<template>
  <div class="header">
    <div class="logoName">
      <div class="logo"></div>
      <div class="name">主煤流安全管控平台</div>
    </div>
    <ul class="menu">
      <li
        v-for="item in routesList"
        :key="item.path"
        :class="{ active: item.path === activeName }"
        class="item"
        @click="toPage(item.path)"
      >
        {{ item.described }}
      </li>
    </ul>
    <div class="rightTime">
      <span class="time">{{ time }}</span>
      <span style="margin-right: 14px">{{ date }}</span>
      <span>{{ week }}</span>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import {useRouter,useRoute} from 'vue-router'
import { routesList } from '@/router/index.js'
import { ref, onMounted } from 'vue'

const router = useRouter()
let route = useRoute()

let weekText = ['零', '一', '二', '三', '四', '五', '六', '七']

let date = ref('')
let time = ref('')
let week = ref('')

let routesListData = ref([])
let activeName = ref('')
onMounted(() => {
  routesListData.value = routesList
  activeName.value = route.path
  setTime()
})

const setTime = () => {
  time.value = dayjs().format('HH:mm:ss')
  date.value = dayjs().format('YYYY-MM-DD')
  week.value = '星期' + weekText[dayjs().day()]
  setTimeout(() => {
    setTime()
  }, 1000)
}

const toPage = (path)=>{
  router.push(path)
}

</script>

<style scoped lang="less">
.header {
  height: 64px;
  width: 100%;
  background-image: url('@/assets/image/headerBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: #ada7a7;
  box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.56);
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  .logoName {
    flex: 0 0 400px;
    display: flex;
    .logo {
      width: 110px;
      height: 25px;
      background: url('@/assets/image/logo.png') no-repeat;
      background-size: 100% 100%;
      margin-right: 14px;
    }
    .name {
      font-weight: 600;
      font-size: 22px;
      color: #ffffff;
    }
  }
  .menu {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
    .item {
      width: 128px;
      height: 44px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 15px;
      &.active {
        background: url('@/assets/image/menuBg.png') no-repeat;
        background-size: 100% 100%;
      }
    }
  }
  .rightTime {
    display: flex;
    flex: 0 0 300px;
    justify-content: right;
    align-items: center;
    span {
      color: #ffffff;
      font-size: 16px;
    }
    .time {
      font-size: 20px;
      padding-right: 14px;
      border-right: 1px solid #fff;
      height: 20px;
      line-height: 20px;
      margin-right: 14px;
      font-weight: bold;
    }
  }
}
</style>
