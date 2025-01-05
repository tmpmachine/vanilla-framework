/* v2.1 */
let windog = (function () {

    let $ = document.querySelector.bind(document);

    let SELF = {
        alert,
        confirm,
        prompt,
        showDialogAsync,
    };

    // # local
    let local = {
        lazyLoadPromise: {},
    };

    // # options

    let dialogOptions = {
        alert: {
            templateSelector: '._dialogAlert',
        },
        confirm: {
            templateSelector: '._dialogConfirm',
            onClose: (dialogEl) => {
                return (dialogEl.returnValue == 'ok');
            },
        },
        prompt: {
            templateSelector: '._dialogPrompt',
            onClose: (dialogEl) => {
                if (dialogEl.returnValue == 'ok') {
                    return dialogEl.querySelector('[data-slot="input"]')?.value;
                }
                return null;
            },
        },
    };

    // # function

    // # prompt
    async function prompt(message = '', defaultValue = '', userOptions) {
        return await showDialogAsync({
            ...dialogOptions.prompt,
            ...userOptions
        }, onShowDefault, {
            message,
            defaultValue,
            ...userOptions,
        });
    }

    async function confirm(message = '', userOptions) {
        return await showDialogAsync({
            ...dialogOptions.confirm,
            ...userOptions
        }, onShowDefault, {
            message,
            ...userOptions,
        });
    }

    // # alert
    async function alert(message = '', userOptions) {
        return await showDialogAsync({
            ...dialogOptions.alert,
            ...userOptions
        }, onShowDefault, {
            message,
        });
    }

    function onShowDefault(dialogEl, extraData, options) {
        let { message, defaultValue } = extraData;
        let { confirmButtonText, cancelButtonText, showCancelButton } = options;
        let slots = DOMSlots(dialogEl);

        slots.message?.replaceChildren(message);
        slots.confirmButtonText?.replaceChildren(confirmButtonText);
        slots.cancelButtonText?.replaceChildren(cancelButtonText);

        if (slots.input) {
            slots.input.value = defaultValue;
        }
        if (!showCancelButton) {
            slots.cancelButtonText?.remove();
        }
    }

    function DOMSlots(itemEl) {
        let slotData = Array.from(itemEl.querySelectorAll('[data-slot]')).map(x => {
            return {
                key: x.dataset.slot,
                el: x,
            };
        });
        let slotObj = slotData.reduce((obj, item) => {
            obj[item.key] = item.el;
            return obj;
        }, {});

        return slotObj;
    }

    async function showDialogAsync(dialogOptions, onShow, extraData) {

        return new Promise(async resolve => {
            // # default options
            let defaultOptions = {
                allowOutsideClick: true,
                allowEscapeKey: true,
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
            };
            let persistentOptions = {
                resolver: {
                    resolve,
                },
            };
            let mixedOptions = Object.assign(defaultOptions, dialogOptions, extraData, persistentOptions);
            let controller = new AbortController();
            let { allowOutsideClick, template, templateSelector } = mixedOptions;
            let el = getTemplateEl(templateSelector, template);
            let dialogEl = el.querySelector('dialog');
            let dialogData = {
                dialogItem: mixedOptions,
                controller,
            };

            dialogEl._windogData = dialogData;

            attachBackdropListener(allowOutsideClick, dialogEl);
            dialogEl.addEventListener('close', onClose);
            document.body.append(el);
            dialogEl.showModal();

            // # lazy load
            if (dialogOptions.src) {
                await lazyLoad(dialogEl, controller, mixedOptions);
            }

            attachKeytrap(dialogEl, dialogData);

            onShow?.(dialogEl, extraData, mixedOptions);
        });
    }

    async function lazyLoad(dialogEl, controller, mixedOptions) {

        let { src } = mixedOptions;

        return new Promise(async resolve => {

            if (local.lazyLoadPromise[src]) {
                await local.lazyLoadPromise[src];
            }

            let isLoaded = loadLazyDialog(dialogEl, mixedOptions);
            if (isLoaded) {
                resolve()
                return;
            }

            local.lazyLoadPromise[src] = new Promise(resolveLazyLoad => {

                fetch(src)
                    .then(r => r.text())
                    .then(r => {

                        // append to body
                        {
                            let template = document.createElement('template');
                            template.innerHTML = r;

                            let docEl = $('._dialogTemplates') ?? document.createElement('div');
                            docEl.classList.add('_dialogTemplates');
                            docEl.append(template.content);
                            document.body.append(docEl);
                        }

                        if (controller.signal.aborted) {
                            return;
                        }

                        loadLazyDialog(dialogEl, mixedOptions)

                        resolve();

                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        resolveLazyLoad();
                        delete local.lazyLoadPromise[dialogOptions.src];
                    });

            });

        });
    }

    function loadLazyDialog(dialogEl, mixedOptions) {
        let { templateSelector, template, allowOutsideClick } = mixedOptions;
        let el = getTemplateEl(templateSelector, template);
        let elDialog = el.querySelector('dialog');

        if (elDialog.dataset.empty) return false;

        let classes = elDialog.getAttribute('class');

        dialogEl.setAttribute('class', classes);
        dialogEl.innerHTML = elDialog.innerHTML;

        attachBackdropListener(allowOutsideClick, dialogEl);

        return true;
    }

    function attachBackdropListener(allowOutsideClick, dialogEl) {
        if (!allowOutsideClick) return;

        dialogEl.querySelector('.backdrop')?.addEventListener('click', (evt) => {
            onCancel(dialogEl);
        });
    }

    function getTemplateEl(templateSelector, template) {
        let node = $(templateSelector);
        if (node) {
            return node.content.cloneNode(true);
        }

        let docEl = document.createElement('template');
        let blankDialog = $('._dialogLoading');
        let blankTemplate = blankDialog ? $('._dialogLoading').innerHTML : '<dialog class="wg-windog" data-empty="true"><div class="backdrop"></div><dialog>';

        docEl.innerHTML = template ?? blankTemplate;

        return docEl.content.cloneNode(true);
    }

    async function onCancel(dialogEl) {
        let { dialogItem } = dialogEl._windogData;

        let isShouldClose = await onBeforeClose(dialogEl, dialogItem);
        if (isShouldClose) {
            dialogEl.close();
        }
    }

    async function onBeforeClose(dialogEl, dialogItem) {
        let isShouldClose = true;
        if (typeof (dialogItem.onBeforeClose) == 'function') {
            isShouldClose = await dialogItem.onBeforeClose(dialogEl);
        }
        return isShouldClose;
    }

    // # close
    async function onClose(evt) {
        let dialogData = evt.target._windogData;
        let dialogItem = dialogData.dialogItem;
        let dialogEl = evt.target;

        dialogData.controller.abort('Closed by user');

        let dialogResult = await dialogItem.onClose?.(dialogEl);
        dialogItem.resolver.resolve(dialogResult);

        // wait close animation
        await new Promise(resolve => setTimeout(resolve, dialogItem.closeAnimationTimeout ?? 3000));
        dialogEl.remove();
    }

    function attachKeytrap(dialogEl, dialogData) {
        let focusableContent = dialogEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        dialogData.firstFocusableElement = focusableContent[0];
        dialogData.lastFocusableElement = focusableContent[focusableContent.length - 1];

        dialogEl.addEventListener('keydown', keyTrapper);
    }

    async function keyTrapper(evt) {
        let dialogEl = evt.target.closest('dialog');
        let isTabPressed = (evt.key == 'Tab');
        let isKeyEscape = (evt.key == 'Escape' || evt.code == 'Escape' || evt.keyCode == '27');

        if (isKeyEscape) {

            let { dialogItem } = dialogEl._windogData;
            if (dialogItem.allowEscapeKey) {
                let isShouldClose = await onBeforeClose(dialogEl, dialogItem)
                if (isShouldClose) {
                    dialogEl.close();
                }
            }

            evt.preventDefault(); // disable default close dialog behaviour
            return;
        }

        if (!isTabPressed) return;

        let { firstFocusableElement, lastFocusableElement } = dialogEl._windogData;

        if (evt.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                evt.preventDefault();
            }
        } else if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            evt.preventDefault();
        }
    }

    return SELF;

})();
