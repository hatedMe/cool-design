<script setup lang="ts">
import { Header, Container, Main } from "../../index";
</script>
<template>
    <Container style="min-height: 160px; border: var(--i-border-base)">
        <Header :height="48" style="background: var(--i-primary-light-9); padding: 12px">Header 自定义高度</Header>
        <Main>主内容区域</Main>
    </Container>
</template>
