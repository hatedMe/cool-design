<script setup lang="ts">
import { Container, Header, Main } from '../../index';
</script>
<template>
  <Container style="height: 200px; border: var(--i-border-base)">
    <Header :height="40" style="padding: 8px; background: var(--i-bg-subtle)">固定页头</Header>
    <Main>
      <p v-for="n in 10" :key="n">第 {{ n }} 条内容，在主区域内滚动</p>
    </Main>
  </Container>
</template>
