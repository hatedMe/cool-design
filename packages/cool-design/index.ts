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
import type { App } from 'vue';
// 版本号内联为字面量，避免构建时读取 package.json 产生多余产物；发版由 scripts/sync-version.mjs 同步。
export const version: string = '1.14.0';
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
import TableColumnComponent from './table-column';
import TableV2 from './table-v2';
import Pagination from './pagination';
import Dialog from './dialog';
import Message, { ElMessage } from './message';
import Affix from './affix';
import { Anchor, AnchorLink } from './anchor';
import InputTag from './input-tag';
import CascaderPanel from './cascader-panel';
import Mention from './mention';
import InputOtp from './input-otp';
import SelectV2 from './select-v2';
import TreeV2 from './tree-v2';
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
import Upload, { UploadDragger } from './upload';
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
import { Notification, Notify } from './notification';
import Popover from './popover';
import Watermark from './watermark';
import Progress from './progress';
import Carousel, { CarouselItem } from './carousel';
import Collapse, { CollapseItem } from './collapse';
import { installDirectives } from './directives';
import { ElLoading } from './loading';
import {
  MessageBox,
  ElMessageBox,
  MessageBoxComponent,
  installMessageBoxServices
} from './message-box';
export { ClickOutside, InfiniteScroll, ElInfiniteScroll, LoadingDirective, VPopover, ElPopoverDirective, directives, installDirectives } from './directives';
export type { PopoverDirectiveValue } from './popover';
import './style/index.scss';
export type { FormRule, FormInstance, FormFieldContext, FormItemInstance, FormValidateCallback, FormValidateState, FormItemProp, FormFieldPaths } from './form';
export type { SortChange } from './table';
export const TableColumn = TableColumnComponent;
export type TableColumn<T extends object = Record<string, unknown>> = import('./table/types').TableColumn<T>;
export type {
  TableV2CellProps,
  TableV2Column,
  TableV2RowEventHandlers,
  TableV2RowEventParams,
  TableV2RowHeight,
  TableV2SortBy,
  TableV2SortOrder
} from './table-v2';
export type { SelectRemoteOption, SelectTagType, SelectPropsMapping } from './select/select';
export type { CascaderFilterMethod, CascaderModelValue, CascaderNode, CascaderOption, CascaderPropsMapping } from './cascader';
export type { Size, Config, ButtonConfigContext, DialogConfigContext, LinkConfigContext, MessageConfigContext, TableConfigContext } from './config-provider/context';

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
  ElMessageBox,
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
  TableV2,
  Pagination,
  Dialog,
  Message,
  Affix,
  Anchor,
  AnchorLink,
  InputTag,
  CascaderPanel,
  Mention,
  InputOtp,
  SelectV2,
  TreeV2,
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
  UploadDragger,
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
  TableColumn,
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
  MessageBoxComponent,
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
  TableV2,
  Pagination,
  Dialog,
  Message,
  Affix,
  Anchor,
  AnchorLink,
  InputTag,
  CascaderPanel,
  Mention,
  InputOtp,
  SelectV2,
  TreeV2,
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
  UploadDragger,
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
  app.use(ElMessage);
  app.use(Notify);
  app.use(ElLoading);
  installMessageBoxServices(app);
};
export default { version, install };

export { useMessageBox, alert, confirm, msgbox, prompt, MessageBoxComponent } from './message-box';
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
export { ElNotification, Notify } from './notification';
export type {
  NotificationHandle,
  NotificationOptions,
  NotificationPosition,
  NotificationType
} from './notification';
export { ElMessage } from './message';
export type { MessageHandle, MessageOptions, MessagePlacement, MessageType } from './message';
export { ElLoading, ElLoadingDirective, ElLoadingService, vLoading } from './loading';
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

export {
  TableColumn as ElTableColumn,
  Container as ElContainer,
  Header as ElHeader,
  Aside as ElAside,
  Main as ElMain,
  Footer as ElFooter,
  Link as ElLink,
  Text as ElText,
  Scrollbar as ElScrollbar,
  Icon as ElIcon,
  Space as ElSpace,
  Divider as ElDivider,
  Empty as ElEmpty,
  Tag as ElTag,
  Tooltip as ElTooltip,
  Popconfirm as ElPopconfirm,
  Button as ElButton,
  ButtonGroup as ElButtonGroup,
  Row as ElRow,
  Col as ElCol,
  ConfigProvider as ElConfigProvider,
  Input as ElInput,
  InputNumber as ElInputNumber,
  Select as ElSelect,
  Checkbox as ElCheckbox,
  CheckboxButton as ElCheckboxButton,
  CheckboxGroup as ElCheckboxGroup,
  Switch as ElSwitch,
  Form as ElForm,
  FormItem as ElFormItem,
  Table as ElTable,
  TableV2 as ElTableV2,
  Pagination as ElPagination,
  Dialog as ElDialog,
  Affix as ElAffix,
  Anchor as ElAnchor,
  AnchorLink as ElAnchorLink,
  InputTag as ElInputTag,
  CascaderPanel as ElCascaderPanel,
  Mention as ElMention,
  InputOtp as ElInputOtp,
  SelectV2 as ElSelectV2,
  TreeV2 as ElTreeV2,
  Avatar as ElAvatar,
  Badge as ElBadge,
  Radio as ElRadio,
  RadioGroup as ElRadioGroup,
  RadioButton as ElRadioButton,
  Rate as ElRate,
  DatePicker as ElDatePicker,
  TimePicker as ElTimePicker,
  TimeSelect as ElTimeSelect,
  Calendar as ElCalendar,
  Autocomplete as ElAutocomplete,
  ColorPicker as ElColorPicker,
  Slider as ElSlider,
  Transfer as ElTransfer,
  TreeSelect as ElTreeSelect,
  Cascader as ElCascader,
  Upload as ElUpload,
  Card as ElCard,
  Descriptions as ElDescriptions,
  DescriptionsItem as ElDescriptionsItem,
  Image as ElImage,
  ImageViewer as ElImageViewer,
  Result as ElResult,
  Skeleton as ElSkeleton,
  SkeletonItem as ElSkeletonItem,
  Tree as ElTree,
  Timeline as ElTimeline,
  TimelineItem as ElTimelineItem,
  Backtop as ElBacktop,
  Countdown as ElCountdown,
  Segmented as ElSegmented,
  Tour as ElTour,
  Splitter as ElSplitter,
  SplitterPanel as ElSplitterPanel,
  Statistic as ElStatistic,
  Menu as ElMenu,
  MenuItem as ElMenuItem,
  SubMenu as ElSubMenu,
  MenuItemGroup as ElMenuItemGroup,
  Breadcrumb as ElBreadcrumb,
  BreadcrumbItem as ElBreadcrumbItem,
  Tabs as ElTabs,
  TabPane as ElTabPane,
  Dropdown as ElDropdown,
  DropdownMenu as ElDropdownMenu,
  DropdownItem as ElDropdownItem,
  Steps as ElSteps,
  Step as ElStep,
  PageHeader as ElPageHeader,
  Alert as ElAlert,
  Drawer as ElDrawer,
  Popover as ElPopover,
  Watermark as ElWatermark,
  Progress as ElProgress,
  Carousel as ElCarousel,
  CarouselItem as ElCarouselItem,
  Collapse as ElCollapse,
  CollapseItem as ElCollapseItem,
  SelectOption as ElOption,
  SelectOptionGroup as ElOptionGroup
};
