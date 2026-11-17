<script setup>
// ============================================
// 核心技术视图
// 知识要点：复用首页已有的 TechSection / AdvantageSection 组件（组件复用！）
// ============================================
import TechSection from '../components/TechSection.vue'
import AdvantageSection from '../components/AdvantageSection.vue'

// 系统架构四层（v-for 渲染时间线）
const layers = [
  { icon: 'fa-microchip', title: '感知层', desc: '微机电传感器部署于墙体、地基，采集振动、倾斜、沉降等结构数据。' },
  { icon: 'fa-microchip', title: '边缘计算层', desc: '本地边缘算法实时分析，异常即时判定，断网不中断预警能力。' },
  { icon: 'fa-bell', title: '预警触达层', desc: '三级预警机制：短信、村级广播、网格员上门，多渠道直达住户。' },
  { icon: 'fa-desktop', title: '平台管理层', desc: '县域级可视化大屏，为住建、应急部门提供全域监管入口。' }
]
</script>

<template>
  <div class="tech-page">
    <!-- 顶部横幅 -->
    <section class="page-hero">
      <div class="container">
        <h1>核心技术</h1>
        <p>低成本、低功耗、断网可用 —— 面向农村的工程化解决方案</p>
      </div>
    </section>

    <!-- 复用首页核心技术区块 -->
    <TechSection />

    <!-- 系统架构 -->
    <section class="section arch-section">
      <div class="container">
        <div class="section-header">
          <h2>系统架构</h2>
          <p>从传感器到预警触达的四层闭环</p>
        </div>
        <div class="arch-list">
          <div v-for="(layer, i) in layers" :key="layer.title" class="arch-item fade-up">
            <span class="arch-step">{{ i + 1 }}</span>
            <div class="arch-icon"><i :class="['fas', layer.icon]"></i></div>
            <div class="arch-body">
              <h3>{{ layer.title }}</h3>
              <p>{{ layer.desc }}</p>
            </div>
            <i v-if="i < layers.length - 1" class="fas fa-arrow-down arch-arrow"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- 复用首页产品优势对比表 -->
    <AdvantageSection />
  </div>
</template>

<style scoped>
.arch-section {
  background: var(--bg-light);
}

.arch-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.arch-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px 28px;
  width: 100%;
}

.arch-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arch-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.arch-body h3 {
  font-size: 18px;
  margin-bottom: 4px;
}

.arch-body p {
  color: var(--text-secondary);
  font-size: 14px;
}

.arch-arrow {
  color: var(--primary);
  font-size: 20px;
  margin: 6px 0;
}
</style>
