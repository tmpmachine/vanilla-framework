/* v1 */
function ListContainerBuilder(opt) {
  
  let $ = document.querySelector.bind(document);
  let containerEl = opt.container ? $(opt.container) : document.createDocumentFragment();
  let templateEl = opt.template ? $(opt.template) : document.createElement('template');
  
  if (templateEl === null) throw new Error(`template not found with selector: ${opt.template}`);
   
  let SELF = {
    Refresh,
    RefreshSingle,
    AppendItems,
    SetContainer,
    GetContainer,
  };
  
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
  
  function RefreshSingle(item) {
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
