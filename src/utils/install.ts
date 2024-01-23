import type { App, AppContext, Component, Plugin } from "vue";

function camelize(str: string): string {
    return str.replace(/-(\w)/g, (_, s) => s.toUpperCase());
}

export type withInstall<T> = T & { install: (app: App) => void };
export function withInstall<T extends Component>(opt: T) {
    (opt as Record<string, unknown>).install = (app: App) => {
        const { name } = opt;
        if (!name) return;
        app.component(name, opt);
        app.component(camelize(`-${name}`), opt);
    };

    return opt as withInstall<T>;
}

export type sfcInstall<T> = T & Plugin;
export type sfcInstallWithContext<T> = T & { _context: AppContext };
export function withFunctionInstall<T>(fn: sfcInstall<T>, name: string) {
    fn.install = (app: App) => {
        (fn as sfcInstallWithContext<T>)._context = app._context;
        app.config.globalProperties[`${name}`] = fn;
    };
    return fn as sfcInstallWithContext<T>;
}
