<script setup>
// ============================================
// 顶部导航栏组件
// 知识要点：
// 1. router-link：声明式路由跳转，自带 to 属性和激活样式
// 2. 滚动监听：window 事件 + onMounted/onBeforeUnmount 生命周期
// 3. href="javascript:void(0)" 的经典用法：
//    - void 是 JS 一元运算符，对表达式求值后返回 undefined
//    - void(0) 永远等于 undefined
//    - 写在 href 里可以「阻止浏览器跳转」，让 <a> 只响应 JS 逻辑
//    - 相比 href="#" 的好处：# 会让页面跳到顶部并修改 URL 历史
// ============================================
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from '../composables/useToast'

const route = useRoute()

// 菜单配置：新增页面只需在这里加一行
const menuItems = [
  { label: '首页', to: '/' },
  { label: '监测平台', to: '/monitor' },
  { label: '核心技术', to: '/technology' },
  { label: '联系我们', to: '/contact' }
]

// 滚动状态：导航栏从透明变成白底
const isScrolled = ref(false)
const onScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => window.addEventListener('scroll', onScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// 移动端汉堡菜单开关
const menuOpen = ref(false)

// 判断某路径是否是当前路由（用于高亮）
const isActive = (path) => route.path === path

// 演示中心：使用 javascript:void(0) 阻止跳转，只弹提示
const handleDemo = () => {
  showToast('演示中心即将开放，敬请期待', 'info')
}
</script>

<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">
      <!-- Logo：router-link 跳首页 -->
      <router-link to="/" class="logo">
        <i class="fas fa-shield-halved"></i>
        <span>震安居</span>
      </router-link>

      <!-- 桌面端菜单 -->
      <nav class="menu" :class="{ open: menuOpen }">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="menu-item"
          :class="{ active: isActive(item.to) }"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </router-link>

        <!-- ★ javascript:void(0) 示例：点它不会跳转、不会刷新，只执行 @click 里的 JS -->
        <a href="javascript:void(0)" class="menu-item demo-link" @click="handleDemo">
          演示中心
        </a>
      </nav>

      <!-- 移动端汉堡按钮 -->
      <button class="hamburger" :class="{ active: menuOpen }" @click="menuOpen = !menuOpen" aria-label="菜单">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  z-index: 100;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

/* 滚动后：白底 + 阴影 */
.navbar.scrolled {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  transition: color 0.3s ease;
}

.navbar.scrolled .logo {
  color: var(--text-main);
}

.logo i {
  color: var(--primary);
  font-size: 26px;
}

.menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.25s ease;
  cursor: pointer;
}

.navbar.scrolled .menu-item {
  color: var(--text-main);
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.navbar.scrolled .menu-item:hover {
  color: var(--primary);
  background: var(--primary-light);
}

.menu-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.navbar.scrolled .menu-item.active {
  color: var(--primary);
  background: var(--primary-light);
}

/* 演示中心：虚线边框提示它是「特殊入口」 */
.demo-link {
  border: 1px dashed rgba(255, 255, 255, 0.6);
}

.navbar.scrolled .demo-link {
  border-color: var(--primary);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.navbar.scrolled .hamburger span {
  background: var(--text-main);
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 移动端 */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .menu {
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    background: #fff;
    padding: 12px 20px 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .menu.open {
    display: flex;
  }

  .menu-item {
    width: 100%;
    text-align: center;
    color: var(--text-main);
  }

  .menu-item.active {
    background: var(--primary-light);
    color: var(--primary);
  }
}
</style>
