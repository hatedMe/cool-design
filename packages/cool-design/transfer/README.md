# Transfer 穿梭框

### 介绍

Transfer 用于在两个列表之间移动和管理选项，支持搜索过滤、禁用项、字段映射、目标排序和自定义插槽。`modelValue` 为右侧列表的数据 `key` 集合，组件内部以 `key` 稳定映射左右列表并去重。

## 基础用法

```vue
<Transfer v-model="value" :data="data" filterable :titles="['左侧列表', '右侧列表']" />
```

`data` 中每一项至少包含 `key`；`disabled` 为 `true` 的选项不可选中、不可移动。

## 按钮文案与计数格式

```vue
<Transfer
  v-model="value"
  :data="data"
  :button-texts="['到左边', '到右边']"
  :format="{ noChecked: '共 ${total} 项', hasChecked: '已选 ${checked}/${total}' }"
/>
```

`format` 同时支持 `${checked}` / `${total}` 与 `{checked}` / `{total}` 两种占位写法。

## 字段映射与目标排序

```vue
<Transfer v-model="value" :data="cities" :props="{ key: 'id', label: 'name' }" target-order="push" />
```

`targetOrder` 为 `original` 时右侧按原始数据顺序展示，为 `push` / `unshift` 时按 `modelValue` 顺序展示。

## 自定义条目与底部

```vue
<Transfer v-model="value" :data="data">
  <template #default="{ option }">
    <span>{{ option.label }}</span>
  </template>
  <template #left-footer>
    <span>左侧底部</span>
  </template>
</Transfer>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 右侧列表的 `key` 集合 | `(string \| number)[]` | `[]` |
| data | 候选数据 | `TransferItem[]` | `[]` |
| titles | 左右面板标题 | `string[]` | `['列表 1', '列表 2']` |
| buttonTexts | 左右移动按钮文案 | `string[]` | `[]` |
| filterable | 是否可搜索 | `boolean` | `false` |
| filterPlaceholder | 搜索框占位文案 | `string` | `请输入搜索内容` |
| filterMethod | 自定义搜索方法 | `(query: string, item: TransferItem) => boolean` | — |
| targetOrder | 右侧列表排序策略 | `original` / `push` / `unshift` | `original` |
| format | 计数文案模板 | `{ noChecked?: string; hasChecked?: string }` | `${total}` / `${checked}/${total}` |
| props | 字段映射 | `{ label?: string; key?: string; disabled?: string }` | `{}` |
| leftDefaultChecked | 左侧初始选中 | `(string \| number)[]` | `[]` |
| rightDefaultChecked | 右侧初始选中 | `(string \| number)[]` | `[]` |
| disabled | 是否禁用 | `boolean` | `false` |
| noDataText | 无数据文案 | `string` | `无数据` |
| noMatchText | 无匹配数据文案 | `string` | `无匹配数据` |

`props` 字段映射支持：`label`、`key`、`disabled`；`format` 支持 `noChecked` 和 `hasChecked`。

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 右侧 `key` 集合更新 | `value: (string \| number)[]` |
| change | 移动选项后触发 | `value: (string \| number)[]`、`direction: 'left' \| 'right'`、`movedKeys: (string \| number)[]` |
| left-check-change | 左侧选中变化 | `keys: (string \| number)[]` |
| right-check-change | 右侧选中变化 | `keys: (string \| number)[]` |

### 插槽

| 插槽名 | 说明 | 参数 |
| --- | --- | --- |
| default | 自定义数据项（Element Plus 兼容） | `{ option: TransferItem }` |
| item | 自定义数据项（`default` 别名） | `{ option: TransferItem }` |
| left-footer | 左侧面板底部 | — |
| right-footer | 右侧面板底部 | — |
| left-empty | 左侧空态 | — |
| right-empty | 右侧空态 | — |

### 暴露方法

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| clearQuery | 清空搜索框 | `which?: 'left' \| 'right' \| 0 \| 1`，不传则清空两侧 |
