import Container from './container';
import Header from './header';
import Aside from './aside';
import Main from './main';
import Footer from './footer';
import Link from './link';
import Icon from './icon';
import Space from './space';
import Divider from './divider';
import Empty from './empty';
import Loading from './loading';
import Tag from './tag';
import Tooltip from './tooltip';
import Popconfirm from './popconfirm';
import MessageBox from './message-box';
import type { App } from 'vue';
import { version as packageVersion } from '../package.json';
export const version: string = packageVersion;
import Button from './button';
import ButtonGroup from './button-group';
import Row from './row';
import Col from './col';
import ConfigProvider from './config-provider';
import Input from './input';
import Select from './select';
import SelectOption from './select-option';
import Checkbox from './checkbox';
import CheckboxGroup from './checkbox-group';
import Switch from './switch';
import Form from './form';
import FormItem from './form-item';
import Table from './table';
import Pagination from './pagination';
import Dialog from './dialog';
import Message from './message';
import Avatar from './avatar';
import Badge from './badge';
import Radio from './radio';
import RadioGroup from './radio-group';
import { DatePicker, TimePicker, DateTimePicker, Calendar } from './date-picker';
import Autocomplete from './autocomplete';
import ColorPicker from './color-picker';
import Slider from './slider';
import Transfer from './transfer';
import TreeSelect from './tree-select';
import Upload from './upload';
import Card from './card';
import Descriptions from './descriptions';
import Image from './image';
import Result from './result';
import Skeleton from './skeleton';
import Tree from './tree';
import Timeline from './timeline';
import Statistic from './statistic';
import Menu from './menu';
import Breadcrumb from './breadcrumb';
import Tabs from './tabs';
import Dropdown from './dropdown';
import Steps from './steps';
import PageHeader from './page-header';
import Alert from './alert';
import Drawer from './drawer';
import { Notification } from './notification';
import Popover from './popover';
import Watermark from './watermark';
import '../src/style/index.scss';
export type { FormRule, FormInstance } from './form';
export type { TableColumn, SortChange } from './table';
export type { SelectRemoteOption } from './select/select';
export type { Size, Config } from './config-provider/context';

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
  ButtonGroup,
  Row,
  Col,
  ConfigProvider,
  Input,
  Select,
  SelectOption,
  Checkbox,
  CheckboxGroup,
  Switch,
  Form,
  FormItem,
  Table,
  Pagination,
  Dialog,
  Message,
  Avatar,
  Badge,
  Radio,
  RadioGroup,
  DatePicker,
  TimePicker,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  Slider,
  Transfer,
  TreeSelect,
  Upload,
  Card,
  Descriptions,
  Image,
  Result,
  Skeleton,
  Tree,
  Timeline,
  Statistic,
  Menu,
  Breadcrumb,
  Tabs,
  Dropdown,
  Steps,
  PageHeader,
  Alert,
  Drawer,
  Notification,
  Popover,
  Watermark
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
  ButtonGroup,
  Row,
  Col,
  ConfigProvider,
  Input,
  Select,
  SelectOption,
  Checkbox,
  CheckboxGroup,
  Switch,
  Form,
  FormItem,
  Table,
  Pagination,
  Dialog,
  Message,
  Avatar,
  Badge,
  Radio,
  RadioGroup,
  DatePicker,
  TimePicker,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  Slider,
  Transfer,
  TreeSelect,
  Upload,
  Card,
  Descriptions,
  Image,
  Result,
  Skeleton,
  Tree,
  Timeline,
  Statistic,
  Menu,
  Breadcrumb,
  Tabs,
  Dropdown,
  Steps,
  PageHeader,
  Alert,
  Drawer,
  Notification,
  Popover,
  Watermark
];
export const install = (app: App) => {
  components.forEach((component) => app.use(component));
};
export default { version, install };

export { useMessageBox } from './message-box';
export type { MessageBoxAction, MessageBoxOptions } from './message-box';
export type { TagType } from './tag/tag';
export type { Placement } from '../src/utils/use-floating';

export { iconNames } from './icon';
export type { ColSize, ColSizeObject } from './col';
export type { LinkType, LinkUnderline } from './link/link';
export type { DatePickerType } from './date-picker';
export { Notify } from './notification';
