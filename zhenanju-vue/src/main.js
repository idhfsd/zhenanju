// ============================================
// 应用入口：创建 Vue 应用实例，挂载路由，渲染到 #app
// ============================================
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)

// 注册路由插件（use 是 Vue 插件的标准注册方式）
app.use(router)

app.mount('#app')
