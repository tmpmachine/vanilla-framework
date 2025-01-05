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

Basic styling with transition and to allow backdrop click:

`skin.css`
```css
/* # windog */
.wg-windog {
  & {
    --sec: 250ms;
  }
  
  & {
    transition: display var(--sec) allow-discrete, overlay var(--sec) allow-discrete, opacity var(--sec);
    padding: 0;
    background: transparent;
    border: 0;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }
  &:not(.transitionless)::backdrop {
    transition: opacity var(--sec);
    opacity: 0;
  }
  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }
  .inner {
    height: 100%;
    display: flex;
    overflow: hidden;
    width: 100%;
  }
  .wrapper {
   &{
    transition: opacity var(--sec), transform var(--sec);
    opacity: 0;
    transform: scale(0.95);
    background: white;
    min-width: 360px;
    overflow: auto;
    max-height: 100%;
    max-width: 100%;
    margin: auto;
    position: relative;
    border-radius: 0.4rem;
  }
    &:not([class*="skin-"]) {
      border: 3px solid;
      padding: 1rem;
    }
    &.skin-1{
      &{
        border-radius: 0.7rem;
        padding: 1rem 0;
      }
      >section{
        padding: 0 1rem;
      }
    }
    &.varian-h100 {
      height: 100%;
    }
    &.varian-flex{
      &{
        display: flex;
        flex-direction: column;
      }
      .body{
        flex: 1;
        overflow: auto;
      }
    }
  }
  &[open] .wrapper {
    & {
      transform: scale(1);
      opacity: 1;
    }
    @starting-style {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  &[open] {
    &::backdrop {
      opacity: 1;
    }
    @starting-style {
      &::backdrop{
        opacity: 0;
      }
    }
  }
  .backdrop {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
  }
  button:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }
}
```

### Lazy Load

Add `src` to the dialogs bundle HTML file.

`dialogs.js`
```js
let dialogObjectives = DialogFactory({
    src: 'dialog.html',
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
<div class="_dialogTemplates">
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

`skin.css`
```css
.wg-loading {
  float: right;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  margin: 8px;
}
.wg-loading svg {
  animation: rotate 3s linear infinite;
}
.wg-loading::after{
  content: 'Loading';
  color: white;
  font-size: 0.6rem;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
```


## Actions
- Show_()
- Close()
- Refresh()

## Example
```js
dialogObjectives.Show_();
```
