import { computed, defineComponent, type PropType, watch } from "vue";
export default defineComponent({
    name: "i-pagination",
    props: {
        currentPage: { type: Number, default: 1 },
        pageSize: { type: Number, default: 10 },
        total: { type: Number, default: 0 },
        disabled: Boolean,
        pageSizes: { type: Array as PropType<number[]>, default: () => [10, 20, 50] },
        pagerCount: { type: Number, default: 7 },
        hideOnSinglePage: Boolean,
        background: Boolean,
        prevText: { type: String, default: "上一页" },
        nextText: { type: String, default: "下一页" }
    },
    emits: ["update:currentPage", "update:pageSize", "current-change", "page-size-change"],
    setup(props, { emit }) {
        const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
        const pageItems = computed<Array<number | "ellipsis">>(() => {
            const count = Math.max(5, props.pagerCount | 0);
            if (pages.value <= count) return Array.from({ length: pages.value }, (_, index) => index + 1);
            const half = Math.floor((count - 3) / 2);
            if (props.currentPage <= half + 2)
                return [...Array.from({ length: count - 2 }, (_, index) => index + 1), "ellipsis", pages.value];
            if (props.currentPage >= pages.value - half - 1)
                return [1, "ellipsis", ...Array.from({ length: count - 2 }, (_, index) => pages.value - count + 3 + index), pages.value];
            return [1, "ellipsis", ...Array.from({ length: count - 4 }, (_, index) => props.currentPage - half + index), "ellipsis", pages.value];
        });
        const changePage = (page: number) => {
            const next = Math.min(pages.value, Math.max(1, page));
            if (next === props.currentPage || props.disabled) return;
            emit("update:currentPage", next);
            emit("current-change", next);
        };
        watch(
            pages,
            (max) => {
                if (props.currentPage > max) emit("update:currentPage", max);
            },
            { immediate: true }
        );
        return () => props.hideOnSinglePage && pages.value <= 1 ? null : (
            <nav class={{ "i-pagination": true, "is-background": props.background }} aria-label="列表分页">
                <span>共 {props.total} 条</span>
                <select
                    aria-label="每页条数"
                    value={props.pageSize}
                    disabled={props.disabled}
                    onChange={(e: Event) => {
                        const size = Number((e.target as HTMLSelectElement).value);
                        emit("update:pageSize", size);
                        emit("page-size-change", size);
                    }}>
                    {[...new Set([...props.pageSizes, props.pageSize])]
                        .sort((a, b) => a - b)
                        .map((size) => (
                            <option value={size} key={size}>
                                {size} 条/页
                            </option>
                        ))}
                </select>
                <button
                    type="button"
                    aria-label="上一页"
                    disabled={props.disabled || props.currentPage <= 1}
                    onClick={() => changePage(props.currentPage - 1)}>
                    {props.prevText}
                </button>
                <div class="i-pagination__pager" aria-live="polite">
                    {pageItems.value.map((page, index) =>
                        page === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} class="i-pagination__ellipsis">…</span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                class={{ "is-active": page === props.currentPage }}
                                aria-current={page === props.currentPage ? "page" : undefined}
                                disabled={props.disabled}
                                onClick={() => changePage(page)}>
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    type="button"
                    aria-label="下一页"
                    disabled={props.disabled || props.currentPage >= pages.value}
                    onClick={() => changePage(props.currentPage + 1)}>
                    {props.nextText}
                </button>
            </nav>
        );
    }
});
