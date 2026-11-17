<script setup>
// ============================================
// 页脚组件
// 知识要点：javascript:void(0) 在社交图标上的应用 ——
// 链接尚无真实地址时，用 void(0) 占位，点击只弹提示不跳转
// ============================================
import { showToast } from '../composables/useToast'

const quickLinks = [
  { label: '首页', to: '/' },
  { label: '监测平台', to: '/monitor' },
  { label: '核心技术', to: '/technology' },
  { label: '联系我们', to: '/contact' }
]

// 社交平台占位：href 用 javascript:void(0)，@click 弹提示
const socials = [
  { icon: 'fa-weixin', name: '微信公众号' },
  { icon: 'fa-weibo', name: '微博' },
  { icon: 'fa-github', name: 'GitHub' }
]

const handleSocial = (name) => {
  showToast(`${name}官方账号建设中，敬请期待`, 'info')
}
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- 品牌区 -->
        <div class="footer-brand">
          <div class="logo">
            <i class="fas fa-shield-halved"></i>
            <span>震安居</span>
          </div>
          <p>用科技守护每一个家</p>
        </div>

        <!-- 快速导航 -->
        <div class="footer-col">
          <h4>快速导航</h4>
          <ul>
            <li v-for="link in quickLinks" :key="link.to">
              <router-link :to="link.to">{{ link.label }}</router-link>
            </li>
          </ul>
        </div>

        <!-- 关注我们 -->
        <div class="footer-col">
          <h4>关注我们</h4>
          <div class="social-icons">
            <!-- ★ javascript:void(0) 占位链接：阻止跳转 + 触发 JS -->
            <a
              v-for="s in socials"
              :key="s.icon"
              href="javascript:void(0)"
              class="social-icon"
              :title="s.name"
              @click="handleSocial(s.name)"
            >
              <i :class="['fab', s.icon]"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 震安居项目组 版权所有 | 创新创业大赛参赛项目</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--bg-dark);
  color: rgba(255, 255, 255, 0.75);
  padding: 56px 0 0;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  padding-bottom: 40px;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.footer-brand .logo i {
  color: var(--primary);
}

.footer-brand p {
  font-size: 14px;
  opacity: 0.7;
}

.footer-col h4 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
}

.footer-col ul li {
  margin-bottom: 10px;
}

.footer-col ul a {
  font-size: 14px;
  opacity: 0.75;
  transition: opacity 0.25s ease, color 0.25s ease;
}

.footer-col ul a:hover {
  opacity: 1;
  color: var(--primary);
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.25s ease;
}

.social-icon:hover {
  background: var(--primary);
  color: #fff;
  transform: translateY(-3px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: 18px 0;
  text-align: center;
  font-size: 13px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
