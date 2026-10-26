import Container from "./container";
import Header from "./header";
import Aside from "./aside";
import Main from "./main";
import Footer from "./footer";
import Link from "./link";
import Icon from "./icon";
import Space from "./space";
import Divider from "./divider";
import Empty from "./empty";
import Loading from "./loading";
import Tag from "./tag";
import Tooltip from "./tooltip";
import Popconfirm from "./popconfirm";
import MessageBox from "./message-box";
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
    Container,
    Header,
    Aside,
    Main,
    Footer,
    Link,
    Icon,
    Space,
    Divider,
    Empty,
    Loading,
    Tag,
    Tooltip,
    Popconfirm,
    MessageBox,
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
    Container,
    Header,
    Aside,
    Main,
    Footer,
    Link,
    Icon,
    Space,
    Divider,
    Empty,
    Loading,
    Tag,
    Tooltip,
    Popconfirm,
    MessageBox,
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

export { useMessageBox } from "./message-box";
export type { MessageBoxAction, MessageBoxOptions } from "./message-box";
export type { TagType } from "./tag/tag";
export type { Placement } from "../src/utils/use-floating";

export { iconNames } from "./icon";
export type { ColSize, ColSizeObject } from "./col";
export type { LinkType, LinkUnderline } from "./link/link";
