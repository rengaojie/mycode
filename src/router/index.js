import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routesList = [
  {
    path: '/',
    name: 'home',
    described:'首页',
    component: HomeView
  },
   {
     path: '/Monitoring',
     name: 'Monitoring',
     described:'监控视频',
     component: () => import('../views/monitoringView.vue')
   }
]

const router = createRouter({
  // hash模式
  history: createWebHashHistory(),
  // history: createWebHistory(import.meta.env.BASE_URL),
  routes:routesList
})

export default router
export {
  routesList
}
