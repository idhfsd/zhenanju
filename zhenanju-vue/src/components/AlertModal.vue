<script setup>
// ============================================
// 预警详情弹窗组件
// 知识要点：
// 1. props 接收 alert；父组件传入 null 时弹窗隐藏（v-if 控制）
// 2. watch 监听 alert 变化，在打开时记录「处理中」状态
// 3. emit('close') 通知父组件关闭弹窗
// 4. Teleport 传送到 body，避免被页面布局遮挡
// ============================================
import { ref, watch } from 'vue'
import { showToast } from '../composables/useToast'
import request from '../api/request'

const props = defineProps({
  alert: { type: Object, default: null }
})

const emit = defineEmits(['close'])

// 级别映射
const levelMap = {
  danger: { label: '紧急预警', icon: 'fa-circle-xmark', color: 'var(--danger)' },
  warning: { label: '黄色预警', icon: 'fa-triangle-exclamation', color: 'var(--warning)' },
  info: { label: '提示信息', icon: 'fa-circle-info', color: 'var(--info)' }
}

// 处理中标记：请求未返回前禁用按钮，防止重复提交
const processing = ref(false)

// 标记已处置：真正调用后端 POST /api/alerts/:id/handle，
// 由后端把该条预警的 handled 置为 true 并写入 alerts.json
const handleResolve = async () => {
  if (!props.alert || processing.value) return

  processing.value = true
  try {
    const res = await request.post(`/alerts/${props.alert.id}/handle`, {
      operator: '系统管理员'
    })
    showToast(res.msg || '预警处理成功', 'success')
    emit('close') // 通知父组件关闭弹窗（父组件会顺带刷新预警列表）
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    processing.value = false
  }
}

// 关闭
const handleClose = () => emit('close')

// 监听 alert 变化：新弹窗打开时重置「处理中」状态（watch 演示）
watch(
  () => props.alert,
  (val) => {
    if (val) {
      processing.value = false
    }
  }
)
</script>

<template>
  <!-- 父组件通过 v-if="alert" 控制：alert 为 null 时不渲染 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="alert" class="modal-mask" @click.self="handleClose">
        <div class="modal-box">
          <!-- 弹窗头部 -->
          <div class="modal-header">
            <h3>
              <i
                class="fas"
                :class="levelMap[alert.level].icon"
                :style="{ color: levelMap[alert.level].color }"
              ></i>
              预警详情
            </h3>
            <button class="modal-close" @click="handleClose" aria-label="关闭">
              <i class="fas fa-xmark"></i>
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="modal-body">
            <div class="m-row">
              <span class="m-label">预警编号</span>
              <span class="m-value">{{ alert.id }}</span>
            </div>
            <div class="m-row">
              <span class="m-label">预警级别</span>
              <span
                class="m-level"
                :style="{ color: levelMap[alert.level].color }"
              >
                {{ levelMap[alert.level].label }}
              </span>
            </div>
            <div class="m-row">
              <span class="m-label">发生时间</span>
              <span class="m-value">{{ alert.time }}</span>
            </div>
            <div class="m-row">
              <span class="m-label">监测点位</span>
              <span class="m-value">{{ alert.point }}</span>
            </div>
            <div class="m-row m-row--desc">
              <span class="m-label">预警详情</span>
              <p class="m-desc">{{ alert.message }}</p>
            </div>
          </div>

          <!-- 弹窗底部按钮 -->
          <div class="modal-footer">
            <button
              class="btn btn-outline btn-sm"
              :disabled="processing"
              @click="handleResolve"
            >
              <i class="fas fa-check"></i>
              {{ processing ? '处理中…' : '标记已处置' }}
            </button>
            <button class="btn btn-primary btn-sm" @click="handleClose">
              知道了
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* 弹窗主体 */
.modal-box {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 17px;
}

.modal-header h3 i {
  margin-right: 8px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--danger);
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.m-row {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.m-label {
  width: 76px;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.m-value {
  font-weight: 500;
}

.m-level {
  font-weight: 700;
}

.m-row--desc {
  align-items: flex-start;
}

.m-desc {
  flex: 1;
  color: var(--text-main);
  line-height: 1.7;
  background: var(--bg-light);
  border-radius: 8px;
  padding: 10px 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-light);
}

.modal-footer .btn-outline {
  border-color: var(--primary);
  color: var(--primary);
}

.modal-footer .btn-outline:hover {
  background: var(--primary-light);
  transform: none;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.92) translateY(10px);
}
</style>
