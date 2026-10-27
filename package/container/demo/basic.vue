<script setup lang="ts">
import { Container, Header, Aside, Main, Footer, Space } from "../../index";
</script>
<template>
  <Space direction="vertical" align="stretch" :size="24">
    <div>
      <p>页头 + 主内容 + 页脚</p>
      <Container class="container-demo" data-layout="header-main-footer">
        <Header :height="48">Header 顶栏</Header>
        <Main>Main 主内容</Main>
        <Footer :height="40">Footer 页脚</Footer>
      </Container>
    </div>
    <div>
      <p>侧栏 +（页头 + 主内容 + 页脚）</p>
      <Container class="container-demo" data-layout="aside-header-main-footer">
        <Aside width="28%">Aside 侧栏</Aside>
        <Container>
          <Header :height="48">Header 顶栏</Header>
          <Main>Main 主内容</Main>
          <Footer :height="40">Footer 页脚</Footer>
        </Container>
      </Container>
    </div>
    <div>
      <p>页头 + 主内容</p>
      <Container class="container-demo" data-layout="header-main">
        <Header :height="48">Header 顶栏</Header>
        <Main>Main 主内容</Main>
      </Container>
    </div>
    <div>
      <p>侧栏 + 主内容</p>
      <Container class="container-demo" data-layout="aside-main">
        <Aside width="28%">Aside 侧栏</Aside>
        <Main>Main 主内容</Main>
      </Container>
    </div>
    <div>
      <p>页头 +（侧栏 + 主内容）</p>
      <Container class="container-demo" data-layout="header-aside-main">
        <Header :height="48">Header 顶栏</Header>
        <Container>
          <Aside width="28%">Aside 侧栏</Aside>
          <Main>Main 主内容</Main>
        </Container>
      </Container>
    </div>
    <div>
      <p>页头 +（侧栏 +（主内容 + 页脚））</p>
      <Container class="container-demo" data-layout="header-aside-main-footer">
        <Header :height="48">Header 顶栏</Header>
        <Container>
          <Aside width="28%">Aside 侧栏</Aside>
          <Container>
            <Main>Main 主内容</Main>
            <Footer :height="40">Footer 页脚</Footer>
          </Container>
        </Container>
      </Container>
    </div>
    <div>
      <p>侧栏 +（页头 + 主内容）</p>
      <Container class="container-demo" data-layout="aside-header-main">
        <Aside width="28%">Aside 侧栏</Aside>
        <Container>
          <Header :height="48">Header 顶栏</Header>
          <Main>Main 主内容</Main>
        </Container>
      </Container>
    </div>
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
