export default function bem (componentName) {
    return function (elementOrMods, mods) {
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
                ? Object.keys(mods).reduce(function (result, name) {
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
