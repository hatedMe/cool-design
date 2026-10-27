<script setup lang="ts">
import { Select, SelectOption, Space } from "../../index";
</script>
<template>
  <Space>
    <Select size="large">
      <SelectOption value="a" label="大尺寸" />
    </Select>
    <Select>
      <SelectOption value="a" label="默认尺寸" />
    </Select>
    <Select size="small">
      <SelectOption value="a" label="小尺寸" />
    </Select>
  </Space>
</template>
