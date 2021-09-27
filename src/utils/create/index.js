import bem from "./bem";
import createComponent from "./component";

export function createNamespace (prefix) {
    const name = "i-" + prefix;
    return [ 
        createComponent(name),
        bem(name)
    ];
}
