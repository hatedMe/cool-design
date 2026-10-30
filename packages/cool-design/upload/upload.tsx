import { defineComponent, ref, type PropType } from 'vue';
export interface UploadFile {
  name: string;
  url?: string;
  status?: 'ready' | 'uploading' | 'success' | 'fail';
  percentage?: number;
  raw?: File;
}
export default defineComponent({
  name: 'i-upload',
  props: {
    modelValue: { type: Array as PropType<UploadFile[]>, default: () => [] },
    fileList: { type: Array as PropType<UploadFile[]>, default: undefined },
    action: String,
    httpRequest: Function as PropType<(file: File) => Promise<unknown>>,
    beforeUpload: Function as PropType<(file: File) => boolean | Promise<boolean>>,
    limit: Number,
    accept: String,
    multiple: Boolean,
    disabled: Boolean,
    autoUpload: { type: Boolean, default: true },
    drag: Boolean,
    listType: { type: String as PropType<'text' | 'picture' | 'picture-card'>, default: 'text' }
  },
  emits: ['update:modelValue', 'change', 'success', 'error', 'remove', 'exceed', 'progress'],
  setup(props, { emit, slots, expose }) {
    const input = ref<HTMLInputElement>();
    const files = ref<UploadFile[]>(props.fileList || props.modelValue);
    const upload = async (file: UploadFile) => {
      if (!file.raw || !props.autoUpload) return;
      file.status = 'uploading';
      emit('progress', file);
      try {
        if (props.httpRequest) await props.httpRequest(file.raw);
        else if (props.action)
          await fetch(props.action, {
            method: 'POST',
            body: (() => {
              const data = new FormData();
              data.append('file', file.raw!);
              return data;
            })()
          });
        file.status = 'success';
        emit('success', file, files.value);
      } catch (error) {
        file.status = 'fail';
        emit('error', error, file, files.value);
      }
      emit('update:modelValue', files.value);
      emit('change', file, files.value);
    };
    const add = async (list: FileList | null) => {
      if (!list || props.disabled) return;
      const incoming = [...list];
      if (props.limit != null && files.value.length + incoming.length > props.limit) {
        emit('exceed', incoming, files.value);
        return;
      }
      for (const raw of incoming) {
        const allowed = props.beforeUpload ? await props.beforeUpload(raw) : true;
        if (allowed === false) continue;
        const file: UploadFile = { name: raw.name, raw, status: 'ready' };
        files.value.push(file);
        await upload(file);
      }
    };
    const remove = (file: UploadFile) => {
      files.value = files.value.filter((item) => item !== file);
      emit('update:modelValue', files.value);
      emit('remove', file, files.value);
    };
    expose({ submit: () => Promise.all(files.value.map(upload)), clearFiles: () => (files.value = []) });
    return () => (
      <div class={{ 'i-upload': true, 'is-drag': props.drag }}>
        <input
          ref={input}
          type='file'
          accept={props.accept}
          multiple={props.multiple}
          disabled={props.disabled}
          hidden
          onChange={(e: Event) => add((e.target as HTMLInputElement).files)}
        />
        {slots.trigger?.({ choose: () => input.value?.click() }) ?? (
          <button type='button' disabled={props.disabled} onClick={() => input.value?.click()}>
            {slots.default?.() ?? '选择文件'}
          </button>
        )}
        {props.drag && <p>将文件拖到此处，或点击选择</p>}
        <ul class='i-upload__list'>
          {files.value.map((file) => (
            <li key={`${file.name}-${file.raw?.lastModified || ''}`}>
              <span>{file.name}</span>
              <em>{file.status}</em>
              {!props.disabled && (
                <button type='button' onClick={() => remove(file)}>
                  删除
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
});
