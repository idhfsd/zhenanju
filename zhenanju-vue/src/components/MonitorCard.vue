<script setup>
// ============================================
// 监测点位卡片组件（监测平台页使用）
// 知识要点：
// 1. props 接收父组件传入的点位数据
// 2. computed 根据状态派生展示文本 / 图标 / 颜色（状态映射表）
// 3. emit('select') 向父组件抛出自定义事件
// ============================================
import { computed } from 'vue'

// 接收父组件传入的 point 对象（结构见 data/mockData.js）
const props = defineProps({
  point: { type: Object, required: true }
})

// 声明本组件会向外抛出的事件
const emit = defineEmits(['select'])

// 状态 -> 展示信息 的映射表（单一数据源）
const statusMap = {
  normal: { label: '正常', icon: 'fa-circle-check', color: 'var(--success)', bg: 'var(--success-light)' },
  warning: { label: '预警', icon: 'fa-triangle-exclamation', color: 'var(--warning)', bg: 'var(--warning-light)' },
  danger: { label: '危险', icon: 'fa-circle-xmark', color: 'var(--danger)', bg: 'var(--danger-light)' }
}

// 派生：当前点位的状态展示对象（computed 会自动更新）
const statusInfo = computed(() => statusMap[props.point.status] || statusMap.normal)

// 点击卡片：向父组件广播 select 事件，并携带当前点位数据
const handleClick = () => {
  emit('select', props.point)
}
</script>

<template>
  <div class="monitor-card card" @click="handleClick">
    <!-- 卡片头部：名称 + 状态徽章 -->
    <div class="mc-header">
      <h3 class="mc-name" :title="point.name">{{ point.name }}</h3>
      <span
        class="mc-badge"
        :style="{ color: statusInfo.color, background: statusInfo.bg }"
      >
        <i :class="['fas', statusInfo.icon]"></i>
        {{ statusInfo.label }}
      </span>
    </div>

    <p class="mc-address"><i class="fas fa-location-dot"></i> {{ point.address }}</p>

    <!-- 监测指标网格 -->
    <div class="mc-metrics">
      <div class="mc-metric">
        <span class="mc-metric-label"><i class="fas fa-battery-three-quarters"></i> 电量</span>
        <span class="mc-metric-value">{{ point.battery }}%</span>
      </div>
      <div class="mc-metric">
        <span class="mc-metric-label"><i class="fas fa-signal"></i> 信号</span>
        <span class="mc-metric-value">{{ point.signal }}</span>
      </div>
      <div class="mc-metric">
        <span class="mc-metric-label"><i class="fas fa-wave-square"></i> 振动</span>
        <span class="mc-metric-value">{{ point.vibration }} mm/s</span>
      </div>
      <div class="mc-metric">
        <span class="mc-metric-label"><i class="fas fa-arrows-turn-to-dots"></i> 倾斜</span>
        <span class="mc-metric-value">{{ point.tilt }}°</span>
      </div>
    </div>

    <!-- 底部：最近更新 + 详情入口 -->
    <div class="mc-footer">
      <span class="mc-time"><i class="fas fa-clock"></i> {{ point.lastUpdate }}</span>
      <span class="mc-detail">查看详情 <i class="fas fa-chevron-right"></i></span>
    </div>
  </div>
</template>

<style scoped>
.monitor-card {
  cursor: pointer;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.mc-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.mc-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.mc-address {
  font-size: 13px;
  color: var(--text-secondary);
}

.mc-address i {
  color: var(--primary);
}

.mc-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: var(--bg-light);
  border-radius: 8px;
  padding: 10px 12px;
}

.mc-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.mc-metric-label {
  color: var(--text-secondary);
}

.mc-metric-label i {
  color: var(--primary);
  margin-right: 4px;
}

.mc-metric-value {
  font-weight: 700;
  font-size: 13px;
}

.mc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 10px;
  font-size: 12px;
  color: var(--text-light);
}

.mc-detail {
  color: var(--primary);
  font-weight: 500;
}
</style>
