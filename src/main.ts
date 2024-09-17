import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Home from './views/home.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useMessageStore } from './stores/message'


const app = createApp(Home)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')

const messageStore = useMessageStore();
messageStore.initWebSocket(); // 应用加载时初始化 WebSocket
