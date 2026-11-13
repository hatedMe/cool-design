import { computed, defineComponent, ref, watch, type PropType } from 'vue';
import { createNamespace } from '../../../src/utils/create';

const [name, bem] = createNamespace('pagination');

export type PaginationLayoutItem = 'total' | 'sizes' | 'prev' | 'pager' | 'next' | 'jumper' | '->' | 'slot';

const DEFAULT_LAYOUT: PaginationLayoutItem[] = ['prev', 'pager', 'next', 'jumper', '->', 'total'];
const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 100];

const parseLayout = (layout: string): PaginationLayoutItem[] => {
  const known: PaginationLayoutItem[] = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper', '->', 'slot'];
  const items = layout
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is PaginationLayoutItem => (known as string[]).includes(item));
  return items.length > 0 ? items : [...DEFAULT_LAYOUT];
};

/** Element Plus 要求 pager-count 为 5~21 之间的奇数 */
const normalizePagerCount = (value: unknown): number => {
  const numeric = Number(value);
  const int = Number.isFinite(numeric) ? Math.floor(numeric) : 7;
  const clamped = Math.min(21, Math.max(5, int));
  return clamped % 2 === 0 ? clamped - 1 : clamped;
};

export default defineComponent({
  name,
  props: {
    currentPage: { type: Number, default: undefined },
    defaultCurrentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: undefined },
    defaultPageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
    /** 总页数，与 total 二选一；传入时优先使用 */
    pageCount: { type: Number, default: undefined },
    pagerCount: { type: Number, default: 7 },
    pageSizes: { type: Array as PropType<number[]>, default: () => [...DEFAULT_PAGE_SIZES] },
    layout: { type: String, default: 'prev, pager, next, jumper, ->, total' },
    small: Boolean,
    background: Boolean,
    disabled: Boolean,
    hideOnSinglePage: Boolean,
    prevText: { type: String, default: '' },
    nextText: { type: String, default: '' }
  },
  emits: [
    'update:currentPage',
    'update:pageSize',
    'current-change',
    'page-size-change',
    'size-change',
    'change',
    'prev-click',
    'next-click'
  ],
  setup(props, { emit, slots }) {
    const jumperValue = ref('');
    const layoutItems = computed(() => parseLayout(props.layout));
    const pagerCount = computed(() => normalizePagerCount(props.pagerCount));
    const currentPage = computed(() => props.currentPage ?? props.defaultCurrentPage);
    const pageSize = computed(() => props.pageSize ?? props.defaultPageSize);
    const pages = computed(() => {
      if (props.pageCount != null && Number.isFinite(props.pageCount)) return Math.max(1, Math.floor(props.pageCount));
      const size = pageSize.value > 0 ? pageSize.value : 1;
      return Math.max(1, Math.ceil(Math.max(0, props.total) / size));
    });
    const safeCurrent = computed(() => Math.min(pages.value, Math.max(1, Math.floor(currentPage.value) || 1)));
    const sizeOptions = computed(() =>
      [...new Set([...props.pageSizes, pageSize.value])].filter((size) => size > 0).sort((a, b) => a - b)
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

    const changePage = (page: number, source?: 'prev' | 'next') => {
      if (props.disabled) return;
      const next = Math.min(pages.value, Math.max(1, page));
      if (next === safeCurrent.value) return;
      emit('update:currentPage', next);
      emit('current-change', next);
      emit('change', next);
      if (source) emit(`${source}-click`, next);
    };

    const changeSize = (size: number) => {
      if (props.disabled || size <= 0 || size === pageSize.value) return;
      emit('update:pageSize', size);
      emit('page-size-change', size);
      emit('size-change', size);
      emit('change', safeCurrent.value);
    };

    const commitJumper = () => {
      const target = Math.floor(Number(jumperValue.value));
      jumperValue.value = '';
      if (!Number.isFinite(target)) return;
      changePage(target);
    };

    watch(
      pages,
      (max) => {
        if (currentPage.value > max) emit('update:currentPage', max);
        if (currentPage.value < 1) emit('update:currentPage', 1);
      },
      { immediate: true }
    );

    const renderTotal = () => <span class={bem('total')}>共 {props.total} 条</span>;
    const renderSizes = () => (
      <select
        class={bem('sizes')}
        aria-label='每页条数'
        value={pageSize.value}
        disabled={props.disabled}
        onChange={(event: Event) => changeSize(Number((event.target as HTMLSelectElement).value))}>
        {sizeOptions.value.map((size) => (
          <option value={size} key={size}>
            {size} 条/页
          </option>
        ))}
      </select>
    );
    const renderPrev = () => (
      <button
        type='button'
        class={bem('prev')}
        aria-label='上一页'
        disabled={props.disabled || safeCurrent.value <= 1}
        onClick={() => changePage(safeCurrent.value - 1, 'prev')}>
        {props.prevText || (
          <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden='true'>
            <path d='M7.5 2 3.5 6l4 4' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          </svg>
        )}
      </button>
    );
    const renderNext = () => (
      <button
        type='button'
        class={bem('next')}
        aria-label='下一页'
        disabled={props.disabled || safeCurrent.value >= pages.value}
        onClick={() => changePage(safeCurrent.value + 1, 'next')}>
        {props.nextText || (
          <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden='true'>
            <path d='M4.5 2l4 4-4 4' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
          </svg>
        )}
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
          return <span key={`sizes-${index}`}>{renderSizes()}</span>;
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
            [name]: true,
            'is-background': props.background,
            'is-small': props.small,
            'is-disabled': props.disabled
          }}
          aria-label='列表分页'>
          {layoutItems.value.map(renderItem)}
        </nav>
      );
  }
});
