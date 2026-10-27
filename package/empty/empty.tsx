import { computed, defineComponent, type PropType } from "vue";
export default defineComponent({
    name: "i-empty",
    props: {
        description: { type: String, default: "暂无数据" },
        image: String,
        imageSize: { type: [String, Number] as PropType<string | number>, default: 64 }
    },
    setup(props, { slots }) {
        const imageStyle = computed(() => {
            const size = typeof props.imageSize === "number" ? `${props.imageSize}px` : props.imageSize;
            return { width: size, height: size };
        });
        return () => (
            <div class="i-empty">
                <div class="i-empty__image" aria-hidden="true">
                    {slots.image?.() ??
                        (props.image ? (
                            <img src={props.image} alt={props.description} style={imageStyle.value} />
                        ) : (
                                <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-label={props.description} role="img">
                                <path d="M8 18 20 6h24l12 12v24H8Z" stroke="currentColor" stroke-width="2" />
                                <path
                                    d="M8 22h15l4 7h10l4-7h15M20 6l3 16m21-16-3 16"
                                    stroke="currentColor"
                                    stroke-width="2"
                                />
                            </svg>
                        ))}
                </div>
                <div class="i-empty__description">{slots.description?.() ?? props.description}</div>
                {slots.default && <div class="i-empty__action">{slots.default()}</div>}
            </div>
        );
    }
});
