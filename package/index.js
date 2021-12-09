import Button from "./button/index";
import Icon from "./icon/index";
import Row from "./row/index"
import Col from "./col"
import Checkbox from "./checkbox";
import CheckboxGroup from "./checkbox-group";
import Switch from "./switch/index";
import Select from "./select/index";
import SelectOption from "./select-option/index";
import RadioGroup from "./radio-group/index";
import Radio from "./radio/index";
import RadioButton from "./radio-button/index";
import Rate from './rate/index'
import InputNumber from './input-number/index'
import Cascader from './cascader/index'
import Progress from './progress/index'
import Tag from './tag/index'
import Pagination from './pagination/index'
import Badge from './badge/index'
import Avatar from './avatar/index'
import Empty from './empty/index'
import Alert from './alert/index'
import Mask from './mask/index'
import message from './message/index'
import alert from './message-box/index'

const version = '1.0.0';
const components = [
    Button,
    Icon,
    Row,
    Col,
    Checkbox,
    CheckboxGroup,
    Switch,
    Select,
    SelectOption,
    Radio,
    RadioGroup,
    RadioButton,
    Rate,
    InputNumber,
    Cascader,
    Progress,
    Tag,
    Pagination,
    Badge,
    Avatar,
    Empty,
    Alert,
    Mask
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
    message,
    alert
};