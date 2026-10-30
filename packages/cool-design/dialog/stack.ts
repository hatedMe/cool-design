import { pushOverlay, removeOverlay, isTopOverlay, isTopFocusOverlay } from '../../../src/utils/overlay-stack';
const dialogs: symbol[] = [];
let originalOverflow = '';
export function lockDialog(token: symbol) {
  if (!dialogs.length) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  dialogs.push(token);
  return pushOverlay(token, true);
}
export const isTopDialog = (token: symbol) => isTopOverlay(token);
export function unlockDialog(token: symbol) {
  removeOverlay(token);
  const index = dialogs.indexOf(token);
  if (index >= 0) dialogs.splice(index, 1);
  if (!dialogs.length) document.body.style.overflow = originalOverflow;
}

export const isTopFocusDialog = isTopFocusOverlay;
