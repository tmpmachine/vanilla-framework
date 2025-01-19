/* v1 */
function DOMSlots(parentNode) {
  let slots = {};
  [...parentNode.querySelectorAll('[data-slot]'), parentNode].forEach(node => {
    let key = node.dataset?.slot;
    
    if (!key || slots[key]) return;
    
    slots[key] = node;
  });
  return slots
}
