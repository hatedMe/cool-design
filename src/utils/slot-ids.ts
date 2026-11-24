import { Fragment, Static, Teleport, isVNode } from 'vue';

interface SlotIds {
  explicit: Set<unknown>;
  encoded: Map<string, number>;
}

const staticIdPattern = /(?=[\t\n\f\r ]id[\t\n\f\r ]*=[\t\n\f\r ]*(?:"([^"]*)"|'([^']*)'|([^\t\n\f\r >]+)))/gi;

export function createSlotIds(rootId?: unknown): SlotIds {
  return { explicit: new Set([rootId]), encoded: new Map() };
}

export function reserveSlotIds(ids: SlotIds, children: unknown): void {
  if (Array.isArray(children)) {
    for (const child of children) reserveSlotIds(ids, child);
  } else if (isVNode(children)) {
    ids.explicit.add(children.props?.id);
    if (children.type === Static && typeof children.children === 'string') {
      for (const [, doubleQuoted, singleQuoted, bare] of children.children.matchAll(staticIdPattern)) {
        const value = doubleQuoted ?? singleQuoted ?? bare;
        const ampersand = value.indexOf('&');
        if (ampersand === -1) {
          ids.explicit.add(value);
        } else {
          // HTML 字符引用解码后不会增长，前缀与长度可保守判断碰撞。
          const prefix = value.slice(0, ampersand);
          ids.encoded.set(prefix, Math.max(ids.encoded.get(prefix) ?? 0, value.length));
        }
      }
    } else if (typeof children.type === 'string' || children.type === Fragment || children.type === Teleport) {
      reserveSlotIds(ids, children.children);
    }
  }
}

export function avoidIdCollision(id: string, reserved: SlotIds): string {
  const mayCollide = () => [...reserved.encoded].some(([prefix, length]) => id.length <= length && id.startsWith(prefix));
  while (reserved.explicit.has(id) || mayCollide()) id += '-fallback';
  return id;
}
