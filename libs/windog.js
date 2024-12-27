/* v1 */
let windog = (function() {

  let $ = document.querySelector.bind(document);
  
  let SELF = {
    alert,
    confirm,
    prompt,
    showDialogAsync,
  };

  let local = {
    inputType: 11, // 111: default/mouse, 22: touch
  }
  // # options
  
  let dialogOptions = {
    alert: {
      templateSelector: '#tmp-dialog-alert',
    },
    confirm: {
      templateSelector: '#tmp-dialog-confirm',
      onClose: (dialogEl) => {
        return (dialogEl.returnValue == 'ok');
      },
    },
    prompt: {
      templateSelector: '#tmp-dialog-prompt',
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
  async function prompt(message='', defaultValue='', userOptions) {
    return await showDialogAsync({
      ...dialogOptions.prompt, 
      ...userOptions
    }, onShowDefault, {
      message,
      defaultValue,
      ...userOptions,
    });
  }
  
  async function confirm(message='', userOptions) {
    return await showDialogAsync({
      ...dialogOptions.confirm, 
      ...userOptions
    }, onShowDefault, {
      message,
      ...userOptions,
    });
  }
  
  // # alert
  async function alert(message='', userOptions) {
    return await showDialogAsync({
      ...dialogOptions.alert, 
      ...userOptions
    }, onShowDefault, {
      message,
    });
  }
  
  function onShowDefault(dialogEl, extraData, options) {
    let {message, defaultValue} = extraData;
    let {confirmButtonText, cancelButtonText, showCancelButton} = options;
    let slots = DOMSlots(dialogEl);
    
    slots.message?.replaceChildren(message);
    if (slots.input) slots.input.value = defaultValue; 
    slots.confirmButtonText?.replaceChildren(confirmButtonText); 
    slots.cancelButtonText?.replaceChildren(cancelButtonText);
    
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
      let {allowOutsideClick, templateSelector} = mixedOptions;
      let el = $(templateSelector).content.cloneNode(true);
      let dialogEl = el.querySelector('dialog');
      let dialogData = {
        dialogItem: mixedOptions,
      };
      
      if (allowOutsideClick) {
        dialogEl.querySelector('.backdrop')?.addEventListener('click', (evt) => {
          onCancel(dialogEl);
        });
      }
      dialogEl.addEventListener('close', onClose);
      attachKeytrap(dialogEl, dialogData);
      
      dialogEl._windogData = dialogData;
      
      document.body.append(el);
      dialogEl.showModal();

      onShow?.(dialogEl, extraData, mixedOptions);
    });
  }
  
  async function onCancel(dialogEl) {
    let {dialogItem} = dialogEl._windogData;
    
    let isShouldClose = await onBeforeClose(dialogEl, dialogItem);
    if (isShouldClose) {
      dialogEl.close();
    }
  }
  
  async function onBeforeClose(dialogEl, dialogItem) {
    let isShouldClose = true;
    if (typeof(dialogItem.onBeforeClose) == 'function') {
      isShouldClose = await dialogItem.onBeforeClose(dialogEl);
    }
    return isShouldClose;
  }
  
  // # close
  async function onClose(evt) {
    let dialogItem = evt.target._windogData.dialogItem;
    let dialogEl = evt.target;
    
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

      let {dialogItem} = dialogEl._windogData;
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
    
    let {firstFocusableElement, lastFocusableElement} = dialogEl._windogData;
    
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
