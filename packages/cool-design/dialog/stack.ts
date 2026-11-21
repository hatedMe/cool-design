import { pushOverlay, removeOverlay, isTopOverlay, isTopFocusOverlay } from '../../../src/utils/overlay-stack';
const dialogs: symbol[] = [];
const locked = new Set<symbol>();
let originalOverflow = '';
export function lockDialog(token: symbol, lockScroll = true) {
  if (lockScroll && !locked.size) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  if (lockScroll) locked.add(token);
  dialogs.push(token);
  return pushOverlay(token, true);
}
export const isTopDialog = (token: symbol) => isTopOverlay(token);
export function bringDialogToFront(token: symbol) {
  removeOverlay(token);
  return pushOverlay(token, true);
}
export function unlockDialog(token: symbol) {
  removeOverlay(token);
  const index = dialogs.indexOf(token);
  if (index >= 0) dialogs.splice(index, 1);
  if (!locked.delete(token)) return;
  if (!locked.size) document.body.style.overflow = originalOverflow;
}

export const isTopFocusDialog = isTopFocusOverlay;
