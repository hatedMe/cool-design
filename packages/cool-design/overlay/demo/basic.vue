<script setup lang="ts">
import { ref } from 'vue';
import { Button, Overlay } from '../../index';
const open = ref(false);
</script>
<template><Button @click="open = true">显示遮罩</Button><Overlay v-if="open" :z-index="3000" @click="open = false"><div style="margin: 15vh auto; padding: 24px; width: 300px; background: white; color: #333">点击外部关闭<Button @click="open = false">关闭遮罩</Button></div></Overlay></template>
