<script setup>
// ============================================
// 首页视图：纯「组装」页面
// 知识要点：组件化复用 —— 页面由多个区块组件拼装而成，
// 每个区块组件只负责自己的内容，互不干扰，易于维护
// ============================================
import HeroSection from '../components/HeroSection.vue'
import AboutSection from '../components/AboutSection.vue'
import TechSection from '../components/TechSection.vue'
import AdvantageSection from '../components/AdvantageSection.vue'
import ScenarioSection from '../components/ScenarioSection.vue'
import ContactSection from '../components/ContactSection.vue'
</script>

<template>
  <div class="home">
    <HeroSection />
    <AboutSection />
    <TechSection />
    <AdvantageSection />
    <ScenarioSection />
    <ContactSection />
  </div>
</template>

<style scoped>
.home {
  background: #fff;
}
</style>
