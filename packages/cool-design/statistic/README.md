# Statistic 统计数值

### 介绍

突出展示金额、数量等统计信息。对标 Element Plus，支持精度、千分位分组、小数分隔符和自定义格式化。

### 用法

```vue
<Statistic title="访问量" :value="1234567" />
<Statistic title="金额" :value="1280" :precision="2" prefix="¥" />
<Statistic title="占比" :value="0.856" :precision="1" suffix="%" :group-separator="''" />
<Statistic title="自定义格式" :value="1280" :formatter="(v) => `¥ ${Number(v).toFixed(2)}`" />
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| title | 标题 | `string` | — |
| value | 数值，非数字原样展示 | `string` / `number` | `0` |
| precision | 小数精度 | `number` | `0` |
| prefix | 前缀文本 | `string` | — |
| suffix | 后缀文本 | `string` | — |
| decimal-separator | 小数点分隔符 | `string` | `.` |
| group-separator | 千分位分组符，空字符串关闭分组 | `string` | `,` |
| formatter | 自定义格式化，返回最终展示字符串 | `(value: string \| number) => string` | — |
| value-style | 数值区样式 | `string` / `object` | — |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| title | 自定义标题 |
| prefix | 自定义前缀 |
| suffix | 自定义后缀 |

### 使用说明

- 提供 `formatter` 时跳过内置的精度与分隔符处理。
- 整数默认按千分位分组，如 `1234567` 展示为 `1,234,567`。
