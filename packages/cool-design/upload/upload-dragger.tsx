import { defineComponent } from 'vue';
import Upload from './upload';

export default defineComponent({
  name: 'i-upload-dragger',
  setup(_, { slots, attrs }) {
    // 拖拽上传区的独立形态：内部强制 drag 模式。
    // 仅透传实际存在的插槽，避免空函数覆盖 Upload 的默认触发按钮。
    const uploadSlots: Record<string, unknown> = {};
    if (slots.default) uploadSlots.default = () => slots.default?.();
    if (slots.tip) uploadSlots.tip = () => slots.tip?.();
    if (slots.trigger) uploadSlots.trigger = () => slots.trigger?.();
    if (slots.file) uploadSlots.file = (scope: unknown) => slots.file?.(scope as never);
    return () => (
      <Upload {...attrs} drag={true}>
        {uploadSlots}
      </Upload>
    );
  }
});
