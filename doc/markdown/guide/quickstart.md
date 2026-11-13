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
      <Input id="user-name" v-model="name" clearable placeholder="请输入姓名" />
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

在 `<script setup>` 中导入需要的组件，模板可直接使用同名标签。样式在应用入口统一引入一次后，后续页面无需重复导入。

```vue
<script setup lang="ts">
import { Button, ConfigProvider } from 'cool-design';
</script>

<template>
  <ConfigProvider>
    <Button type="primary">保存修改</Button>
  </ConfigProvider>
</template>
```

组件入口采用命名导出，支持构建工具处理 Tree Shaking；当前 `style.css` 为统一样式文件。项目没有配置自动导入插件，使用组件前应显式导入或全局注册。

## 全局注册

在应用的 `main.ts` 中注册组件库并导入样式：

```ts
import { createApp } from 'vue';
import CoolDesign from 'cool-design';
import 'cool-design/style.css';
import App from './App.vue';

createApp(App).use(CoolDesign).mount('#app');
```

全局注册后，模板使用 `i-` 前缀：

```vue
<template>
  <i-config-provider>
    <i-button type="primary">保存修改</i-button>
  </i-config-provider>
</template>
```

## 应用级配置

建议在应用根部放置一个 ConfigProvider。主题、支持尺寸继承的控件和浮层会读取最近的配置；具体覆盖方式见 [自定义主题](#/guide/theme)。

```vue
<script setup lang="ts">
import { Button, ConfigProvider } from 'cool-design';
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
| 单项选择   | Select 的 `v-model` 支持字符串或数字，清空为 `undefined`       |
| 开关与勾选 | Switch、Checkbox 的 `v-model` 为布尔值                         |
| 分页       | `v-model:current-page` 绑定页码，从 1 开始                     |
| 表单提交   | Button 默认是普通按钮，提交时设置 `native-type="submit"`       |
| 字段校验   | Form 的 `validate()` 返回 `Promise<boolean>`，通过后由页面保存 |
| 表格排序   | `sort-change` 通知排序状态，页面更新数据，组件不自动请求接口   |
| 消息关闭   | Message 的 `close` 事件通知页面，由页面移除消息组件            |

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
