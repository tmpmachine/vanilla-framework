Version: 1

Setup:
```html
<!-- written in divless HTML format -->
<!-- https://github.com/tmpmachine/divless-html -->
<body>

[ data-view-name="main" .is-hidden
  page 1
  [btn onclick="viewStateMain.Update({name:'about'})" 'about']
]
[ data-view-name="about" .is-hidden
  page 2
  [btn onclick="viewStateMain.Update({name:'main'})" 'main']
]

</body>
```
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
