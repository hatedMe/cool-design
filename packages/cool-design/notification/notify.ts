import { createVNode, type AppContext, render } from 'vue';
import Notification from './notification';
import type { NotificationOptions } from './types';

function notify(options: NotificationOptions = {}, context: AppContext | null = null) {
  const container = document.createElement('div');
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    render(null, container);
    container.remove();
    options.onClose?.();
  };
  const vnode = createVNode(Notification, { ...options, onClose: close });
  vnode.appContext = context ?? (notify as typeof notify & { _context?: AppContext })._context ?? null;
  render(vnode, document.body.appendChild(container));
  return { close };
}

export default notify;
