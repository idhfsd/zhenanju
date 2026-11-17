<script setup>
// ============================================
// 联系区块（首页 + 联系页复用）
// 知识要点：
// 1. v-model 双向绑定表单输入
// 2. computed 实时校验表单是否填写完整
// 3. 表单提交：@submit.prevent 阻止默认刷新，改用 JS 处理 + toast 反馈
// ============================================
import { ref, computed } from 'vue'
import { showToast } from '../composables/useToast'
import request from '../api/request'

// 联系信息
const contactInfo = [
  { icon: 'fa-map-location-dot', title: '项目地址', desc: '湖南省衡阳市' },
  { icon: 'fa-envelope', title: '合作邮箱', desc: 'contact@zhenanju.com' },
  { icon: 'fa-phone', title: '咨询电话', desc: '138-xxxx-xxxx' }
]

// 表单数据（v-model 绑定）
const form = ref({
  name: '',
  email: '',
  content: ''
})

// 表单是否可提交：三项都非空才允许
const canSubmit = computed(() =>
  form.value.name.trim() !== '' &&
  form.value.email.trim() !== '' &&
  form.value.content.trim() !== ''
)

// 提交中标记：防止用户连点重复提交
const submitting = ref(false)

// 提交处理：真正把表单数据 POST 给后端 /api/contact
// 后端做了必填校验和邮箱格式校验，前端只负责提示成功/失败
const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  try {
    const res = await request.post('/contact', form.value)
    showToast(res.msg || '提交成功，我们将尽快与您联系！', 'success')
    form.value = { name: '', email: '', content: '' } // 清空表单
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="section contact" id="contact">
    <div class="container">
      <div class="section-header">
        <h2>联系我们</h2>
        <p>期待与您携手，共筑基层安全防线</p>
      </div>

      <div class="contact-wrapper">
        <!-- 左侧：联系信息 -->
        <div class="contact-info">
          <div v-for="info in contactInfo" :key="info.title" class="info-item">
            <i :class="['fas', info.icon]"></i>
            <div>
              <h4>{{ info.title }}</h4>
              <p>{{ info.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 右侧：咨询表单 -->
        <form class="contact-form card" @submit.prevent="handleSubmit">
          <div class="form-group">
            <input
              v-model="form.name"
              type="text"
              placeholder="您的姓名"
              required
            />
          </div>
          <div class="form-group">
            <input
              v-model="form.email"
              type="email"
              placeholder="联系邮箱"
              required
            />
          </div>
          <div class="form-group">
            <textarea
              v-model="form.content"
              rows="4"
              placeholder="咨询内容"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            class="btn btn-primary submit-btn"
            :disabled="!canSubmit || submitting"
          >
            {{ submitting ? '提交中…' : (canSubmit ? '提交咨询' : '请填写完整信息') }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: #fff;
}

.contact-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: start;
}

.info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 18px 0;
  border-bottom: 1px solid var(--border);
}

.info-item i {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.info-item h4 {
  font-size: 16px;
  margin-bottom: 4px;
}

.info-item p {
  color: var(--text-secondary);
  font-size: 14px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  background: var(--bg-light);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

.form-group textarea {
  resize: vertical;
}

.submit-btn {
  width: 100%;
}

.submit-btn:disabled {
  background: #c9d3e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .contact-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
