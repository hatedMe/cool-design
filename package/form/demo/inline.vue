<script setup lang="ts">
import { reactive } from "vue";
import { Form, FormItem, Input, Button } from "../../index";
const model = reactive({ name: "" });
</script>
<template><Form :model="model" inline label-position="left" label-width="70px"><FormItem label="姓名" prop="name"><Input v-model="model.name" placeholder="姓名" /></FormItem><Button type="primary">查询</Button></Form></template>
