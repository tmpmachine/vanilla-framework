/* v1 */
function DialogFactory(opt) {

	// # self
	let SELF = {
		Show_,
	};

	// # local
	let local = {
		extraData: {
			id: null,
			slots: null,
			dialogEl: null,
		},
		dialogOptEdit: {
			defaultValue: null,
			templateSelector: opt.templateSelector,
			onClose: (dialogEl) => readDialogEdit(dialogEl),
			onBeforeClose: async (dialogEl) => await validateDialogEdit(dialogEl),
		},
		// # dom events, # events
		eventsMap: opt.eventsMap ?? {},
	};

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

		return {
			...formData,
			returnValue: dialogEl.returnValue,
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

			local.extraData.dialogEl = dialogEl;

			if (local.eventsMap) {
				local.eventsMap.onclick = {
					'close-dialog': () => local.extraData.dialogEl.close(),
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
