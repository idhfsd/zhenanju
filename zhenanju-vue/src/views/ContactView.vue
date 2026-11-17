<script setup>
// ============================================
// 联系我们视图
// 复用首页的 ContactSection 组件，并补充 FAQ 手风琴
// 知识要点：v-model 双向绑定、v-show 条件展示、ref 响应式状态
// ============================================
import { ref } from 'vue'
import ContactSection from '../components/ContactSection.vue'

// FAQ 列表：openIndex 记录当前展开项的索引，-1 表示全部收起
const faqs = [
  { q: '震安居的安装需要专业施工吗？', a: '不需要。终端体积小巧，采用免钉安装，普通村民 5 分钟即可完成部署，无需布线、无需专业工具。' },
  { q: '设备断网了还能预警吗？', a: '可以。系统采用「本地边缘计算为主、云端同步为辅」的架构，断网时本地预警功能完全不受影响。' },
  { q: '一套系统的成本大概是多少？', a: '单节点成本仅为传统工程监测方案的十分之一，适合县域规模化部署，具体报价可联系商务洽谈。' },
  { q: '数据如何保障安全与隐私？', a: '房屋结构数据仅用于安全监测，平台端实施分级权限管理，个人隐私数据严格脱敏存储。' }
]

const openIndex = ref(0)

// 点击切换展开/收起：再点同一项则收起
const toggle = (i) => {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <div class="contact-page">
    <!-- 顶部横幅 -->
    <section class="page-hero">
      <div class="container">
        <h1>联系我们</h1>
        <p>期待与您携手，共筑基层安全防线</p>
      </div>
    </section>

    <!-- 复用首页联系表单区块 -->
    <ContactSection />

    <!-- FAQ 常见问题 -->
    <section class="section faq-section">
      <div class="container">
        <div class="section-header">
          <h2>常见问题</h2>
          <p>关于产品与服务的常见疑问</p>
        </div>
        <div class="faq-list">
          <div v-for="(item, i) in faqs" :key="i" class="faq-item card">
            <button class="faq-question" @click="toggle(i)">
              <span>{{ item.q }}</span>
              <i class="fas" :class="openIndex === i ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            <!-- v-show 只切换 display 样式，元素始终保留在 DOM 中 -->
            <div v-show="openIndex === i" class="faq-answer">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.faq-section {
  background: var(--bg-light);
}

.faq-list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  padding: 0;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
}

.faq-question i {
  color: var(--primary);
}

.faq-answer {
  padding: 0 24px 18px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
