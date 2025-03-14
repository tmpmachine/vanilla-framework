// v2.1
class ViewState {
	/**
	 * @typedef {Object} ViewStateOption
	 * @property {string} containerSelector
	 * @property {string} viewDataKey
	 * @property {number} defaultTransitionTimeout
	 * @property {function(ViewData): void} [onBeforeShow]
	 * @property {function(ViewData): void} [onShow]
	 * @property {function(ViewData): void} [onHide]
	 */

	/**
	 * @typedef {Object} ViewData
	 * @property {HTMLElement} node
	 * @property {string} viewName
	 * @property {boolean} [isFirstRender]
	 */

	/** @param {ViewStateOption} opt */
	constructor(opt) {
		this.containerSelector = opt.containerSelector.trim();
		this.viewDataKey = opt.viewDataKey.trim();
		this.onHide = opt.onHide;
		this.onShow = opt.onShow;
		this.onBeforeShow = opt.onBeforeShow;
		this.defaultTransitionTimeout = opt.transitionTimeout ?? 1;
	}

	GetActiveNode() {
		return document.querySelector(`${this.containerSelector} > [${this.viewDataKey}]:not(template)`);
	}

	async SetActiveView(viewName) {
		let nodes = Array.from(document.querySelectorAll(`${this.containerSelector} > [${this.viewDataKey}]`));

		let targetNode =
			nodes.find((node) => node.getAttribute(this.viewDataKey) == viewName) ??
			nodes.find((node) => node.tagName != 'TEMPLATE') ??
			nodes[0];
		let targetViewName = targetNode.getAttribute(this.viewDataKey);

		if (targetNode.tagName == 'TEMPLATE') {
			let isAlreadyActive = nodes.some(
				(node) => node.getAttribute(this.viewDataKey) == targetViewName && node.tagName != 'TEMPLATE'
			);
			if (isAlreadyActive) return;
		}

		nodes
			.filter((node) => node.tagName != 'TEMPLATE')
			.forEach(async (node) => {
				let viewName = node.getAttribute(this.viewDataKey);
				if (viewName == targetViewName) return; // active view

				let anchorNode = nodes.find(
					(t) => t.tagName == 'TEMPLATE' && t.getAttribute(this.viewDataKey) == viewName
				);

				if (!anchorNode) {
					anchorNode = document.createElement('template');
					anchorNode.setAttribute(this.viewDataKey, viewName);
					node.insertAdjacentElement('beforebegin', anchorNode);
				}

				node.removeAttribute(this.viewDataKey);
				this.onHide?.(
					/** @type {ViewData} */ ({
						node,
						viewName: viewName,
					})
				);
				anchorNode.content.append(node);
			});

		let node = targetNode.content?.firstElementChild ?? targetNode;

		if (node) {
			node.setAttribute(this.viewDataKey, targetViewName);

			let isFirstRender = !node.dataset.rendered;
			/** @type {ViewData} */
			let viewData = {
				node,
				isFirstRender,
				viewName: targetViewName,
			};

			this.onBeforeShow?.(viewData);

			targetNode.parentNode.append(node); // highest element order

			this.onShow?.(viewData);

			node.dataset.rendered = true;
		}
	}
}
