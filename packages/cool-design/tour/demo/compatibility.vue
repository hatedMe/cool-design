<script setup lang="ts">
import { ref } from 'vue';
import { Button, Tour, TourStep } from '../../index';
const open = ref(false);
</script>
<template><Button @click="open = true">查看引导</Button><Tour v-model="open" :content-style="{ width: '360px' }"><TourStep title="第一步" :content-style="{ width: '420px' }" /><TourStep title="第二步" /></Tour></template>
