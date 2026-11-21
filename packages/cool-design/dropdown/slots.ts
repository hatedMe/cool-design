import type { VNode } from 'vue';

// 替换 Vue 3.2 默认的字符串索引，保留构造签名和静态成员。
export type WithSlots<C extends abstract new (...args: never[]) => { $slots: unknown }, Names extends string> =
  Omit<C, never> & (new (...args: ConstructorParameters<C>) => Omit<InstanceType<C>, '$slots'> & {
    $slots: Readonly<Partial<Record<Names, () => VNode[]>>>;
  });
