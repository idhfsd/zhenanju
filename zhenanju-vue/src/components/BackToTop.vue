<script setup>
// ============================================
// 回到顶部按钮组件
// 知识要点：
// 1. ref 响应式状态 + 滚动事件监听
// 2. 条件渲染 v-show：滚动超过 400px 才显示
// 3. window.scrollTo 平滑滚动回顶部
// ============================================
import { ref, onMounted, onBeforeUnmount } from 'vue'

const showBtn = ref(false)

const onScroll = () => {
  showBtn.value = window.scrollY > 400
}

const backToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <button
    v-show="showBtn"
    class="back-to-top"
    @click="backToTop"
    aria-label="回到顶部"
  >
    <i class="fas fa-arrow-up"></i>
  </button>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 32px;
  bottom: 40px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.4);
  transition: all 0.3s ease;
  z-index: 90;
}

.back-to-top:hover {
  background: var(--primary-dark);
  transform: translateY(-3px);
}
</style>
