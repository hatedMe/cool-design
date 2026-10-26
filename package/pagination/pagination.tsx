import { computed, defineComponent, watch } from "vue";
export default defineComponent({
    name: "i-pagination",
    props: {
        currentPage: { type: Number, default: 1 },
        pageSize: { type: Number, default: 10 },
        total: { type: Number, default: 0 },
        disabled: Boolean
    },
    emits: ["update:currentPage", "update:pageSize"],
    setup(props, { emit }) {
        const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
        watch(
            pages,
            (max) => {
                if (props.currentPage > max) emit("update:currentPage", max);
            },
            { immediate: true }
        );
        return () => (
            <nav class="i-pagination" aria-label="列表分页">
                <span>共 {props.total} 条</span>
                <select
                    aria-label="每页条数"
                    value={props.pageSize}
                    disabled={props.disabled}
                    onChange={(e: Event) => emit("update:pageSize", Number((e.target as HTMLSelectElement).value))}>
                    {[...new Set([10, 20, 50, props.pageSize])]
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
                    onClick={() => emit("update:currentPage", props.currentPage - 1)}>
                    上一页
                </button>
                <span aria-live="polite">
                    {props.currentPage} / {pages.value}
                </span>
                <button
                    type="button"
                    aria-label="下一页"
                    disabled={props.disabled || props.currentPage >= pages.value}
                    onClick={() => emit("update:currentPage", props.currentPage + 1)}>
                    下一页
                </button>
            </nav>
        );
    }
});
