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

## Actions
- Show_()
- Close()
- Refresh()

## Example
```js
dialogObjectives.Show_();
```
