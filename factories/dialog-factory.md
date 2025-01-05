## Setup
index.html
```html
<template class="_dialogObjectives">
  [dialog .wg-windog
  <!-- # objectives -->
    [ .backdrop]
    <div class="inner">
    [ .wrapper
      [ .flex .justify-between .align-center
        [b 'Objectives']
        [btn 'Add' data-onclick="add"]
      ]
      [hr]
      [ data-slot="listView"]
    ]
    </div>
  ]
</template>
```


`uis/dialogs.js`
```js
// # objectives
let dialogObjectives = DialogFactory({
    templateSelector: '._dialogObjectives',
    onBeforeClose: (dialogEl) => {},
    onShow: ({slots}) => {
        listViewObjectives.SetContainer(slots.listView);
        listViewObjectives.Refresh();
    },
    eventsMap: {
        onclick: {
            'add': () => compoActivity.PromptAddActivity(),
        }
    }
});
```

Basic styling with transition and to allow backdrop click, see [windog.css](https://github.com/tmpmachine/vanilla-framework/blob/main/css/skin/windog.css)

### Lazy Load

Add `src` to the dialogs bundle HTML file.

`dialogs.js`
```js
let dialogObjectives = DialogFactory({
    src: 'dialogs.html',
    /* ... */
});
```

External templates are loaded when open. To preload them, somewhere in your app:

Preloading templates:
```
// preload dialogs
windog.preloadTemplate('dialogs.html');
```

Notes: loading dialog will disappear directly after 250ms (no transition out). This is hardcoded to the library and you must adjust to the `--sec` var in the CSS. It is needed for smooth transition of backdrop opacity when lazy loading.

```css
&:not(.transitionless)::backdrop {
  transition: opacity var(--sec);
  opacity: 0;
}
&::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
```

The `._dialogTemplates` container is optional. It is used to append dialog elements when loaded from external. It will be created if not exists. The `._dialogLoading` dialog also optional. The default will only show backdrop where this one has a nice and simple loading spinner.

`index.html`
```html
<div class="_dialogTemplates" hidden>
  <template class="_dialogLoading">
    [dialog .wg-windog data-empty="true"
      [ .backdrop data-backdrop
        [ .wg-loading
          <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20" fill="none" stroke="#ffffffaa" stroke-dasharray="100" stroke-dashoffset="75" stroke-width="4"/></svg>
        ]
      ]
    ]  
  </template>
</div>
```


## Actions
- Show_()
- Close()
- Refresh()

## Example
```js
dialogObjectives.Show_();
```
