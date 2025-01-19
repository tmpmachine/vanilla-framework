/* v6 */
function ListViewFactory(opt = {
    src: null,
    options: null,
    retrieveDataCallback: null,
    builderCallback: null,
    template: null,
    templateSelector: null,
    onclick: null,
    lookupCallback: null,
    eventDataCallback: null,
    itemDataModifier: null,
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
    };

    // # local
    let local = {
        isLoadingTemplate: false,
        lazyLoadPromise: {},
        containerEl: opt?.containerEl,
        templateEl: getTemplateEl(opt.templateSelector, opt.template),
        options: opt?.options ?? {},
    };

    let debounceRefresh = debounce(150, () => {
        Refresh();
    });

    let lookupCallback = opt.lookupCallback; 
    let eventDataCallback = opt.eventDataCallback;
    let itemDataModifier = opt.itemDataModifier;

    // # function

    function debounce(time, callback) {
        let timeoutId;
        return function (...args) {
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

        if (local.isLoadingTemplate) return;

        let node = evt.target.closest('[data-onclick]');
        let key = 'default';

        if (local.containerEl.contains(node)) {
            key = node.dataset.onclick;
        }

        let callback = opt?.onclick?.[key];
        let data = eventDataCallback?.({
            evt, 
            containerNode: local.containerEl,
        }) ?? {
            evt,
        };

        callback?.(data);
    }

   

    function RefreshItem(item) {
        let itemNode = lookupCallback?.(local.containerEl, item);
        if (!itemNode) return;

        let itemData = {
            itemNode,
            item,
        };
        itemDataModifier?.(itemData);
        opt.builderCallback?.(itemData);
    }

    function RemoveItem(item) {
        let itemEl = lookupCallback?.(local.containerEl, item);
        itemEl?.remove();
    }

    // # refresh
    async function Refresh() {
        let { containerEl } = local;

        if (!containerEl) return;

        containerEl.userData = containerEl.userData ?? {};

        registerEventListeners();

        let items = opt?.retrieveDataCallback?.(local.options) ?? [];

        // # lazy load
        if (local.templateEl.dataset.empty && opt.src) {

            let { containerEl } = local;
            let docFrag = document.createDocumentFragment();
            let controller = new AbortController();

            items.forEach(() => {
                docFrag.append(local.templateEl.content.cloneNode(true));
            });
            containerEl?.replaceChildren(docFrag);

            local.isLoadingTemplate = true;

            let templateEl = await lazyLoad({
                src: opt.src,
                controller,
            });

            local.templateEl = templateEl;
            local.isLoadingTemplate = false;
        }

        refreshListContainer(items)
    }

    function refreshListContainer(items) {
        let { containerEl, templateEl } = local;
        let docFrag = document.createDocumentFragment();

        containerEl?.replaceChildren();

        if (items?.length > 0) {
            for (let item of items) {
                let clonedNode = templateEl?.content.firstElementChild?.cloneNode(true);
                let itemData = {
                    itemNode: clonedNode,
                    item,
                };
                itemDataModifier?.(itemData);
                let node = opt.builderCallback?.(itemData);

                if (!node) continue;

                docFrag.append(node);
            }
        }

        containerEl?.append(docFrag);
    }

    // # lazy load
    async function lazyLoad(opt) {
        let {src, controller} = opt;

        return new Promise(async resolve => {

            if (local.lazyLoadPromise[src]) {
                await local.lazyLoadPromise[src];
            }

            let templateEl = getLazyTemplate();
            if (templateEl) {
                resolve(templateEl)
                return;
            }

            await preloadTemplate(src);

            if (controller.signal.aborted) {
                return;
            }

            // retry get template
            templateEl = getLazyTemplate()

            resolve(templateEl);
        });
    }

    function preloadTemplate(src) {
        return new Promise(resolve => {

            local.lazyLoadPromise[src] = new Promise(async resolveLazyLoad => {

                fetch(src)
                    .then(r => r.text())
                    .then(r => {
                        // append to body
                        {
                            let template = document.createElement('template');
                            template.innerHTML = r;

                            let docEl = $('._listViewTemplates') ?? document.createElement('div');
                            docEl.classList.add('_listViewTemplates');
                            docEl.append(template.content);
                            document.body.append(docEl);
                        }
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        resolve()
                        resolveLazyLoad();
                        delete local.lazyLoadPromise[src];
                    });

            });

        });
    }

    function getLazyTemplate() {
        let { templateSelector, template } = opt;
        let templateEl = getTemplateEl(templateSelector, template);

        if (templateEl.dataset.empty) return null;

        return templateEl;
    }

    function getTemplateEl(templateSelector, template) {
        let node = $(templateSelector);
        if (node) {
            return node;
        }

        let docEl = document.createElement('template');
        docEl.dataset.empty = true;
        let blankListItem = $('._listItemLoading');
        let blankTemplate = blankListItem ? blankListItem.innerHTML : '';

        docEl.innerHTML = template ?? blankTemplate;

        return docEl;
    }

    return SELF;

}
