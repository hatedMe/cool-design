<script setup lang="ts">
import { Avatar, Space } from "../../index";
</script>

<template>
    <Space>
        <Avatar url="/missing-avatar.png" alt="用户头像">
            <template #fallback><span aria-label="回退头像">回退</span></template>
        </Avatar>
        <Avatar url="/missing-avatar.png" icon="icon-user">
            <template #fallback><span aria-label="默认用户">U</span></template>
        </Avatar>
    </Space>
</template>
