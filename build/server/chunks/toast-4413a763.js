import { w as writable } from './index2-bd557b7d.js';

const toasts = writable([]);
function addToast(message, type = "success", duration = 4e3) {
  const id = Date.now();
  toasts.update((t) => [...t, { id, message, type }]);
  setTimeout(() => {
    toasts.update((t) => t.filter((toast) => toast.id !== id));
  }, duration);
}

export { addToast as a, toasts as t };
//# sourceMappingURL=toast-4413a763.js.map
