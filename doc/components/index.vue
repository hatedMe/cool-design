<template>
    <div class="">
        <Header>header</Header>
        <Aside />
        <main class="container">
            <slot></slot>
        </main>
        <!-- <div class="demo"></div> -->
        <footer>footer</footer>
    </div>
</template>
<script>
import Header from "./header";
import Aside from "./aside.vue"
export default {
    components: {
        Header,
        Aside,
    },
    data () {
        return {};
    }
};
</script>

<style lang="scss">
.nav {
    position: fixed;
    top: 60px;
    bottom: 0;
    left: 0;
    z-index: 1;
    min-width: 220px;
    max-width: 220px;
    padding: 24px 0 72px;
    overflow-y: scroll;
    background-color: #fff;
    box-shadow: 0 8px 12px #ebedf0;
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        background-color: transparent;
        transition: all 0.5s;
    }
    .title {
        // height: 400px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: transparent;
        border-radius: 6px;
    }

    &:hover::-webkit-scrollbar-thumb {
        background-color: rgba(69, 90, 100, 0.2);
    }
}
.container {
    padding-left: 220px;
    overflow: hidden;
    box-sizing: border-box;
}
.demo {
    position: absolute;
    top: 90px;
    right: 30px;
    z-index: 1;
    box-sizing: border-box;
    width: 360px;
    min-width: 360px;
    overflow: hidden;
    background: #fafafa;
    border-radius: 12px;
    box-shadow: #ebedf0 0 4px 12px;
    // background-color: rgb(243, 242, 242);
    height: 632px;
}
</style>
