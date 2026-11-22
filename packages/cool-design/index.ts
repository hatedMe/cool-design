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
import CheckTag from './check-tag';
import Tooltip from './tooltip';
import Popconfirm from './popconfirm';
import type { App } from 'vue';
// 版本号内联为字面量，避免构建时读取 package.json 产生多余产物；发版由 scripts/sync-version.mjs 同步。
export const version: string = '1.15.0';
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
import AutoResizer from './auto-resizer';
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
import DatePickerPanel from './date-picker-panel';
import TimeSelect from './time-select';
import Autocomplete from './autocomplete';
import ColorPicker from './color-picker';
import ColorPickerPanel from './color-picker-panel';
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
import TourStep from './tour-step';
export type TourStep = import('./tour/types').TourStep;
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
export type { SortChange, TableHeaderRenderParams, TableOverflowTooltipOptions, TableRowExpandable } from './table';
export const TableColumn = TableColumnComponent;
export type TableColumn<T extends object = Record<string, unknown>> = import('./table/types').TableColumn<T>;
export type {
  TableV2CellParams,
  TableV2CellProps,
  TableV2CellRendererParams,
  TableV2Column,
  TableV2DataGetterParams,
  TableV2ElementProps,
  TableV2HeaderCellParams,
  TableV2HeaderCellRendererParams,
  TableV2HeaderParams,
  TableV2HeaderSlotParams,
  TableV2Key,
  TableV2RowEventHandlers,
  TableV2RowEventParams,
  TableV2RowExpandParams,
  TableV2RowHeight,
  TableV2RowParams,
  TableV2RowsRenderedParams,
  TableV2ScrollOptions,
  TableV2ScrollStrategy,
  TableV2Slots,
  TableV2SortBy,
  TableV2SortOrder,
  TableV2SortState
} from './table-v2';
export type { SelectRemoteOption, SelectTagType, SelectPropsMapping } from './select/select';
export type { CascaderFilterMethod, CascaderModelValue, CascaderNode, CascaderOption, CascaderPropsMapping, CascaderSuggestion, CascaderTag } from './cascader';
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
  CheckTag,
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
  AutoResizer,
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
  DatePickerPanel,
  TimePicker,
  TimeSelect,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  ColorPickerPanel,
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
  TourStep,
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
  CheckTag,
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
  AutoResizer,
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
  DatePickerPanel,
  TimePicker,
  TimeSelect,
  DateTimePicker,
  Calendar,
  Autocomplete,
  ColorPicker,
  ColorPickerPanel,
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
  TourStep,
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
export { datePickerPanelProps, datePickerPanelEmits } from './date-picker-panel';
export type {
  DatePickerPanelCalendarRange, DatePickerPanelCell, DatePickerPanelEmits, DatePickerPanelInstance,
  DatePickerPanelModelValue, DatePickerPanelNavigation, DatePickerPanelProps, DatePickerPanelShortcut,
  DatePickerPanelSlots, DatePickerPanelTimeRules
} from './date-picker-panel';
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
  CheckTag as ElCheckTag,
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
  AutoResizer as ElAutoResizer,
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
  DatePickerPanel as ElDatePickerPanel,
  TimePicker as ElTimePicker,
  TimeSelect as ElTimeSelect,
  Calendar as ElCalendar,
  Autocomplete as ElAutocomplete,
  ColorPicker as ElColorPicker,
  ColorPickerPanel as ElColorPickerPanel,
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
  TourStep as ElTourStep,
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

export type { InputInstance } from './input';
export type { TreeInstance } from './tree';

import type { MessageOptions, MessageHandle } from './message';
import type { NotificationOptions, NotificationHandle } from './notification';
import type { LoadingServiceOptions, LoadingInstance } from './loading';
import type { MessageBoxOptions } from './message-box';
import type { msgbox, alert, confirm, prompt } from './message-box';
import type { AppContext } from 'vue';

declare module 'vue' {
  interface GlobalComponents {
    ElTableColumn: typeof import('./index')['ElTableColumn'];
    ElContainer: typeof import('./index')['ElContainer'];
    ElHeader: typeof import('./index')['ElHeader'];
    ElAside: typeof import('./index')['ElAside'];
    ElMain: typeof import('./index')['ElMain'];
    ElFooter: typeof import('./index')['ElFooter'];
    ElLink: typeof import('./index')['ElLink'];
    ElText: typeof import('./index')['ElText'];
    ElScrollbar: typeof import('./index')['ElScrollbar'];
    ElIcon: typeof import('./index')['ElIcon'];
    ElSpace: typeof import('./index')['ElSpace'];
    ElDivider: typeof import('./index')['ElDivider'];
    ElEmpty: typeof import('./index')['ElEmpty'];
    ElTag: typeof import('./index')['ElTag'];
    ElCheckTag: typeof import('./index')['ElCheckTag'];
    ElTooltip: typeof import('./index')['ElTooltip'];
    ElPopconfirm: typeof import('./index')['ElPopconfirm'];
    ElButton: typeof import('./index')['ElButton'];
    ElButtonGroup: typeof import('./index')['ElButtonGroup'];
    ElRow: typeof import('./index')['ElRow'];
    ElCol: typeof import('./index')['ElCol'];
    ElConfigProvider: typeof import('./index')['ElConfigProvider'];
    ElInput: typeof import('./index')['ElInput'];
    ElInputNumber: typeof import('./index')['ElInputNumber'];
    ElSelect: typeof import('./index')['ElSelect'];
    ElCheckbox: typeof import('./index')['ElCheckbox'];
    ElCheckboxButton: typeof import('./index')['ElCheckboxButton'];
    ElCheckboxGroup: typeof import('./index')['ElCheckboxGroup'];
    ElSwitch: typeof import('./index')['ElSwitch'];
    ElForm: typeof import('./index')['ElForm'];
    ElFormItem: typeof import('./index')['ElFormItem'];
    ElTable: typeof import('./index')['ElTable'];
    ElTableV2: typeof import('./index')['ElTableV2'];
    ElAutoResizer: typeof import('./index')['ElAutoResizer'];
    ElPagination: typeof import('./index')['ElPagination'];
    ElDialog: typeof import('./index')['ElDialog'];
    ElAffix: typeof import('./index')['ElAffix'];
    ElAnchor: typeof import('./index')['ElAnchor'];
    ElAnchorLink: typeof import('./index')['ElAnchorLink'];
    ElInputTag: typeof import('./index')['ElInputTag'];
    ElCascaderPanel: typeof import('./index')['ElCascaderPanel'];
    ElMention: typeof import('./index')['ElMention'];
    ElInputOtp: typeof import('./index')['ElInputOtp'];
    ElSelectV2: typeof import('./index')['ElSelectV2'];
    ElTreeV2: typeof import('./index')['ElTreeV2'];
    ElAvatar: typeof import('./index')['ElAvatar'];
    ElBadge: typeof import('./index')['ElBadge'];
    ElRadio: typeof import('./index')['ElRadio'];
    ElRadioGroup: typeof import('./index')['ElRadioGroup'];
    ElRadioButton: typeof import('./index')['ElRadioButton'];
    ElRate: typeof import('./index')['ElRate'];
    ElDatePicker: typeof import('./index')['ElDatePicker'];
    ElDatePickerPanel: typeof import('./index')['ElDatePickerPanel'];
    ElTimePicker: typeof import('./index')['ElTimePicker'];
    ElTimeSelect: typeof import('./index')['ElTimeSelect'];
    ElCalendar: typeof import('./index')['ElCalendar'];
    ElAutocomplete: typeof import('./index')['ElAutocomplete'];
    ElColorPicker: typeof import('./index')['ElColorPicker'];
    ElColorPickerPanel: typeof import('./index')['ElColorPickerPanel'];
    ElSlider: typeof import('./index')['ElSlider'];
    ElTransfer: typeof import('./index')['ElTransfer'];
    ElTreeSelect: typeof import('./index')['ElTreeSelect'];
    ElCascader: typeof import('./index')['ElCascader'];
    ElUpload: typeof import('./index')['ElUpload'];
    ElCard: typeof import('./index')['ElCard'];
    ElDescriptions: typeof import('./index')['ElDescriptions'];
    ElDescriptionsItem: typeof import('./index')['ElDescriptionsItem'];
    ElImage: typeof import('./index')['ElImage'];
    ElImageViewer: typeof import('./index')['ElImageViewer'];
    ElResult: typeof import('./index')['ElResult'];
    ElSkeleton: typeof import('./index')['ElSkeleton'];
    ElSkeletonItem: typeof import('./index')['ElSkeletonItem'];
    ElTree: typeof import('./index')['ElTree'];
    ElTimeline: typeof import('./index')['ElTimeline'];
    ElTimelineItem: typeof import('./index')['ElTimelineItem'];
    ElBacktop: typeof import('./index')['ElBacktop'];
    ElCountdown: typeof import('./index')['ElCountdown'];
    ElSegmented: typeof import('./index')['ElSegmented'];
    ElTour: typeof import('./index')['ElTour'];
    ElTourStep: typeof import('./index')['ElTourStep'];
    ElSplitter: typeof import('./index')['ElSplitter'];
    ElSplitterPanel: typeof import('./index')['ElSplitterPanel'];
    ElStatistic: typeof import('./index')['ElStatistic'];
    ElMenu: typeof import('./index')['ElMenu'];
    ElMenuItem: typeof import('./index')['ElMenuItem'];
    ElSubMenu: typeof import('./index')['ElSubMenu'];
    ElMenuItemGroup: typeof import('./index')['ElMenuItemGroup'];
    ElBreadcrumb: typeof import('./index')['ElBreadcrumb'];
    ElBreadcrumbItem: typeof import('./index')['ElBreadcrumbItem'];
    ElTabs: typeof import('./index')['ElTabs'];
    ElTabPane: typeof import('./index')['ElTabPane'];
    ElDropdown: typeof import('./index')['ElDropdown'];
    ElDropdownMenu: typeof import('./index')['ElDropdownMenu'];
    ElDropdownItem: typeof import('./index')['ElDropdownItem'];
    ElSteps: typeof import('./index')['ElSteps'];
    ElStep: typeof import('./index')['ElStep'];
    ElPageHeader: typeof import('./index')['ElPageHeader'];
    ElAlert: typeof import('./index')['ElAlert'];
    ElDrawer: typeof import('./index')['ElDrawer'];
    ElPopover: typeof import('./index')['ElPopover'];
    ElWatermark: typeof import('./index')['ElWatermark'];
    ElProgress: typeof import('./index')['ElProgress'];
    ElCarousel: typeof import('./index')['ElCarousel'];
    ElCarouselItem: typeof import('./index')['ElCarouselItem'];
    ElCollapse: typeof import('./index')['ElCollapse'];
    ElCollapseItem: typeof import('./index')['ElCollapseItem'];
    ElOption: typeof import('./index')['ElOption'];
    ElOptionGroup: typeof import('./index')['ElOptionGroup'];
    ITableColumn: typeof TableColumn;
    IContainer: typeof Container;
    IHeader: typeof Header;
    IAside: typeof Aside;
    IMain: typeof Main;
    IFooter: typeof Footer;
    ILink: typeof Link;
    IText: typeof Text;
    IScrollbar: typeof Scrollbar;
    IIcon: typeof Icon;
    ISpace: typeof Space;
    IDivider: typeof Divider;
    IEmpty: typeof Empty;
    ITag: typeof Tag;
    ICheckTag: typeof CheckTag;
    ITooltip: typeof Tooltip;
    IPopconfirm: typeof Popconfirm;
    IButton: typeof Button;
    IButtonGroup: typeof ButtonGroup;
    IRow: typeof Row;
    ICol: typeof Col;
    IConfigProvider: typeof ConfigProvider;
    IInput: typeof Input;
    IInputNumber: typeof InputNumber;
    ISelect: typeof Select;
    ICheckbox: typeof Checkbox;
    ICheckboxButton: typeof CheckboxButton;
    ICheckboxGroup: typeof CheckboxGroup;
    ISwitch: typeof Switch;
    IForm: typeof Form;
    IFormItem: typeof FormItem;
    ITable: typeof Table;
    ITableV2: typeof TableV2;
    IAutoResizer: typeof AutoResizer;
    IPagination: typeof Pagination;
    IDialog: typeof Dialog;
    IAffix: typeof Affix;
    IAnchor: typeof Anchor;
    IAnchorLink: typeof AnchorLink;
    IInputTag: typeof InputTag;
    ICascaderPanel: typeof CascaderPanel;
    IMention: typeof Mention;
    IInputOtp: typeof InputOtp;
    ISelectV2: typeof SelectV2;
    ITreeV2: typeof TreeV2;
    IAvatar: typeof Avatar;
    IBadge: typeof Badge;
    IRadio: typeof Radio;
    IRadioGroup: typeof RadioGroup;
    IRadioButton: typeof RadioButton;
    IRate: typeof Rate;
    IDatePicker: typeof DatePicker;
    IDatePickerPanel: typeof DatePickerPanel;
    ITimePicker: typeof TimePicker;
    ITimeSelect: typeof TimeSelect;
    ICalendar: typeof Calendar;
    IAutocomplete: typeof Autocomplete;
    IColorPicker: typeof ColorPicker;
    IColorPickerPanel: typeof ColorPickerPanel;
    ISlider: typeof Slider;
    ITransfer: typeof Transfer;
    ITreeSelect: typeof TreeSelect;
    ICascader: typeof Cascader;
    IUpload: typeof Upload;
    ICard: typeof Card;
    IDescriptions: typeof Descriptions;
    IDescriptionsItem: typeof DescriptionsItem;
    IImage: typeof Image;
    IImageViewer: typeof ImageViewer;
    IResult: typeof Result;
    ISkeleton: typeof Skeleton;
    ISkeletonItem: typeof SkeletonItem;
    ITree: typeof Tree;
    ITimeline: typeof Timeline;
    ITimelineItem: typeof TimelineItem;
    IBacktop: typeof Backtop;
    ICountdown: typeof Countdown;
    ISegmented: typeof Segmented;
    ITour: typeof Tour;
    ITourStep: typeof TourStep;
    ISplitter: typeof Splitter;
    ISplitterPanel: typeof SplitterPanel;
    IStatistic: typeof Statistic;
    IMenu: typeof Menu;
    IMenuItem: typeof MenuItem;
    ISubMenu: typeof SubMenu;
    IMenuItemGroup: typeof MenuItemGroup;
    IBreadcrumb: typeof Breadcrumb;
    IBreadcrumbItem: typeof BreadcrumbItem;
    ITabs: typeof Tabs;
    ITabPane: typeof TabPane;
    IDropdown: typeof Dropdown;
    IDropdownMenu: typeof DropdownMenu;
    IDropdownItem: typeof DropdownItem;
    ISteps: typeof Steps;
    IStep: typeof Step;
    IPageHeader: typeof PageHeader;
    IAlert: typeof Alert;
    IDrawer: typeof Drawer;
    IPopover: typeof Popover;
    IWatermark: typeof Watermark;
    IProgress: typeof Progress;
    ICarousel: typeof Carousel;
    ICarouselItem: typeof CarouselItem;
    ICollapse: typeof Collapse;
    ICollapseItem: typeof CollapseItem;
    ISelectOption: typeof SelectOption;
    ISelectOptionGroup: typeof SelectOptionGroup;
    ILoading: typeof Loading;
    IMessage: typeof Message;
    INotification: typeof Notification;
    IMessageBox: typeof MessageBoxComponent;
    IDateTimePicker: typeof DateTimePicker;
    IUploadDragger: typeof UploadDragger;
  }

  interface ComponentCustomProperties {
    $message: Omit<typeof import('./index')['ElMessage'], 'install' | '_context'> & ((options: string | MessageOptions, context?: AppContext | null) => MessageHandle);
    $notify: Omit<typeof Notify, 'install' | '_context'> & ((options?: string | NotificationOptions, context?: AppContext | null) => NotificationHandle);
    $loading: (options?: LoadingServiceOptions, context?: AppContext | null) => LoadingInstance;
    $msgbox: (options: Parameters<typeof msgbox>[0], context?: AppContext | null) => ReturnType<typeof msgbox>;
    $messageBox: ComponentCustomProperties['$msgbox'];
    $alert: (message: string, titleOrOptions?: string | MessageBoxOptions, options?: MessageBoxOptions, context?: AppContext | null) => ReturnType<typeof alert>;
    $confirm: (message: string, titleOrOptions?: string | MessageBoxOptions, options?: MessageBoxOptions, context?: AppContext | null) => ReturnType<typeof confirm>;
    $prompt: (message: string, titleOrOptions?: string | MessageBoxOptions, options?: MessageBoxOptions, context?: AppContext | null) => ReturnType<typeof prompt>;
  }
}

export type { InputNumberInstance } from './input-number';
export type { InputOtpInstance } from './input-otp';
export type { InputTagInstance } from './input-tag';
export type { SwitchInstance } from './switch';
export type { MentionInstance } from './mention';
export type { AutocompleteFetchSuggestions, AutocompleteInstance, AutocompleteSuggestion } from './autocomplete';
export type { ColorPickerInstance } from './color-picker';

export type { SelectInstance } from './select';
export type { SelectV2Instance } from './select-v2';
export type { TreeSelectInstance } from './tree-select';
export type { TimeSelectInstance } from './time-select';
export type { CalendarInstance, DatePickerInstance, DateTimePickerInstance, TimePickerInstance } from './date-picker';
export type { AffixInstance, AffixPosition, AffixProps, AffixScrollEvent, AffixTargetContainer } from './affix';
export type { TextInstance, TextProps, TextSize, TextType } from './text';
export type { ButtonInstance } from './button';
export type { SpaceProps } from './space';
export type { AnchorInstance } from './anchor';
export type { CarouselInstance } from './carousel';
export type { CollapseInstance, CollapseItemInstance } from './collapse';
export type { DialogBeforeClose, DialogContentInstance, DialogHeaderScope, DialogInstance, DialogModalClass, DialogSlots } from './dialog';
export type { PaginationInstance, PaginationLayoutItem, PaginationPopperClass, PaginationPopperStyle, PaginationProps, PaginationSlots } from './pagination';
export type { DrawerBeforeClose, DrawerDirection, DrawerInstance, DrawerResizableOptions, DrawerResizePayload } from './drawer';
export type {
  DropdownCommand, DropdownInstance, DropdownItemInstance, DropdownItemOption, DropdownPlacement, DropdownProps,
  DropdownSize, DropdownTrigger, DropdownType
} from './dropdown';
export type { ImageInstance, ImageViewerInstance } from './image';
export type { TourInstance } from './tour';
export type { TabBarInstance, TabNavInstance, TabPaneProps, TabPaneSlots, TabsBeforeLeave, TabsClickPane, TabsInstance, TabsPaneName, TabsProps, TabsSlots } from './tabs';
export type { CascaderInstance } from './cascader';
export type { CascaderPanelInstance } from './cascader-panel';
export type { MenuInstance, MenuItemClicked, MenuPopperClass, MenuRoute, MenuRouterResult, SubMenuInstance } from './menu';
export type { PopoverInstance, PopoverProps, PopoverVirtualRef } from './popover';
export type { PopconfirmActions, PopconfirmInstance, PopconfirmProps } from './popconfirm';
export type { RateInstance } from './rate';
export type { ScrollbarDirection, ScrollbarInstance } from './scrollbar';
export type { SplitterPanelInstance } from './splitter';
export type { StatisticInstance } from './statistic';
export type { TableV2Instance } from './table-v2';
export type { PopperOptions, TooltipInstance, TooltipVirtualRef } from './tooltip';
export type { TransferInstance } from './transfer';
export type { TreeV2Instance } from './tree-v2';
export type { UploadInstance } from './upload';
export type { TableInstance } from './table';

export type { AutoResizerSize } from './auto-resizer';

export type { ColorPickerPanelInstance } from './color-picker-panel';
