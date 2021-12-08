<style lang="sass">
.warp
  margin-top: 100px
  display: flex
  justify-content: center
  align-items: center
</style>

<template>
    <div id="app" class="warp">
        <i-button @click="openMessage">提示信息</i-button>
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
        return {
            value: "111"
        };
    },
    methods: {
        openMessage() {
            CoolDesign.message({
                text: "成功提示",
                type: "success",
                closeble: true,
                icon:'icon-emoji_fill'
            });
        }
    }
};
</script>
