<script setup lang="ts">
import { ref } from 'vue';
import { Container, Header, Aside, Main, Footer, Button, Table } from '../../index';
import type { TableColumn } from '../../index';
const collapsed = ref(false);
const columns: TableColumn[] = [
  { key: 'id', title: '用户 ID', width: 100 },
  { key: 'name', title: '姓名', width: 100 },
  { key: 'department', title: '所属部门', width: 140 }
];
const records = Array.from({ length: 20 }, (_, index) => ({
  id: 1001 + index,
  name: ['陈晨', '林沐', '周远'][index % 3],
  department: ['产品设计', '研发中心', '运营支持'][index % 3]
}));
</script>
<template>
  <Container class="admin-layout-demo">
    <Aside :width="collapsed ? 64 : 160">
      <div class="admin-layout-demo__brand">
        {{ collapsed ? 'C' : 'Cool Design' }}
      </div>
      <nav aria-label="示例工作台导航">
        <a href="#/components/table" aria-label="数据表格">{{ collapsed ? '表' : '数据表格' }}</a>
        <a href="#/components/form" aria-label="表单编辑">{{ collapsed ? '单' : '表单编辑' }}</a>
      </nav>
    </Aside>
    <Container>
      <Header :height="56">
        <Button size="small" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
          {{ collapsed ? '展开侧栏' : '折叠侧栏' }}
        </Button>
        <span class="hidden-xs-only">管理工作台</span>
      </Header>
      <Main>
        <h4>用户列表</h4>
        <p>侧栏和页头保持可见；表格内容在主区域内滚动。</p>
        <Table :columns="columns" :data="records" row-key="id" />
      </Main>
      <Footer :height="36">共 {{ records.length }} 位用户</Footer>
    </Container>
  </Container>
</template>
<style scoped>
.admin-layout-demo {
  height: 400px;
  border: var(--i-border-base);
  border-radius: var(--i-radius);
  overflow: hidden;
}
.admin-layout-demo > .i-aside {
  background: var(--i-primary-light-9);
  border-right: var(--i-border-base);
}
.admin-layout-demo__brand {
  height: 56px;
  display: grid;
  place-items: center;
  font-weight: 600;
  white-space: nowrap;
  color: var(--i-primary);
}
.admin-layout-demo nav {
  display: grid;
  gap: 8px;
  padding: 12px;
}
.admin-layout-demo nav a {
  display: block;
  padding: 8px 0;
  text-align: center;
}
.admin-layout-demo .i-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border-bottom: var(--i-border-base);
}
.admin-layout-demo .i-header span {
  white-space: nowrap;
  font-size: 12px;
}
.admin-layout-demo .i-footer {
  display: flex;
  align-items: center;
  border-top: var(--i-border-base);
  color: var(--i-text-muted);
  font-size: 12px;
}
.admin-layout-demo h4 {
  margin: 0 0 8px;
}
.admin-layout-demo p {
  color: var(--i-text-muted);
  font-size: 12px;
}
</style>
