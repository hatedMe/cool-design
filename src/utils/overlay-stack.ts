const layers: Array<{ token: symbol; focus: boolean }> = [];
let zIndex = 2000;
export function pushOverlay(token: symbol, focus = false) {
    layers.push({ token, focus });
    return ++zIndex;
}
export function removeOverlay(token: symbol) {
    const i = layers.findIndex((layer) => layer.token === token);
    if (i >= 0) layers.splice(i, 1);
}
export const isTopOverlay = (token: symbol) => layers[layers.length - 1]?.token === token;
export const isTopFocusOverlay = (token: symbol) => layers.filter((layer) => layer.focus).slice(-1)[0]?.token === token;
