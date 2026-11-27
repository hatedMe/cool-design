<script setup lang="ts">
import { ref } from 'vue';
import { Text, type TextInstance } from '../../index';

const singleLine = ref<TextInstance>();
</script>

<template>
  <div>
    <Text type="primary" size="large">强调文本</Text>
    <p>
      <Text ref="singleLine" truncated style="max-width: 140px">
        限制宽度后，过长的文本会在一行内省略。
      </Text>
      <span v-if="singleLine?.isTruncated">（已截断）</span>
    </p>
    <Text :line-clamp="2" style="max-width: 140px">
      多行文本会按容器宽度换行。设定最大行数后，超出两行的文字会省略。悬停可查看全文。
    </Text>
  </div>
</template>
