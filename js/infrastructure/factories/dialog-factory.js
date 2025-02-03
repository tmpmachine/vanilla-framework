/* v5.0 */
function DialogFactory(
    opt = {
        dialogDataModifier: null,
        onShow: null,
        onBeforeClose: null,
    }
) {
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
            onBeforeClose: async (dialogEl) => await validateDialogEdit(dialogEl),
        },
    };

    // # function

    function SetOptions(options) {
        for (let key in options) {
            local.options[key] = options[key];
        }
    }

    async function validateDialogEdit(dialogEl) {
        if (opt.onFormValidate) {
            return await opt.onFormValidate(dialogEl);
        }
        return true;
    }

    async function onClose(dialogEl) {
        let returnValue = dialogEl.returnValue;
        let returnData = opt.onBeforeClose?.(dialogEl);

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
        let isClose = await validateDialogEdit(local.dialogEl);
        if  (!isClose) return;
        
        local.dialogEl.close();
    }

    // # show, # build
    async function Show_(formValuesObject = {}, extraParams, callback) {
        let formData = await windog.showDialogAsync(
            local.dialogOptions,
            function onshown(dialogEl) {
                let form = dialogEl.querySelector("form");
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
