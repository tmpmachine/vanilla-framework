/* v4 */
function ViewStateFactory(opt = {
    selector: null,
    onHide: null,
    onEnter: null,
}) {

    let isAnimationStart = false;
    let selector = opt.selector;
    let defaultTransitionTimeout = opt.transitionTimeout ?? 1;

    let screens = DOMStates({
        selector,
    })

    let activeScreen = DOMStates({
        selector: `${selector.trim()}:not(template)`,
    })

    let stateManager = screens.clone({
        onUpdate: async (nodes, { name, transitionTimeout }) => {
            
            if (isAnimationStart) return;

            if (!transitionTimeout) {
                transitionTimeout = defaultTransitionTimeout;
            }
            
            let targetScreen = nodes.find(node => node.dataset.viewName == name) ?? nodes[0];
            let targetScreenName = targetScreen.dataset.viewName;

            if (targetScreen.tagName == 'TEMPLATE') {
                let isAlreadyActive = nodes.some(node => node.dataset.viewName == targetScreenName && node.tagName != 'TEMPLATE');
                if (isAlreadyActive) return;
            }

            let promises = [];

            nodes
                .filter(node => node.tagName != 'TEMPLATE')
                .forEach(async node => {
                    let screenName = node.dataset.viewName;
                    if (screenName == targetScreenName) return; // active screen

                    let screenAnchorNode = nodes.find(t => t.tagName == 'TEMPLATE' && t.dataset.viewName == screenName);

                    if (!screenAnchorNode) {
                        screenAnchorNode = document.createElement('template');
                        screenAnchorNode.dataset.viewName = screenName;
                        node.insertAdjacentElement('beforebegin', screenAnchorNode);
                    }

                    node.dataset.hidden = true;

                    let hidePromise = new Promise(async resolve => {
                        await new Promise(resolve => window.setTimeout(resolve, transitionTimeout));
                        opt.onHide?.(node);
                        screenAnchorNode.content.append(node);
                        resolve();
                    });
                    promises.push(hidePromise);
                });

            await Promise.all(promises);

            isAnimationStart = true;

            if (targetScreen.tagName == 'TEMPLATE') {
                let node = targetScreen.content.firstElementChild;
                
                if (node) {
                    targetScreen.parentNode.append(node); // highest element order

                    // delay 1ms to allow browser to render initial element state before starting transition
                    window.setTimeout(() => {
                        delete node.dataset.hidden;
                    }, 1);
                }

                await new Promise(resolve => setTimeout(() => {
                    resolve();
                }, transitionTimeout));
            }
            
            isAnimationStart = false;
        }
    });

    // # function
    function GetScreenNode() {
        return activeScreen.getElements()[0];
    }

    // # self
    let SELF = {
        stateManager,
        GetScreenNode,
        Update: (opt) => stateManager.update(opt),
        Update_: async (opt) => await stateManager.updateAsync(opt),
    }

    return SELF;
}
