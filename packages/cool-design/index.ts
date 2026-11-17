import Container from './container';
import Header from './header';
import Aside from './aside';
import Main from './main';
import Footer from './footer';
import Link from './link';
import Text from './text';
import Scrollbar from './scrollbar';
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
import { version as packageVersion } from '../../package.json';
export const version: string = packageVersion;
import Button from './button';
import ButtonGroup from './button-group';
import Row from './row';
import Col from './col';
import ConfigProvider from './config-provider';
import Input from './input';
import InputNumber from './input-number';
import Select from './select';
import SelectOption from './select-option';
import SelectOptionGroup from './select-option-group';
import Checkbox, { CheckboxButton } from './checkbox';
import CheckboxGroup from './checkbox-group';
import Switch from './switch';
import Form from './form';
import FormItem from './form-item';
import Table from './table';
import Pagination from './pagination';
import Dialog from './dialog';
import Message from './message';
import Affix from './affix';
import { Anchor, AnchorLink } from './anchor';
import InputTag from './input-tag';
import CascaderPanel from './cascader-panel';
import Avatar from './avatar';
import Badge from './badge';
import Radio from './radio';
import RadioGroup from './radio-group';
import RadioButton from './radio-button';
import Rate from './rate';
import { DatePicker, TimePicker, DateTimePicker, Calendar } from './date-picker';
import TimeSelect from './time-select';
import Autocomplete from './autocomplete';
import ColorPicker from './color-picker';
import Slider from './slider';
import Transfer from './transfer';
import TreeSelect from './tree-select';
import Cascader from './cascader';
import Upload from './upload';
import Card from './card';
import Descriptions, { DescriptionsItem } from './descriptions';
import Image, { ImageViewer } from './image';
import Result from './result';
import Skeleton, { SkeletonItem } from './skeleton';
import Tree from './tree';
import Timeline, { TimelineItem } from './timeline';
import Countdown from './countdown';
import Segmented from './segmented';
import Tour from './tour';
import { Splitter, SplitterPanel } from './splitter';
import Statistic from './statistic';
import Backtop from './backtop';
import Menu, { MenuItem, SubMenu, MenuItemGroup } from './menu';
import Breadcrumb, { BreadcrumbItem } from './breadcrumb';
import Tabs, { TabPane } from './tabs';
import Dropdown, { DropdownMenu, DropdownItem } from './dropdown';
import Steps, { Step } from './steps';
import PageHeader from './page-header';
import Alert from './alert';
import Drawer from './drawer';
import { Notification } from './notification';
import Popover from './popover';
import Watermark from './watermark';
import Progress from './progress';
import Carousel, { CarouselItem } from './carousel';
import Collapse, { CollapseItem } from './collapse';
import { installDirectives } from './directives';
export { ClickOutside, InfiniteScroll, LoadingDirective, directives, installDirectives } from './directives';
import './style/index.scss';
export type { FormRule, FormInstance, FormFieldContext, FormItemInstance } from './form';
export type { TableColumn, SortChange } from './table';
export type { SelectRemoteOption, SelectTagType } from './select/select';
export type { CascaderFilterMethod, CascaderModelValue, CascaderNode, CascaderOption, CascaderPropsMapping } from './cascader';
export type { Size, Config } from './config-provider/context';

export {
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Link,
  Text,
  Scrollbar,
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
  InputNumber,
  Select,
  SelectOption,
  SelectOptionGroup,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Form,
  FormItem,
  Table,
  Pagination,
  Dialog,
  Message,
  Affix,
  Anchor,
  AnchorLink,
  InputTag,
  CascaderPanel,
  Avatar,
  Badge,
  Radio,
  RadioGroup,
  RadioButton,
  Rate,
  DatePicker,
  TimePicker,
  TimeSelect,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  Slider,
  Transfer,
  TreeSelect,
  Cascader,
  Upload,
  Card,
  Descriptions,
  DescriptionsItem,
  Image,
  ImageViewer,
  Result,
  Skeleton,
  SkeletonItem,
  Tree,
  Timeline,
  TimelineItem,
  Backtop,
  Countdown,
  Segmented,
  Tour,
  Splitter,
  SplitterPanel,
  Statistic,
  Menu,
  MenuItem,
  SubMenu,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabPane,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Steps,
  Step,
  PageHeader,
  Alert,
  Drawer,
  Notification,
  Popover,
  Watermark,
  Progress,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem
};
const components = [
  Container,
  Header,
  Aside,
  Main,
  Footer,
  Link,
  Text,
  Scrollbar,
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
  InputNumber,
  Select,
  SelectOption,
  SelectOptionGroup,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Form,
  FormItem,
  Table,
  Pagination,
  Dialog,
  Message,
  Affix,
  Anchor,
  AnchorLink,
  InputTag,
  CascaderPanel,
  Avatar,
  Badge,
  Radio,
  RadioGroup,
  RadioButton,
  Rate,
  DatePicker,
  TimePicker,
  TimeSelect,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  Slider,
  Transfer,
  TreeSelect,
  Cascader,
  Upload,
  Card,
  Descriptions,
  DescriptionsItem,
  Image,
  ImageViewer,
  Result,
  Skeleton,
  SkeletonItem,
  Tree,
  Timeline,
  TimelineItem,
  Backtop,
  Countdown,
  Segmented,
  Tour,
  Splitter,
  SplitterPanel,
  Statistic,
  Menu,
  MenuItem,
  SubMenu,
  MenuItemGroup,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  TabPane,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Steps,
  Step,
  PageHeader,
  Alert,
  Drawer,
  Notification,
  Popover,
  Watermark,
  Progress,
  Carousel,
  CarouselItem,
  Collapse,
  CollapseItem
];
export const install = (app: App) => {
  components.forEach((component) => app.use(component));
  installDirectives(app);
};
export default { version, install };

export { useMessageBox } from './message-box';
export type {
  MessageBoxAction,
  MessageBoxBeforeClose,
  MessageBoxInstance,
  MessageBoxOptions,
  MessageBoxPromptResult,
  MessageBoxType
} from './message-box';
export type { TagEffect, TagType } from './tag/tag';
export type { Placement } from '../../src/utils/use-floating';

export { iconNames } from './icon';
export * from './hooks';
export type { ColSize, ColSizeObject } from './col';
export type { LinkType, LinkUnderline } from './link/link';
export type { DatePickerType } from './date-picker';
export type {
  UploadBeforeResult,
  UploadData,
  UploadDataRecord,
  UploadDataValue,
  UploadFile,
  UploadFiles,
  UploadProgressEvent,
  UploadRawFile,
  UploadRequestOptions,
  UploadStatus,
  UploadUserFile
} from './upload';
export type {
  RateColor,
  RateExposed,
  RateIcon,
  RateIconMap,
  RateProps,
  RateSize,
  RateThresholdMap,
  RateThresholdValue
} from './rate';
export { Notify } from './notification';
export type {
  NotificationHandle,
  NotificationOptions,
  NotificationPosition,
  NotificationType
} from './notification';
export { ElMessage } from './message';
export type { MessageHandle, MessageOptions, MessagePlacement, MessageType } from './message';
export type { LoadingInstance, LoadingServiceOptions } from './loading';
export type { AlertEffect, AlertType } from './alert';
export type { TimelineMode, TimelineItem as TimelineItemData } from './timeline';
export type { TimelineItemPlacement, TimelineItemSize, TimelineItemType } from './timeline';
export type { DividerBorderStyle, DividerContentPosition, DividerDirection } from './divider/divider';
export type { ImageFit, ImageLoading, ImageReferrerPolicy } from './image';
export type { ImageViewerToolbarActions } from './image';
export type { DrawerBeforeClose, DrawerDirection, DrawerResizableOptions, DrawerResizePayload } from './drawer/drawer';
export type {
  CalendarCellData,
  CalendarCellType,
  CalendarControllerType,
  CalendarFormatter,
  CalendarSelectDateType
} from './date-picker/calendar';
