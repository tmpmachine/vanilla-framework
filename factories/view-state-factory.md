Version: 3

## Setup
Hide any hidden screen by wrapping inside `<template>`. This is good for SEO and performance to avoid rendering. The hidden screen container must containt `data-hidden` attribute.
```html
<!-- written in divless HTML format -->
<!-- https://github.com/tmpmachine/divless-html -->
<body>

[ data-view-name="main"
  page 1
  [btn onclick="viewStateMain.Update({name:'about'})" 'about']
]
<template data-view-name="about">
[ data-hidden
  page 2
  [btn onclick="viewStateMain.Update({name:'main'})" 'main']
]
</template>

<script src="/libs/dom-states.js"></script>

</body>
```
```js
let viewStateRoot = ViewStateFactory({
  selector: 'body > [data-view-name]',
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

Initialize/updating the screen:
```js
viewStateRoot.Update_({
  // name: 'main',
});
```
