import Button from "./button/index";

const version = '1.0.0';
const components = [
    Button
]

const install = (Vue) => {
    components.forEach(component => {
        Vue.component(component.name, component)
    });
}

export default {
    version,
    install,
};