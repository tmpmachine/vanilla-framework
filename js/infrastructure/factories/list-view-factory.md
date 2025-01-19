Create a factory builder. Set `src` for lazy loading from another file.

`list-views.js`
```js
// # builder
let listViewBuilder = (function() {

	function Create(opt) {
		let defaultOpt = {
			src: 'list-item-templates.html',
			itemDataModifier,
			eventDataCallback,
			lookupCallback,
		}
		return ListViewFactory({
			...defaultOpt,
			...opt,
		});
	}

	function eventDataCallback({evt, containerNode}) {
		let node = evt.target.closest('[data-id]');
		if (!containerNode.contains(node)) return;
		
		return {
			id: node.dataset.id ? parseInt(node.dataset.id) : null
		};
	}

	function lookupCallback(containerEl, item) {
		return containerEl.querySelector(`[data-id="${item.id}"]`);
	}

	function itemDataModifier(itemData) {
		itemData.slots = DOMSlots(itemData.itemNode);
	}

	return {
		Create,
	}

})();
```

Initialize a list view.
```js
// # notes (timer)
let listViewTimer_notes = listViewBuilder.Create({
	retrieveDataCallback: () => {
		return servActivity_notes.GetAllByEntity(uiTimer.GetActivityId()).sort((a,b) => b.createdDate - a.createdDate).slice(0, 3);
	},
	templateSelector: "._itemTimerNote",
	builderCallback: ({slots, item}) => {
		slots.content.textContent = item.content;
		return slots.root;
	},
});
```

## Lazy Loading Setup
Below is a shimmer effect for lazy loading. If no default lopading template provided, the list will be blank initially.

`index.html`
```html
<!-- # list view templates -->
<!-- ========= -->
<div class="_listViewTemplates" hidden>
  <template class="_listItemLoading">
    [ .wg-list-item-shimmer]
  </template>
</div>
```

skin.css
```css
.wg-list-item-shimmer {
  width: 100%; /* Adjust width as needed */
  height: 70px; /* Adjust height as needed */
  background: linear-gradient(90deg, #f0f0f01c 25%, #e0e0e03b 50%, #f0f0f045 75%);
  background-size: 200% 100%;
  animation: wg-list-item-shimmer 1.5s infinite;
  margin-bottom: 0.25rem;
}
@keyframes wg-list-item-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
```
