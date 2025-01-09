## Generating Manifest Cache

Create resource map file.

`resource-map.js`
```js
export const batches = {
  batch1: [
    'js/libs/dom-slots.js',
    'js/libs/dom-states.js',
    // ...
  ],
  batch2: [
    // ...
  ],
};

export const manifestCache = {
  "version": 2,
  "resourceMap": {
    ...batches,
  },
  "root": [
    "./",
    "index.js",
    "index.html",
    "resource-map.js",
    "script-loader.js",
    "manifest.json",
    "pwa-cacher.js"
  ],
  // ...
};
```

Generate `manifest-cache.json`.

`generate-manifest-cache.js`
```js
import { manifestCache } from './src/resource-map.js';
import fs from 'fs';

const jsonOutput = JSON.stringify(manifestCache, null, 2);
fs.writeFileSync('./src/manifest-cache.json', jsonOutput, 'utf-8');
console.log('Manifest JSON generated successfully.');
```

## Setup A Cache Manager Feature

Setup a feature to control application cache. Make sure this is loaded independently so that user can remove the cache even when something went wrong.

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

Initialize the PWA feature states.

```js
pwaCacher.Init();
```
