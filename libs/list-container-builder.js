/* v3 */
function ListContainerBuilder(opt) {
  
  let $ = document.querySelector.bind(document);
  let containerEl = $(opt?.container) ?? document.createDocumentFragment();
  let templateEl = getTemplateEl(opt?.templateSelector, opt?.template);
   
  let SELF = {
    Refresh,
    RefreshItem,
    AppendItems,
    SetContainer,
    GetContainer,
  };
  
  function getTemplateEl(templateSelector, template = '') {
    let node = $(templateSelector);
    if (node) {
      return node;
    }

    let docEl = document.createElement('template');
    docEl.innerHTML = template;
    return docEl;
  }
  
  function SetContainer(el) {
    containerEl = el;
  }
  
  function GetContainer() {
    return containerEl;
  }
  
  function Refresh(items) {
    refreshListContainer(items, containerEl, templateEl, (clonedNode, item) => opt.builder(clonedNode, item));
  }
  
  function AppendItems(items) {
    let docFrag = document.createDocumentFragment();
    
    for (let item of items) {
      let clonedNode = templateEl?.content.cloneNode(true);
      opt.builder(clonedNode, item);
      docFrag.append(clonedNode);
    }
    
    containerEl?.append(docFrag);
  }
  
  function RefreshItem(item) {
    let itemEl = opt.lookup?.(containerEl, item);
    if (!itemEl) return;
    
    opt.builder(itemEl, item);
  }
  
  function refreshListContainer(items, containerEl, templateEl, onItemClone) {
    let docFrag = document.createDocumentFragment();
    
    containerEl?.replaceChildren();
    
    if (items?.length > 0) {
      for (let item of items) {
        let clonedNode = templateEl?.content.cloneNode(true);
        let node = onItemClone(clonedNode, item);
        if (!node) continue;
        docFrag.append(node);
      }
    }
    
    containerEl?.append(docFrag);
  }
  
  return SELF;
}
