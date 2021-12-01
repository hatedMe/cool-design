<style lang="sass">
.warp
  margin-top: 100px
  display: flex
  justify-content: center
  align-items: center
</style>

<template>
    <div id="app" class="warp">
        <i-badge :value="123" :max="99" type="danger" isDot>
            <i-select type="cancel"></i-select>
        </i-badge>
    </div>
</template>

<script>
import doc from "./components";
import "highlight.js/styles/github-dark.css";
export default {
    components: {
        doc
    },
    data() {
        return {};
    },
    methods: {}
};
</script>
