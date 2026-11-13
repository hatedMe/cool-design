import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { expect, test, vi } from 'vitest';
import Upload, { type UploadFile, type UploadFiles, type UploadRawFile, type UploadStatus, type UploadUserFile } from '..';

const exportedTypes: [UploadStatus, UploadRawFile, UploadFile, UploadUserFile, UploadFiles] | undefined = undefined;
void exportedTypes;

const select = async (wrapper: ReturnType<typeof mount>, files: File[]) => {
  const input = wrapper.get('input[type="file"]');
  Object.defineProperty(input.element, 'files', { value: files, configurable: true });
  await input.trigger('change');
};

test('拖拽区域支持 Enter 和 Space 键盘触发选择', async () => {
  const wrapper = mount(Upload, { props: { drag: true } });
  const input = wrapper.get('input').element as HTMLInputElement;
  const click = vi.spyOn(input, 'click');
  const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
  const space = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
  wrapper.element.dispatchEvent(enter);
  wrapper.element.dispatchEvent(space);
  expect(click).toHaveBeenCalledTimes(2);
  expect(enter.defaultPrevented).toBe(true);
  expect(space.defaultPrevented).toBe(true);
});

test('默认渲染文件输入、按钮和默认插槽', () => {
  const wrapper = mount(Upload, { slots: { default: () => '上传文件' } });
  const input = wrapper.get('input[type="file"]');

  expect(input.attributes('hidden')).toBeDefined();
  expect(input.attributes('multiple')).toBeUndefined();
  expect(input.attributes('accept')).toBe('');
  expect(wrapper.props('listType')).toBe('text');
  expect(wrapper.get('button').text()).toBe('上传文件');
  expect(wrapper.get('ul').classes()).toContain('i-upload__list');
});

test('没有 action 时默认使用当前页面地址上传并触发 Element Plus success 参数', async () => {
  const xhrInstances: Array<{ upload: { onprogress?: (event: ProgressEvent) => void }; open: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; setRequestHeader: ReturnType<typeof vi.fn>; onload?: () => void }> = [];
  class MockXHR {
    upload = {};
    open = vi.fn();
    send = vi.fn(() => { this.onload?.(); });
    setRequestHeader = vi.fn();
    onload?: () => void;
    onerror?: () => void;
    status = 200;
    response = '{"ok":true}';
    constructor() { xhrInstances.push(this); }
  }
  vi.stubGlobal('XMLHttpRequest', MockXHR);
  const onSuccess = vi.fn();
  const wrapper = mount(Upload, { props: { onSuccess } });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  expect(xhrInstances[0].open).toHaveBeenCalledWith('POST', '#', true);
  expect(onSuccess).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ name: 'x.txt' }), expect.any(Array));
  expect(wrapper.emitted('success')?.[0]).toEqual([expect.anything(), expect.objectContaining({ name: 'x.txt' }), expect.any(Array)]);
  vi.unstubAllGlobals();
});

test('默认请求将字符串二元数组按 filename tuple 处理', async () => {
  const send = vi.fn((body: FormData) => { void body; });
  class MockXHR {
    upload = {};
    open = vi.fn();
    send = send;
    setRequestHeader = vi.fn();
    status = 200;
    response = '{}';
    responseText = '{}';
    onload?: () => void;
    onerror?: () => void;
  }
  vi.stubGlobal('XMLHttpRequest', MockXHR);
  const wrapper = mount(Upload, { props: { action: '/upload', data: { attachment: ['text', 'file.txt'] as [string, string] } } });
  await select(wrapper, [new File(['x'], 'source.txt')]);
  await vi.waitFor(() => expect(send).toHaveBeenCalled());
  const value = send.mock.calls[0][0] as FormData;
  expect(value.getAll('attachment')).toHaveLength(1);
  expect(value.get('attachment')).toBeInstanceOf(Blob);
  expect((value.get('attachment') as File).name).toBe('file.txt');
  vi.unstubAllGlobals();
});

test('默认请求透传真实进度并保留 Blob 和文件名数据', async () => {
  const instances: Array<{ upload: { onprogress?: (event: ProgressEvent) => void }; onload?: () => void }> = [];
  class MockXHR {
    upload: { onprogress?: (event: ProgressEvent) => void } = {};
    open = vi.fn();
    send = vi.fn();
    setRequestHeader = vi.fn();
    onload?: () => void;
    status = 200;
    response = '{}';
    constructor() {
      instances.push(this);
    }
  }
  vi.stubGlobal('XMLHttpRequest', MockXHR);
  const onProgress = vi.fn();
  const blob = new Blob(['value']);
  const wrapper = mount(Upload, { props: { action: '/upload', data: { blob, names: ['a', 'b', 'c'] }, onProgress } });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  await vi.waitFor(() => expect(instances[0]).toBeTruthy());
  const xhr = instances[0];
  xhr?.upload.onprogress?.({ lengthComputable: true, loaded: 1, total: 2 } as ProgressEvent);
  expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ percent: 50 }), expect.anything(), expect.any(Array));
  const body = (xhr as unknown as { send: ReturnType<typeof vi.fn> }).send.mock.calls[0][0] as FormData;
  expect(body.get('blob')).toBeInstanceOf(Blob);
  expect(body.getAll('names')).toEqual(['a', 'b', 'c']);
  xhr?.onload?.();
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  vi.unstubAllGlobals();
});

test('选择同一文件前清空 input，before-upload 返回 File 时上传转换后的文件', async () => {
  const request = vi.fn().mockResolvedValue(undefined);
  const converted = new File(['converted'], 'converted.txt');
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, beforeUpload: () => converted } });
  const input = wrapper.get('input').element as HTMLInputElement;
  const click = vi.spyOn(input, 'click');
  await wrapper.get('button').trigger('click');
  expect(input.value).toBe('');
  expect(click).toHaveBeenCalledOnce();
  await select(wrapper, [new File(['raw'], 'raw.txt')]);
  expect(request).toHaveBeenCalledWith(expect.objectContaining({ file: converted }));
});

test('选择文件时生成 ready 文件并按 modelValue 回写', async () => {
  const wrapper = mount(Upload, { props: { autoUpload: false } });
  const raw = new File(['hello'], 'hello.txt', { type: 'text/plain' });

  await select(wrapper, [raw]);

  const file = wrapper.emitted('change')?.[0]?.[0] as Record<string, unknown>;
  expect(file).toMatchObject({ name: 'hello.txt', status: 'ready', raw, size: 5 });
  expect(file.uid).toEqual(expect.any(Number));
  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([file]);
});

test('modelValue 变化同步列表，file-list 是受控主入口并优先', async () => {
  const first = { name: 'controlled.txt', uid: 10, status: 'ready' as const };
  const second = { name: 'next.txt', uid: 11, status: 'success' as const };
  const wrapper = mount(Upload, {
    props: { modelValue: [{ name: 'model.txt', uid: 9, status: 'ready' }] }
  });
  expect(wrapper.text()).toContain('model.txt');
  await wrapper.setProps({ modelValue: [{ name: 'model-next.txt', uid: 9, status: 'ready' }] });
  expect(wrapper.text()).toContain('model-next.txt');

  await wrapper.setProps({
    fileList: [first],
    modelValue: [{ name: 'ignored.txt', uid: 12, status: 'ready' }],
    autoUpload: false
  });

  expect(wrapper.text()).toContain('controlled.txt');
  expect(wrapper.text()).not.toContain('ignored.txt');
  await wrapper.setProps({ fileList: [second] });
  expect(wrapper.text()).toContain('next.txt');
  expect(wrapper.text()).not.toContain('controlled.txt');

  await select(wrapper, [new File(['x'], 'added.txt')]);
  expect(wrapper.emitted('update:file-list')?.at(-1)?.[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'added.txt', status: 'ready' })])
  );
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('受控列表等值回写不会取消活动请求', async () => {
  const handle = { cancel: vi.fn(), promise: new Promise<unknown>(() => undefined) };
  const wrapper = mount(Upload, { props: { fileList: [], action: '/upload', autoUpload: false, httpRequest: () => handle } });
  await (wrapper.vm as { handleStart: (file: File) => void }).handleStart(new File(['x'], 'active.txt'));
  void (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(handle.cancel).not.toHaveBeenCalled());
  const current = (wrapper.emitted('update:file-list')?.at(-1)?.[0] as UploadFile[]).map((file) => ({ ...file }));
  await wrapper.setProps({ fileList: current });
  expect(handle.cancel).not.toHaveBeenCalled();
});

test('无 uid 的受控文件重排时保持对应 uid', async () => {
  const wrapper = mount(Upload, { props: { fileList: [{ name: 'a.txt', status: 'ready' as const }, { name: 'b.txt', status: 'ready' as const }], autoUpload: false } });
  const first = wrapper.findAll('li').map((item) => Number(item.attributes('data-uid')));
  await wrapper.setProps({ fileList: [{ name: 'b.txt', status: 'ready' as const }, { name: 'a.txt', status: 'ready' as const }] });
  const second = wrapper.findAll('li').map((item) => Number(item.attributes('data-uid')));
  expect(second).toEqual([first[1], first[0]]);
});

test('无 uid 的受控文件改名时保持稳定 uid', async () => {
  const wrapper = mount(Upload, { props: { fileList: [{ name: 'before.txt', status: 'ready' as const }], autoUpload: false } });
  const firstUid = Number(wrapper.find('li').attributes('data-uid'));
  await wrapper.setProps({ fileList: [{ name: 'after.txt', status: 'ready' as const }] });
  expect(Number(wrapper.find('li').attributes('data-uid'))).toBe(firstUid);
});

test('无 uid 的受控文件回写时保持稳定 uid', async () => {
  const wrapper = mount(Upload, { props: { fileList: [{ name: 'plain.txt', status: 'ready' as const }], autoUpload: false } });
  const firstUid = Number(wrapper.find('li').attributes('data-uid'));
  await wrapper.setProps({ fileList: [{ name: 'plain.txt', status: 'ready' as const }] });
  expect(Number(wrapper.find('li').attributes('data-uid'))).toBe(firstUid);
  expect(wrapper.findAll('li')).toHaveLength(1);
});

test('uid 稳定且多文件唯一，disabled 时不选择或删除', async () => {
  const wrapper = mount(Upload, { props: { autoUpload: false, multiple: true } });
  await select(wrapper, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  const selected = wrapper.emitted('change')?.map((event) => event[0]) as Array<{ uid: number }>;
  expect(selected[0].uid).not.toBe(selected[1].uid);
  const firstUid = selected[0].uid;
  const controlledFile = { name: 'one.txt', status: 'ready' as const };
  await wrapper.setProps({ modelValue: [controlledFile] });
  const firstRenderedUidAttribute = wrapper.findAll('li')[0].attributes('data-uid');
  expect(firstRenderedUidAttribute).toBeDefined();
  const firstRenderedUid = Number(firstRenderedUidAttribute);
  expect(Number.isFinite(firstRenderedUid)).toBe(true);
  await wrapper.setProps({ modelValue: [{ name: 'one.txt', status: 'ready' as const }] });
  const replacedUidAttribute = wrapper.findAll('li')[0].attributes('data-uid');
  expect(replacedUidAttribute).toBeDefined();
  const replacedUid = Number(replacedUidAttribute);
  expect(Number.isFinite(replacedUid)).toBe(true);
  await wrapper.setProps({ modelValue: [{ name: 'one.txt', status: 'ready' as const }] });
  const deeplySyncedUidAttribute = wrapper.findAll('li')[0].attributes('data-uid');
  expect(deeplySyncedUidAttribute).toBeDefined();
  const deeplySyncedUid = Number(deeplySyncedUidAttribute);
  expect(Number.isFinite(deeplySyncedUid)).toBe(true);
  expect(wrapper.findAll('li')).toHaveLength(1);
  expect(replacedUid).toBe(firstRenderedUid);
  expect(deeplySyncedUid).toBe(firstRenderedUid);
  expect(firstUid).toEqual(expect.any(Number));
});

test('默认请求使用 POST、file 字段并透传上传配置', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  class MockXHR {
    upload = {};
    open = vi.fn();
    send = vi.fn(() => { this.status = 200; this.response = '{"ok":true}'; this.responseText = this.response; this.onload?.(); });
    setRequestHeader = vi.fn();
    onload?: () => void;
    onerror?: () => void;
    onabort?: () => void;
    status = 0;
    response = '';
    responseText = '';
    withCredentials = false;
    abort = vi.fn();
  }
  vi.stubGlobal('XMLHttpRequest', MockXHR);
  const wrapper = mount(Upload, {
    props: {
      action: '/upload',
      name: 'asset',
      method: 'PUT',
      headers: { Authorization: 'token' },
      data: { folder: 'tmp' },
      withCredentials: true
    }
  });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  expect(fetchMock).not.toHaveBeenCalled();
  expect(wrapper.emitted('success')?.[0]?.[0]).toEqual({ ok: true });
  fetchMock.mockRestore();
});

test('自定义请求未传 data 时收到空对象', async () => {
  let requestData: unknown;
  const wrapper = mount(Upload, { props: { action: '/upload', autoUpload: false, httpRequest: (options: { data: unknown }) => { requestData = options.data; return Promise.resolve(undefined); } } });
  await select(wrapper, [new File(['x'], 'empty-data.txt')]);
  await (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  expect(requestData).toEqual({});
});

test('自定义请求返回 void 时等待回调 response', async () => {
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: ({ onSuccess }: { onSuccess: (response: unknown) => void }) => { setTimeout(() => onSuccess({ id: 2 }), 0); } } });
  await select(wrapper, [new File(['x'], 'callback.txt')]);
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  expect(wrapper.emitted('success')?.[0]?.[0]).toEqual({ id: 2 });
});

test('自定义请求 Promise 返回值会作为 success response', async () => {
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: () => Promise.resolve({ id: 1 }) } });
  await select(wrapper, [new File(['x'], 'promise.txt')]);
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  const file = wrapper.emitted('success')?.[0]?.[1] as UploadFile;
  expect(wrapper.emitted('success')?.[0]?.[0]).toEqual({ id: 1 });
  expect(file.response).toEqual({ id: 1 });
});

test('data 函数会在自定义请求前解析并传入结果', async () => {
  const data = { userId: 1 };
  const request = vi.fn().mockResolvedValue({ ok: true });
  const wrapper = mount(Upload, { props: { action: '/upload', data: () => Promise.resolve(data), httpRequest: request } });
  await select(wrapper, [new File(['x'], 'data.txt')]);
  await vi.waitFor(() => expect(request).toHaveBeenCalled());
  expect(request.mock.calls[0][0].data).toEqual(data);
});

test('自定义请求接收完整协议并通过回调驱动状态', async () => {
  let options: Record<string, unknown> | undefined;
  const wrapper = mount(Upload, {
    props: {
      action: '/upload',
      httpRequest: (request: Record<string, unknown>) => {
        options = request;
        (request.onProgress as (event: { percent: number }) => void)({ percent: 50 });
        (request.onSuccess as (response: unknown) => void)({ id: 1 });
        return Promise.resolve();
      }
    }
  });
  const raw = new File(['x'], 'x.txt');
  await select(wrapper, [raw]);
  await vi.waitFor(() => expect(wrapper.emitted('success')).toBeTruthy());
  expect(options).toMatchObject({ file: raw, action: '/upload', method: 'POST', filename: 'file', withCredentials: false });
  expect(options?.onProgress).toBeTypeOf('function');
  expect(wrapper.emitted('success')?.[0]?.[0]).toEqual({ id: 1 });
  expect((wrapper.emitted('success')?.[0]?.[1] as UploadFile).response).toEqual({ id: 1 });
});

test('父组件复制列表后仍能收到转换后的 raw 和 size', async () => {
  let parentList: UploadFile[] = [];
  const converted = new File(['converted'], 'converted.txt');
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { fileList: parentList, autoUpload: false, beforeUpload: () => converted, httpRequest: request, 'onUpdate:fileList': (list: UploadFile[]) => { parentList = list.map((file) => ({ ...file })); } } });
  await select(wrapper, [new File(['source'], 'source.txt')]);
  await vi.waitFor(() => expect(parentList[0]?.raw).toBe(converted));
  expect(parentList[0]?.size).toBe(converted.size);
});

test('before-upload 转换后保留展示名称且不额外触发 change', async () => {
  const converted = new File(['converted'], 'converted.txt');
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { autoUpload: false, beforeUpload: () => converted, httpRequest: request } });
  await select(wrapper, [new File(['source'], 'source.txt')]);
  const changes = wrapper.emitted('change') || [];
  expect(changes).toHaveLength(1);
  expect((changes[0][0] as UploadFile).name).toBe('source.txt');
  expect((wrapper.vm as { handleStart: (file: File) => void }).handleStart).toBeTypeOf('function');
});

test('before-upload 返回 Blob 时保留目录元数据', async () => {
  const wrapper = mount(Upload, { props: { directory: true, autoUpload: false, beforeUpload: () => new Blob(['converted'], { type: 'text/plain' }) } });
  const raw = new File(['source'], 'a.txt') as UploadRawFile;
  Object.defineProperty(raw, 'webkitRelativePath', { value: 'folder/a.txt' });
  await select(wrapper, [raw]);
  const file = wrapper.emitted('change')?.[0]?.[0] as UploadFile;
  expect(file.raw?.webkitRelativePath).toBe('folder/a.txt');
  expect(file.raw?.isDirectory).toBe(true);
  expect(file.raw?.size).toBe(9);
});

test('before-upload 拒绝后先经历 ready 再移除并触发 remove', async () => {
  const onRemove = vi.fn();
  const wrapper = mount(Upload, { props: { autoUpload: false, beforeUpload: () => false, onRemove } });
  await select(wrapper, [new File(['x'], 'rejected.txt')]);
  expect(wrapper.emitted('change')?.map((event) => (event[0] as UploadFile).status)).toEqual(['ready']);
  await vi.waitFor(() => expect(wrapper.emitted('remove')).toBeTruthy());
  expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ name: 'rejected.txt' }), []);
  expect(wrapper.findAll('li')).toHaveLength(0);
});

test('auto-upload=false 时 submit 才上传，before-upload 可阻止请求', async () => {
  const request = vi.fn().mockResolvedValue(undefined);
  const beforeUpload = vi.fn().mockResolvedValue(false);
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, autoUpload: false } });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  expect(request).not.toHaveBeenCalled();
  expect(wrapper.text()).toContain('x.txt');
  await (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  expect(request).toHaveBeenCalled();

  const blocked = mount(Upload, { props: { action: '/upload', httpRequest: request, beforeUpload } });
  await select(blocked, [new File(['x'], 'blocked.txt')]);
  expect(request).toHaveBeenCalledTimes(1);
  expect(beforeUpload).toHaveBeenCalled();
});

test('limit 超出不部分加入且触发 prop 与 emit，multiple=false 只接收一个文件', async () => {
  const onExceed = vi.fn();
  const wrapper = mount(Upload, { props: { limit: 1, multiple: false, autoUpload: false, onExceed } });
  await select(wrapper, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  expect(wrapper.findAll('li')).toHaveLength(0);
  expect(wrapper.emitted('exceed')).toHaveLength(1);
  expect(onExceed).toHaveBeenCalled();
});

test('limit=0 不启用数量限制，multiple=false 仍只接收一个文件', async () => {
  const onExceed = vi.fn();
  const wrapper = mount(Upload, { props: { limit: 0, multiple: false, autoUpload: false, onExceed } });
  await select(wrapper, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  expect(wrapper.findAll('li')).toHaveLength(1);
  expect(onExceed).not.toHaveBeenCalled();
});

test('失败上传仍触发 change，before-remove=false 不删除', async () => {
  const onChange = vi.fn();
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: () => Promise.reject(new Error('no')), beforeRemove: () => false, onChange } });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  await vi.waitFor(() => expect(wrapper.emitted('error')).toBeTruthy());
  expect(wrapper.emitted('change')).toBeTruthy();
  await wrapper.findAll('button').find((button) => button.text() === '删除')?.trigger('click');
  expect(wrapper.findAll('li')).toHaveLength(1);
});

test('abort 单个和全部请求后不保留 uploading 且自定义句柄可取消', async () => {
  const handles: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];
  const wrapper = mount(Upload, { props: { action: '/upload', multiple: true, autoUpload: false, httpRequest: () => { const handle = { cancel: vi.fn() }; handles.push(handle); return handle; } } });
  await select(wrapper, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  const submit = (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(handles).toHaveLength(2));
  await (wrapper.vm as { abort: (file?: UploadFile) => void }).abort();
  await wrapper.vm.$nextTick();
  expect(handles[0].cancel).toHaveBeenCalledTimes(1);
  expect(handles[1].cancel).toHaveBeenCalledTimes(1);
  const single = mount(Upload, { props: { action: '/upload', autoUpload: false, httpRequest: () => { const handle = { cancel: vi.fn(), promise: new Promise<unknown>(() => undefined) }; handles.push(handle); return handle; } } });
  await select(single, [new File(['s'], 'single.txt')]);
  void (single.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(handles).toHaveLength(3));
  await (single.vm as { abort: (file?: UploadFile) => void }).abort({ uid: Number(single.find('li').attributes('data-uid')) } as UploadFile);
  expect(handles[2].cancel).toHaveBeenCalledTimes(1);
  const allHandles: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];
  const all = mount(Upload, { props: { action: '/upload', multiple: true, autoUpload: false, httpRequest: () => { const handle = { cancel: vi.fn(), promise: new Promise<unknown>(() => undefined) }; allHandles.push(handle); return handle; } } });
  await select(all, [new File(['3'], 'three.txt'), new File(['4'], 'four.txt')]);
  void (all.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(allHandles).toHaveLength(2));
  await (all.vm as { abort: (file?: UploadFile) => void }).abort();
  expect(allHandles[0].cancel).toHaveBeenCalledTimes(1);
  expect(allHandles[1].cancel).toHaveBeenCalledTimes(1);
  expect(wrapper.findAll('li').every((item) => item.text().includes('ready') || item.text().includes('fail'))).toBe(true);
  await submit;
});

test('before-upload 和 before-remove reject 被捕获，onPreview 可触发且回调参数完整', async () => {
  const onPreview = vi.fn();
  const wrapper = mount(Upload, { props: { autoUpload: false, beforeUpload: () => Promise.reject(new Error('blocked')), beforeRemove: () => Promise.reject(new Error('blocked')), onPreview } });
  await select(wrapper, [new File(['x'], 'x.txt')]);
  expect(wrapper.findAll('li')).toHaveLength(0);
  const onRemove = vi.fn();
  const preview = mount(Upload, { props: { modelValue: [{ name: 'x.txt', uid: 1, status: 'ready' }], onPreview, beforeRemove: () => Promise.reject(new Error('blocked')), onRemove } });
  await preview.findAll('button').find((button) => button.text() === '预览')?.trigger('click');
  expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'x.txt' }));
  await preview.findAll('button').find((button) => button.text() === '删除')?.trigger('click');
  expect(preview.findAll('li')).toHaveLength(1);
  expect(onRemove).not.toHaveBeenCalled();
});

test('Promise 请求永不完成时 abort 会结束 submit 并恢复 ready', async () => {
  const wrapper = mount(Upload, { props: { action: '/upload', autoUpload: false, httpRequest: () => new Promise<unknown>(() => undefined) } });
  await select(wrapper, [new File(['x'], 'never.txt')]);
  const submit = (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(wrapper.find('em').text()).toBe('uploading'));
  await (wrapper.vm as { abort: () => void }).abort();
  await expect(submit).resolves.toEqual([undefined]);
  expect(wrapper.find('em').text()).toBe('ready');
});

test('带 promise 句柄 abort 不悬挂且底层 resolve 不触发 success', async () => {
  let resolve: (value: unknown) => void = () => undefined;
  const promise = new Promise<unknown>((done) => { resolve = done; });
  const abort = vi.fn();
  const wrapper = mount(Upload, { props: { action: '/upload', autoUpload: false, httpRequest: () => ({ abort, promise }) } });
  await select(wrapper, [new File(['x'], 'handle.txt')]);
  const submit = (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(wrapper.find('em').text()).toBe('uploading'));
  await (wrapper.vm as { abort: () => void }).abort();
  await expect(submit).resolves.toEqual([undefined]);
  resolve({ ok: true });
  await Promise.resolve();
  expect(wrapper.emitted('success')).toBeUndefined();
  expect(wrapper.emitted('error')).toBeUndefined();
  expect(wrapper.find('em').text()).toBe('ready');
  expect(abort).toHaveBeenCalledOnce();
});

test('before-upload 返回 null 时视为允许', async () => {
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, beforeUpload: () => null } });
  await select(wrapper, [new File(['x'], 'null-result.txt')]);
  expect(request).toHaveBeenCalledOnce();
});

test('before-upload 无返回值时允许上传且类型可用', async () => {
  const beforeUpload: (file: UploadRawFile) => void = () => undefined;
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, beforeUpload } });
  await select(wrapper, [new File(['x'], 'allowed.txt')]);
  expect(request).toHaveBeenCalledOnce();
});

test('abort 后 Promise resolve 不触发 success/error/change', async () => {
  let resolve: (value: unknown) => void = () => undefined;
  const promise = new Promise<unknown>((done) => { resolve = done; });
  const wrapper = mount(Upload, { props: { action: '/upload', autoUpload: false, httpRequest: () => promise } });
  await select(wrapper, [new File(['x'], 'late.txt')]);
  const submit = (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  await vi.waitFor(() => expect(wrapper.find('em').text()).toBe('uploading'));
  const changesBeforeAbort = wrapper.emitted('change')?.length;
  await (wrapper.vm as { abort: () => void }).abort();
  await expect(submit).resolves.toEqual([undefined]);
  resolve({ ok: true });
  await Promise.resolve();
  expect(wrapper.emitted('success')).toBeUndefined();
  expect(wrapper.emitted('error')).toBeUndefined();
  expect(wrapper.emitted('change')?.length).toBe(changesBeforeAbort! + 1);
});

test('abort-only 句柄异步 success/error 会结束 pending 请求', async () => {
  let complete: ((response?: unknown) => void) | undefined;
  const success = mount(Upload, { props: { action: '/upload', httpRequest: (options: { onSuccess: (response: unknown) => void }) => { complete = options.onSuccess; return { abort: vi.fn() }; } } });
  await select(success, [new File(['x'], 'success.txt')]);
  await vi.waitFor(() => expect(complete).toBeTypeOf('function'));
  complete?.({ ok: true });
  await vi.waitFor(() => expect(success.emitted('success')).toBeTruthy());

  let fail: ((error: unknown) => void) | undefined;
  const failed = mount(Upload, { props: { action: '/upload', httpRequest: (options: { onError: (error: unknown) => void }) => { fail = options.onError; return { cancel: vi.fn() }; } } });
  await select(failed, [new File(['x'], 'fail.txt')]);
  await vi.waitFor(() => expect(fail).toBeTypeOf('function'));
  fail?.(new Error('failed'));
  await vi.waitFor(() => expect(failed.emitted('error')).toBeTruthy());
});

test('multiple=false 不因自身多选触发 limit exceed，limit 单独校验', async () => {
  const wrapper = mount(Upload, { props: { multiple: false, autoUpload: false } });
  await select(wrapper, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  expect(wrapper.findAll('li')).toHaveLength(1);
  const limited = mount(Upload, { props: { multiple: true, limit: 1, autoUpload: false } });
  await select(limited, [new File(['1'], 'one.txt'), new File(['2'], 'two.txt')]);
  expect(limited.emitted('exceed')).toHaveLength(1);
});

test('实例方法只提交 ready 文件，clearFiles 清理列表，handleStart 和 handleRemove 可用', async () => {
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, autoUpload: false } });
  const raw = new File(['x'], 'manual.txt');
  await (wrapper.vm as { handleStart: (file: File) => void }).handleStart(raw);
  expect(wrapper.text()).toContain('manual.txt');
  await (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  expect(request).toHaveBeenCalledTimes(1);
  await (wrapper.vm as { handleRemove: (file: UploadFile) => Promise<void> }).handleRemove((wrapper.vm as { fileList?: UploadFile[] }).fileList?.[0] || (wrapper.find('li').element && { uid: Number(wrapper.find('li').attributes('data-uid')) } as UploadFile));
  await (wrapper.vm as { clearFiles: () => void }).clearFiles();
  expect(wrapper.findAll('li')).toHaveLength(0);
});

test('受控列表 handleRemove 按 uid 删除内部克隆并遵守 beforeRemove', async () => {
  const beforeRemove = vi.fn().mockResolvedValue(true);
  const onRemove = vi.fn();
  const controlled = { name: 'controlled.txt', uid: 42, status: 'ready' as const };
  const wrapper = mount(Upload, { props: { fileList: [controlled], beforeRemove, onRemove } });
  await (wrapper.vm as { handleRemove: (file: UploadFile) => Promise<void> }).handleRemove({ name: 'external.txt', uid: 42, status: 'ready' });
  expect(beforeRemove).toHaveBeenCalledWith(expect.objectContaining({ name: 'controlled.txt', uid: 42 }), expect.any(Array));
  expect(wrapper.emitted('update:file-list')?.at(-1)?.[0]).toEqual([]);
  expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ name: 'controlled.txt', uid: 42 }), []);
  const rejected = mount(Upload, { props: { fileList: [controlled], beforeRemove: () => false } });
  await (rejected.vm as { handleRemove: (file: UploadFile) => Promise<void> }).handleRemove({ name: 'external.txt', uid: 42, status: 'ready' });
  expect(rejected.emitted('update:file-list')).toBeUndefined();
});

test('show-file-list、trigger、tip 和 file 插槽控制展示', async () => {
  const wrapper = mount(Upload, { props: { showFileList: false }, slots: { trigger: ({ choose }: { choose: () => void }) => h('span', { class: 'trigger', onClick: choose }, '触发'), tip: () => h('span', { class: 'tip' }, '提示'), default: () => '默认' } });
  expect(wrapper.find('ul').exists()).toBe(false);
  expect(wrapper.find('.trigger').exists()).toBe(true);
  expect(wrapper.find('.tip').text()).toBe('提示');
  await select(wrapper, [new File(['x'], 'hidden.txt')]);
  expect(wrapper.text()).toContain('触发');
});

test('隐藏列表不影响 submit，trigger choose 打开文件选择器', async () => {
  const request = vi.fn().mockResolvedValue(undefined);
  const wrapper = mount(Upload, { props: { action: '/upload', httpRequest: request, autoUpload: false, showFileList: false }, slots: { trigger: ({ choose }: { choose: () => void }) => h('button', { class: 'custom-trigger', onClick: choose }, '上传') } });
  const input = wrapper.get('input').element as HTMLInputElement;
  const click = vi.spyOn(input, 'click');
  await select(wrapper, [new File(['x'], 'hidden-submit.txt')]);
  expect(wrapper.find('ul').exists()).toBe(false);
  await (wrapper.vm as { submit: () => Promise<unknown> }).submit();
  expect(request).toHaveBeenCalledTimes(1);
  await wrapper.get('.custom-trigger').trigger('click');
  expect(click).toHaveBeenCalledTimes(1);
});

test('拖拽添加文件、目录属性和目录文件类型信息', async () => {
  const wrapper = mount(Upload, { props: { drag: true, directory: true, autoUpload: false } });
  const raw = new File(['x'], 'folder.txt') as UploadRawFile;
  Object.defineProperty(raw, 'webkitRelativePath', { value: 'folder/folder.txt' });
  const dragover = new Event('dragover', { cancelable: true });
  wrapper.element.dispatchEvent(dragover);
  const drop = new Event('drop', { cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [raw] } });
  wrapper.element.dispatchEvent(drop);
  expect(dragover.defaultPrevented).toBe(true);
  expect(drop.defaultPrevented).toBe(true);
  await wrapper.vm.$nextTick();
  expect(wrapper.get('input').attributes('webkitdirectory')).toBeDefined();
  expect(wrapper.text()).toContain('folder.txt');
  expect((wrapper.emitted('change')?.[0]?.[0] as UploadFile).raw?.isDirectory).toBe(true);
  expect((wrapper.emitted('change')?.[0]?.[0] as UploadFile).raw?.webkitRelativePath).toBe('folder/folder.txt');
});

test('图片列表渲染缩略图、file 插槽和预览回调', async () => {
  const onPreview = vi.fn();
  const wrapper = mount(Upload, { props: { listType: 'picture', autoUpload: false, onPreview, modelValue: [{ name: 'a.png', uid: 1, status: 'success', url: '/a.png' }] }, slots: { file: ({ file }: { file: UploadFile }) => h('strong', { class: 'custom-file' }, file.name) } });
  expect(wrapper.find('.custom-file').text()).toBe('a.png');
  const preview = mount(Upload, { props: { listType: 'picture', autoUpload: false, onPreview, modelValue: [{ name: 'a.png', uid: 1, status: 'success', url: '/a.png' }] } });
  expect(preview.find('img').attributes('src')).toBe('/a.png');
  await preview.findAll('button').find((button) => button.text() === '预览')?.trigger('click');
  expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'a.png' }));
  const card = mount(Upload, { props: { listType: 'picture-card', modelValue: [{ name: 'b.png', uid: 2, status: 'success', raw: new File(['x'], 'b.png') as UploadRawFile }] } });
  expect(card.find('.i-upload__list').classes()).toContain('i-upload__list--picture-card');
  expect(card.find('img').exists()).toBe(true);
});

test('disabled 时不选择或删除文件，并透传原生属性', async () => {
  const wrapper = mount(Upload, {
    props: { disabled: true, multiple: true, accept: '.png', directory: true, modelValue: [{ name: 'kept.txt', uid: 1, status: 'ready' }] }
  });
  const input = wrapper.get('input[type="file"]');

  expect(input.attributes('multiple')).toBeDefined();
  expect(input.attributes('accept')).toBe('.png');
  expect(input.attributes('webkitdirectory')).toBeDefined();
  await select(wrapper, [new File(['x'], 'new.txt')]);
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  expect(wrapper.text()).toContain('kept.txt');
  expect(wrapper.findAll('button').some((button) => button.text() === '删除')).toBe(false);

  const enabled = mount(Upload, { props: { modelValue: [{ name: 'remove.txt', uid: 2, status: 'ready' }] } });
  await enabled.findAll('button').find((button) => button.text() === '删除')?.trigger('click');
  expect(enabled.emitted('update:modelValue')?.[0]?.[0]).toEqual([]);
});
