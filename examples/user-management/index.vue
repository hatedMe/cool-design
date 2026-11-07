<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  Icon,
  Space,
  Divider,
  Tag,
  Tooltip,
  Popconfirm,
  MessageBox,
  Button,
  ConfigProvider,
  Dialog,
  Form,
  FormItem,
  Input,
  Message,
  Pagination,
  Select,
  SelectOption,
  Switch,
  Table
} from '../../packages/cool-design/index';
import type { FormInstance, FormRule, SortChange, TableColumn } from '../../packages/cool-design/index';
import { createUserService } from './service';
import type { User, UserQuery, UserService } from './types';
import './style.scss';

const props = defineProps<{ service?: UserService }>();
const demo = createUserService();
const service = props.service || demo.api;
const dark = ref(false);
const primary = ref('#2463eb');
const themeVars = computed(() => {
  const rgb = primary.value
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => parseInt(value, 16) / 255);
  const linear = rgb.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return {
    '--i-primary': primary.value,
    '--i-primary-hover': primary.value,
    '--i-on-primary': luminance > 0.179 ? '#000000' : '#ffffff'
  };
});
const conditions = reactive<{ name: string; status?: User['status'] }>({ name: '', status: undefined });
const query = reactive<UserQuery>({ name: '', status: undefined, page: 1, pageSize: 10 });
const rows = ref<User[]>([]);
const total = ref(0);
const loading = ref(false);
const deleting = ref(false);
const batchConfirmOpen = ref(false);
const batchIds = ref<number[]>([]);
const loadError = ref('');
const selected = ref<object[]>([]);
const table = ref<{ clearSelection(): void }>();
const feedback = ref<{ type: 'success' | 'error'; message: string }>();
let requestId = 0;
let alive = true;
const columns: TableColumn[] = [
  { key: 'id', title: '用户 ID', width: 150, fixed: 'left', sortable: true },
  { key: 'name', title: '姓名', sortable: true },
  { key: 'status', title: '账号状态', width: 180 },
  { key: 'action', title: '操作', width: 200, fixed: 'right' }
];
const errorMessage = (reason: unknown, fallback: string) => (reason instanceof Error ? reason.message : fallback);
async function loadUsers(): Promise<boolean> {
  const id = ++requestId;
  const params = { ...query };
  loading.value = true;
  loadError.value = '';
  selected.value = [];
  table.value?.clearSelection();
  try {
    const result = await service.listUsers(params);
    if (!alive || id !== requestId) return false;
    const lastPage = Math.max(1, Math.ceil(result.total / query.pageSize));
    if (query.page > lastPage) {
      query.page = lastPage;
      return await loadUsers();
    }
    rows.value = result.items;
    total.value = result.total;
    return true;
  } catch (reason) {
    if (alive && id === requestId) {
      loadError.value = errorMessage(reason, '列表加载失败，请重试');
      rows.value = [];
    }
    return false;
  } finally {
    if (alive && id === requestId) loading.value = false;
  }
}
function search() {
  query.name = conditions.name.trim();
  query.status = conditions.status;
  query.page = 1;
  void loadUsers();
}
function resetSearch() {
  conditions.name = '';
  conditions.status = undefined;
  search();
}
function setPage(page: number) {
  if (query.page === page) return;
  query.page = page;
  void loadUsers();
}
function setPageSize(size: number) {
  query.pageSize = size;
  query.page = 1;
  void loadUsers();
}
function sort(change: SortChange) {
  query.sortBy = change.key;
  query.order = change.order;
  query.page = 1;
  void loadUsers();
}

const editing = ref(false);
const editingId = ref(0);
const editVersion = ref(0);
const saving = ref(false);
const persisting = ref(false);
const draft = reactive<Pick<User, 'name' | 'status'>>({ name: '', status: 'enabled' });
const editForm = ref<FormInstance>();
const rules: Record<string, FormRule[]> = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      validator: (value) => {
        if (typeof value === 'string' && value.trim().length > 30) throw new Error('姓名不能超过 30 个字符');
      },
      trigger: 'blur'
    }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};
function editUser(user: User) {
  if (loading.value || saving.value || deleting.value) return;
  editingId.value = user.id;
  draft.name = user.name;
  draft.status = user.status;
  editVersion.value++;
  editing.value = true;
  feedback.value = undefined;
}
function closeEditor() {
  if (!saving.value) editing.value = false;
}
async function save() {
  if (saving.value || !editing.value) return;
  saving.value = true;
  feedback.value = undefined;
  try {
    if (!(await editForm.value?.validate())) return;
    persisting.value = true;
    await service.updateUser(editingId.value, { name: draft.name.trim(), status: draft.status });
    if (!alive) return;
    editing.value = false;
    const refreshed = await loadUsers();
    if (alive)
      feedback.value = {
        type: refreshed ? 'success' : 'error',
        message: refreshed ? '保存成功' : '保存成功，列表刷新失败，请重试加载'
      };
  } catch (reason) {
    if (alive) feedback.value = { type: 'error', message: errorMessage(reason, '保存失败，请重试') };
  } finally {
    if (alive) {
      saving.value = false;
      persisting.value = false;
    }
  }
}
async function deleteAndRefresh(ids: number[]) {
  if (deleting.value || loading.value || saving.value || !ids.length) return false;
  deleting.value = true;
  try {
    await service.deleteUsers(ids);
    if (!alive) return false;
    const refreshed = await loadUsers();
    if (alive)
      feedback.value = {
        type: refreshed ? 'success' : 'error',
        message: refreshed ? '删除成功' : '删除成功，列表刷新失败，请重试加载'
      };
    return true;
  } finally {
    if (alive) deleting.value = false;
  }
}
async function deleteOne(user: User) {
  try {
    await deleteAndRefresh([user.id]);
  } catch (reason) {
    if (alive) feedback.value = { type: 'error', message: errorMessage(reason, '删除失败，请重试') };
  }
}
function prepareBatchDelete() {
  if (loading.value || saving.value || deleting.value || batchConfirmOpen.value || !selected.value.length) return;
  batchIds.value = selected.value.map((row) => (row as User).id);
  batchConfirmOpen.value = true;
}
onMounted(() => {
  void loadUsers();
});
onBeforeUnmount(() => {
  alive = false;
  requestId++;
});
</script>

<template>
  <ConfigProvider :theme="dark ? 'dark' : 'light'" :theme-vars="themeVars">
    <div class="admin-shell">
      <aside class="sidebar" aria-label="工作空间">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true">M</span>
          <strong>Megane</strong>
          <span class="brand__edition">工作台</span>
        </div>
        <div class="workspace">
          <span class="workspace__avatar">管</span>
          <div>
            <strong>管理工作空间</strong>
            <small>后台管理</small>
          </div>
        </div>
        <div class="sidebar__label">组织管理</div>
        <a class="sidebar__active" href="#users" aria-current="page">
          <span aria-hidden="true">▦</span>
          用户管理
        </a>
        <div class="sidebar__bottom">
          <span class="sidebar__dot" />
          组件库首版示例
        </div>
      </aside>
      <div class="main-area">
        <header class="topbar">
          <div class="breadcrumb">
            工作空间
            <span>/</span>
            <strong>用户管理</strong>
          </div>
          <div class="appearance">
            <label class="color-setting">
              主色
              <input v-model="primary" type="color" aria-label="主题主色" />
            </label>
            <Switch v-model="dark" aria-label="深色模式">深色模式</Switch>
          </div>
        </header>
        <main id="users" class="page-content">
          <div class="page-heading">
            <div>
              <h1>用户管理</h1>
              <p>查询用户信息，维护账号状态。</p>
            </div>
            <span class="page-heading__tag">组织管理</span>
          </div>
          <section class="query-panel" aria-label="查询条件">
            <form data-test="query-form" class="query-form" @submit.prevent="search">
              <label class="query-field">
                <span>姓名</span>
                <Input v-model="conditions.name" data-test="query-name" placeholder="输入姓名查询" clearable />
              </label>
              <label class="query-field">
                <span>账号状态</span>
                <Select
                  :model-value="conditions.status"
                  placeholder="全部状态"
                  clearable
                  @update:model-value="conditions.status = $event as User['status'] | undefined">
                  <SelectOption value="enabled" label="启用" />
                  <SelectOption value="disabled" label="停用" />
                </Select>
              </label>
              <Space class="query-actions">
                <Button type="primary" native-type="submit">
                  <Icon type="icon-search" />
                  查询
                </Button>
                <Button data-test="reset" @click="resetSearch">重置</Button>
              </Space>
            </form>
          </section>
          <section class="list-panel" aria-labelledby="list-title">
            <div class="list-toolbar">
              <div>
                <h2 id="list-title">用户列表</h2>
                <span class="list-toolbar__count">{{ total }} 位用户</span>
              </div>
              <Space>
                <Tooltip content="选择仅保留当前页，查询或翻页后清空。">
                  <button type="button" class="selection-hint selection-help">
                    {{ selected.length ? `已选择 ${selected.length} 项` : '可勾选当前页用户' }}
                  </button>
                </Tooltip>
                <Divider vertical />
                <Button
                  data-test="batch-delete"
                  type="danger"
                  size="small"
                  :disabled="!selected.length || loading || saving || deleting"
                  @click="prepareBatchDelete">
                  批量删除
                </Button>
              </Space>
            </div>
            <div v-if="loadError" class="load-error" role="alert">
              <span>{{ loadError }}</span>
              <Button data-test="retry" @click="loadUsers">重新加载</Button>
            </div>
            <Table
              ref="table"
              :data="rows"
              :columns="columns"
              row-key="id"
              selection
              :loading="loading"
              @selection-change="selected = $event"
              @sort-change="sort">
              <template #name="{ row }">
                <span class="user-cell">
                  <span class="user-avatar" aria-hidden="true">{{ row.name.slice(0, 1) }}</span>
                  <strong>{{ row.name }}</strong>
                </span>
              </template>
              <template #status="{ row }">
                <Tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '停用' }}
                </Tag>
              </template>
              <template #action="{ row }">
                <Space :size="8" :wrap="false">
                  <Button
                    data-test="edit"
                    size="small"
                    :disabled="loading || saving || deleting"
                    @click="editUser(row as User)">
                    编辑
                  </Button>
                  <Popconfirm
                    :title="`确定删除“${row.name}”吗？`"
                    :disabled="loading || saving || deleting"
                    @confirm="deleteOne(row as User)">
                    <Button data-test="delete" size="small" type="danger" :disabled="loading || saving || deleting">
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              </template>
            </Table>
            <Pagination
              :current-page="query.page"
              :page-size="query.pageSize"
              :total="total"
              :disabled="loading"
              @update:current-page="setPage"
              @update:page-size="setPageSize" />
          </section>
          <details v-if="!props.service" class="demo-settings">
            <summary>演示设置</summary>
            <div>
              <p>以下设置仅影响下一次操作，方便检查失败后的恢复流程。</p>
              <Button
                size="small"
                @click="
                  demo.failNextList();
                  search();
                ">
                体验查询失败
              </Button>
              <Button
                size="small"
                @click="
                  demo.failNextSave();
                  feedback = { type: 'success', message: '下一次保存将模拟失败，请编辑任意用户' };
                ">
                体验保存失败
              </Button>
              <Button
                size="small"
                @click="
                  demo.failNextDelete();
                  feedback = { type: 'success', message: '下一次删除将模拟失败，请选择删除操作' };
                ">
                体验删除失败
              </Button>
            </div>
          </details>
          <footer class="page-footer">
            Megane UI
            <span>用户管理示例</span>
          </footer>
        </main>
      </div>
    </div>
    <Dialog
      :model-value="editing"
      title="编辑用户"
      :closable="!saving"
      :close-on-click-modal="!saving"
      :close-on-press-escape="!saving"
      @update:model-value="closeEditor">
      <p class="edit-description">用户 ID：{{ editingId }}</p>
      <Form
        v-if="editing"
        id="user-edit-form"
        :key="editVersion"
        ref="editForm"
        :model="draft"
        :rules="rules"
        data-test="edit-form"
        @submit="save">
        <FormItem prop="name" label="姓名">
          <Input v-model="draft.name" data-test="edit-name" placeholder="请输入姓名" :disabled="persisting" />
        </FormItem>
        <FormItem prop="status" label="账号状态">
          <Select
            :model-value="draft.status"
            :disabled="persisting"
            @update:model-value="draft.status = $event as User['status']">
            <SelectOption value="enabled" label="启用" />
            <SelectOption value="disabled" label="停用" />
          </Select>
        </FormItem>
      </Form>
      <template #footer>
        <Button data-test="reset-edit" :disabled="saving" @click="editForm?.resetFields()">重置</Button>
        <Button data-test="cancel" :disabled="saving" @click="closeEditor">取消</Button>
        <Button type="primary" native-type="submit" form="user-edit-form" :loading="saving">保存修改</Button>
      </template>
    </Dialog>
    <MessageBox
      v-model="batchConfirmOpen"
      title="批量删除用户"
      :message="`确定删除选中的 ${batchIds.length} 位用户吗？此操作不可恢复。`"
      confirm-button-text="删除"
      :before-confirm="() => deleteAndRefresh(batchIds)" />
    <Message
      v-if="feedback"
      :key="feedback.message"
      :type="feedback.type"
      :message="feedback.message"
      @close="feedback = undefined" />
  </ConfigProvider>
</template>
