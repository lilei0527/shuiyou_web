import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import Home from './views/home.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useMessageStore } from './stores/message' 
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'



const app = createApp(Home)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
app.use(ContextMenu)

if(localStorage.getItem('token')!= null){
    useMessageStore().initWebSocket();
}
