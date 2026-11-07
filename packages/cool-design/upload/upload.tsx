import { defineComponent, onBeforeUnmount, ref, watch, type PropType } from 'vue';

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'fail';

export type UploadRawFile = Omit<File, 'webkitRelativePath'> & {
  uid: number;
  isDirectory?: boolean;
  readonly webkitRelativePath?: string;
};

export type UploadDataValue = string | number | boolean | Blob | string[] | [string | Blob, string];
export type UploadDataRecord = Record<string, UploadDataValue>;
export type UploadData = UploadDataRecord | Promise<UploadDataRecord> | ((rawFile: UploadRawFile) => UploadDataRecord | Promise<UploadDataRecord>);
export type UploadBeforeResult = void | null | boolean | File | Blob | Promise<void | null | boolean | File | Blob>;
export interface UploadProgressEvent extends ProgressEvent {
  percent: number;
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
  headers?: Record<string, string | number | null | undefined> | Headers;
  data: UploadDataRecord;
  filename: string;
  file: UploadRawFile;
  withCredentials: boolean;
  onProgress: (event: UploadProgressEvent) => void;
  onSuccess: (response: unknown) => void;
  onError: (error: Error) => void;
}
export interface UploadRequestHandle { abort?: () => void; cancel?: () => void; promise?: Promise<unknown>; }
export type UploadRequestResult = void | Promise<unknown> | UploadRequestHandle;
export type UploadRequest = (options: UploadRequestOptions) => UploadRequestResult;

type UploadList = UploadUserFile[] | UploadFiles;
type UploadHandler = (...args: unknown[]) => void | Promise<boolean | void>;
type UploadPreviewHandler = (file: UploadFile) => void | Promise<boolean | void>;
type UploadRemoveHandler = (file: UploadFile, files: UploadFiles) => void | Promise<boolean | void>;
type UploadSuccessHandler = (response: unknown, file: UploadFile, files: UploadFiles) => void | Promise<boolean | void>;
type UploadErrorHandler = (error: Error, file: UploadFile, files: UploadFiles) => void | Promise<boolean | void>;
type UploadProgressHandler = (event: UploadProgressEvent, file: UploadFile, files: UploadFiles) => void | Promise<boolean | void>;
type UploadChangeHandler = (file: UploadFile, files: UploadFiles) => void | Promise<boolean | void>;
type UploadExceedHandler = (files: UploadRawFile[], fileList: UploadUserFile[]) => void | Promise<boolean | void>;
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
    action: { type: String, default: '#' },
    headers: Object as PropType<Record<string, string | number | null | undefined> | Headers>,
    method: { type: String, default: 'POST' },
    data: [Object, Function] as PropType<UploadData>,
    name: { type: String, default: 'file' },
    crossorigin: { type: String as PropType<'anonymous' | 'use-credentials' | ''>, default: '' },
    withCredentials: Boolean,
    httpRequest: Function as PropType<UploadRequest>,
    beforeUpload: Function as PropType<(file: UploadRawFile) => UploadBeforeResult>,
    beforeRemove: Function as PropType<(file: UploadFile, files: UploadFiles) => boolean | Promise<boolean>>,
    onPreview: Function as PropType<UploadPreviewHandler>,
    onRemove: Function as PropType<UploadRemoveHandler>,
    onSuccess: Function as PropType<UploadSuccessHandler>,
    onError: Function as PropType<UploadErrorHandler>,
    onProgress: Function as PropType<UploadProgressHandler>,
    onChange: Function as PropType<UploadChangeHandler>,
    onExceed: Function as PropType<UploadExceedHandler>,
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
    const objectUrls = new Map<number, { raw: UploadRawFile; url: string }>();
    const revokeObjectUrl = (file: UploadFile) => {
      const entry = objectUrls.get(file.uid);
      if (entry) URL.revokeObjectURL(entry.url);
      objectUrls.delete(file.uid);
    };
    onBeforeUnmount(() => {
      requests.forEach((request) => request.abort?.());
      objectUrls.forEach((entry) => URL.revokeObjectURL(entry.url));
    });
    const isControlled = () => props.fileList !== undefined;
    const currentList = () => (isControlled() ? props.fileList : props.modelValue) || [];
    const syncFiles = () => {
      const nextList = currentList();
      const occurrences = new Map<string, number>();
      const normalized = nextList.map((file) => {
        const source = file as object;
        const key = `${file.name}:${file.size ?? ''}:${file.url ?? ''}:${file.raw?.lastModified ?? ''}`;
        const occurrence = occurrences.get(key) ?? 0;
        occurrences.set(key, occurrence + 1);
        const stableKey = `${key}:${occurrence}`;
        const active = files.value.length === 1 && nextList.length === 1 && files.value[0].size === file.size ? files.value[0] : files.value.find((item) => item.name === file.name && item.raw === file.raw);
        const stableUid = file.uid ?? generatedUids.get(source) ?? active?.uid ?? generatedKeys.get(stableKey) ?? ++uid;
        generatedUids.set(source, stableUid);
        generatedKeys.set(stableKey, stableUid);
        return { ...file, uid: stableUid, status: file.status ?? 'ready' } as UploadFile;
      });
      const nextUids = new Set(normalized.map((file) => file.uid));
      files.value.forEach((file) => {
        const nextFile = normalized.find((item) => item.uid === file.uid);
        if (!nextUids.has(file.uid) || nextFile?.raw !== file.raw || nextFile?.url !== file.url) {
          requests.get(file.uid)?.abort?.();
          revokeObjectUrl(file);
        }
      });
      files.value = normalized.map((file) => {
        const active = files.value.find((item) => item.uid === file.uid);
        if (active && active.raw === file.raw && active.name === file.name && active.status === file.status && active.url === file.url) return active;
        return file;
      });
    };
    syncFiles();
    watch(() => [props.fileList, props.modelValue], syncFiles, { deep: true });

    const updateList = () => {
      const list = files.value.slice();
      if (isControlled()) emit('update:file-list', list);
      else emit('update:modelValue', list);
    };
    const callback = (name: keyof typeof props, ...args: unknown[]) => {
      const handler = props[name] as unknown as UploadHandler | undefined;
      void Promise.resolve(handler?.(...args)).catch(() => undefined);
    };
    const change = (file: UploadFile) => {
      updateList();
      callback('onChange', file, files.value);
      emit('change', file, files.value);
    };
    const upload = async (file: UploadFile) => {
      if (props.disabled || !file.raw || file.status === 'success') return;
      file.status = 'uploading';
      const progress = (event: ProgressEvent | { percent: number }) => {
        if (settled || cancelled) return;
        const percent = 'percent' in event ? event.percent : event.lengthComputable && event.total > 0 ? event.loaded / event.total * 100 : 0;
        file.percentage = percent;
        const progressEvent = Object.assign(event, { percent }) as UploadProgressEvent;
        callback('onProgress', progressEvent, file, files.value);
        emit('progress', progressEvent, file, files.value);
      };
      let settled = false;
      let cancelled = false;
      let releasePending: (() => void) | undefined;
      const pending = new Promise<void>((resolve) => {
        releasePending = resolve;
      });
      const cancelledToken = Symbol('cancelled');
      let abortUnderlying: (() => void) | undefined;
      const finishCancelled = () => {
        if (settled) return;
        cancelled = true;
        settled = true;
        releasePending?.();
        file.status = 'ready';
        change(file);
        abortUnderlying?.();
      };
      const success = (response: unknown) => {
        if (settled) return;
        settled = true;
        releasePending?.();
        file.status = 'success';
        file.response = response;
        callback('onSuccess', response, file, files.value);
        emit('success', response, file, files.value);
      };
      const error = (reason: unknown) => {
      const normalizedReason = reason instanceof Error ? reason : new Error(String(reason));
        if (settled) return;
        settled = true;
        releasePending?.();
        file.status = 'fail';
        callback('onError', normalizedReason, file, files.value);
        emit('error', normalizedReason, file, files.value);
      };
      try {
        if (props.httpRequest) {
          requests.set(file.uid, { abort: finishCancelled });
          const dataResult = typeof props.data === 'function' ? props.data(file.raw) : props.data;
          const data = await Promise.race([Promise.resolve(dataResult), pending.then(() => cancelledToken)]);
          if (data === cancelledToken || cancelled || settled) return;
          const resolvedData = data as UploadDataRecord | undefined;
          const result = props.httpRequest({
            file: file.raw,
            action: props.action || '',
            method: props.method,
            headers: props.headers,
            data: resolvedData || {},
            filename: props.name,
            withCredentials: props.withCredentials,
            onProgress: progress,
            onSuccess: success,
            onError: error
          });
          if (result && typeof (result as Promise<unknown>).then === 'function') {
            requests.set(file.uid, { abort: finishCancelled });
            const response = await Promise.race([Promise.resolve(result), pending.then(() => undefined)]);
            if (!settled && !cancelled) success(response);
          } else if (result && typeof result === 'object') {
            const handle = result as UploadRequestHandle;
            abortUnderlying = handle.abort || handle.cancel;
            requests.set(file.uid, { abort: finishCancelled });
            if (handle.promise) {
              const response = await Promise.race([handle.promise, pending.then(() => undefined)]);
              if (!settled && !cancelled) success(response);
            } else if (!settled) await pending;
          }
          if (!settled && !cancelled && result === undefined) await pending;
        } else {
          requests.set(file.uid, { abort: finishCancelled });
          const body = new FormData();
          const dataResult = typeof props.data === 'function' ? props.data(file.raw) : props.data;
          const data = await Promise.race([Promise.resolve(dataResult), pending.then(() => cancelledToken)]);
          if (data === cancelledToken || cancelled || settled) return;
          Object.entries(data || {}).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'string' && (typeof value[0] === 'string' || value[0] instanceof Blob)) {
              const content = value[0] instanceof Blob ? value[0] : new Blob([value[0]]);
              body.append(key, content, value[1]);
            } else if (Array.isArray(value)) {
              value.forEach((item) => {
                body.append(key, item instanceof Blob ? item : String(item));
              });
            } else if (value instanceof Blob) body.append(key, value);
            else if (value != null) body.append(key, String(value));
          });
          body.append(props.name, file.raw);
          const xhr = new XMLHttpRequest();
          const controller = new AbortController();
          const finish = (handler: () => void) => {
            xhr.onload = handler;
            xhr.onerror = () => error(new Error('Upload request failed'));
            xhr.onabort = () => { cancelled = true; finishCancelled(); };
          };
          requests.set(file.uid, {
            abort: () => {
              cancelled = true;
              controller.abort();
              xhr.abort();
              if (!settled) finishCancelled();
            }
          });
          xhr.upload.onprogress = progress;
          xhr.open(props.method, props.action, true);
          if (props.headers instanceof Headers) {
            props.headers.forEach((value, key) => {
              xhr.setRequestHeader(key, value);
            });
          } else {
            Object.entries(props.headers || {}).forEach(([key, value]) => {
              if (value != null) xhr.setRequestHeader(key, String(value));
            });
          }
          finish(() => {
            if (xhr.status < 200 || xhr.status >= 300) {
              error(new Error(`Upload failed with status ${xhr.status}`));
              return;
            }
            let result: unknown = xhr.responseText || xhr.response;
            try { result = xhr.responseText ? JSON.parse(xhr.responseText) : xhr.response; } catch { /* keep raw response */ }
            success(result);
          });
          xhr.withCredentials = props.withCredentials;
          xhr.send(body);
          await pending;
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
      let incoming = [...list] as Array<File | UploadRawFile>;
      if (props.directory) incoming = incoming.map((raw) => {
        const directoryFile = raw as UploadRawFile;
        if (directoryFile.webkitRelativePath) directoryFile.isDirectory = true;
        return directoryFile;
      });
      if (props.limit && files.value.length + incoming.length > props.limit) {
        callback('onExceed', incoming, files.value);
        emit('exceed', incoming, files.value);
        return;
      }
      if (!props.multiple && incoming.length > 1) incoming = incoming.slice(0, 1);
      for (const raw of incoming) {
        const file = createUploadFile(raw as File);
        files.value.push(file);
        change(file);
        if (props.beforeUpload) {
          try {
            const result = await props.beforeUpload(file.raw as UploadRawFile);
            if (result === false) {
              await remove(file, false);
              continue;
            }
            if (result instanceof File || result instanceof Blob) {
              const converted = result instanceof File ? result as UploadRawFile : new File([result], file.name, { type: result.type, lastModified: file.raw?.lastModified }) as UploadRawFile;
              Object.defineProperty(converted, 'uid', { value: file.uid, writable: true, configurable: true });
              if (file.raw?.webkitRelativePath) Object.defineProperty(converted, 'webkitRelativePath', { value: file.raw.webkitRelativePath, configurable: true });
              if (file.raw?.isDirectory) converted.isDirectory = true;
              file.raw = converted;
              file.size = converted.size;
              updateList();
            }
          } catch {
            await remove(file, false);
            continue;
          }
        }
        if (props.autoUpload && files.value.some((item) => item.uid === file.uid)) await upload(file);
      }
    };
    const remove = async (file: UploadFile, checkBeforeRemove = true) => {
      if (props.disabled && checkBeforeRemove) return;
      const target = files.value.find((item) => item.uid === file.uid) || files.value.find((item) => item === file);
      if (!target) return;
      if (checkBeforeRemove && props.beforeRemove) {
        try {
          if ((await props.beforeRemove(target, files.value)) === false) return;
        } catch {
          return;
        }
      }
      requests.get(target.uid)?.abort?.();
      revokeObjectUrl(target);
      files.value = files.value.filter((item) => item !== target && item.uid !== target.uid);
      updateList();
      callback('onRemove', target, files.value);
      emit('remove', target, files.value);
    };
    const handleStart = (file: File) => add([file]);
    const clearFiles = () => {
      requests.forEach((request) => {
        request.abort?.();
      });
      files.value.forEach(revokeObjectUrl);
      files.value = [];
      updateList();
    };
    expose({
      submit: () => Promise.all(files.value.filter((file) => file.status === 'ready').map(upload)),
      abort: (file?: UploadFile) => {
        if (file) {
          requests.get(file.uid)?.abort?.();
          return;
        }
        requests.forEach((request) => {
          request.abort?.();
        });
      },
      clearFiles,
      handleStart,
      handleRemove: remove
    });
    const choose = () => {
      if (input.value) input.value.value = '';
      input.value?.click();
    };
    const getFileUrl = (file: UploadFile) => {
      if (file.url) {
        revokeObjectUrl(file);
        return file.url;
      }
      if (!file.raw || typeof URL.createObjectURL !== 'function') return '';
      const existing = objectUrls.get(file.uid);
      if (existing?.raw === file.raw) return existing.url;
      if (existing) URL.revokeObjectURL(existing.url);
      const url = URL.createObjectURL(file.raw);
      objectUrls.set(file.uid, { raw: file.raw, url });
      return url;
    };
    const renderTrigger = () => slots.trigger?.({ choose }) ?? <button type='button' disabled={props.disabled} onClick={choose}>{slots.default?.() ?? '选择文件'}</button>;
    const renderFile = (file: UploadFile, index: number) => slots.file?.({ file, index }) ?? <>{props.listType !== 'text' && <img src={getFileUrl(file)} alt={file.name} crossorigin={props.crossorigin || undefined} />}{props.listType === 'text' && <span>{file.name}</span>}<em>{file.status}</em>{file.status === 'uploading' && <progress max='100' value={file.percentage ?? 0} />}{file.status === 'fail' && <button type='button' onClick={() => upload(file)}>重试</button>}{props.onPreview && <button type='button' onClick={() => callback('onPreview', file)}>预览</button>}{!props.disabled && <button type='button' onClick={() => remove(file)}>删除</button>}</>;
    return () => (
      <div class={{ 'i-upload': true, 'is-drag': props.drag }} role={props.drag ? 'button' : undefined} tabindex={props.drag ? 0 : undefined} aria-disabled={props.disabled || undefined} onKeydown={(event: KeyboardEvent) => { if (props.drag && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); choose(); } }} onDragover={(event: DragEvent) => { if (props.drag) event.preventDefault(); }} onDrop={(event: DragEvent) => { if (props.drag) { event.preventDefault(); void add(event.dataTransfer?.files ? [...event.dataTransfer.files] : null); } }}>
        <input ref={input} type='file' name={props.name} accept={props.accept} multiple={props.multiple} disabled={props.disabled} {...(props.directory ? { webkitdirectory: '' } : {})} hidden onChange={(e: Event) => add((e.target as HTMLInputElement).files)} />
        {props.showFileList && <ul class={{ 'i-upload__list': true, [`i-upload__list--${props.listType}`]: true }}>{files.value.map((file, index) => <li key={file.uid} data-uid={file.uid} class={{ 'i-upload__item': true, 'is-picture': props.listType !== 'text' }}>{renderFile(file, index)}</li>)}{props.listType === 'picture-card' && <li class='i-upload__trigger'>{renderTrigger()}</li>}</ul>}
        {(!props.showFileList || props.listType !== 'picture-card') && renderTrigger()}
        {props.drag && <p>将文件拖到此处，或点击选择</p>}
        {slots.tip?.()}
      </div>
    );
  }
});
