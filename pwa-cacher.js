/* v1.1 */
let pwaCacher = (function() {
  
  let $ = document.querySelector.bind(document);
  let buildVersion = '1';
  let cacheName = `appcache-dailyheroes-NTY3OTYyOTc-build${buildVersion}`;
  let manifestCachePath = './manifest-cache.json';
  
  let SELF = {
    Update,
    SetAutoCache,
    Clear,
    Init,
  };
  
  let data = {
    isAutoCache: true,
  };
  
  let local = {
    domslots: {},
    componentStorageKey: `${cacheName}-settings`,
    defaultDataJSON: JSON.stringify(data),
  };
  
  function save() {
    localStorage.setItem(local.componentStorageKey, JSON.stringify(data));
  }

  async function Clear() {
    let isConfirm = window.confirm('This will disable offline access. Continue?');
    if (!isConfirm) return;

    localStorage.removeItem(local.componentStorageKey);
    data = JSON.parse(local.defaultDataJSON);
    await removeCache();
    refreshSettingsState_();
  }
  
  function SetAutoCache(isChecked) {
    data.isAutoCache = isChecked;
    refreshSettingsState_();
    save();
  }
  
  function extractUrlsFromJson(json) {
    const urls = [];

    (function recurse(obj) {
      for (const key in obj) {
        const value = obj[key];
        if (Array.isArray(value)) {
          urls.push(...value);
        } else if (value && typeof value === "object") {
          recurse(value); // Recurse into nested objects
        }
      }
    })(json);

    return urls;
  }
    
  async function removeCache() {
    let cacheNames = await caches.keys();

    for (let cname of cacheNames) {
      if (cname.includes(cacheName)) {
        await caches.delete(cname);
      }
    }
  }
  
  function Update(opt) {
    cacheAssets(opt);
  }

  function cacheAssets(opt) {
    
    if (!navigator.onLine) {
      console.warn('You are offline.');
      return;
    }

    fetch(manifestCachePath)
    .then(res => res.json())
    .then(async json => {
      
      let cacheURLs = extractUrlsFromJson(json);
      let version = json.version;
      let newCacheVersionKey = `${cacheName}-v${version}`;
      let cacheNames = await caches.keys();
      let hasLatestCache = cacheNames.find(cname => cname == newCacheVersionKey);
        
      for (let cname of cacheNames) {
        if (cname == newCacheVersionKey && opt?.isCheckBySystem) continue;
        if (cname.includes(cacheName)) {
          await caches.delete(cname);
        }
      }
      
      if (hasLatestCache && opt?.isCheckBySystem) return;
  
      let errorURLs = [];
      
      caches.open(newCacheVersionKey)
      .then(function(cache) {
        return Promise.all(
          cacheURLs.map(function(url) {
            return cache.add(url).catch(function(error) {
              console.error('Failed to cache URL:', url, error);
              errorURLs.push(url);
            });
          })
        );
      })
      .then(function() {
        if (errorURLs.length > 0) {
          setInfo('Failed to cache the following URLs. Offline access may work partially.');
          local.domslots.urls.textContent = errorURLs.join('\n');
        } else {
          setInfo('Done! Reload to take effect.')
        }
        refreshSettingsState_();
      })
      .catch(function(error) {
        console.log(error);
        setInfo('Failed. Check console.')
      });
    
    });
    
  };
  
  function loadData() {
    data = JSON.parse(localStorage.getItem(local.componentStorageKey) || local.defaultDataJSON);
  }
  
  function Init() {
    local.domslots = GetSlotEl($('._pwaCacheManagerContainer'));
    loadData();
    refreshSettingsState_();
    triggerAutoUpdate_();
  }

  async function hasCache_() {
    let cacheNames = await caches.keys();
    let hasCache = cacheNames.find(cname => cname.includes(cacheName));
    return hasCache;
  }

  async function triggerAutoUpdate_() {
    let isCached = await hasCache_();
    if (!isCached) return;

    if (data.isAutoCache) {
      cacheAssets({
        isCheckBySystem: true,
      });
    }
  }

  function GetSlotEl(itemEl) {
    let slotData = Array.from(itemEl.querySelectorAll('[data-slot]')).map(x => {
      return {
        key: x.dataset.slot,
        el: x,
      };
    });
    let slotObj = slotData.reduce((obj, item) => {
      obj[item.key] = item.el;
      return obj;
    }, {});
    
    return slotObj;
  }

  function setInfo(txt) {
    let {txtInfo} = local.domslots;
    txtInfo.textContent = txt;
  }
  
  async function refreshSettingsState_() {
    let {cacheBtn, clearBtn, updateBtn, cacheOpt} = local.domslots;
    
    cacheOpt.checked = data.isAutoCache;
    
    let isCached = await hasCache_();
    cacheBtn.disabled = isCached;
    clearBtn.disabled = !isCached;
    
    updateBtn.disabled = !isCached;
    cacheOpt.disabled = !isCached;
  }
  
  return SELF; 
  
})();
