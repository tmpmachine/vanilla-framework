// @ts-check

// v2.1
let compoGsi = (function () {
	let SELF = {
		InitTokenClient,
		RequestToken,
		RevokeToken,
		TaskAuthorize,
		// # init
		/** @param {AuthData} authData */
		async Init(authData) {
			data = authData;
			if (data.access_token) {
				ReloadAuthState();
				await SELF.DistributeTokenToComponents_();
			}
		},
		ReloadAuthState,
		ClearToken,
		Commit,
		GetEmailHint() {
			return data.userEmail;
		},
		Logout,
		RequestTokenHandler: null,
		OnAuthStateChange: null, // user defined
		ResolveTokenRequest() {
			onGoingAuthProcessResolver?.();
			onGoingAuthProcessPromise = null;
		},

		async DistributeTokenToComponents_() {
			await TaskWaitUntil(() => typeof drive != 'undefined');
			drive.SetToken(data.access_token);
		},
	};

	/**
	 * @typedef {Object} AuthData
	 * @property {string} userEmail
	 * @property {string} access_token
	 * @property {number} expires_at
	 */

	/** @type {AuthData} */
	let data = {
		userEmail: null,
		access_token: null,
		expires_at: 0,
	};
	let onGoingAuthProcessResolver = null;
	let onGoingAuthProcessPromise = null;

	let local = {
		client_id: '',
		scope: 'https://www.googleapis.com/auth/userinfo.email',
		tokenClient: null,
		tempData: null,
	};

	function Logout() {
		let isConfirm = window.confirm(
			'This will only sign out your account. See Application Data section to clear application data. Continue?'
		);
		if (!isConfirm) return;

		data.userEmail = null;
		ClearToken();
		Commit();

		ReloadAuthState();
	}

	function ReloadAuthState() {
		let isAuthorized = data.access_token?.trim().length > 0;
		SELF.OnAuthStateChange?.(isAuthorized);
	}

	function ClearToken() {
		data.access_token = null;
		data.expires_at = 0;
	}

	async function TaskAuthorize() {
		return new Promise(async (resolve) => {
			let now = Date.now();
			let thirtySc = 30 * 1000;

			if (data.expires_at - now <= thirtySc) {
				await onGoingAuthProcessPromise;
				RequestToken();
				await onGoingAuthProcessPromise;
			} else {
				await SELF.DistributeTokenToComponents_();
			}

			resolve();
		});
	}

	function TaskWaitUntil(stateCheckCallback, delay = 100) {
		return new Promise((resolve) => {
			let interval = window.setInterval(() => {
				let shouldResolve = stateCheckCallback();
				if (shouldResolve) {
					window.clearInterval(interval);
					resolve();
				}
			}, delay);
		});
	}

	function InitTokenClient() {
		local.tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: local.client_id,
			scope: local.scope,
			callback: (tokenResponse) => onTokenResponse(tokenResponse),
		});
	}

	async function onTokenResponse(tokenResponse) {
		try {
			data.access_token = tokenResponse.access_token;
			data.expires_at = new Date(
				Date.now() + tokenResponse.expires_in * 1000
			).getTime();
			Commit();

			readToken();

			await SELF.DistributeTokenToComponents_();
			ReloadAuthState();
		} catch (e) {
			console.error(e);
		}

		SELF.ResolveTokenRequest();
	}

	function readToken() {
		if (!data.userEmail) {
			getTokenUserInfo(data.access_token);
		}
	}

	function getTokenUserInfo(access_token) {
		fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
			headers: {
				authorization: `Bearer ${access_token}`,
			},
		})
			.then((r) => r.json())
			.then((json) => {
				data.userEmail = json.email;
				Commit();
			});
	}

	function RequestToken() {
		if (!onGoingAuthProcessPromise) {
			onGoingAuthProcessPromise = new Promise(
				(resolve) => (onGoingAuthProcessResolver = resolve)
			);
		}

		let opt = {};

		if (data.userEmail) {
			opt.hint = data.userEmail;
			opt.prompt = '';
		}

		if (SELF.RequestTokenHandler) {
			SELF.RequestTokenHandler(opt);
		} else {
			local.tokenClient.requestAccessToken(opt);
		}
	}

	function RevokeToken() {
		google.accounts.oauth2.revoke(data.access_token, () => {
			console.log('access token revoked');
		});
	}

	function Commit() {
		servAuthGoogle.data = data;
		servAuthGoogle.Save();
	}

	return SELF;
})();
