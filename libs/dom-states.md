```js
// states template
let stateHidden = DOMStates({
    onUpdate: (nodes, {isHidden = true}) => {
        nodes.forEach(node => {
            node.classList.toggle('is-hidden', isHidden);
        });
    }
});
let stateNotHidden = stateHidden.clone({ extraParams: { isHidden: false } });


// state object
let state3DToolbar = {
    hide: stateHidden.clone({ selector: '._3dToolbar' }).update,
    show: stateNotHidden.clone({ selector: '._3dToolbar' }).update,
}
```
