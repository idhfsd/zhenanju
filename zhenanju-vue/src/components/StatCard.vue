<script setup>
// ============================================
// 统计卡片组件（通用、可复用）
// 知识要点：
// 1. defineProps 声明接收的属性，模板中可直接使用
// 2. 动态样式绑定 :style，让调用方自定义数字颜色
// 3. light 属性：是否用于深色背景（英雄区）
// ============================================

// 声明组件接收的 props
defineProps({
  icon: { type: String, default: 'fa-chart-simple' },
  value: { type: [Number, String], required: true },
  suffix: { type: String, default: '' },
  label: { type: String, required: true },
  color: { type: String, default: 'var(--primary)' },
  light: { type: Boolean, default: false }
})
</script>

<template>
  <div class="stat-card" :class="{ 'stat-card--light': light }">
    <div class="stat-icon">
      <i :class="['fas', icon]"></i>
    </div>
    <div class="stat-body">
      <div class="stat-value" :style="{ color }">
        {{ value }}<span class="stat-suffix">{{ suffix }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* 深色背景版本（英雄区使用） */
.stat-card--light {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: none;
  backdrop-filter: blur(4px);
}

.stat-card--light .stat-label {
  color: rgba(255, 255, 255, 0.75);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-card--light .stat-icon {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-suffix {
  font-size: 15px;
  font-weight: 600;
  margin-left: 2px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
