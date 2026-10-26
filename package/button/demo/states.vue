<script setup lang="ts">
import { Button, Space } from "../../index";
</script>

<template>
    <Space>
        <Button disabled>禁用按钮</Button>
        <Button type="primary" disabled>禁用主要按钮</Button>
        <Button type="primary" loading>正在保存</Button>
    </Space>
</template>
