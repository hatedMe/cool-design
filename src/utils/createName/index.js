import bem from "./bem";

export function createNamespace (prefix) {
    const name = "i-" + prefix;
    return [ 
        name,
        bem(name)
    ];
}
