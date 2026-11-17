// ============================================
// 路由配置：决定「URL 路径 -> 页面组件」的映射关系
// 使用 createWebHashHistory（hash 模式）：
//   URL 形如 https://xxx/#/monitor
// 优点：静态托管（Netlify）无需服务器重写配置，刷新页面也不会 404
//
// 懒加载（代码分割）：component 用 () => import(...) 动态导入，
// Vite/Rollup 会把每个页面拆成独立 chunk，访问到该页面才下载对应 JS。
// 好处：首页首屏更快；echarts 等大库只在使用它的监测页加载。
// ============================================
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '首页' } },
  { path: '/monitor', name: 'monitor', component: () => import('../views/MonitorView.vue'), meta: { title: '监测平台' } },
  { path: '/technology', name: 'technology', component: () => import('../views/TechnologyView.vue'), meta: { title: '核心技术' } },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue'), meta: { title: '联系我们' } },
  // 兜底：任意未匹配路径都回到首页
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 切换页面后自动滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局前置守卫：每次跳转前更新浏览器标签页标题
router.beforeEach((to) => {
  document.title = `${to.meta.title || ''} - 震安居`
})

export default router
