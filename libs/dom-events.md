## Usage
```html
[btn 'Download' data-onclick="download"]
```

```js
let eventsMap = {
  onclick: {
    'download': () => compoMain.Download(),
  }
};
```

```js
DOMEvents.Listen(eventsMap);
```
