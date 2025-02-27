// @ts-check

// v1
export class IdbWrapper {
	// # const
	constructor(dbName, dbVersion = 1, upgradeCallback) {
		this.db = null;
		this.dbVersion = dbVersion;
		this.dbName = dbName;
		this.requestQueue = [];
		this.requestResolverQueue = [];
		this.upgradeCallback = upgradeCallback;
		this.queueCounter = 0;
	}

	// # function

	// # self, # public
	EndRequest(id) {
		let requestIndex = this.requestResolverQueue.findIndex((e) => e.id == id);

		this.requestQueue.splice(requestIndex, 1);
		let [requestPromise] = this.requestResolverQueue.splice(requestIndex, 1);

		this.db.close();

		requestPromise.resolver();
	}

	async openDb_() {
		let lastRequestPromise;

		if (this.requestQueue.length > 0) {
			let lastRequest = this.requestQueue[this.requestQueue.length - 1];
			lastRequestPromise = lastRequest.promise;
		}

		let requestId = this.queueCounter++;

		// add to queue
		let newRequestPromise = new Promise((resolve) => {
			this.requestResolverQueue.push({
				id: requestId,
				resolver: resolve,
			});
		});
		this.requestQueue.push({
			promise: newRequestPromise,
			id: requestId,
		});

		await lastRequestPromise;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);
			request.onerror = (event) => reject('Error opening database: ' + event.target.errorCode);
			request.onsuccess = async (event) => {
				this.db = event.target.result;
				resolve({
					db: this.db,
					requestId,
				});
			};

			// # upgrade
			request.onupgradeneeded = async (event) => {
				this.upgradeCallback(event);
			};
		});
	}
}
