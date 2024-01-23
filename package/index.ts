import type { App } from "vue";
import Button from "./button";
import Row from "./row";
import Col from "./col";

const version = '1.0.0';
const components = [
    Button,
    Row,
    Col,
]

const install = (Vue:App) => {
    components.forEach(component => {
        Vue.component(component.name, component)
    });
}

export default {
    version,
    install,
};