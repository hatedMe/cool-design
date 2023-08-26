<style lang="sass">
.warp
    margin-top: 100px
    display: flex
    justify-content: center
    align-items: center
    background: #FFF
</style>

<template>
  <div id="app" class="warp">
    <i-button @click="openMessage">按钮</i-button>
    <!-- <i-progress :value="progressValue"></i-progress> -->
    <i-cascader :data="options"></i-cascader>
  </div>
</template>

<script>
import doc from "./components";
import "highlight.js/styles/github-dark.css";
import CoolDesign from "../package/index";
export default {
  components: {
    doc,
  },
  data() {
    return {
      progressValue: 20,
      options: [
        {
          value: "zhinan",
          label: "指南",
          children: [
            {
              value: "shejiyuanze",
              label: "设计原则",
              children: [
                {
                  value: "yizhi",
                  label: "一致",
                },
                {
                  value: "fankui",
                  label: "反馈",
                },
                {
                  value: "xiaolv",
                  label: "效率",
                },
                {
                  value: "kekong",
                  label: "可控",
                },
              ],
            },
            {
              value: "daohang",
              label: "导航",
              children: [
                {
                  value: "cexiangdaohang",
                  label: "侧向导航",
                },
                {
                  value: "dingbudaohang",
                  label: "顶部导航",
                },
              ],
            },
          ],
        },
        {
          value: "dinwei",
          label: "城市",
          children: [
            {
              value: "beijing",
              label: "北京",
            },
            {
              value: "shanghai",
              label: "上海",
            },
          ],
        },
      ],
    };
  },
  methods: {
    openMessage() {
      this.progressValue += 10;
      console.log(this.progressValue);
      // CoolDesign.alert({
      //     title: "提示",
      //     message: "成功提示",
      //     showClose: true,
      //     closeOnClickModal: true,
      //     callback: function(res) {
      //         if (res === "cancel") {
      //             CoolDesign.message({
      //                 text: "点击了取消！",
      //                 type: "fail"
      //             });
      //         } else {
      //             CoolDesign.message({
      //                 text: "点击了确定！",
      //                 type: "success"
      //             });
      //         }
      //     }
      // });
    },
  },
};
</script>
