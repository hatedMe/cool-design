<template>
  <div id="app">
    <i-button>我是按钮</i-button>

    <i-icon type="icon-add" />
    <i-select :data="data" @change="change"> </i-select>
    <i-radio-group v-model="value" @change="change">
      <i-radio-button :label="1" disabled>文本1文本1文本1文本1</i-radio-button>
      <i-radio-button :label="2" disabled>文本2</i-radio-button>
      <i-radio-button :label="3">文本2</i-radio-button>
      <i-radio-button :label="4">文本2</i-radio-button>
      <i-radio-button :label="5">文本2</i-radio-button>
    </i-radio-group>
    <i-radio-group v-model="value">
      <i-radio :label="1">文本1</i-radio>
      <i-radio :label="2">文本2</i-radio>
      <i-radio :label="3">文本2</i-radio>
    </i-radio-group>
    <!-- <i-switch :value="checkSwitch" @change="change" :closeText="'关闭信息'" :disabled="false" :openText="'打开信息'" :width="40" /> -->
  </div>
</template>

<script>
import doc from "./components";
import "highlight.js/styles/github-dark.css";
export default {
  data() {
    return {
      data: [
        {
          label: "选择1",
          value: 1,
          disabled: true,
        },
        {
          label: "选择2",
          value: 2,
        },
        {
          label: "选择3",
          value: 3,
        },
      ],
      checkSwitch: false,
      value: 1,
      disalbed: true,
    };
  },
  methods: {
    change(e) {
      console.log(e, "e");
    },
  },
};
</script>

