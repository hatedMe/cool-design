<script setup lang="ts">
import { Container, Header, Aside, Main, Footer } from "../../index";
</script>
<template>
  <Container class="scroll-demo">
    <Header :height="44">固定区域</Header>
    <Container>
      <Aside width="100px">侧栏</Aside>
      <Main>
        <p v-for="n in 15" :key="n">第 {{ n }} 条内容，主区域独立滚动</p>
      </Main>
    </Container>
    <Footer :height="36">页脚保持可见</Footer>
  </Container>
</template>
<style scoped>
.scroll-demo {
  height: 260px;
  border: var(--i-border-base);
}
.scroll-demo .i-header,
.scroll-demo .i-footer {
  display: flex;
  align-items: center;
  background: var(--i-bg-subtle);
}
.scroll-demo .i-aside {
  padding: 20px 12px;
  background: var(--i-primary-light-9);
}
.scroll-demo .i-main {
  border-left: var(--i-border-base);
}
.scroll-demo p {
  margin: 0 0 16px;
}
</style>
