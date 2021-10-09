import Button from "./button/index";
import Icon from "./icon/index";
import Switch from "./switch/index";
import Select from "./select/index";
import Radio from "./radio/index";
import Radiod from "./radio-default/index";
import Radiob from "./radio-button/index";

const version = '1.0.0';
const components = [
    Button,
    Icon,
    Switch,
    Select,
    Radio,
    Radiod,
    Radiob,
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