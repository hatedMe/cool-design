<script setup lang="ts">
import { Dropdown, DropdownMenu, DropdownItem } from '../../index';
const onCommand = (command: string | number | object) => {
  console.log('command', command);
};
</script>
<template>
  <Dropdown trigger="click" placement="bottom" @command="onCommand">
    <button type="button">更多操作</button>
    <template #dropdown>
      <DropdownMenu>
        <DropdownItem command="edit" icon="✎">编辑</DropdownItem>
        <DropdownItem command="delete" divided>删除</DropdownItem>
        <DropdownItem command="share" disabled>分享</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
