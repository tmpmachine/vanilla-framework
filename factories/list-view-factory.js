/* v5 */
function ListViewFactory(opt = {
    options: null,
    retrieveDataCallback: null,
    builderCallback: null,
    template: null,
    templateSelector: null,
    onclick: null,
    lookupCallback: null,
    eventDataCallback: null,
}) {

    let $ = document.querySelector.bind(document);

    let SELF = {
        Refresh,
        RefreshItem,
        RemoveItem,
        GetOptions: () => local.options,
        Search,
        SetOptions,
        SetContainer: (node) => {
            local.containerEl = node;
        },
        Configure,
    };

    // # local
    let local = {
        containerEl: opt?.containerEl,
        templateEl: getTemplateEl(opt.templateSelector, opt.template),
        options: opt?.options ?? {},
    };

    let debounceRefresh = debounce(150, () => {
        Refresh();
    });
    
    let lookupCallback, eventDataCallback;

    // # function
    
    function Configure(opt = {}) {
      lookupCallback = opt.lookupCallback;
      eventDataCallback = opt.eventDataCallback;
      
      return SELF;
    }

    function debounce(time, callback) {
        let timeoutId;
        return function(...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            callback(...args);
          }, time);
        };
    }

    // # search
    function Search(searchTerms) {
        searchTerms = searchTerms.trim();

        if (searchTerms.length == 1) {
            local.options['searchTerms'] = '';
        } else {
            local.options['searchTerms'] = searchTerms;
            debounceRefresh();
        }
    }

    function SetOptions(options) {
        for (let key in options) {
            local.options[key] = options[key];
        }
    }

    function registerEventListeners() {
        let { containerEl } = local;
        if (containerEl && !containerEl?.userData.isEventRegistered) {
            containerEl.addEventListener('click', handleClickEvt);
            containerEl.userData.isEventRegistered = true;
        }
    }

    function handleClickEvt(evt) {
        let node = evt.target.closest('[data-onclick]');
        let key = 'default';

        if (local.containerEl.contains(node)) {
            key = node.dataset.onclick;
        }
        
        let callback = opt?.onclick?.[key];
        
        callback?.({
            evt,
            data: opt?.eventDataCallback?.(evt) ?? null,
        });
    }
    
    function getTemplateEl(templateSelector, template = '') {
      let node = $(templateSelector);
      if (node) {
        return node;
      }
  
      let docEl = document.createElement('template');
      docEl.innerHTML = template;
      return docEl;
    }

    function RefreshItem(item) {
      let itemEl = opt.lookupCallback?.(local.containerEl, item);
      if (!itemEl) return;
      
      opt.builderCallback?.(itemEl, item);
    }
    
    function RemoveItem(item) {
      let itemEl = opt.lookupCallback?.(local.containerEl, item);
      itemEl?.remove();
    }

    // # refresh
    function Refresh() {
        let { containerEl } = local;

        if (!containerEl) return;

        containerEl.userData = containerEl.userData ?? {};

        registerEventListeners();

        let items = opt?.retrieveDataCallback?.(local.options) ?? [];
        
        refreshListContainer(items)
    }
    
    function refreshListContainer(items, onItemClone) {
      let { containerEl, templateEl } = local;
      let docFrag = document.createDocumentFragment();
      
      containerEl?.replaceChildren();
      
      if (items?.length > 0) {
        for (let item of items) {
          let clonedNode = templateEl?.content.firstElementChild?.cloneNode(true);
          let node = opt?.builderCallback?.(clonedNode, item);
          
          if (!node) continue;
          
          docFrag.append(node);
        }
      }
      
      containerEl?.append(docFrag);
    }

    return SELF;

}
