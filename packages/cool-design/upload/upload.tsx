import { defineComponent, ref, watch, type PropType } from 'vue';

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'fail';

export interface UploadRawFile extends File {
  uid: number;
  isDirectory?: boolean;
}

export interface UploadFile {
  name: string;
  uid: number;
  status: UploadStatus;
  percentage?: number;
  size?: number;
  response?: unknown;
  url?: string;
  raw?: UploadRawFile;
}

export type UploadUserFile = Omit<UploadFile, 'uid' | 'status'> & Partial<Pick<UploadFile, 'uid' | 'status'>>;
export type UploadFiles = UploadFile[];
export interface UploadRequestOptions {
  action: string;
  method: string;
  headers?: Record<string, string>;
  data?: Record<string, unknown>;
  filename: string;
  file: UploadRawFile;
  withCredentials: boolean;
  onProgress: (event: { percent: number }) => void;
  onSuccess: (response: unknown) => void;
  onError: (error: unknown) => void;
}
export interface UploadRequestHandle { abort?: () => void; cancel?: () => void; promise?: Promise<unknown>; }
export type UploadRequestResult = void | Promise<unknown> | UploadRequestHandle;
export type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult;

type UploadList = UploadUserFile[] | UploadFiles;
type UploadCallback = (...args: any[]) => void | Promise<boolean | void>;
let uid = 0;

const createUploadFile = (raw: File): UploadFile => {
  const file = raw as UploadRawFile;
  file.uid = ++uid;
  return { name: raw.name, uid: file.uid, status: 'ready', size: raw.size, raw: file };
};

export default defineComponent({
  name: 'i-upload',
  props: {
    modelValue: { type: Array as PropType<UploadList>, default: () => [] },
    fileList: { type: Array as PropType<UploadList>, default: undefined },
    action: String,
    headers: Object as PropType<Record<string, string>>,
    method: { type: String, default: 'POST' },
    data: Object as PropType<Record<string, unknown>>,
    name: { type: String, default: 'file' },
    withCredentials: Boolean,
    httpRequest: Function as PropType<UploadRequest>,
    beforeUpload: Function as PropType<(file: UploadRawFile) => void | boolean | Promise<void | boolean>>,
    beforeRemove: Function as PropType<(file: UploadFile, files: UploadFiles) => boolean | Promise<boolean>>,
    onPreview: Function as PropType<UploadCallback>,
    onRemove: Function as PropType<UploadCallback>,
    onSuccess: Function as PropType<UploadCallback>,
    onError: Function as PropType<UploadCallback>,
    onProgress: Function as PropType<UploadCallback>,
    onChange: Function as PropType<UploadCallback>,
    onExceed: Function as PropType<UploadCallback>,
    limit: Number,
    accept: { type: String, default: '' },
    multiple: Boolean,
    disabled: Boolean,
    autoUpload: { type: Boolean, default: true },
    drag: Boolean,
    directory: Boolean,
    showFileList: { type: Boolean, default: true },
    listType: { type: String as PropType<'text' | 'picture' | 'picture-card'>, default: 'text' }
  },
  emits: ['update:modelValue', 'update:file-list', 'change', 'success', 'error', 'remove', 'exceed', 'progress'],
  setup(props, { emit, slots, expose }) {
    const input = ref<HTMLInputElement>();
    const files = ref<UploadFiles>([]);
    const generatedUids = new WeakMap<object, number>();
    const generatedKeys = new Map<string, number>();
    const requests = new Map<number, { abort?: () => void }>();
    const isControlled = () => props.fileList !== undefined;
    const currentList = () => (isControlled() ? props.fileList : props.modelValue) || [];
    const syncFiles = () => {
      const occurrences = new Map<string, number>();
      files.value = currentList().map((file) => {
        const source = file as object;
        const key = `${file.name}:${file.size ?? ''}:${file.url ?? ''}:${file.raw?.lastModified ?? ''}`;
        const occurrence = occurrences.get(key) ?? 0;
        occurrences.set(key, occurrence + 1);
        const stableKey = `${key}:${occurrence}`;
        const stableUid = file.uid ?? generatedUids.get(source) ?? generatedKeys.get(stableKey) ?? ++uid;
        generatedUids.set(source, stableUid);
        generatedKeys.set(stableKey, stableUid);
        return { ...file, uid: stableUid, status: file.status ?? 'ready' };
      }) as UploadFiles;
    };
    syncFiles();
    watch(() => [props.fileList, props.modelValue], syncFiles, { deep: true });

    const updateList = () => {
      const list = files.value.slice();
      if (isControlled()) emit('update:file-list', list);
      else emit('update:modelValue', list);
    };
    const callback = (name: keyof typeof props, ...args: any[]) => {
      const handler = props[name] as unknown as UploadCallback | undefined;
      void Promise.resolve(handler?.(...args)).catch(() => undefined);
    };
    const change = (file: UploadFile) => {
      updateList();
      callback('onChange', file, files.value);
      emit('change', file, files.value);
    };
    const upload = async (file: UploadFile) => {
      if (!file.raw || (!props.action && !props.httpRequest) || file.status === 'success') return;
      file.status = 'uploading';
      change(file);
      const progress = (event: { percent: number }) => {
        file.percentage = event.percent;
        callback('onProgress', event, file, files.value);
        emit('progress', event, file, files.value);
      };
      let settled = false;
      let cancelled = false;
      let releasePending: (() => void) | undefined;
      let abortUnderlying: (() => void) | undefined;
      const finishCancelled = () => {
        if (settled) return;
        cancelled = true;
        abortUnderlying?.();
        settled = true;
        releasePending?.();
        file.status = 'ready';
        change(file);
      };
      const success = (response: unknown) => {
        if (settled) return;
        settled = true;
        releasePending?.();
        file.status = 'success';
        file.response = response;
        callback('onSuccess', response, file, files.value);
        emit('success', file, files.value);
      };
      const error = (reason: unknown) => {
        if (settled) return;
        settled = true;
        releasePending?.();
        file.status = 'fail';
        callback('onError', reason, file, files.value);
        emit('error', reason, file, files.value);
      };
      try {
        if (props.httpRequest) {
          const pending = new Promise<void>((resolve) => { releasePending = resolve; });
          const result = props.httpRequest({
            file: file.raw,
            action: props.action || '',
            method: props.method,
            headers: props.headers,
            data: props.data,
            filename: props.name,
            withCredentials: props.withCredentials,
            onProgress: progress,
            onSuccess: success,
            onError: error
          });
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            requests.set(file.uid, { abort: finishCancelled });
            await Promise.race([Promise.resolve(result), pending]);
          } else if (result && typeof result === 'object') {
            const handle = result as UploadRequestHandle;
            abortUnderlying = handle.abort || handle.cancel;
            requests.set(file.uid, { abort: finishCancelled });
            if (handle.promise) await Promise.race([handle.promise, pending]);
            else if (!settled) await pending;
          }
          if (!settled && !cancelled) success(undefined);
        } else {
          const body = new FormData();
          Object.entries(props.data || {}).forEach(([key, value]) => body.append(key, String(value)));
          body.append(props.name, file.raw);
          const controller = new AbortController();
          requests.set(file.uid, {
            abort: () => {
              cancelled = true;
              controller.abort();
              if (!settled) {
                settled = true;
                file.status = 'ready';
                change(file);
              }
            }
          });
          const response = await fetch(props.action!, {
            method: props.method,
            headers: props.headers,
            body,
            credentials: props.withCredentials ? 'include' : 'same-origin',
            signal: controller.signal
          });
          if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
          let result: unknown;
          try { result = await response.json(); } catch { result = response; }
          success(result);
        }
      } catch (reason) {
        if (!cancelled && (reason as { name?: string })?.name !== 'AbortError') error(reason);
      } finally {
        requests.delete(file.uid);
        if (settled && !cancelled) change(file);
      }
    };
    const add = async (list: FileList | File[] | null) => {
      if (!list || props.disabled) return;
      let incoming = [...list] as File[];
      if (props.directory) incoming = incoming.map((raw) => {
        const directoryFile = raw as UploadRawFile;
        if ((directoryFile as File & { webkitRelativePath?: string }).webkitRelativePath) directoryFile.isDirectory = true;
        return directoryFile;
      });
      if (!props.multiple && incoming.length > 1) incoming = incoming.slice(0, 1);
      if (props.limit != null && (files.value.length + incoming.length > props.limit || (!props.multiple && list.length > 1))) {
        callback('onExceed', incoming, files.value);
        emit('exceed', incoming, files.value);
        return;
      }
      const accepted: UploadFile[] = [];
      for (const raw of incoming) {
          if (props.beforeUpload) {
          try {
            if ((await props.beforeUpload(raw as UploadRawFile)) === false) continue;
          } catch {
            continue;
          }
        }
        accepted.push(createUploadFile(raw));
      }
      files.value.push(...accepted);
      for (const file of accepted) {
        change(file);
        if (props.autoUpload) await upload(file);
      }
    };
    const remove = async (file: UploadFile) => {
      if (props.disabled) return;
      const target = files.value.find((item) => item.uid === file.uid) || files.value.find((item) => item === file);
      if (!target) return;
      if (props.beforeRemove) {
        try {
          if ((await props.beforeRemove(target, files.value)) === false) return;
        } catch {
          return;
        }
      }
      requests.get(target.uid)?.abort?.();
      files.value = files.value.filter((item) => item !== target && item.uid !== target.uid);
      updateList();
      callback('onRemove', target, files.value);
      emit('remove', target, files.value);
    };
    const handleStart = (file: File) => add([file]);
    const clearFiles = () => {
      requests.forEach((request) => request.abort?.());
      files.value = [];
      updateList();
    };
    expose({
      submit: () => Promise.all(files.value.filter((file) => file.status === 'ready').map(upload)),
      abort: (file?: UploadFile) => file ? requests.get(file.uid)?.abort?.() : requests.forEach((request) => request.abort?.()),
      clearFiles,
      handleStart,
      handleRemove: remove
    });
    const choose = () => input.value?.click();
    return () => (
      <div class={{ 'i-upload': true, 'is-drag': props.drag }} onDragover={(event: DragEvent) => { if (props.drag) event.preventDefault(); }} onDrop={(event: DragEvent) => { if (props.drag) { event.preventDefault(); void add(event.dataTransfer?.files ? [...event.dataTransfer.files] : null); } }}>
        <input ref={input} type='file' accept={props.accept} multiple={props.multiple} disabled={props.disabled} {...(props.directory ? { webkitdirectory: '' } : {})} hidden onChange={(e: Event) => add((e.target as HTMLInputElement).files)} />
        {slots.trigger?.({ choose }) ?? <button type='button' disabled={props.disabled} onClick={choose}>{slots.default?.() ?? '选择文件'}</button>}
        {props.drag && <p>将文件拖到此处，或点击选择</p>}
        {slots.tip?.()}
        {props.showFileList && <ul class={{ 'i-upload__list': true, [`i-upload__list--${props.listType}`]: true }}>{files.value.map((file) => <li key={file.uid} data-uid={file.uid} class={{ 'i-upload__item': true, 'is-picture': props.listType !== 'text' }}>
          {slots.file?.({ file }) ?? <>{props.listType !== 'text' && <img src={file.url || (file.raw && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file.raw) : '')} alt={file.name} />}{props.listType === 'text' && <span>{file.name}</span>}<em>{file.status}</em>{props.onPreview && <button type='button' onClick={() => callback('onPreview', file)}>预览</button>}{!props.disabled && <button type='button' onClick={() => remove(file)}>删除</button>}</>}
        </li>)}</ul>}
      </div>
    );
  }
});
