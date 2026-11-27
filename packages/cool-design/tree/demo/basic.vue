<script setup lang="ts">
import { ref } from 'vue';
import { Tree } from '../../index';
import type { TreeData, TreeFilterMethod, TreeLoadFunction, TreeNode } from '../types';

const data = ref<TreeData[]>([
  {
    id: 1,
    label: '一级 1',
    children: [
      {
        id: 11,
        label: '二级 1-1',
        children: [{ id: 111, label: '三级 1-1-1' }]
      },
      { id: 12, label: '二级 1-2', disabled: true }
    ]
  },
  {
    id: 2,
    label: '一级 2',
    children: [
      { id: 21, label: '二级 2-1' },
      { id: 22, label: '二级 2-2' }
    ]
  }
]);

const checkedData = ref<TreeData[]>([
  {
    id: 1,
    label: '父节点',
    children: [
      { id: 2, label: '子节点 1' },
      { id: 3, label: '子节点 2' }
    ]
  }
]);

const filterText = ref('');
const filterTreeRef = ref<{ filter: (value: string) => void } | null>(null);
const filterMethod: TreeFilterMethod = (value, item) => String(item.label).includes(value);
const onFilterInput = () => filterTreeRef.value?.filter(filterText.value);

const lazyData = ref<TreeData[]>([{ id: 100, label: '懒加载根节点' }]);
const loadNode: TreeLoadFunction = (node: TreeNode, resolve) => {
  window.setTimeout(() => {
    resolve([
      { id: `${node.key}-1`, label: `动态 ${node.label}-1`, isLeaf: true },
      { id: `${node.key}-2`, label: `动态 ${node.label}-2`, isLeaf: true }
    ]);
  }, 300);
};

const dragData = ref<TreeData[]>([
  { id: 1, label: '可拖拽 1', children: [{ id: 11, label: '可拖拽 1-1' }] },
  { id: 2, label: '可拖拽 2' }
]);

const lastDrop = ref('');
const handleDrop = (drag: TreeNode, drop: TreeNode, type: string) => {
  lastDrop.value = `${drag.label} -> ${drop.label} (${type})`;
};
</script>

<template>
  <div class="tree-demo">
    <h4>基础用法</h4>
    <Tree :data="data" node-key="id" default-expand-all highlight-current :props="{ label: 'label' }" />

    <h4>复选框</h4>
    <Tree :data="checkedData" node-key="id" show-checkbox default-expand-all :default-checked-keys="[2]" />

    <h4>过滤</h4>
    <input v-model="filterText" placeholder="输入关键字过滤" @input="onFilterInput" />
    <Tree ref="filterTreeRef" :data="data" node-key="id" default-expand-all :filter-node-method="filterMethod" />

    <h4>懒加载</h4>
    <Tree :data="lazyData" node-key="id" lazy :load="loadNode" />

    <h4>拖拽</h4>
    <Tree :data="dragData" node-key="id" draggable default-expand-all @node-drop="handleDrop">
      <template #default="{ data: item }">
        <span>{{ item.label }}</span>
      </template>
    </Tree>
    <p v-if="lastDrop">上次放置：{{ lastDrop }}</p>
  </div>
</template>

<style scoped>
.tree-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 480px;
}

.tree-demo h4 {
  margin: 12px 0 4px;
}
</style>
