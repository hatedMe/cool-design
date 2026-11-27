<script setup lang="ts">
import { Dropdown, DropdownMenu, DropdownItem } from '../../index';
const onCommand = (command: string | number | object) => {
  console.log('command', command);
};
</script>
<template>
  <Dropdown trigger="click" placement="bottom" role="navigation" @command="onCommand">
    <button type="button">站内导航</button>
    <template #dropdown>
      <DropdownMenu>
        <DropdownItem command="home">首页</DropdownItem>
        <DropdownItem command="docs">文档</DropdownItem>
        <DropdownItem command="settings" divided disabled>设置</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
