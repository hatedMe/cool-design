<script setup lang="ts">
import { ref } from 'vue';
import { Popper, PopperTrigger, PopperContent, PopperArrow } from '../../index';
const open = ref(false);
</script>
<template><Popper role="tooltip"><PopperTrigger id="primitive-tip" :open="open" @mouseenter="open = true" @mouseleave="open = false" @focus="open = true" @blur="open = false"><button>底层浮层示例</button></PopperTrigger><PopperContent v-show="open" id="primitive-tip" :visible="open" placement="bottom">组合式浮层内容<PopperArrow /></PopperContent></Popper></template>
