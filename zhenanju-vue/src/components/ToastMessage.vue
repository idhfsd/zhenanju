<script setup>
// ============================================
// 全局轻提示组件：渲染 useToast.js 里的提示数组
// 知识要点：
// 1. Teleport：把 DOM 传送到 body 下，避免被父级样式/层级影响
// 2. TransitionGroup：列表的增删动画（enter / leave）
// 3. 组合式函数共享状态：任何组件 showToast()，这里都会收到
// ============================================
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <!-- Teleport 到 body 末尾，保证提示永远浮在最上层 -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
        >
          <i class="fas toast-icon" :class="{
            'fa-circle-check': t.type === 'success',
            'fa-circle-exclamation': t.type === 'warning',
            'fa-circle-info': t.type === 'info',
            'fa-circle-xmark': t.type === 'error'
          }"></i>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
  font-size: 14px;
  color: var(--text-main);
  border-left: 4px solid var(--info);
}

.toast--success {
  border-left-color: var(--success);
}

.toast--success .toast-icon {
  color: var(--success);
}

.toast--warning {
  border-left-color: var(--warning);
}

.toast--warning .toast-icon {
  color: var(--warning);
}

.toast--error {
  border-left-color: var(--danger);
}

.toast--error .toast-icon {
  color: var(--danger);
}

.toast--info .toast-icon {
  color: var(--info);
}

/* TransitionGroup 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
