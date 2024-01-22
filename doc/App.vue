<template>
  <div>
    555
    <Col tag="main" :span="12">123</Col>

    <Avater shape="circle">江</Avater>

    <Badge :value="99" :max="200">
      <Avater shape="square">江</Avater>
    </Badge>
  </div>
</template>
<script setup lang="ts">

import Col from "../package/col/index"
import Avater from "../package/avatar/index"
import Badge from "../package/badge/index"


import { onMounted } from 'vue';

onMounted(() => {
  console.log("mounted");
})
</script>
