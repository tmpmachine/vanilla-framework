/* v1 */
function ViewStateFactory(opt={
  selector: 'body',
  hiddenClass: 'is-hidden',
  onHide: null,
  onEnter: null,
}) {

    let isAnimationStart = false;
    let isInitialLoad = true;
    let selector = opt.selector ?? 'body';
    let hiddenClass = opt.hiddenClass ?? 'is-hidden';
    let transitionTimeout = opt.transitionTimeout ?? 1;

    let screens = DOMStates({
        selector: `${selector} > [data-view-name]`,
    })

    let activeScreen = DOMStates({
        selector: `${selector} > [data-view-name]:not(template)`,
    })

    let stateManager = screens.clone({
        onUpdate: async (nodes, { name }) => {

            if (isAnimationStart) return;

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

                    if (!isInitialLoad) {
                        node.classList.add('is-clean-animation-state');
                    }

                    let hidePromise = new Promise(async resolve => {
                        await new Promise(resolve => window.setTimeout(resolve, transitionTimeout));
                        node.classList.remove(opt.hiddenClass);
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
                }

                if (!isInitialLoad) {
                    window.setTimeout(() => {
                        node?.classList.remove('is-clean-animation-state');
                    }, 1);
                }

                new Promise(resolve => setTimeout(() => {
                    resolve();
                    isAnimationStart = false;
                }, transitionTimeout));
            } else {
                targetScreen.classList.remove(opt.hiddenClass);
                isAnimationStart = false;
            }

            isInitialLoad = false;
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
