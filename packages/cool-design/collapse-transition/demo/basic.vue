<script setup lang="ts">
import { ref } from 'vue';
import { Button, CollapseTransition } from '../../index';
const open = ref(true);
</script>
<template><Button @click="open = !open">切换折叠</Button><CollapseTransition><div v-show="open" style="padding: 12px; background: var(--i-bg-subtle)">可折叠内容</div></CollapseTransition></template>
