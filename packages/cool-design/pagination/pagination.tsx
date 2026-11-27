import { computed, defineComponent, normalizeClass, normalizeStyle, ref, resolveDynamicComponent, watch, type Component, type PropType, type StyleValue, type VNode } from 'vue';
import { createBEM } from '../../../src/utils/create';
import { useNamespace } from '../../hooks/use-namespace';
import { useConfig, type Size } from '../config-provider/context';
import Icon, { type IconProp } from '../icon';
import Select from '../select';

export type PaginationLayoutItem = 'total' | 'sizes' | 'prev' | 'pager' | 'next' | 'jumper' | '->' | 'slot';
export type PaginationPopperClass = string | boolean | Record<string, unknown> | PaginationPopperClass[];
export type PaginationPopperStyle = StyleValue | boolean;
export interface PaginationSlots {
  default?: () => VNode[];
}

const DEFAULT_LAYOUT: PaginationLayoutItem[] = ['prev', 'pager', 'next', 'jumper', '->', 'total'];
const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 100];

const ArrowLeft = () => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden='true'>
    <path d='M7.5 2 3.5 6l4 4' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
  </svg>
);
const ArrowRight = () => (
  <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden='true'>
    <path d='M4.5 2l4 4-4 4' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
  </svg>
);

const isNumber = (value: number) => typeof value === 'number';

const parseLayout = (layout: string): PaginationLayoutItem[] => {
  const known: PaginationLayoutItem[] = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper', '->', 'slot'];
  const items = layout
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is PaginationLayoutItem => (known as string[]).includes(item));
  return items.length > 0 ? items : [...DEFAULT_LAYOUT];
};

/** pager-count 要求为 5~21 之间的奇数 */
const normalizePagerCount = (value: unknown): number => {
  const numeric = Number(value);
  const int = Number.isFinite(numeric) ? Math.floor(numeric) : 7;
  const clamped = Math.min(21, Math.max(5, int));
  return clamped % 2 === 0 ? clamped - 1 : clamped;
};

const Pagination = defineComponent({
  name: 'i-pagination',
  props: {
    currentPage: { type: Number, default: undefined },
    defaultCurrentPage: Number,
    pageSize: { type: Number, default: undefined },
    defaultPageSize: Number,
    total: Number,
    /** 总页数，与 total 二选一；传入时优先使用 */
    pageCount: { type: Number, default: undefined },
    pagerCount: { type: Number, default: 7 },
    pageSizes: { type: Array as PropType<number[]>, default: () => [...DEFAULT_PAGE_SIZES] },
    layout: { type: String, default: 'prev, pager, next, jumper, ->, total' },
    small: Boolean,
    size: String as PropType<Size>,
    background: Boolean,
    disabled: Boolean,
    hideOnSinglePage: Boolean,
    prevText: { type: String, default: '' },
    prevIcon: { type: [String, Object, Function] as PropType<IconProp>, default: () => ArrowLeft },
    nextText: { type: String, default: '' },
    nextIcon: { type: [String, Object, Function] as PropType<IconProp>, default: () => ArrowRight },
    appendSizeTo: String,
    popperClass: { type: [String, Array, Object, Boolean] as PropType<PaginationPopperClass>, default: '' },
    popperStyle: { type: [String, Array, Object, Boolean] as PropType<PaginationPopperStyle>, default: undefined },
    teleported: { type: Boolean, default: true }
  },
  emits: {
    'update:currentPage': isNumber,
    'update:pageSize': isNumber,
    'current-change': isNumber,
    'page-size-change': isNumber,
    'size-change': isNumber,
    change: (currentPage: number, pageSize: number) => isNumber(currentPage) && isNumber(pageSize),
    'prev-click': isNumber,
    'next-click': isNumber
  },
  setup(props, { emit, slots }) {
    const ns = useNamespace('pagination');
    const bem = createBEM(ns.b);
    const config = useConfig();
    const controlSize = computed(() => props.small ? 'small' : props.size ?? config.value.size);
    const jumperValue = ref('');
    const layoutItems = computed(() => parseLayout(props.layout));
    const pagerCount = computed(() => normalizePagerCount(props.pagerCount));
    // 非受控内部状态：未绑定 v-model 时由组件自身维护当前页与每页条数
    const innerPage = ref(Math.max(1, Math.floor(props.defaultCurrentPage ?? 1) || 1));
    const innerSize = ref(Math.max(1, Math.floor(props.defaultPageSize ?? 10) || 10));
    const currentPage = computed(() => props.currentPage ?? innerPage.value);
    const pageSize = computed(() => props.pageSize ?? innerSize.value);
    const pages = computed(() => {
      if (props.pageCount != null && Number.isFinite(props.pageCount)) return Math.max(1, Math.floor(props.pageCount));
      const size = pageSize.value > 0 ? pageSize.value : 1;
      return Math.max(1, Math.ceil(Math.max(0, props.total ?? 0) / size));
    });
    const safeCurrent = computed(() => Math.min(pages.value, Math.max(1, Math.floor(currentPage.value) || 1)));
    const sizeOptions = computed(() =>
      [...new Set([...props.pageSizes, pageSize.value])]
        .filter((size) => size > 0)
        .sort((a, b) => a - b)
        .map((size) => ({ value: size, label: `${size} 条/页` }))
    );

    const pageItems = computed<Array<number | 'ellipsis'>>(() => {
      const count = pagerCount.value;
      if (pages.value <= count) return Array.from({ length: pages.value }, (_, index) => index + 1);
      const half = Math.floor((count - 3) / 2);
      const current = safeCurrent.value;
      const range = (start: number, length: number) => Array.from({ length }, (_, index) => start + index);
      if (current <= half + 2) return [...range(1, count - 1), 'ellipsis', pages.value];
      if (current >= pages.value - half - 1)
        return [1, 'ellipsis', ...range(pages.value - count + 3, count - 2)];
      return [1, 'ellipsis', ...range(current - half, count - 2), 'ellipsis', pages.value];
    });

    const updatePage = (page: number) => {
      if (props.currentPage === undefined) innerPage.value = page;
      emit('update:currentPage', page);
      emit('current-change', page);
    };

    const changePage = (page: number, source?: 'prev' | 'next') => {
      if (props.disabled) return;
      const next = Math.min(pages.value, Math.max(1, page));
      if (next === safeCurrent.value) return;
      updatePage(next);
      if (source === 'prev') emit('prev-click', currentPage.value);
      if (source === 'next') emit('next-click', currentPage.value);
    };

    let checkedPageCount = pages.value;
    const clampPage = (max: number) => {
      if (max === checkedPageCount) return;
      checkedPageCount = max;
      if (currentPage.value > max || currentPage.value < 1) updatePage(safeCurrent.value);
    };

    const changeSize = (size: unknown) => {
      if (props.disabled || typeof size !== 'number' || size <= 0 || size === pageSize.value) return;
      if (props.pageSize === undefined) innerSize.value = size;
      emit('update:pageSize', size);
      emit('page-size-change', size);
      emit('size-change', size);
      clampPage(pages.value);
    };

    const commitJumper = () => {
      const target = Math.floor(Number(jumperValue.value));
      jumperValue.value = '';
      if (!Number.isFinite(target)) return;
      changePage(target);
    };

    if (currentPage.value > pages.value || currentPage.value < 1) {
      if (props.currentPage === undefined) innerPage.value = safeCurrent.value;
      emit('update:currentPage', safeCurrent.value);
    }
    watch(pages, clampPage);
    watch([currentPage, pageSize], ([page, size]) => emit('change', page, size), { flush: 'post' });

    const renderTotal = () => <span class={bem('total')}>共 {props.total ?? 0} 条</span>;
    const renderSizes = () => (
      <Select
        aria-label='每页条数'
        modelValue={pageSize.value}
        options={sizeOptions.value}
        size={controlSize.value}
        disabled={props.disabled}
        validateEvent={false}
        fitInputWidth
        appendTo={props.appendSizeTo}
        teleported={props.teleported}
        popperClass={normalizeClass(props.popperClass)}
        popperStyle={normalizeStyle([props.popperStyle])}
        onChange={changeSize}
      />
    );
    const renderIcon = (icon: IconProp) => {
      const resolved = resolveDynamicComponent(icon);
      return <Icon icon={typeof resolved === 'symbol' ? undefined : resolved as string | Component} />;
    };
    const renderPrev = () => (
      <button
        type='button'
        class={bem('prev')}
        aria-label='上一页'
        disabled={props.disabled || safeCurrent.value <= 1}
        onClick={() => changePage(safeCurrent.value - 1, 'prev')}>
        {props.prevText || renderIcon(props.prevIcon)}
      </button>
    );
    const renderNext = () => (
      <button
        type='button'
        class={bem('next')}
        aria-label='下一页'
        disabled={props.disabled || safeCurrent.value >= pages.value}
        onClick={() => changePage(safeCurrent.value + 1, 'next')}>
        {props.nextText || renderIcon(props.nextIcon)}
      </button>
    );
    const renderPager = () => (
      <div class={bem('pager')} aria-live='polite'>
        {pageItems.value.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} class={bem('ellipsis')} aria-hidden='true'>
              …
            </span>
          ) : (
            <button
              key={page}
              type='button'
              class={{ 'is-active': page === safeCurrent.value }}
              aria-label={`第 ${page} 页`}
              aria-current={page === safeCurrent.value ? 'page' : undefined}
              disabled={props.disabled}
              onClick={() => changePage(page)}>
              {page}
            </button>
          )
        )}
      </div>
    );
    const renderJumper = () => (
      <span class={bem('jumper')}>
        前往
        <input
          type='text'
          inputmode='numeric'
          autocomplete='off'
          aria-label='前往第几页'
          disabled={props.disabled}
          value={jumperValue.value}
          placeholder={String(safeCurrent.value)}
          onInput={(event: Event) => {
            jumperValue.value = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '');
          }}
          onChange={commitJumper}
          onKeydown={(event: KeyboardEvent) => {
            if (event.key === 'Enter') commitJumper();
          }}
        />
        页
      </span>
    );

    const renderItem = (item: PaginationLayoutItem, index: number) => {
      switch (item) {
        case 'total':
          return <span key={`total-${index}`}>{renderTotal()}</span>;
        case 'sizes':
          return <span key={`sizes-${index}`} class={bem('sizes')}>{renderSizes()}</span>;
        case 'prev':
          return <span key={`prev-${index}`}>{renderPrev()}</span>;
        case 'pager':
          return <span key={`pager-${index}`}>{renderPager()}</span>;
        case 'next':
          return <span key={`next-${index}`}>{renderNext()}</span>;
        case 'jumper':
          return <span key={`jumper-${index}`}>{renderJumper()}</span>;
        case '->':
          return <span key={`spacer-${index}`} class={bem('spacer')} aria-hidden='true' />;
        case 'slot':
          return <span key={`slot-${index}`}>{slots.default?.()}</span>;
        default:
          return null;
      }
    };

    return () =>
      props.hideOnSinglePage && pages.value <= 1 ? null : (
        <nav
          class={{
            [bem()]: true,
            'is-background': props.background,
            'is-small': controlSize.value === 'small',
            [ns.m(controlSize.value)]: true,
            'is-disabled': props.disabled
          }}
          aria-label='列表分页'>
          {layoutItems.value.map(renderItem)}
        </nav>
      );
  }
});

type PaginationOptions = Omit<typeof Pagination, never>;
export type PaginationProps = InstanceType<typeof Pagination>['$props'] & {
  'onUpdate:current-page'?: (page: number) => void;
  'onUpdate:page-size'?: (size: number) => void;
  onCurrentChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSizeChange?: (size: number) => void;
  onPrevClick?: (page: number) => void;
  onNextClick?: (page: number) => void;
};
type PaginationComponent = PaginationOptions & (
  new (...args: ConstructorParameters<typeof Pagination>) => Omit<InstanceType<typeof Pagination>, '$props' | '$slots'> & {
    $props: PaginationProps;
    $slots: PaginationSlots;
  }
);

export type PaginationInstance = InstanceType<PaginationComponent>;
export default (Pagination as PaginationOptions) as PaginationComponent;
