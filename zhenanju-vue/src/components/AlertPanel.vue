<script setup>
// ============================================
// 实时预警面板组件
// 知识要点：
// 1. props 接收预警列表；computed 统计数量
// 2. 子组件向父组件 emit('select') 通知点击了哪条预警
// ============================================
import { computed } from 'vue'

const props = defineProps({
  alerts: { type: Array, default: () => [] }
})

const emit = defineEmits(['select'])

// 统计未处置预警数（danger + warning，且未被标记已处置）
const pendingCount = computed(
  () =>
    props.alerts.filter(
      a => !a.handled && (a.level === 'danger' || a.level === 'warning')
    ).length
)

// 级别 -> 展示样式
const levelMap = {
  danger: { label: '紧急', icon: 'fa-circle-xmark', color: 'var(--danger)', bg: 'var(--danger-light)' },
  warning: { label: '预警', icon: 'fa-triangle-exclamation', color: 'var(--warning)', bg: 'var(--warning-light)' },
  info: { label: '提示', icon: 'fa-circle-info', color: 'var(--info)', bg: 'var(--info-light)' }
}

// 点击某条预警
const handleSelect = (alert) => {
  emit('select', alert)
}
</script>

<template>
  <div class="alert-panel card">
    <div class="ap-header">
      <h3><i class="fas fa-bell"></i> 实时预警</h3>
      <span class="ap-count">{{ pendingCount }} 条待处理</span>
    </div>

    <div class="ap-list">
      <div
        v-for="a in alerts"
        :key="a.id"
        class="ap-item"
        @click="handleSelect(a)"
      >
        <div class="ap-item-top">
          <span
            class="ap-level"
            :style="{ color: levelMap[a.level].color, background: levelMap[a.level].bg }"
          >
            <i :class="['fas', levelMap[a.level].icon]"></i>
            {{ levelMap[a.level].label }}
          </span>
          <span class="ap-time">{{ a.time }}</span>
        </div>
        <p class="ap-point">{{ a.point }}</p>
        <p class="ap-message">{{ a.message }}</p>
      </div>
    </div>

    <!-- 空状态 -->
    <p v-if="alerts.length === 0" class="ap-empty">暂无预警事件</p>
  </div>
</template>

<style scoped>
.alert-panel {
  display: flex;
  flex-direction: column;
}

.ap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.ap-header h3 {
  font-size: 17px;
}

.ap-header h3 i {
  color: var(--danger);
  margin-right: 6px;
}

.ap-count {
  font-size: 12px;
  color: var(--danger);
  background: var(--danger-light);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.ap-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 420px;
}

.ap-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.ap-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateX(3px);
}

.ap-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ap-level {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.ap-time {
  font-size: 12px;
  color: var(--text-light);
}

.ap-point {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ap-message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ap-empty {
  text-align: center;
  color: var(--text-light);
  padding: 40px 0;
}
</style>
