<script setup lang="ts">
import { Badge, Space } from "../../index";
</script>

<template>
    <Space>
        <Badge :value="12"><button type="button">消息</button></Badge>
        <Badge value="new" type="success"><button type="button">状态</button></Badge>
        <Badge is-dot type="danger"><button type="button">提醒</button></Badge>
    </Space>
</template>
