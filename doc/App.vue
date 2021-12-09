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
    </div>
</template>

<script>
import doc from "./components";
import "highlight.js/styles/github-dark.css";
import CoolDesign from "../package/index";
export default {
    components: {
        doc
    },
    data() {
        return {};
    },
    methods: {
        openMessage() {
            CoolDesign.alert({
                title: "提示",
                message: "成功提示",
                showClose: true,
                closeOnClickModal: true,
                callback: function(res) {
                    if (res === "cancel") {
                        CoolDesign.message({
                            text: "点击了取消！",
                            type: "fail"
                        });
                    } else {
                        CoolDesign.message({
                            text: "点击了确定！",
                            type: "success"
                        });
                    }
                }
            });
        }
    }
};
</script>
