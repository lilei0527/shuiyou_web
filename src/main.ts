import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import LoginDialog from './components/LoginDialog.vue'
import router from './router'
import Home from './views/home.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(Home)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')

//挂载登录弹窗
const createDialog = (message: any, option = {}) => {
    const mountNode = document.createElement('div')
    const Instance = createApp(LoginDialog, {
        show: true,
        message,
        ...option,
        close: () => {
            Instance.unmount();
            document.body.removeChild(mountNode);
        }
    })
    document.body.appendChild(mountNode)
        .mount(mountNode)
}
export default createDialog;
