// @ts-check

// v1
export class LocalStorageWrapper {
	constructor(prefix = '') {
		this.postfix = 'data';
		this.prefix = prefix;
		this.data = {};
	}

	_getKey() {
		return this.prefix ? `${this.prefix}:${this.postfix}` : this.postfix;
	}

	SetItem(key, value) {
		try {
			this.data[key] = value;
		} catch (error) {
			console.error('Failed to set item in data:', error);
		}
	}

	GetItem(key) {
		return this.data[key] ?? null;
	}

	Save() {
		try {
			const stringValue = JSON.stringify(this.data);
			localStorage.setItem(this._getKey(), stringValue);
		} catch (error) {
			console.error('Failed to save data to storage:', error);
		}
	}

	Read() {
		try {
			const value = localStorage.getItem(this._getKey());
			this.data = value ? JSON.parse(value) : {};
		} catch (error) {
			console.error('Failed to read data from storage:', error);
			this.data = {};
		}
	}

	Clear() {
		localStorage.removeItem(this._getKey());
	}
}

export class LocalStorageKeyWrapper {
	constructor(master, key, data) {
		/** @type {LocalStorageWrapper} */
		this.master = master;
		this.key = key;
		this.value = data;
	}

	Commit() {
		this.master.SetItem(this.key, this.value);
	}

	Restore(restoreStrategyCallback) {
		let data = this.master.GetItem(this.key);
		restoreStrategyCallback?.(data);
	}
}
