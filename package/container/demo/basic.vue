<script setup lang="ts">
import { Container, Header, Aside, Main, Footer, Space } from "../../index";
</script>
<template>
    <Space direction="vertical" align="stretch" :size="24">
        <Container class="container-demo">
            <Header :height="48">Header 顶栏</Header>
            <Main>Main 主内容</Main>
            <Footer :height="40">Footer 页脚</Footer>
        </Container>
        <Container class="container-demo">
            <Aside width="28%">Aside 侧栏</Aside>
            <Container>
                <Header :height="48">Header 顶栏</Header>
                <Main>Main 主内容</Main>
                <Footer :height="40">Footer 页脚</Footer>
            </Container>
        </Container>
    </Space>
</template>
<style scoped>
.container-demo {
    min-height: 220px;
    border: 1px solid var(--i-border);
    border-radius: var(--i-radius);
    overflow: hidden;
    text-align: center;
}
.container-demo .i-header,
.container-demo .i-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--i-primary-light-8);
    color: var(--i-primary);
}
.container-demo .i-aside {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--i-primary-light-7);
    color: var(--i-primary);
}
.container-demo .i-main {
    display: grid;
    place-items: center;
    background: var(--i-bg-subtle);
}
</style>
