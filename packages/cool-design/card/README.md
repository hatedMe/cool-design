# Card 卡片

### 介绍

用于承载相关内容和操作，由头部、内容区和底部组成。头尾支持属性文本或插槽。

### 基础用法

```vue
<Card header="卡片标题">
  <p>卡片内容</p>
  <template #footer>底部操作</template>
</Card>
```

阴影：`always` / `hover` / `never`。

## API

### 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `header` | 头部文本 | `string` | — |
| `footer` | 底部文本 | `string` | — |
| `body-style` | 内容区自定义样式 | `object` | — |
| `header-class` | 头部自定义 class | `string` | `''` |
| `body-class` | 内容区自定义 class | `string` | `''` |
| `footer-class` | 底部自定义 class | `string` | `''` |
| `shadow` | 阴影显示时机：`always` / `hover` / `never` | `string` | `always` |
| `border` | 是否显示边框 | `boolean` | `true` |

### 插槽

| 名称 | 说明 |
| --- | --- |
| `header` | 自定义头部，优先级高于 `header` 属性 |
| `default` | 卡片内容 |
| `footer` | 自定义底部，优先级高于 `footer` 属性 |

### 使用说明

未提供头部（属性与插槽皆无）时不渲染头部区域，底部同理。

### 事件

无自定义事件。
