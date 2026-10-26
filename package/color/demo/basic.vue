<script setup lang="ts">
import { ref } from "vue";
import { ConfigProvider, Space, Switch } from "../../index";
const custom = ref(false);
const primary = ref("#7c3aed");
const colors = [
    ["primary", "主色"],
    ["success", "成功"],
    ["warning", "警告"],
    ["danger", "危险"],
    ["info", "信息"]
];
const shades = ["dark-2", "base", "light-3", "light-5", "light-7", "light-8", "light-9"];
const variable = (name: string, shade: string) => `--i-${name}${shade === "base" ? "" : `-${shade}`}`;
</script>
<template>
    <Space direction="vertical" align="stretch" :size="20">
        <Space>
            <Switch v-model="custom">自定义主色</Switch>
            <label>
                主色
                <input v-model="primary" type="color" aria-label="自定义主色" @input="custom = true" />
            </label>
            <code>{{ primary }}</code>
        </Space>
        <ConfigProvider :theme-vars="custom ? { '--i-primary': primary } : {}" class="palette-preview">
            <div v-for="[name, label] in colors" :key="name" class="palette-row">
                <h4>
                    {{ label }}
                    <code>--i-{{ name }}</code>
                </h4>
                <div class="palette-shades">
                    <div v-for="shade in shades" :key="shade" class="palette-chip">
                        <span
                            :style="{ background: `var(${variable(name, shade)})` }"
                            :data-color="variable(name, shade)"></span>
                        <code>{{ shade }}</code>
                    </div>
                </div>
            </div>
            <div class="neutral-colors">
                <div
                    v-for="token in ['text', 'text-secondary', 'text-muted', 'bg', 'bg-page', 'bg-subtle']"
                    :key="token">
                    <span :style="{ background: `var(--i-${token})` }"></span>
                    <code>--i-{{ token }}</code>
                </div>
            </div>
        </ConfigProvider>
    </Space>
</template>
<style scoped>
.palette-preview {
    background: var(--i-bg);
}
.palette-row h4 {
    margin: 0 0 12px;
    font-size: 14px;
}
.palette-row h4 code {
    margin-left: 8px;
    color: var(--i-text-secondary);
    font-weight: 400;
}
.palette-row + .palette-row {
    margin-top: 24px;
}
.palette-shades {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
}
.palette-chip span {
    display: block;
    height: 64px;
    border-radius: 3px;
}
.palette-chip code {
    display: block;
    margin-top: 6px;
    font-size: 10px;
    overflow-wrap: anywhere;
}
.neutral-colors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    margin-top: 28px;
}
.neutral-colors span {
    display: block;
    height: 44px;
    border: var(--i-border-base);
    border-radius: 4px;
}
.neutral-colors code {
    display: block;
    margin-top: 8px;
    font-size: 11px;
}
</style>
