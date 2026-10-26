const dialogs: symbol[] = [];
let originalOverflow = "";
export function lockDialog(token: symbol) {
    if (!dialogs.length) {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    dialogs.push(token);
}
export const isTopDialog = (token: symbol) => dialogs[dialogs.length - 1] === token;
export function unlockDialog(token: symbol) {
    const index = dialogs.indexOf(token);
    if (index >= 0) dialogs.splice(index, 1);
    if (!dialogs.length) document.body.style.overflow = originalOverflow;
}
