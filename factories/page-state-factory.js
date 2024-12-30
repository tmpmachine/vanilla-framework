/* v1 */
function PageStateFactory(stateHandlerMap={}) {

    // # self
    let SELF = {
        Update,
        SetData: (data = null) => local.data = data,
        GetData: () => local.data,
        SetDirty,
    };

    let local = {
        stateHandlers: {},
        data: null,
    };

    // # function

    function SetDirty(stateKeys, dirtyState=true) {
        for (let key of stateKeys) {
            if (typeof(local.stateHandlers[key]) == 'undefined') continue;

            local.stateHandlers[key].isDirty = dirtyState;
        }
    }

    function Update() {
        for (let key in local.stateHandlers) {
            let handler = local.stateHandlers[key];
            if (!handler.isDirty) continue;
            
            handler.callback();
            handler.isDirty = false;
        }
    }

    // # init
    {
        for (let key in stateHandlerMap) {
            local.stateHandlers[key] = {
                isDirty: true,
                callback: stateHandlerMap[key],
            }
        }
    }

    return SELF;
}
