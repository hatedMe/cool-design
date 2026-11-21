<script setup lang="ts">
import { Affix, Button } from '../../index';
</script>

<template>
  <Affix :offset-top="20">
    <Button type="primary">固定在顶部</Button>
  </Affix>
</template>
