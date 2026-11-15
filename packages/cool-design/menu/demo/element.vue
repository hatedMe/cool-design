<script setup lang="ts">
import { ref } from 'vue';
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '../../index';
const active = ref('1-1');
const opened = ref(['1']);
const onSelect = (index: string, path: string[]) => {
  active.value = index;
  console.log('select', index, path);
};
</script>
<template>
  <Menu v-model="active" :default-openeds="opened" @select="onSelect">
    <SubMenu index="1">
      <template #title>导航一</template>
      <MenuItem index="1-1">选项一</MenuItem>
      <MenuItem index="1-2" disabled>选项二</MenuItem>
      <MenuItemGroup title="分组">
        <MenuItem index="1-3">选项三</MenuItem>
      </MenuItemGroup>
    </SubMenu>
    <MenuItem index="2">导航二</MenuItem>
  </Menu>
</template>
