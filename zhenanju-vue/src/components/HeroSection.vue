<script setup>
// ============================================
// 英雄区组件（首页首屏）
// 知识要点：
// 1. v-for 循环渲染统计卡片，复用 StatCard 子组件
// 2. router-link 实现按钮跳转
// ============================================
import StatCard from './StatCard.vue'

// 首屏核心数据
const stats = [
  { icon: 'fa-map-pin', value: 5000, suffix: '+', label: '规划监测点位', color: 'var(--success)' },
  { icon: 'fa-battery-full', value: 3, suffix: '年', label: '终端电池续航', color: 'var(--info)' },
  { icon: 'fa-bullseye', value: 98, suffix: '%', label: '预警识别准确率', color: 'var(--warning)' },
  { icon: 'fa-coins', value: 1, suffix: '/10', label: '仅为传统方案成本', color: 'var(--danger)' }
]
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <h1 class="hero-title fade-up">
        农村老旧房屋低成本<br />微震动监测预警系统
      </h1>
      <p class="hero-subtitle fade-up">用科技守护基层民生，打造县域级房屋安全网格化监测体系</p>

      <div class="hero-buttons fade-up">
        <router-link to="/technology" class="btn btn-primary">了解项目</router-link>
        <router-link to="/contact" class="btn btn-outline">合作咨询</router-link>
      </div>

      <!-- 首屏数据：循环渲染 StatCard -->
      <div class="hero-stats">
        <StatCard
          v-for="s in stats"
          :key="s.label"
          :icon="s.icon"
          :value="s.value"
          :suffix="s.suffix"
          :label="s.label"
          :color="s.color"
          light
        />
      </div>
    </div>

    <!-- 底部波浪装饰 -->
    <svg class="hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none">
      <path d="M0,50 C240,90 480,10 720,40 C960,70 1200,20 1440,50 L1440,90 L0,90 Z" fill="#ffffff" />
    </svg>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  background: linear-gradient(135deg, #0b2d5c 0%, #1a5fb4 55%, #1677ff 100%);
  color: #fff;
  padding: 160px 0 120px;
  overflow: hidden;
}

.hero-inner {
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 46px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 1px;
}

.hero-subtitle {
  margin-top: 18px;
  font-size: 17px;
  opacity: 0.85;
}

.hero-buttons {
  margin-top: 36px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.hero-stats {
  margin-top: 64px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.hero-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 90px;
}

/* 动画延迟：让三个元素依次入场 */
.fade-up:nth-child(2) {
  animation-delay: 0.15s;
}

.fade-up:nth-child(3) {
  animation-delay: 0.3s;
}

@media (max-width: 768px) {
  .hero {
    padding: 130px 0 90px;
  }

  .hero-title {
    font-size: 30px;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
