<template>
  <a-config-provider :locale="locale">
    <RouterView />
  </a-config-provider>
</template>

<script setup>
import autoFit from 'autofit.js'
import { RouterView } from 'vue-router'
import { onMounted} from 'vue'

import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
let locale = zhCN

onMounted(()=>{
  autoFit.init({
    dh: 1080,
    dw: 1920,
    el:"body",
    resize: true
  })
})


</script>

<style scoped></style>
