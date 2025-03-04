// @ts-check

// v2.1
class IdbStoreRepository {
	constructor(dbManager, storeName) {
		this.dbManager = dbManager;
		this.storeName = storeName;
	}

	// # clear
	async Clear_() {
		return new Promise(async (resolve, reject) => {
			let dbRequestResult = await this.OpenDb_();
			let { db, requestId } = dbRequestResult;
			const transaction = db.transaction([this.storeName], 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.clear();

			request.onsuccess = () => {
				resolve(true);
				this.dbManager.EndRequest(requestId);
			};
			request.onerror = (event) => {
				reject('Error clearing store: ' + event.target.errorCode);
				this.dbManager.EndRequest(requestId);
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
					this.dbManager.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbManager.EndRequest(requestId);
				reject('Error storing item: ' + error);
			}
		});
	}

	// # add, # put
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
					this.dbManager.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbManager.EndRequest(requestId);
				reject('Error storing item: ' + error);
			}
		});
	}

	// # list, # get all
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
						this.dbManager.EndRequest(requestId);
					}
				};

				cursorRequest.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbManager.EndRequest(requestId);
				reject('Error retrieving items: ' + error);
			}
		});
	}

	// # get
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

					this.dbManager.EndRequest(requestId);
				};
				request.onerror = (event) => {
					throw event.target.errorCode;
				};
			} catch (error) {
				this.dbManager.EndRequest(requestId);
				reject('Error retrieving item: ' + error);
			}
		});
	}

	async OpenDb_() {
		let dbRequestResult = await this.dbManager.OpenDb_();
		return dbRequestResult;
	}
}
