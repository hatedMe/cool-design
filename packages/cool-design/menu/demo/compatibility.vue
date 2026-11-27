<script setup lang="ts">
import { Menu } from '../../index';
const items = [{ index: 'group', label: '菜单', children: [{ index: 'child', label: '子项' }] }];
</script>
<template><Menu :items="items" :default-openeds="['group']" close-on-click-outside /></template>
