import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Home from './views/home.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'


const app = createApp(Home)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')

app.config.globalProperties.$http = axios;
