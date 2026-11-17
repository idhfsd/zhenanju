// ============================================
// 全局轻提示（Toast）组合式函数
//
// 知识点：
// 1. Vue 3 组合式 API：把可复用的逻辑（状态 + 方法）封装成函数
// 2. reactive：创建响应式对象，任何组件读它都会自动更新视图
// 3. 模块级单例：toasts 定义在模块顶层，所有组件共享同一份状态
//
// 用法（任意组件内）：
//   import { showToast } from '../composables/useToast'
//   showToast('保存成功', 'success')
// ============================================
import { reactive } from 'vue'

// 响应式提示数组，由 ToastMessage.vue 渲染
const toasts = reactive([])

let seed = 0

// 弹出一条提示，2.6 秒后自动消失
export function showToast(message, type = 'info') {
  const id = ++seed
  toasts.push({ id, message, type })

  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id)
    if (index !== -1) toasts.splice(index, 1)
  }, 2600)
}

// 提供给组件读取状态
export function useToast() {
  return { toasts, showToast }
}
