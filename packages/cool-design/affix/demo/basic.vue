<script setup lang="ts">
import { ref } from 'vue';
import { Affix, Button, type AffixInstance } from '../../index';

const affix = ref<AffixInstance>();
const expanded = ref(false);

function toggleLabel() {
  expanded.value = !expanded.value;
  return affix.value?.updateRoot();
}
</script>

<template>
  <Affix
    ref="affix"
    :offset="20"
  >
    <Button
      type="primary"
      @click="toggleLabel"
    >
      {{ expanded ? '固定在顶部，点击缩短文字' : '固定在顶部' }}
    </Button>
  </Affix>
</template>
