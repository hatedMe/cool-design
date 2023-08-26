
type Mod = string |  { [x: string]: any; };
type Mods = Mod | Mod[];
function bem(componentName: string) {
    return function (elementOrMods?: Mod, mods?:Mods) {
        if (!elementOrMods) {
            return componentName;
        }

        let element;

        if (typeof elementOrMods === "string") {
            element = elementOrMods;
        } else {
            mods = elementOrMods;
        }

        let base = componentName;
        if (element) {
            base += "__" + element;
        }

        return base + (
            mods
                ? Object.keys(mods).reduce<string>(function (result, name) {
                    // @ts-ignore
                    const value = mods[name];

                    if (value) {
                        result += " " + (
                            typeof value === "boolean"
                                ? (base + "--" + name)
                                : (base + "--" + name + "_" + value)
                        );
                    }

                    return result;
                }, "")
                : ""
        );
    };
}


export function createNamespace(name: string) {
    const prefixedName = `i-${name}`;
    return [
        prefixedName,
        bem(prefixedName),
    ] as const;
}