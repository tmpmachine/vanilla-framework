// v2.2
/**
 * @template T
 * @class
 */
class LocalStorageWrapper {
	constructor(prefix, postfix = 'data') {
		this.postfix = postfix;
		this.prefix = prefix ?? '';
		/** @type {T} */
		this.data = null;

		this.SetDefaultData();
	}

	_getKey() {
		return this.prefix ? `${this.prefix}:${this.postfix}` : this.postfix;
	}

	SetDefaultData() {
		this.data = null;
	}

	Save() {
		try {
			const stringValue = JSON.stringify(this.data);
			localStorage.setItem(this._getKey(), stringValue);
		} catch (error) {
			console.error('Failed to save data to storage:', error);
		}
	}

	Restore() {
		try {
			const value = localStorage.getItem(this._getKey());

			if (!value) return;

			let json = JSON.parse(value);

			this.data = json;
		} catch (error) {
			console.error('Failed to read data from storage:', error);
		}
	}

	Clear() {
		localStorage.removeItem(this._getKey());
		this.SetDefaultData();
	}
}
