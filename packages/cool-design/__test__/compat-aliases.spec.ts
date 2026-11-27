import { createApp } from 'vue';
import { expect, test } from 'vitest';
import * as library from '..';

const aliases = [
  'ElTableColumn',
  'ElContainer',
  'ElHeader',
  'ElAside',
  'ElMain',
  'ElFooter',
  'ElLink',
  'ElText',
  'ElScrollbar',
  'ElIcon',
  'ElSpace',
  'ElDivider',
  'ElEmpty',
  'ElTag',
  'ElTooltip',
  'ElPopconfirm',
  'ElButton',
  'ElButtonGroup',
  'ElRow',
  'ElCol',
  'ElConfigProvider',
  'ElInput',
  'ElInputNumber',
  'ElSelect',
  'ElCheckbox',
  'ElCheckboxButton',
  'ElCheckboxGroup',
  'ElSwitch',
  'ElForm',
  'ElFormItem',
  'ElTable',
  'ElTableV2',
  'ElPagination',
  'ElDialog',
  'ElAffix',
  'ElAnchor',
  'ElAnchorLink',
  'ElInputTag',
  'ElCascaderPanel',
  'ElMention',
  'ElInputOtp',
  'ElSelectV2',
  'ElTreeV2',
  'ElAvatar',
  'ElAvatarGroup',
  'ElBadge',
  'ElRadio',
  'ElRadioGroup',
  'ElRadioButton',
  'ElRate',
  'ElDatePicker',
  'ElTimePicker',
  'ElTimeSelect',
  'ElCalendar',
  'ElAutocomplete',
  'ElColorPicker',
  'ElSlider',
  'ElTransfer',
  'ElTreeSelect',
  'ElCascader',
  'ElUpload',
  'ElCard',
  'ElDescriptions',
  'ElDescriptionsItem',
  'ElImage',
  'ElImageViewer',
  'ElResult',
  'ElSkeleton',
  'ElSkeletonItem',
  'ElTree',
  'ElTimeline',
  'ElTimelineItem',
  'ElBacktop',
  'ElCountdown',
  'ElSegmented',
  'ElTour',
  'ElSplitter',
  'ElSplitterPanel',
  'ElStatistic',
  'ElMenu',
  'ElMenuItem',
  'ElSubMenu',
  'ElMenuItemGroup',
  'ElBreadcrumb',
  'ElBreadcrumbItem',
  'ElTabs',
  'ElTabPane',
  'ElDropdown',
  'ElDropdownMenu',
  'ElDropdownItem',
  'ElSteps',
  'ElStep',
  'ElPageHeader',
  'ElAlert',
  'ElDrawer',
  'ElPopover',
  'ElWatermark',
  'ElProgress',
  'ElCarousel',
  'ElCarouselItem',
  'ElCollapse',
  'ElCollapseItem',
  'ElOption',
  'ElOptionGroup',
] as const;

test('组件新旧名称引用并注册同一组件', () => {
  const app = createApp({});
  app.use(library.default);
  for (const alias of aliases) {
    const oldName = alias === 'ElOption' ? 'SelectOption' :
      alias === 'ElOptionGroup' ? 'SelectOptionGroup' : alias.slice(2);
    const component = Reflect.get(library, oldName);
    expect(Reflect.get(library, alias), alias).toBe(component);
    expect(app.component(alias), alias).toBe(component);
    expect(app.component(`I${oldName}`), oldName).toBe(component);
  }
});

test('Notification 保持声明组件并新增官方服务别名', () => {
  expect(Reflect.get(library, 'ElNotification')).toBe(library.Notify);
  const app = createApp({});
  app.use(library.default);
  expect(app.component('INotification')).toBe(library.Notification);
  expect(app.component('ElNotification')).toBeUndefined();
  expect(typeof app.config.globalProperties.$messageBox).toBe('function');
});

test('单独安装兼容别名和服务', async () => {
  const app = createApp({});
  app.use(library.ElButton).use(library.ElMessageBox).use(library.ElNotification).use(library.ElLoading);
  expect(app.component('ElButton')).toBe(library.Button);
  expect(app.component('IMessageBox')).toBe(library.MessageBoxComponent);
  expect(app.directive('loading')).toBe(library.ElLoadingDirective);
  expect(library.ElLoading.service).toBe(library.ElLoadingService);
  expect(library.vLoading).toBe(library.ElLoadingDirective);
  const services = app.config.globalProperties;
  const message = services.$notify({ message: '新通知', duration: 0 });
  expect(document.querySelector('.i-notification')?.textContent).toContain('新通知');
  message.close();
  const loading = services.$loading({ text: '加载' });
  expect(document.body.textContent).toContain('加载');
  loading.close();
});
