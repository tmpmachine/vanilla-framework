/* v3 */
function DialogFactory(opt = {}) {

	// # self
	let SELF = {
		Show_,
		GetOptions: () => JSON.parse(JSON.stringify(local.options)),
		GetDialog: () => local.dialogEl,
		SetOptions,
	};

	// # local
	let local = {
		options: opt.options ?? {},
		dialogEl: null,
		dialogOptEdit: {
			defaultValue: null,
			templateSelector: opt.templateSelector,
			onClose: (dialogEl) => readDialogEdit(dialogEl),
			onBeforeClose: async (dialogEl) => await validateDialogEdit(dialogEl),
		},
		// # dom events, # events
		eventsMap: opt.eventsMap ?? {},
	};

	// # function
	function SetOptions(options) {
		for (let key in options) {
			if (typeof (local.options[key]) != 'undefined') {
				local.options[key] = options[key];
			}
		}
	}

	function getDialogEditFormData(dialogEl) {
		let form = dialogEl.querySelector("form");
		if (!form) return new FormData();

		let formData = new FormData(form);;
		return utils?.FormDataToObject?.(formData);
	}

	async function validateDialogEdit(dialogEl) {
		if (opt.onFormValidate) {
			return await opt.onFormValidate(dialogEl);
		}
		return true;
	}

	async function readDialogEdit(dialogEl) {
		let formData = getDialogEditFormData(dialogEl);
		let returnValue = dialogEl.returnValue;

		local.dialogEl = null;

		return {
			...formData,
			returnValue,
		};
	}

	// # show, # build
	async function Show_(formValuesObject = {}, extraParams, callback) {
		let formData = await windog.showDialogAsync(local.dialogOptEdit, function onshown(dialogEl) {
			let form = dialogEl.querySelector('form');
			let slots = utils?.DOMSlots?.(dialogEl);
			let dialogShowObj = {
				dialogEl,
				form,
				slots,
				extraParams,
				formValuesObject,
			};

			local.dialogEl = dialogEl;

			if (local.eventsMap) {
				local.eventsMap.onclick = {
					'close-dialog': () => dialogEl.close(),
					...local.eventsMap.onclick,
				}
			};

			DOMEvents.Listen(local.eventsMap, dialogEl);
			utils?.FillFormWithData?.(form, formValuesObject);
			opt.onShow?.(dialogShowObj)
			callback?.(dialogShowObj);
		});

		return formData;
	}

	return SELF;

}
