Version: 4

Notes: HTML snippets are written in divless HTML format. Visit https://github.com/tmpmachine/divless-html.

## Setup
Hide any hidden screen by wrapping inside `<template>`. This is good for SEO and performance to avoid rendering. The hidden screen container must containt `data-hidden` attribute.
```html
<!DOCTYPE html>
<html>
<head>

</head>
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
  
  <script src="./libs/dom-states.js"></script>
  <script src="./libs/view-state-factory.js"></script>
  <script src="./index.js"></script>
  
</body>
</html>
```

# Basic Styling & Transition
```css
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

# Initialize & Changing Views
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
