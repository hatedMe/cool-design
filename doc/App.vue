<style lang="sass">
.warp
  margin-top: 100px
  display: flex
  justify-content: center
  align-items: center
</style>

<template>
  <div id="app" class="warp">
    <!-- <i-button>我是按钮</i-button>
    <i-icon type="icon-add" /> -->
    <!-- <i-select :data="data" @change="change"> </i-select> -->
    <!-- <i-radio-group v-model="value" @change="change">
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
    </i-radio-group> -->
    <!-- <i-switch :value="checkSwitch" @change="change" :closeText="'关闭信息'" :disabled="false" :openText="'打开信息'" :width="40" /> -->
    <!-- <i-rate v-model="rate1" disabled></i-rate>
    <i-rate v-model="rate2"></i-rate>
    <i-rate v-model="rate3"></i-rate> -->
    <!-- <i-button @click="change(10)">我是按钮</i-button> -->
    <!-- <i-input-number v-model="value" :max="10" :min="0" @change="change"></i-input-number> -->
    <i-cascader :data="data"></i-cascader>
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
          children: [
            {
              label: "data1",
              value: 11,
            },
            {
              label: "data2",
              value: 12,
            },
          ],
        },
        {
          label: "选择2",
          value: 2,
          children: [
            {
              label: "data1",
              value: 21,
            },
            {
              label: "data2",
              value: 22,
            },
          ],
        },
        {
          label: "选择3",
          value: 3,
        },
      ],
      checkSwitch: false,
      value: 1,
      disalbed: true,
      rate1: 2,
      rate2: 2,
      rate3: 2,
    };
  },
  watch: {
    rate1: function (n, o) {
      console.log(n, "oo1");
    },
    rate2: function (n, o) {
      console.log(n, "oo2");
    },
    rate3: function (n, o) {
      console.log(n, "oo3");
    },
    value: function (n, o) {
      console.log(n, "value");
    },
  },
  methods: {
    change(e) {
      console.log(e, "e");
    },
  },
    components: {
        doc
    }
};
</script>

