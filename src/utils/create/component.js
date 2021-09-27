
const camelizeRE = /-(\w)/g;
function camelize (str) {
    return str.replace(camelizeRE, (_, c) => c.toUpperCase());
}

const install = function (Vue) {
    const { name } = this;
    Vue.component(name, this);
    Vue.component(camelize(`-${name}`), this);
};

export default function createComponent (name) {
    return function functionName (component) {
        component.name = name;
        component.install = install;
        return component;
    };
};
