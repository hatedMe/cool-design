import type { App, Component } from 'vue';

function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, s) => s.toUpperCase());
}

const serviceAndExtensionNames = new Set([
  'i-message', 'i-message-box', 'i-notification', 'i-loading', 'i-date-time-picker', 'i-upload-dragger'
]);
const selectNames: Record<string, string> = {
  'i-select-option': 'ElOption',
  'i-select-option-group': 'ElOptionGroup'
};

export type withInstall<T> = T & { install: (app: App) => void };
type WithExposed<T, Exposed> = [Exposed] extends [never] ? T :
  T extends abstract new (...args: infer Args) => infer Instance
    ? { [K in keyof T]: T[K] } & (new (...args: Args) => Instance & Exposed)
    : T;

export type InstalledComponent<T, Exposed = never> = withInstall<WithExposed<T, Exposed>>;

export function withInstall<T extends Component, Exposed = never>(opt: T): InstalledComponent<T, Exposed> {
  (opt as Record<string, unknown>).install = (app: App) => {
    const { name } = opt;
    if (!name) return;
    app.component(name, opt);
    app.component(camelize(`-${name}`), opt);
    if (name.startsWith('i-') && !serviceAndExtensionNames.has(name)) {
      app.component(selectNames[name] ?? `El${camelize(name.slice(1))}`, opt);
    }
  };

  return opt as unknown as withInstall<WithExposed<T, Exposed>>;
}
