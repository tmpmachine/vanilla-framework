// @ts-check
/* v1.2 */
let storageUtil = (function () {
	// # vars

	let db = null;
	let isDbClosed = true;
	let dbVersion = 1;
	let storeName = 'public';
	let dbName = '';
	let dbReadyPromiseResolver = null;
	let dbReadyPromise = new Promise((resolve) => {
		dbReadyPromiseResolver = resolve;
	});

	// # function

	async function openDb_(version, onUpgrade) {
		return new Promise((resolve, reject) => {
			if (!isDbClosed && (version ?? dbVersion) === dbVersion) resolve(db);

			const request = indexedDB.open(dbName, version ?? dbVersion);
			request.onerror = (event) => reject('Error opening database: ' + event.target.errorCode);
			request.onsuccess = (event) => {
				db = event.target.result;
				isDbClosed = false;
				resolve(db);
			};
			request.onupgradeneeded = (event) => {
				db = event.target.result;
				onupgradeneeded(db);

				onUpgrade?.(db);
			};
		});
	}

	function onupgradeneeded(db) {
		if (!db.objectStoreNames.contains(storeName)) {
			db.createObjectStore(storeName, { keyPath: 'key' });
		}
	}

	function getDatabaseVersion_() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(dbName);

			request.onsuccess = (event) => {
				const db = event.target.result;
				const version = db.version;

				db.close();

				isDbClosed = true;

				resolve(version);
			};

			request.onerror = (event) => {
				reject(`Error opening database: ${event.target.errorCode}`);
				isDbClosed = true;
				db?.close();
			};

			request.onupgradeneeded = (event) => {
				db = event.target.result;
				onupgradeneeded(db);
				resolve(null);
			};
		});
	}

	// # self
	let SELF = {
		openDb_,
		getDatabaseVersion_,

		// # init
		async Init_(_dbName) {
			dbName = _dbName;

			dbVersion = (await getDatabaseVersion_()) ?? 1;
			dbReadyPromiseResolver();
		},

		setDBVersion(newDBVersion) {
			dbVersion = newDBVersion;
		},

		getDb() {
			return db;
		},

		async checkStoreExists_(storeName) {
			await dbReadyPromise;
			await openDb_();
			return db.objectStoreNames.contains(storeName);
		},

		async clearStore_() {
			return new Promise(async (resolve, reject) => {
				await openDb_(); // Ensure the database is open
				const transaction = db.transaction([storeName], 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.clear();

				request.onsuccess = () => {
					resolve(true);
					db.close();
					isDbClosed = true;
				};
				request.onerror = (event) => {
					reject('Error clearing store: ' + event.target.errorCode);
					db.close();
					isDbClosed = true;
				};
			});
		},

		closeDb() {
			isDbClosed = true;
			db.close();
		},

		async setItem_(key, value) {
			return new Promise(async (resolve, reject) => {
				await openDb_();
				const transaction = db.transaction([storeName], 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.put({ key, value });

				request.onsuccess = () => {
					resolve(true);
					db.close();
					isDbClosed = true;
				};
				request.onerror = (event) => {
					reject('Error storing item: ' + event.target.errorCode);
					db.close();
					isDbClosed = true;
				};
			});
		},

		// # get
		async getItem_(key) {
			return new Promise(async (resolve, reject) => {
				await openDb_();
				const transaction = db.transaction([storeName], 'readonly');
				const store = transaction.objectStore(storeName);
				const request = store.get(key);

				request.onsuccess = (event) => {
					const result = event.target.result;
					if (result) {
						resolve(result.value);
					} else {
						resolve(null); // return null if not found
					}
					db.close();
					isDbClosed = true;
				};
				request.onerror = (event) => {
					reject('Error retrieving item: ' + event.target.errorCode);
					db.close();
					isDbClosed = true;
				};
			});
		},

		// # remove
		async removeItem_(key) {
			return new Promise(async (resolve, reject) => {
				await openDb_();
				const transaction = db.transaction([storeName], 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.delete(key);

				request.onsuccess = () => {
					resolve(true);
					db.close();
					isDbClosed = true;
				};
				request.onerror = (event) => {
					reject('Error removing item: ' + event.target.errorCode);
					db.close();
					isDbClosed = true;
				};
			});
		},
	};

	return SELF;
})();
