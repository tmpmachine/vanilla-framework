/* v4 */
function DialogFactory(
	opt = {
		onShow: null,
		onBeforeClose: null,
	}
) {
	// # self
	let SELF = {
		Show_,
		Refresh,
		Close,
		GetOptions: () => local.options,
		GetDialog: () => local.dialogEl,
		SetOptions,
	};

	// # local
	let local = {
		options: opt.options ?? {},
		dialogEl: null,
		dialogShowObj: null,
		dialogOptEdit: {
			defaultValue: null,
			template: opt.template,
			templateSelector: opt.templateSelector,
			onClose: (dialogEl) => readDialogEdit(dialogEl),
			onBeforeClose: async (dialogEl) => await validateDialogEdit(dialogEl),
		},
		// # dom events, # events
		eventsMap: opt.eventsMap ?? {},
	};

	// # function

	function Close() {
		local.dialogEl?.close();
	}

	function SetOptions(options) {
		for (let key in options) {
			local.options[key] = options[key];
		}
	}

	function getDialogEditFormData(dialogEl) {
		let form = dialogEl.querySelector("form");
		if (!form) return new FormData();

		let formData = new FormData(form);
		return utils?.FormDataToObject?.(formData);
	}

	async function validateDialogEdit(dialogEl) {
		opt.onBeforeClose?.(dialogEl);
		if (opt.onFormValidate) {
			return await opt.onFormValidate(dialogEl);
		}
		return true;
	}

	async function readDialogEdit(dialogEl) {
		let formData = getDialogEditFormData(dialogEl);
		let returnValue = dialogEl.returnValue;

		local.dialogEl = null;
		local.dialogShowObj = null;

		return {
			...formData,
			returnValue,
		};
	}

	function Refresh() {
		opt.onShow?.(local.dialogShowObj);
	}

	// # show, # build
	async function Show_(formValuesObject = {}, extraParams, callback) {
		let formData = await windog.showDialogAsync(
			local.dialogOptEdit,
			function onshown(dialogEl) {
				let form = dialogEl.querySelector("form");
				let slots = utils?.DOMSlots?.(dialogEl);
				let dialogShowObj = {
					dialogEl,
					form,
					slots,
					extraParams,
					formValuesObject,
				};

				local.dialogEl = dialogEl;
				local.dialogShowObj = dialogShowObj;

				if (local.eventsMap) {
					local.eventsMap.onclick = {
						...local.eventsMap.onclick,
						"close-dialog": () => dialogEl.close(),
					};
				}

				DOMEvents.Listen(local.eventsMap, dialogEl);
				utils?.FillFormWithData?.(form, formValuesObject);
				opt.onShow?.(dialogShowObj);
				callback?.(dialogShowObj);
			}
		);

		return formData;
	}

	return SELF;
}
