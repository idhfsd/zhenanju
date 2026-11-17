<script setup>
// ============================================
// 项目介绍区块
// 知识要点：静态内容组件 —— 无状态、纯展示，v-for 渲染亮点列表
// ============================================

// 三大亮点
const highlights = [
  { icon: 'fa-coins', title: '成本仅传统方案 1/10' },
  { icon: 'fa-wifi', title: '断网仍可正常预警' },
  { icon: 'fa-users', title: '适配老年用户群体' }
]
</script>

<template>
  <section class="section about" id="about">
    <div class="container">
      <div class="section-header">
        <h2>项目介绍</h2>
        <p>聚焦农村住房安全，填补基层监测空白</p>
      </div>

      <div class="about-content">
        <!-- 左侧文字 -->
        <div class="about-text">
          <p>
            震安居项目面向县域农村地区的老旧危房、自建住房安全监测需求，研发低成本微震动监测终端与智能预警平台，
            通过部署在房屋墙体、地基处的微型传感设备，实时采集房屋结构震动、倾斜、沉降等数据。
          </p>
          <p>
            系统通过本地边缘算法分析房屋安全状态，一旦出现异常风险，立即通过短信、村级广播、网格员通知等多渠道发出预警，
            保障基层群众生命财产安全。
          </p>

          <!-- 亮点列表：v-for 渲染 -->
          <div class="about-highlights">
            <div v-for="h in highlights" :key="h.title" class="highlight-item">
              <i :class="['fas', h.icon]"></i>
              <h4>{{ h.title }}</h4>
            </div>
          </div>
        </div>

        <!-- 右侧示意图（占位卡片） -->
        <div class="about-image">
          <div class="image-placeholder">
            <i class="fas fa-house-chimney"></i>
            <p>系统架构示意图</p>
            <span>传感器 → 边缘计算 → 多渠道预警</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  background: #fff;
}

.about-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 48px;
  align-items: center;
}

.about-text p {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.9;
  margin-bottom: 16px;
}

.about-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 28px;
}

.highlight-item {
  background: var(--bg-light);
  border-radius: 10px;
  padding: 18px 14px;
  text-align: center;
  transition: all 0.3s ease;
}

.highlight-item:hover {
  background: var(--primary-light);
  transform: translateY(-3px);
}

.highlight-item i {
  font-size: 24px;
  color: var(--primary);
  margin-bottom: 8px;
}

.highlight-item h4 {
  font-size: 14px;
  font-weight: 600;
}

.image-placeholder {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(160deg, var(--bg-light) 0%, #fff 100%);
  color: var(--text-secondary);
}

.image-placeholder i {
  font-size: 72px;
  color: var(--primary);
  opacity: 0.5;
}

.image-placeholder p {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.image-placeholder span {
  font-size: 13px;
  color: var(--text-light);
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
  }

  .about-highlights {
    grid-template-columns: 1fr;
  }
}
</style>
