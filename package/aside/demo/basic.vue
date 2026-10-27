<script setup lang="ts">
import { Aside, Container, Main } from "../../index";
</script>
<template>
  <Container style="min-height: 160px; border: var(--i-border-base)">
    <Aside :width="180" style="background: var(--i-primary-light-9); padding: 12px">Aside 自定义宽度</Aside>
    <Main>主内容区域</Main>
  </Container>
</template>
