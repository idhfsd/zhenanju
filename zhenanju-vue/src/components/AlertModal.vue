
<script setup>
// ============================================
// 预警详情弹窗组件
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

// 请求处理中标记
const processing = ref(false)

// 标记已处置
const handleResolve = async () => {
  if (!props.alert || processing.value) return

  processing.value = true
  try {
    const res = await request.post(`/alerts/${props.alert.id}/handle`, {
      operator: '系统管理员'
    })
    showToast(res.msg || '预警处理成功', 'success')
    emit('close')
  } catch (err) {
    showToast(err.message || '预警处理失败', 'error')
  } finally {
    processing.value = false
  }
}

// 恢复为未处理
const handleUnresolve = async () => {
  if (!props.alert || processing.value) return

  processing.value = true
  try {
    const res = await request.post(`/alerts/${props.alert.id}/unhandle`, {})
    showToast(res.msg || '预警已恢复为未处理', 'success')
    emit('close')
  } catch (err) {
    showToast(err.message || '恢复预警失败', 'error')
  } finally {
    processing.value = false
  }
}

// 关闭弹窗
const handleClose = () => emit('close')

// 监听弹窗数据变化
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
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="alert" class="modal-mask" @click.self="handleClose">
        <div class="modal-box">
          <!-- 弹窗头部 -->
          <div class="modal-header">
            <h3>
              <i
                class="fas"
                :class="levelMap[alert.level]?.icon || 'fa-circle-info'"
                :style="{ color: levelMap[alert.level]?.color || 'var(--info)' }"
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
                :style="{ color: levelMap[alert.level]?.color || 'var(--info)' }"
              >
                {{ levelMap[alert.level]?.label || alert.level }}
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
              v-if="alert.handled"
              class="btn btn-outline btn-sm"
              :disabled="processing"
              @click="handleUnresolve"
            >
              <i class="fas fa-rotate-left"></i>
              {{ processing ? '处理中…' : '恢复为未处理' }}
            </button>

            <button
              v-else
              class="btn btn-outline btn-sm"
              :disabled="processing"
              @click="handleResolve"
            >
              <i class="fas fa-check"></i>
              {{ processing ? '处理中…' : '标记已处置' }}
            </button>

            <button
              class="btn btn-primary btn-sm"
              :disabled="processing"
              @click="handleClose"
            >
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
