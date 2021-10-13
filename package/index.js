import Button from "./button/index";
import Icon from "./icon/index";
import Row from "./row/index"
import Checkbox from "./checkbox";
import CheckboxGroup from "./checkbox-group";
import Switch from "./switch/index";
import Select from "./select/index";
import RadioGroup from "./radio-group/index";
import Radio from "./radio/index";
import RadioButton from "./radio-button/index";
import Rate from './rate/index'
import InputNumber from './input-number/index'
import Cascader from './cascader/index'

const version = '1.0.0';
const components = [
    Button,
    Icon,
    Row,
    Checkbox,
    CheckboxGroup,
    Switch,
    Select,
    Radio,
    RadioGroup,
    RadioButton,
    Rate,
    InputNumber,
    Cascader
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