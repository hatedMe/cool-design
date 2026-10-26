<script setup lang="ts">
import { Footer, Container, Main } from "../../index";
</script>
<template>
    <Container style="min-height: 160px; border: var(--i-border-base)">
        <Footer :height="40" style="background: var(--i-primary-light-9); padding: 12px">Footer 自定义高度</Footer>
        <Main>主内容区域</Main>
    </Container>
</template>
