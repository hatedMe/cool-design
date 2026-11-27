<script setup lang="ts">
import { Button, Descriptions, DescriptionsItem, Space } from '../../index';
</script>

<template>
  <Space direction="vertical" align="stretch" :size="16">
    <Descriptions title="用户信息" :column="3" border>
      <template #extra>
        <Button type="primary">编辑</Button>
      </template>
      <DescriptionsItem label="姓名">张三</DescriptionsItem>
      <DescriptionsItem label="手机号">13800000000</DescriptionsItem>
      <DescriptionsItem label="状态">正常</DescriptionsItem>
      <DescriptionsItem label="地址" :span="2">浙江省杭州市西湖区</DescriptionsItem>
      <DescriptionsItem label="备注">
        <template #label>自定义标签</template>
        重要客户
      </DescriptionsItem>
    </Descriptions>
  </Space>
</template>
