```html
<script src="pwa-cacher.js"></script>
<section>
  [h2 'Offline Access']
  
  <!-- PWA cache manager -->
  [ .flex .gap-50
    <button data-slot="cacheBtn" onclick="pwaCacher.Update()">Enable</button>
    <button data-slot="clearBtn" onclick="pwaCacher.Clear()">Disable</button>
  ]
  [
    <button data-slot="updateBtn" onclick="pwaCacher.Update()">Cache latest version</button>
  ]
  [
    <label>
      <input name="replaceWidgetSettings" type="checkbox" oninput="pwaCacher.SetAutoCache(this.checked)" data-slot="cacheOpt"/>
      Automatically cache latest version.
    </label>
  ]
  [ data-slot="txtInfo" .hide-empty]
  [pre data-slot="urls" .hide-empty]
</section>
```

```js
pwaCacher.Init();
```
