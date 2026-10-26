import type { App } from "vue";
import { version as packageVersion } from "../package.json";
export const version: string = packageVersion;
import Button from "./button";
import Row from "./row";
import Col from "./col";
import ConfigProvider from "./config-provider";
import Input from "./input";
import Select from "./select";
import SelectOption from "./select-option";
import Checkbox from "./checkbox";
import Switch from "./switch";
import Form from "./form";
import FormItem from "./form-item";
import Table from "./table";
import Pagination from "./pagination";
import Dialog from "./dialog";
import Message from "./message";
import "../src/style/index.scss";
export type { FormRule, FormInstance } from "./form";
export type { TableColumn, SortChange } from "./table";
export type { Size, Config } from "./config-provider/context";

export {
    Button,
    Row,
    Col,
    ConfigProvider,
    Input,
    Select,
    SelectOption,
    Checkbox,
    Switch,
    Form,
    FormItem,
    Table,
    Pagination,
    Dialog,
    Message
};
const components = [
    Button,
    Row,
    Col,
    ConfigProvider,
    Input,
    Select,
    SelectOption,
    Checkbox,
    Switch,
    Form,
    FormItem,
    Table,
    Pagination,
    Dialog,
    Message
];
export const install = (app: App) => {
    components.forEach((component) => app.use(component));
};
export default { version, install };
