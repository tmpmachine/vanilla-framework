// @ts-check

// v3.0

/**
 * @template T
 * @class
 */
class IdbWrapper {
	constructor(dbConnection, storeName) {
		this.dbConnection = dbConnection;
		this.storeName = storeName;
	}

	// # clear
	/** @returns {Promise<boolean>} */
	async Clear_() {
		return new Promise(async (resolve, reject) => {
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;
			const transaction = db.transaction([this.storeName], 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.clear();

			request.onsuccess = () => {
				resolve(true);
				this.dbConnection.EndRequest(requestId);
			};
			request.onerror = (event) => {
				reject('Error clearing store: ' + event.target.errorCode);
				this.dbConnection.EndRequest(requestId);
			};
		});
	}

	// # remove, # delete

	/** @returns {Promise<boolean>} */
	async Delete_(key) {
		return new Promise(async (resolve, reject) => {
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;

			try {
				const transaction = db.transaction([this.storeName], 'readwrite');
				const store = transaction.objectStore(this.storeName);
				const request = store.delete(key);

				request.onsuccess = () => {
					resolve(true);
					this.dbConnection.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbConnection.EndRequest(requestId);
				reject('Error storing item: ' + error);
			}
		});
	}

	// # add, # put
	/**
	 * @param {T} item
	 * @returns {Promise<T>}
	 */
	Put_(item) {
		return new Promise(async (resolve, reject) => {
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;

			try {
				const transaction = db.transaction([this.storeName], 'readwrite');
				const store = transaction.objectStore(this.storeName);
				const request = store.put(item);

				request.onsuccess = () => {
					resolve(item);
					this.dbConnection.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbConnection.EndRequest(requestId);
				reject('Error storing item: ' + error);
			}
		});
	}

	// # list, # get all
	/** @returns {Promise<T[]>} */
	List_() {
		return new Promise(async (resolve, reject) => {
			let items = [];
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;
			const transaction = db.transaction([this.storeName], 'readonly');

			try {
				const store = transaction.objectStore(this.storeName);
				let cursorRequest = store.openCursor();

				cursorRequest.onsuccess = (event) => {
					let cursor = event.target.result;

					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					} else {
						resolve(items);
						this.dbConnection.EndRequest(requestId);
					}
				};

				cursorRequest.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbConnection.EndRequest(requestId);
				reject('Error retrieving items: ' + error);
			}
		});
	}

	// # get
	/** @returns {Promise<T|null>} */
	Get_(key) {
		return new Promise(async (resolve, reject) => {
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;

			try {
				const transaction = db.transaction([this.storeName], 'readonly');
				const store = transaction.objectStore(this.storeName);
				const request = store.get(key);

				request.onsuccess = (event) => {
					const result = event.target.result;

					if (result) {
						resolve(result);
					} else {
						resolve(null);
					}

					this.dbConnection.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbConnection.EndRequest(requestId);
				reject('Error retrieving item: ' + error);
			}
		});
	}

	async OpenDb_() {
		let dbRequestResult = await this.dbConnection.OpenDb_();
		return dbRequestResult;
	}
}
