
import 'ant-design-vue/dist/reset.css';
import './assets/main.less'

import { createApp } from 'vue'
import Antd from 'ant-design-vue';
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
