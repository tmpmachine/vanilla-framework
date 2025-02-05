// @ts-check
/* v5.1 */

/**
@typedef {Object} qwDialogFactoryDialogData
@property {HTMLElement} dialogEl - The dialog element
@property {HTMLFormElement} form - The form inside the dialog
@property {Object} extraParams - Additional parameters for the dialog
@property {Object} formValuesObject - The form values object

@typedef {Object} qwDialogFactoryOptions
@property {Function} [dialogDataModifier]
@property {any} [options] - initial user data
@property {string} [src] - path to HTML that contains dialog templates
@property {string} [template] - dialog template HTML string
@property {string} [templateSelector] - CSS selector for dialog template
@property {(dialogData: qwDialogFactoryDialogData) => void} [onShow]
@property {Function} [onClose]
@property {Function} [onBeforeClose]
*/
/** @param {qwDialogFactoryOptions} opt */
function DialogFactory(opt) {
    // # self
    let SELF = {
        Show_,
        Refresh,
        Close: () => closeDialog(),
        GetOptions: () => local.options,
        GetDialog: () => local.dialogEl,
        SetOptions,
    };

    // # local
    let local = {
        options: opt.options ?? {},
        dialogEl: null,
        dialogData: null,
        dialogOptions: {
            src: opt.src,
            template: opt.template,
            templateSelector: opt.templateSelector,
            onClose: (dialogEl) => onClose(dialogEl),
            onBeforeClose: async () => await onBeforeClose(),
        },
    };

    // # function

    function SetOptions(options) {
        for (let key in options) {
            local.options[key] = options[key];
        }
    }

    async function onBeforeClose() {
        if (opt.onBeforeClose) {
            return await opt.onBeforeClose(local.dialogEl);
        }
        return true;
    }

    async function onClose(dialogEl) {
        let returnValue = dialogEl.returnValue;
        let returnData = opt.onClose(dialogEl);

        local.options = {};
        local.dialogEl = null;
        local.dialogData = null;

        return {
            form: dialogEl.querySelector('form'),
            returnValue,
            returnData,
        };
    }

    function Refresh() {
        opt.onShow?.(local.dialogData);
    }

    async function closeDialog() {
        let isClose = await onBeforeClose();
        if  (!isClose) return;
        
        local.dialogEl.close();
    }

    // # show, # build
    async function Show_(formValuesObject = {}, extraParams, callback) {
        let formData = await windog.showDialogAsync(
            local.dialogOptions,
            function onshown(dialogEl) {
                let form = dialogEl.querySelector("form");
                
                /** @type {qwDialogFactoryDialogData} */
                let dialogData = {
                    dialogEl,
                    form,
                    extraParams,
                    formValuesObject,
                };

                local.dialogEl = dialogEl;
                local.dialogData = dialogData;

                opt.dialogDataModifier?.(dialogData);
                opt.onShow?.(dialogData);
                callback?.(dialogData);
            }
        );

        return formData;
    }

    return SELF;
}
