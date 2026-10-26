<script setup lang="ts">
import { ref } from "vue";
import { Link, Space } from "../../index";
const count = ref(0);
const types = ["default", "primary", "success", "warning", "danger", "info"] as const;
</script>
<template>
    <Space direction="vertical" align="stretch" :size="20">
        <Space :size="20">
            <Link v-for="type in types" :key="type" :type="type" href="#/components/link">{{ type }} 链接</Link>
        </Space>
        <Space :size="20">
            <Link underline="always" @click="count++">始终有下划线</Link>
            <Link underline="hover" @click="count++">悬停下划线</Link>
            <Link :underline="false" @click="count++">没有下划线</Link>
        </Space>
        <Space :size="20">
            <Link icon="icon-search" @click="count++">查询记录</Link>
            <Link href="#/components/link" disabled @click="count++">禁用链接</Link>
            <Link v-for="size in ['small', 'default', 'large'] as const" :key="size" :size="size" @click="count++">
                {{ size }}
            </Link>
        </Space>
        <output aria-live="polite">操作已触发 {{ count }} 次</output>
    </Space>
</template>
