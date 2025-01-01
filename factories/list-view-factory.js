/* v4 */
function ListViewFactory(opt = {
    containerEl: null,
    options: null,
    retrieveDataCallback: null,
    builderCallback: null,
    templateSelector: null,
    eventsMap: null,
    lookupCallback: null,
    eventDataCallback: null,
}) {

    opt = {
        ...{
            eventDataCallback: defaultEventDataCallback,
            lookupCallback: defaultLookupCallback,
        },
        ...opt,
    }

    let $ = document.querySelector.bind(document);

    let SELF = {
        Refresh,
        RefreshItem,
        GetOptions: () => JSON.parse(JSON.stringify(local.options)),
        Search,
        SetOptions,
        SetContainer: (node) => {
            local.containerEl = node;
            listContainer.SetContainer(node);
        },
    };

    // # local
    let local = {
        containerEl: opt?.containerEl,
        options: opt?.options ?? {},
    };

    let listContainer = new ListContainerBuilder({
        template: opt?.templateSelector ?? '',
        builder: (node, item) => buildListItem(node, item),
        lookup: (containerEl, item) => opt?.lookupCallback?.(containerEl, item),
    });

    let debounceRefresh = debounce(150, () => {
        Refresh();
    });

    // # function

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

    function defaultEventDataCallback({ itemEl }) {
        return itemEl?.dataset.id ? parseInt(itemEl.dataset.id) : null;
    }

    function defaultLookupCallback(containerEl, item) {
        return containerEl.querySelector(`[data-id="${item.id}"]`);
    }

    function SetOptions(options) {
        for (let key in options) {
            if (typeof (local.options[key]) != 'undefined') {
                local.options[key] = options[key];
            }
        }
    }

    function registerEventListeners() {
        let { containerEl } = local;
        if (containerEl && !containerEl?.userData.isEventRegistered) {
            containerEl.addEventListener('click', HandleClickEvt);
            containerEl.userData.isEventRegistered = true;
        }
    }

    function HandleClickEvt(evt) {
        let targetEl = evt.target;
        let itemEl = targetEl.closest('[data-slot="root"]');
        let actionEl = targetEl.closest('[data-action]');
        let action = targetEl.closest('[data-action]')?.dataset.action;

        if (!local.containerEl.contains(actionEl)) {
            action = 'default';
        }

        handleClickAction(evt, itemEl, action);
    }

    // # dom events, # events
    function handleClickAction(evt, itemEl, action) {
        let callback = opt?.eventsMap?.[action];
        callback?.({
            evt,
            itemEl,
            data: opt?.eventDataCallback?.({ evt, itemEl }) ?? null,
        });
    }

    // # refresh
    function Refresh() {
        let { containerEl } = local;

        if (!containerEl) return;

        containerEl.userData = containerEl.userData ?? {};

        registerEventListeners();

        let items = opt?.retrieveDataCallback?.(local.options) ?? [];
        listContainer.Refresh(items);
    }

    // # build
    function buildListItem(node, item) {
        let slots = DOMSlots(node);
        return opt?.builderCallback?.(slots, item);
    }

    function RefreshItem(item) {
        listContainer.RefreshSingle(item);
    }

    // # init
    {
        if (opt?.containerEl) {
            listContainer.SetContainer(opt.containerEl);
        }
    }

    return SELF;

}
