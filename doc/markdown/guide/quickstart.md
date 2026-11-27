# 快速上手

完成 [安装](#/guide/install) 后，先用一个查询表单跑通组件引入、样式和 Vue 3 双向绑定，再选择局部引入或全局注册。

## 第一个页面

将下面的内容放到应用的 `App.vue`。输入姓名后点击“查询”，页面会显示本次查询条件；点击“重置”可清空输入。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button, ConfigProvider, Input, Space } from 'cool-design';
import 'cool-design/style.css';

const name = ref('');
const nameInput = { id: 'user-name' };
const result = ref('请输入姓名后查询');
function search() {
  result.value = name.value.trim() ? `正在查询：${name.value.trim()}` : '正在查询全部用户';
}
function reset() {
  name.value = '';
  result.value = '筛选条件已重置';
}
</script>

<template>
  <ConfigProvider>
    <form class="search-form" @submit.prevent="search">
      <label for="user-name">用户姓名</label>
      <Input v-model="name" v-bind="nameInput" clearable placeholder="请输入姓名" />
      <Space>
        <Button type="primary" native-type="submit">查询</Button>
        <Button @click="reset">重置</Button>
      </Space>
      <p role="status">{{ result }}</p>
    </form>
  </ConfigProvider>
</template>

<style scoped>
.search-form {
  display: grid;
  gap: 16px;
  max-width: 480px;
  padding: 24px;
}
</style>
```

这里的查询只演示页面状态变化，不发起网络请求。对接接口时，在 `search()` 中使用输入值构造查询参数。

## 局部引入

在 `<script setup>` 中导入需要的组件，模板可直接使用同名标签。下面的示例只引入按钮所需样式。如果应用入口已经引入全量 `cool-design/style.css`，可以省略示例中的 CSS 导入。

```vue
<script setup lang="ts">
import Button from 'cool-design/button';
import ConfigProvider from 'cool-design/config-provider';
import 'cool-design/button/style.css';
</script>

<template>
  <ConfigProvider>
    <Button type="primary">保存修改</Button>
  </ConfigProvider>
</template>
```

每个组件子路径都提供 `/style.css`，包含主题变量和组件内建依赖。插槽中另用的组件需引入各自样式。组合 Tag、Image 和 Cascader 时，依次引入三者的 CSS，可保持与全量样式相同的按钮优先级。

### 兼容命名的根入口

根包提供 `El*` 组件别名。下面的例子使用 `ElSelect`、`ElOption` 和全量样式。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ElOption, ElSelect } from 'cool-design';
import 'cool-design/style.css';

const city = ref('chengdu');
const cityControl = { 'aria-label': '城市' };
</script>

<template>
  <ElSelect v-model="city" v-bind="cityControl">
    <ElOption value="chengdu" label="成都" />
    <ElOption value="chongqing" label="重庆" />
  </ElSelect>
</template>
```

`cool-design/button` 的默认导出是 `Button`，其具名导出包含 `Button` 和 `ButtonGroup`。如果只全局安装这组组件，通过 `app.use(Button).use(ButtonGroup)` 分别注册父子组件。`app.use(Avatar)` 会一并注册 `AvatarGroup`。

## 全局注册

在应用的 `main.ts` 中注册组件库并导入样式：

```ts
import { createApp } from 'vue';
import CoolDesign from 'cool-design';
import 'cool-design/style.css';
import App from './App.vue';

createApp(App).use(CoolDesign).mount('#app');
```

全局注册后，模板可使用 `i-` 品牌前缀。已提供 `El*` 兼容名的组件也可使用 kebab-case，例如 `<el-button>`。

```vue
<template>
  <i-config-provider>
    <i-button type="primary">保存修改</i-button>
  </i-config-provider>
</template>
```

全量安装还会注册携带当前应用上下文的全局服务属性，可在模板或选项式组件中调用 `$message`、`$notify`、`$msgbox`、`$alert`、`$confirm`、`$prompt` 和 `$loading`。

需要直接导入服务时，从根包导入 `ElMessage`、`ElNotification`、`ElMessageBox` 或 `ElLoading`。例如 `ElMessage.success('已保存')` 与 `ElLoading.service(options)`。声明式形态使用库原名，如 `Message` 和 `Notification`。库扩展 `DateTimePicker` 也使用原名。

选项式组件可以使用以下应用级服务。

```ts
export default {
  methods: {
    save() {
      this.$message.success('已保存');
      this.$confirm('确认删除该记录？', '删除确认')
        .then(() => this.$message.success('已删除'))
        .catch(() => undefined);
    }
  }
};
```

## 应用级配置

建议在应用根部放置一个 ConfigProvider。主题、支持尺寸继承的控件和浮层会读取最近的配置；具体覆盖方式见 [自定义主题](#/guide/theme)。

```vue
<script setup lang="ts">
import Button from 'cool-design/button';
import ConfigProvider from 'cool-design/config-provider';
import 'cool-design/button/style.css';
</script>

<template>
  <ConfigProvider theme="light" size="default">
    <Button type="primary">默认桌面尺寸</Button>
  </ConfigProvider>
</template>
```

## 表单与事件约定

| 场景       | 写法与行为                                                     |
| ---------- | -------------------------------------------------------------- |
| 文本输入   | `v-model` 绑定字符串，Input 支持 `clearable`                   |
| 单项选择 | 通常绑定 `string` 或 `number`，也支持 `boolean` 或配置 `value-key` 的对象，详见 Select API |
| 开关与勾选 | 单个 Switch 或 Checkbox 默认绑定 `boolean`，可配置自定义选中与未选中值 |
| 分页       | `v-model:current-page` 绑定页码，从 1 开始                     |
| 表单提交   | Button 默认是普通按钮，提交时设置 `native-type="submit"`       |
| 字段校验   | Form 的 `validate()` 返回 `Promise<boolean>`，通过后由页面保存 |
| 表格排序   | `sort-change` 通知排序状态，页面更新数据，组件不自动请求接口   |
| 消息关闭   | Message 的 `close` 事件通知页面，由页面移除消息组件            |

Switch 通过 `active-value` / `inactive-value` 配置自定义值，独立 Checkbox 通过 `true-value` / `false-value` 配置。初始模型值使用相同的类型。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, Switch } from 'cool-design';
import 'cool-design/style.css';

const status = ref('disabled');
const consent = ref(0);
</script>

<template>
  <Switch v-model="status" active-value="enabled" inactive-value="disabled" />
  <Checkbox v-model="consent" :true-value="1" :false-value="0">同意</Checkbox>
</template>
```

## 类型提示

公开类型可以与组件一起从包入口导入：

```ts
import type { FormInstance, FormRule, TableColumn, SortChange, Size } from 'cool-design';

const size: Size = 'default';
const columns: TableColumn[] = [{ key: 'name', title: '姓名' }];
```

`FormInstance` 用于模板 ref，`FormRule` 用于表单规则，`SortChange` 用于表格排序回调；各组件文档提供对应的完整示例。

## 下一步

- [Form 表单](#/components/form)：校验、提交和重置。
- [Table 表格](#/components/table)：选择、排序、固定列和操作列。
- [Dialog 对话框](#/components/dialog)：桌面编辑弹窗。
- [自定义主题](#/guide/theme)：品牌颜色、深浅主题和局部配置。
- [过渡动画](#/guide/transition)：在业务区域加入进入、离开动画。

右上角“业务示例”提供用户管理页面，可查看查询、分页和编辑如何组合使用。

## API 命名约定

组件属性表使用模板中的 kebab-case 名称，例如 `model-value`、`empty-values`、`popper-style`。`model-value` 通常通过 `v-model` 使用；JavaScript / TypeScript 属性对象仍使用 `modelValue`、`emptyValues`、`popperStyle`。

事件保留实际协议，例如 `update:modelValue`。服务选项、列配置、字段映射等 JavaScript 对象字段继续使用 camelCase，例如 `ElMessage({ showClose: true })` 和 `{ dataKey: 'name', cellRenderer }`。

文档以当前实现为准；本库扩展及与 Element Plus 默认值不同的项目会单独说明。未列出的上游 API 不视为已经支持，迁移时请核对具体组件的支持范围。
