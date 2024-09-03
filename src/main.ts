import './assets/main.css'
// Import Froala Editor css files.



import { createApp } from 'vue'
import { createPinia } from 'pinia'

// import App from './App.vue'
import router from './router'
import Home from './views/home.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(Home)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
