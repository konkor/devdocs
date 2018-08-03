/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// Traversing
//

let smoothDistance, smoothDuration, smoothEnd, smoothStart;
this.$ = function(selector, el) {
  if (el == null) { el = document; }
  try { return el.querySelector(selector); } catch (error) {}
};

this.$$ = function(selector, el) {
  if (el == null) { el = document; }
  try { return el.querySelectorAll(selector); } catch (error) {}
};

$.id = id => document.getElementById(id);

$.hasChild = function(parent, el) {
  if (!parent) { return; }
  while (el) {
    if (el === parent) { return true; }
    if (el === document.body) { return; }
    el = el.parentNode;
  }
};

$.closestLink = function(el, parent) {
  if (parent == null) { parent = document.body; }
  while (el) {
    if (el.tagName === 'A') { return el; }
    if (el === parent) { return; }
    el = el.parentNode;
  }
};

//
// Events
//

$.on = function(el, event, callback, useCapture) {
  if (useCapture == null) { useCapture = false; }
  if (event.indexOf(' ') >= 0) {
    for (let name of Array.from(event.split(' '))) { $.on(el, name, callback); }
  } else {
    el.addEventListener(event, callback, useCapture);
  }
};

$.off = function(el, event, callback, useCapture) {
  if (useCapture == null) { useCapture = false; }
  if (event.indexOf(' ') >= 0) {
    for (let name of Array.from(event.split(' '))) { $.off(el, name, callback); }
  } else {
    el.removeEventListener(event, callback, useCapture);
  }
};

$.trigger = function(el, type, canBubble, cancelable) {
  if (canBubble == null) { canBubble = true; }
  if (cancelable == null) { cancelable = true; }
  const event = document.createEvent('Event');
  event.initEvent(type, canBubble, cancelable);
  el.dispatchEvent(event);
};

$.click = function(el) {
  const event = document.createEvent('MouseEvent');
  event.initMouseEvent('click', true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
  el.dispatchEvent(event);
};

$.stopEvent = function(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
};

$.eventTarget = event => event.target.correspondingUseElement || event.target;

//
// Manipulation
//

const buildFragment = function(value) {
  const fragment = document.createDocumentFragment();

  if ($.isCollection(value)) {
    for (let child of Array.from($.makeArray(value))) { fragment.appendChild(child); }
  } else {
    fragment.innerHTML = value;
  }

  return fragment;
};

$.append = function(el, value) {
  if (typeof value === 'string') {
    el.insertAdjacentHTML('beforeend', value);
  } else {
    if ($.isCollection(value)) { value = buildFragment(value); }
    el.appendChild(value);
  }
};

$.prepend = function(el, value) {
  if (!el.firstChild) {
    $.append(value);
  } else if (typeof value === 'string') {
    el.insertAdjacentHTML('afterbegin', value);
  } else {
    if ($.isCollection(value)) { value = buildFragment(value); }
    el.insertBefore(value, el.firstChild);
  }
};

$.before = function(el, value) {
  if ((typeof value === 'string') || $.isCollection(value)) {
    value = buildFragment(value);
  }

  el.parentNode.insertBefore(value, el);
};

$.after = function(el, value) {
  if ((typeof value === 'string') || $.isCollection(value)) {
    value = buildFragment(value);
  }

  if (el.nextSibling) {
    el.parentNode.insertBefore(value, el.nextSibling);
  } else {
    el.parentNode.appendChild(value);
  }
};

$.remove = function(value) {
  if ($.isCollection(value)) {
    for (let el of Array.from($.makeArray(value))) { if (el.parentNode != null) {
      el.parentNode.removeChild(el);
    } }
  } else {
    if (value.parentNode != null) {
      value.parentNode.removeChild(value);
    }
  }
};

$.empty = function(el) {
  while (el.firstChild) { el.removeChild(el.firstChild); }
};

// Calls the function while the element is off the DOM to avoid triggering
// unnecessary reflows and repaints.
$.batchUpdate = function(el, fn) {
  const parent = el.parentNode;
  const sibling = el.nextSibling;
  parent.removeChild(el);

  fn(el);

  if (sibling) {
    parent.insertBefore(el, sibling);
  } else {
    parent.appendChild(el);
  }
};

//
// Offset
//

$.rect = el => el.getBoundingClientRect();

$.offset = function(el, container) {
  if (container == null) { container = document.body; }
  let top = 0;
  let left = 0;

  while (el && (el !== container)) {
    top += el.offsetTop;
    left += el.offsetLeft;
    el = el.offsetParent;
  }

  return {
    top,
    left
  };
};

$.scrollParent = function(el) {
  while ((el = el.parentNode) && (el.nodeType === 1)) {
    var needle;
    if (el.scrollTop > 0) { break; }
    if ((needle = __guard__(getComputedStyle(el), x => x.overflowY), ['auto', 'scroll'].includes(needle))) { break; }
  }
  return el;
};

$.scrollTo = function(el, parent, position, options) {
  if (position == null) { position = 'center'; }
  if (options == null) { options = {}; }
  if (!el) { return; }

  if (parent == null) { parent = $.scrollParent(el); }
  if (!parent) { return; }

  const parentHeight = parent.clientHeight;
  const parentScrollHeight = parent.scrollHeight;
  if (!(parentScrollHeight > parentHeight)) { return; }

  const { top } = $.offset(el, parent);
  const { offsetTop } = parent.firstElementChild;

  switch (position) {
    case 'top':
      parent.scrollTop = top - offsetTop - ((options.margin != null) ? options.margin : 0);
      break;
    case 'center':
      parent.scrollTop = top - Math.round((parentHeight / 2) - (el.offsetHeight / 2));
      break;
    case 'continuous':
      var { scrollTop } = parent;
      var height = el.offsetHeight;

      var lastElementOffset = parent.lastElementChild.offsetTop + parent.lastElementChild.offsetHeight;
      var offsetBottom = lastElementOffset > 0 ? parentScrollHeight - lastElementOffset : 0;

      // If the target element is above the visible portion of its scrollable
      // ancestor, move it near the top with a gap = options.topGap * target's height.
      if ((top - offsetTop) <= (scrollTop + (height * (options.topGap || 1)))) {
        parent.scrollTop = top - offsetTop - (height * (options.topGap || 1));
      // If the target element is below the visible portion of its scrollable
      // ancestor, move it near the bottom with a gap = options.bottomGap * target's height.
      } else if ((top + offsetBottom) >= ((scrollTop + parentHeight) - (height * ((options.bottomGap || 1) + 1)))) {
        parent.scrollTop = ((top + offsetBottom) - parentHeight) + (height * ((options.bottomGap || 1) + 1));
      }
      break;
  }
};

$.scrollToWithImageLock = function(el, parent, ...args) {
  if (parent == null) { parent = $.scrollParent(el); }
  if (!parent) { return; }

  $.scrollTo(el, parent, ...Array.from(args));

  // Lock the scroll position on the target element for up to 3 seconds while
  // nearby images are loaded and rendered.
  for (var image of Array.from(parent.getElementsByTagName('img'))) {
    if (!image.complete) {
      (function() {
        let timeout;
        const onLoad = function(event) {
          clearTimeout(timeout);
          unbind(event.target);
          return $.scrollTo(el, parent, ...Array.from(args));
        };

        var unbind = target => $.off(target, 'load', onLoad);

        $.on(image, 'load', onLoad);
        return timeout = setTimeout(unbind.bind(null, image), 3000);
      })();
    }
  }
};

// Calls the function while locking the element's position relative to the window.
$.lockScroll = function(el, fn) {
  let parent;
  if (parent = $.scrollParent(el)) {
    let { top } = $.rect(el);
    if (![document.body, document.documentElement].includes(parent)) { top -= $.rect(parent).top; }
    fn();
    parent.scrollTop = $.offset(el, parent).top - top;
  } else {
    fn();
  }
};

let smoothScroll =  (smoothStart = (smoothEnd = (smoothDistance = (smoothDuration = null))));

$.smoothScroll = function(el, end) {
  if (!window.requestAnimationFrame) {
    el.scrollTop = end;
    return;
  }

  smoothEnd = end;

  if (smoothScroll) {
    const newDistance = smoothEnd - smoothStart;
    smoothDuration += Math.min(300, Math.abs(smoothDistance - newDistance));
    smoothDistance = newDistance;
    return;
  }

  smoothStart = el.scrollTop;
  smoothDistance = smoothEnd - smoothStart;
  smoothDuration = Math.min(300, Math.abs(smoothDistance));
  const startTime = Date.now();

  smoothScroll = function() {
    const p = Math.min(1, (Date.now() - startTime) / smoothDuration);
    const y = Math.max(0, Math.floor(smoothStart + (smoothDistance * (p < 0.5 ? 2 * p * p : (p * (4 - (p * 2))) - 1))));
    el.scrollTop = y;
    if (p === 1) {
      return smoothScroll = null;
    } else {
      return requestAnimationFrame(smoothScroll);
    }
  };
  return requestAnimationFrame(smoothScroll);
};

//
// Utilities
//

$.extend = function(target, ...objects) {
  for (let object of Array.from(objects)) {
    if (object) {
      for (let key in object) {
        const value = object[key];
        target[key] = value;
      }
    }
  }
  return target;
};

$.makeArray = function(object) {
  if (Array.isArray(object)) {
    return object;
  } else {
    return Array.prototype.slice.apply(object);
  }
};

$.arrayDelete = function(array, object) {
  const index = array.indexOf(object);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  } else {
    return false;
  }
};

// Returns true if the object is an array or a collection of DOM elements.
$.isCollection = object => Array.isArray(object) || (typeof (object != null ? object.item : undefined) === 'function');

const ESCAPE_HTML_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

const ESCAPE_HTML_REGEXP = /[&<>"'\/]/g;

$.escape = string => string.replace(ESCAPE_HTML_REGEXP, match => ESCAPE_HTML_MAP[match]);

const ESCAPE_REGEXP = /([.*+?^=!:${}()|\[\]\/\\])/g;

$.escapeRegexp = string => string.replace(ESCAPE_REGEXP, "\\$1");

$.urlDecode = string => decodeURIComponent(string.replace(/\+/g, '%20'));

$.classify = function(string) {
  string = string.split('_');
  for (let i = 0; i < string.length; i++) {
    const substr = string[i];
    string[i] = substr[0].toUpperCase() + substr.slice(1);
  }
  return string.join('');
};

$.framify = function(fn, obj) {
  if (window.requestAnimationFrame) {
    return (...args) => requestAnimationFrame(fn.bind(obj, ...Array.from(args)));
  } else {
    return fn;
  }
};

$.requestAnimationFrame = function(fn) {
  if (window.requestAnimationFrame) {
    requestAnimationFrame(fn);
  } else {
    setTimeout(fn, 0);
  }
};

//
// Miscellaneous
//

$.noop = function() {};

$.popup = function(value) {
  try {
    const win = window.open();
    if (win.opener) { win.opener = null; }
    win.location = value.href || value;
  } catch (error) {
    window.open(value.href || value, '_blank');
  }
};

let isMac = null;
$.isMac = () => isMac != null ? isMac : (isMac = (navigator.userAgent != null ? navigator.userAgent.indexOf('Mac') : undefined) >= 0);

let isIE = null;
$.isIE = () => isIE != null ? isIE : (isIE = ((navigator.userAgent != null ? navigator.userAgent.indexOf('MSIE') : undefined) >= 0) || ((navigator.userAgent != null ? navigator.userAgent.indexOf('rv:11.0') : undefined) >= 0));

let isAndroid = null;
$.isAndroid = () => isAndroid != null ? isAndroid : (isAndroid = (navigator.userAgent != null ? navigator.userAgent.indexOf('Android') : undefined) >= 0);

let isIOS = null;
$.isIOS = () => isIOS != null ? isIOS : (isIOS = ((navigator.userAgent != null ? navigator.userAgent.indexOf('iPhone') : undefined) >= 0) || ((navigator.userAgent != null ? navigator.userAgent.indexOf('iPad') : undefined) >= 0));

$.overlayScrollbarsEnabled = function() {
  if (!$.isMac()) { return false; }
  const div = document.createElement('div');
  div.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: absolute');
  document.body.appendChild(div);
  const result = div.offsetWidth === div.clientWidth;
  document.body.removeChild(div);
  return result;
};

const HIGHLIGHT_DEFAULTS = {
  className: 'highlight',
  delay: 1000
};

$.highlight = function(el, options) {
  if (options == null) { options = {}; }
  options = $.extend({}, HIGHLIGHT_DEFAULTS, options);
  el.classList.add(options.className);
  setTimeout((() => el.classList.remove(options.className)), options.delay);
};

$.copyToClipboard = function(string) {
  let result;
  const textarea = document.createElement('textarea');
  textarea.style.position = 'fixed';
  textarea.style.opacity = 0;
  textarea.value = string;
  document.body.appendChild(textarea);
  try {
    textarea.select();
    result = !!document.execCommand('copy');
  } catch (error) {
    result = false;
  }
  finally {
    document.body.removeChild(textarea);
  }
  return result;
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}