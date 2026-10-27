<script setup lang="ts">
import { Avatar, Space } from "../../index";
const fits = ["fill", "contain", "cover", "none", "scale-down"] as const;
</script>

<template>
    <Space wrap>
        <div v-for="fit in fits" :key="fit" class="avatar-fit-item">
            <span>{{ fit }}</span>
            <Avatar shape="square" :size="72" :fit="fit" url="https://picsum.photos/120/80" />
        </div>
    </Space>
</template>

<style scoped>
.avatar-fit-item { display: flex; flex-direction: column; gap: 6px; align-items: center; color: var(--i-text-secondary); font-size: 12px; }
</style>
