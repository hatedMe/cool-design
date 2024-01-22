# Badge 徽章


### 基础用法
用来展示未读数或者提示信息的小圆点。

```html
<badge value="1"></badge>
<badge value="2" max="9"></badge>
<badge value="99+" max="99"></badge>
<badge value="99+" max="99" is-dot></badge>
```


### props参数 

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 显示值 | `string \| number` | '' |
| max | 文本 | `number` | 99 |
| is-dot | 是否显示圆点 | `boolean` | false |
| hidden | 是否隐藏 Badge | `boolean` | false |
| type | 类型 | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | 'danger' |

### slot插槽

| 名称 | 说明 |
| --- | --- |
| default | 自定义显示内容 |


