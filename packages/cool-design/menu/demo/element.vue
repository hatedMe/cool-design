<script setup lang="ts">
import { h, ref } from 'vue';
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '../../index';
const active = ref('1-1');
const opened = ref(['1']);
const collapsed = ref(false);
const plusIcon = () => h('span', '+');
const minusIcon = () => h('span', '−');
const onSelect = (index: string, path: string[]) => {
  active.value = index;
  console.log('select', index, path);
};
</script>
<template>
  <button type="button" @click="collapsed = !collapsed">{{ collapsed ? '展开菜单' : '折叠菜单' }}</button>
  <Menu
    v-model="active"
    :collapse="collapsed"
    :default-openeds="opened"
    :persistent="false"
    :popper-style="['padding: 4px', { minWidth: '220px' }]"
    @select="onSelect">
    <SubMenu index="1" :collapse-close-icon="plusIcon" :collapse-open-icon="minusIcon" :hide-timeout="400">
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
