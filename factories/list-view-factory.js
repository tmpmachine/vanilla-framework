/* v2 */
function ListViewFactory(opt = {
    containerEl: null,
    extraParams: null,
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
        GetOptions: () => JSON.parse(JSON.stringify(local.extraParams)),
        SetOptions,
        SetContainer: (node) => {
            local.containerEl = node;
            listContainer.SetContainer(node);
        },
    };

    // # local
    let local = {
        containerEl: opt?.containerEl,
        extraParams: opt?.extraParams ?? opt?.options ?? {},
    };

    // # list
    let listContainer = new ListContainerBuilder({
        template: opt?.templateSelector ?? '',
        builder: (node, item) => buildListItem(node, item),
        lookup: (containerEl, item) => opt?.lookupCallback?.(containerEl, item),
    });

    // # function

    function defaultEventDataCallback({ itemEl }) {
        return itemEl?.dataset.id ? parseInt(itemEl.dataset.id) : null;
    }

    function defaultLookupCallback(containerEl, item) {
        return containerEl.querySelector(`[data-id="${item.id}"]`);
    }

    function SetOptions(extraParams) {
        for (let key in extraParams) {
            if (typeof (local.extraParams[key]) != 'undefined') {
                local.extraParams[key] = extraParams[key];
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

        let items = opt?.retrieveDataCallback?.(local.extraParams) ?? [];
        listContainer.Refresh(items);
    }

    // # build
    function buildListItem(node, item) {
        let slots = utils.DOMSlots(node);
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
