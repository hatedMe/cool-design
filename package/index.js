import Button from "./button/index";
import Icon from "./icon/index";
import Row from "./row/index"
import Checkbox from "./checkbox";
import CheckboxGroup from "./checkbox-group";

const version = '1.0.0';
const components = [
    Button,
    Icon,
    Row,
    Checkbox,
    CheckboxGroup
]

const install = (Vue) => {
    components.forEach(component => {
        Vue.component(component.name, component)
    });
}

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    version,
    install,
};