# Badge 徽标

### 介绍

在内容旁显示数量、状态或提醒圆点。对标 Element Plus，支持最大值截断、圆点模式、零值显示和自定义徽标内容。

### 用法

```vue
<Badge :value="12">
  <button type="button">消息</button>
</Badge>
<Badge value="new" type="success">
  <button type="button">状态</button>
</Badge>
<Badge is-dot type="danger">
  <button type="button">提醒</button>
</Badge>
```

使用 `content` 插槽替换徽标文本：

```vue
<Badge :value="12" type="primary">
  <template #content>新品</template>
  <button type="button">商品</button>
</Badge>
```

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| value | 徽标内容，空字符串时隐藏 | `string` / `number` | `''` |
| max | 数值上限，超过显示 `{max}+` | `number` | `99` |
| type | 徽标类型：`primary` / `success` / `warning` / `danger` / `info` | `string` | `danger` |
| is-dot | 显示圆点，不展示数值 | `boolean` | `false` |
| hidden | 隐藏徽标 | `boolean` | `false` |
| show-zero | 是否显示数值 0 | `boolean` | `true` |
| color | 自定义徽标背景色 | `string` | — |
| offset | 兼容扩展：徽标位置偏移 `[x, y]`，单位 px | `[number, number]` | — |

### 插槽

| 名称 | 说明 |
| ---- | ---- |
| default | 被标记内容 |
| content | 自定义徽标内容 |

### 使用说明

- `value` 为数字且超过 `max` 时显示 `{max}+`，字符串原样展示。
- `is-dot` 为圆点模式，忽略 `value` 内容。
- `hidden` 优先级最高，为 true 时始终隐藏。
