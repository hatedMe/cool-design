<script setup lang="ts">
import { Avatar, AvatarGroup } from '../../index';
</script>

<template>
  <AvatarGroup
    :size="40"
    shape="square"
    collapse-avatars
    collapse-avatars-tooltip
    :max-collapse-avatars="2"
    :collapse-style="{ backgroundColor: 'var(--i-primary)', color: '#fff' }"
  >
    <Avatar>林</Avatar>
    <Avatar shape="circle">沈</Avatar>
    <Avatar>陈</Avatar>
    <Avatar>周</Avatar>
    <Avatar>叶</Avatar>
  </AvatarGroup>
</template>
