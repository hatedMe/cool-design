# Watermark 水印

### 介绍

为内容区域添加重复文字水印。

## 基础用法

使用 `content` 设置水印文字，数组会以空格连接为一行。使用 `font` 调整水印文字的字号、字体、字重和颜色。

## API

### 属性

| 参数      | 说明                             | 类型                    | 默认值            |
| --------- | -------------------------------- | ----------------------- | ----------------- |
| `content` | 水印文字，数组时以空格连接       | `string \| string[]`    | `''`              |
| `font`    | 字体设置，见下表                 | `WatermarkFont`         | —                 |
| `color`   | 水印颜色，可被 `font.color` 覆盖 | `string`                | `rgba(0,0,0,.15)` |
| `rotate`  | 水印旋转角度                     | `number`                | `-22`             |
| `gap`     | 水印间距 `[水平, 垂直]`          | `[number, number]`      | `[100, 100]`      |
| `zIndex`  | 水印层级                         | `number`                | `9`               |

### WatermarkFont 字体

| 字段        | 说明                            | 类型               | 默认值     |
| ----------- | ------------------------------- | ------------------ | ---------- |
| `color`     | 字体颜色，优先于 `color` 属性   | `string`           | —          |
| `fontSize`  | 字体大小                        | `string \| number` | `16`       |
| `fontFamily` | 字体                           | `string`           | `sans-serif` |
| `fontWeight` | 字重                           | `string \| number` | `normal`   |
| `fontStyle` | 字体样式                        | `string`           | `normal`   |

### 插槽

| 名称      | 说明               |
| --------- | ------------------ |
| `default` | 被水印覆盖的内容   |
