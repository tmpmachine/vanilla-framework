Version: 4

## Setup
Hide any hidden screen by wrapping inside `<template>`. This is good for SEO and performance to avoid rendering. The hidden screen container must containt `data-hidden` attribute.
```html
<!-- written in divless HTML format -->
<!-- https://github.com/tmpmachine/divless-html -->
<body>

[ data-view-name="main"
  [ .inner
    page 1
    [btn onclick="viewStateRoot.Update({name:'about'})" 'about']
  ]
]
<template data-view-name="about">
[ data-hidden
  [ .inner
    page 2
    [btn onclick="viewStateRoot.Update({name:'main'})" 'main']
  ]
]
</template>

<script src="/libs/dom-states.js"></script>

</body>
```

# Basic Styling & Transition
```
html,body{height:100%}
body{margin:0;display:flex;flex-direction:column;overflow:hidden}

/* # views */
[data-view-name] {
    &{
        height: 100%;
        width: 100%;
        position: absolute;
        overflow: hidden;
        top: 0;
        left: 0;
    }
    & > .inner {
        transition: 150ms;
        overflow: auto;
        height: inherit;
    }  
    &[data-hidden] > .inner{
        transform: translateX(8px);
        opacity: 0;
    } 
}
```

# Initialize & Updating the screen
```js
let viewStateRoot = ViewStateFactory({
  selector: 'body > [data-view-name]',
  transitionTimeout: 150, // adjust to your screen transition time
  onHide: (node) => {
    // reset form, empty element, reset UI, etc.
  }
});

// navigate to certain screen
viewStateRoot.Update_({
  name: 'about',
});
```
