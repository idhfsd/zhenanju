// Vite 构建配置
// 插件 @vitejs/plugin-vue 负责把 .vue 单文件组件编译成浏览器可执行的 JS
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // base 设为相对路径 './'，这样构建产物部署到 Netlify 等任意子路径下都能正常加载
  base: './',
  build: {
    rollupOptions: {
      output: {
        // 手动分包：把 echarts 单独拆成一个 chunk，配合路由懒加载，
        // 只有访问「监测平台」页时才需要下载它（其余页面不加载这个大库）
        manualChunks: {
          echarts: ['echarts']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    // 开发代理：把页面里 /api 开头的请求转发给本地 Express（3000 端口）
    // 这样前端代码里只写 /api，开发环境和线上环境的行为保持一致
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
