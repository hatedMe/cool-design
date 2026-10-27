import { defineComponent, ref, type PropType } from "vue";
export default defineComponent({
  name: "i-image",
  props: {
    src: String,
    alt: String,
    fit: { type: String as PropType<"fill" | "contain" | "cover" | "none" | "scale-down">, default: "cover" },
    lazy: Boolean,
    previewSrcList: { type: Array as PropType<string[]>, default: () => [] },
    hideOnClickModal: Boolean,
    fallback: String
  },
  emits: ["load", "error", "close", "show"],
  setup(props, { emit }) {
    const visible = ref(false);
    const error = ref(false);
    return () => (
      <span class="i-image">
        <img
          src={error.value ? props.fallback : props.src}
          alt={props.alt}
          loading={props.lazy ? "lazy" : "eager"}
          style={{ objectFit: props.fit }}
          onLoad={(e) => emit("load", e)}
          onError={(e) => {
            error.value = true;
            emit("error", e);
          }}
          onClick={() => {
            if (props.previewSrcList.length) {
              visible.value = true;
              emit("show");
            }
          }}
        />
        {visible.value && (
          <div
            class="i-image__preview"
            onClick={() => {
              if (!props.hideOnClickModal) {
                visible.value = false;
                emit("close");
              }
            }}>
            <img src={props.previewSrcList[0] || props.src} alt={props.alt} />
          </div>
        )}
      </span>
    );
  }
});
