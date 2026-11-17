<script setup>
// ============================================
// 根组件 App.vue：只负责整体布局
// 结构 = 顶部导航 + 页面出口(router-view) + 页脚 + 全局小组件
// 注意：子组件需要先 import 才能在模板中使用（组合式 API <script setup> 语法）
// ============================================
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import BackToTop from './components/BackToTop.vue'
import ToastMessage from './components/ToastMessage.vue'
</script>

<template>
  <NavBar />

  <!-- router-view 是路由出口：当前路径对应的页面组件会渲染在这里 -->
  <!-- 用 <transition> 包裹，实现页面切换时的淡入淡出动画 -->
  <main class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <FooterBar />
  <BackToTop />
  <!-- 全局轻提示组件：挂在根组件，任何页面都能弹 toast -->
  <ToastMessage />
</template>

<style scoped>
.app-main {
  min-height: calc(100vh - 300px);
}
</style>
