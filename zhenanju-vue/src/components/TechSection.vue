<script setup>
// ============================================
// 核心技术区块（首页 + 技术页复用）
// 知识要点：卡片式数据驱动渲染 —— 只改数组，页面自动增减卡片
// ============================================

// 四大技术卡片
const techCards = [
  {
    icon: 'fa-microchip',
    title: '微机电传感终端',
    desc: '集成高精度微机电传感器，低功耗设计，电池续航 3 年以上，体积小巧，安装简便，无需专业施工。'
  },
  {
    icon: 'fa-brain',
    title: '轻量化智能算法',
    desc: '针对农村房屋结构优化算法模型，降低算力需求，可在低端边缘设备运行，保障识别准确率。'
  },
  {
    icon: 'fa-network-wired',
    title: '边缘计算架构',
    desc: '本地计算为主、云端同步为辅，断网状态下本地预警功能完全不受影响，适配农村弱网环境。'
  },
  {
    icon: 'fa-bell',
    title: '多渠道分级预警',
    desc: '三级预警机制，结合短信、广播、网格员上门等多种方式，解决预警落地最后一公里问题。'
  }
]
</script>

<template>
  <section class="section tech">
    <div class="container">
      <div class="section-header">
        <h2>核心技术</h2>
        <p>四大技术创新，构筑安全屏障</p>
      </div>

      <div class="tech-grid">
        <div v-for="card in techCards" :key="card.title" class="tech-card card fade-up">
          <div class="tech-icon">
            <i :class="['fas', card.icon]"></i>
          </div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech {
  background: var(--bg-light);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.tech-card {
  text-align: center;
  padding: 36px 24px;
}

.tech-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--primary) 0%, #4d9bff 100%);
  color: #fff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.3);
}

.tech-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.tech-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

@media (max-width: 1024px) {
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
</style>
