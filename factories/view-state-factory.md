Version: 1

Setup:
```js
let viewStateMain = ViewStateFactory({
  hiddenClass: 'is-hidden',
  // transitionTimeout: 1,
  onHide: (node) => {
    return;
    // empty data-slot elements
    {
        let slots = utils.DOMSlots(node);
        Object.entries(slots).forEach(([key, value]) => {
            let node = value;
            
            if (!node.classList.contains('is-autoclear')) return;

            node.replaceChildren();
        });
    }

    node.querySelectorAll('form').forEach(e => {
        e.reset();
    })
  }
});
```

Updating the screen:
```js
viewStateMain.Update_({
  // name: 'main',
});
```
