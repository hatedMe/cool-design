<template>
  <div>
    555
    <Col tag="main" :span="12">123</Col>

    <Avater shape="circle">江</Avater>
  </div>
</template>
<script setup lang="ts">

import Col from "../package/col/index"
import Avater from "../package/avatar/index"


import { onMounted } from 'vue';

onMounted(() => {
  console.log("mounted");
})
</script>
