<script setup lang="ts">
import { Container, Header, Aside, Main, Footer } from "../../index";
</script>
<template>
    <Container class="size-demo">
        <Header :height="48">Header：数字 48 → 48px</Header>
        <Container>
            <Aside width="25%">Aside：25%</Aside>
            <Main>Main：填充剩余空间</Main>
        </Container>
        <Footer height="3rem">Footer：3rem</Footer>
    </Container>
</template>
<style scoped>
.size-demo {
    height: 240px;
    border: var(--i-border-base);
}
.size-demo .i-header,
.size-demo .i-footer {
    display: flex;
    align-items: center;
    background: var(--i-bg-subtle);
    font-size: 12px;
}
.size-demo .i-aside,
.size-demo .i-main {
    display: grid;
    place-items: center;
    text-align: center;
    font-size: 12px;
}
.size-demo .i-aside {
    background: var(--i-primary-light-9);
    color: var(--i-primary);
}
</style>
