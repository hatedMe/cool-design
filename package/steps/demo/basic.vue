<script setup lang="ts">import { Steps } from "../../index"; const items = [{ title: "填写信息" }, { title: "确认订单" }, { title: "完成" }];</script><template><Steps :items="items" :active="1" /></template>
