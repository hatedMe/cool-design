<script setup lang="ts">
import { Notify } from "../../index";
const open = () => Notify({ title: "保存成功", message: "数据已经保存", type: "success" });
</script>
<template>
  <button type="button" @click="open">发送通知</button>
</template>
