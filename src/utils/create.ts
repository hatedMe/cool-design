type Mod = string | Record<string, boolean | number | string>;
type Mods = Mod | Mod[];
function bem(componentName: string) {
  return function (elementOrMods?: Mod, mods?: Mods) {
    if (!elementOrMods) {
      return componentName;
    }

    let element;

    if (typeof elementOrMods === 'string') {
      element = elementOrMods;
    } else {
      mods = elementOrMods;
    }

    let base = componentName;
    if (element) {
      base += '__' + element;
    }

    return (
      base +
      (mods
        ? Object.keys(mods).reduce<string>(function (result, name) {
            const value = (mods as Record<string, boolean | number | string>)[name];

            if (value) {
              result += ' ' + (typeof value === 'boolean' ? base + '--' + name : base + '--' + name + '_' + value);
            }

            return result;
          }, '')
        : '')
    );
  };
}

export function createNamespace(name: string) {
  const prefixedName = `i-${name}`;
  return [prefixedName, bem(prefixedName)] as const;
}
