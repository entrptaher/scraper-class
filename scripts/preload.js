window.simulateMouseEvent = function simulateEvent(eventx, elem) {
  var event = new MouseEvent(eventx, {
    view: window,
    bubbles: true,
    cancelable: true
  });
  var cb = elem;
  var cancelled = !cb.dispatchEvent(event);
};

window.simulateKeyboardEvent = function simulateEvent(eventx, elem) {
  var event = new KeyboardEvent(eventx, {
    view: window,
    bubbles: true,
    cancelable: true
  });
  var cb = elem;
  var cancelled = !cb.dispatchEvent(event);
};

window.simulateEvent = window.simulateKeyboardEvent;

window.simulateType = function simulateType(selector, value) {
  const elem = document.querySelector(selector);
  elem.value = value;
  for (let event of [
    "click",
    "focus",
    "mousedown",
    "compositionend",
    "compositionstart"
  ]) {
    simulateEvent(event, elem);
  }
};