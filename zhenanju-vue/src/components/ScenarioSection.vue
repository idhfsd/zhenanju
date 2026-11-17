<script setup>
// ============================================
// 应用场景区块
// 知识要点：纯展示组件，数据驱动卡片渲染
// ============================================

const scenarios = [
  { icon: 'fa-building', title: '农村老旧危房监测', desc: '对年久失修的农村老旧房屋进行实时结构监测，及时发现垮塌风险，保障住户安全。' },
  { icon: 'fa-mountain', title: '地质灾害易发区', desc: '在山区、滑坡易发区部署监测网络，提前预警地质灾害引发的房屋结构损坏。' },
  { icon: 'fa-city', title: '县域安全监管', desc: '为住建、应急管理部门提供全域房屋安全可视化管理平台，提升基层治理效率。' },
  { icon: 'fa-house-circle-check', title: '村级防灾体系', desc: '融入村级应急管理体系，结合广播与网格员机制，筑牢基层防灾第一道防线。' }
]
</script>

<template>
  <section class="section scenario">
    <div class="container">
      <div class="section-header">
        <h2>应用场景</h2>
        <p>覆盖基层安全治理多类场景</p>
      </div>

      <div class="scenario-grid">
        <div v-for="s in scenarios" :key="s.title" class="scenario-card card fade-up">
          <i :class="['fas', s.icon]"></i>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scenario {
  background: var(--bg-light);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.scenario-card {
  text-align: center;
  padding: 32px 22px;
}

.scenario-card i {
  font-size: 36px;
  color: var(--primary);
  margin-bottom: 16px;
}

.scenario-card h3 {
  font-size: 17px;
  margin-bottom: 10px;
}

.scenario-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

@media (max-width: 1024px) {
  .scenario-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
