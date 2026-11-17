<script setup>
// ============================================
// 监测平台视图：数据看板
// 知识要点：
// 1. ref / computed 响应式状态与「派生数据」
// 2. v-for 渲染列表、v-if 条件过滤
// 3. 父子组件通信：父组件通过 props 传数据、监听子组件 emit 事件
// ============================================
import { ref, computed, onMounted } from 'vue'
import request from '../api/request'
import { showToast } from '../composables/useToast'
import StatCard from '../components/StatCard.vue'
import MonitorCard from '../components/MonitorCard.vue'
import AlertPanel from '../components/AlertPanel.vue'
import RiskTrendChart from '../components/RiskTrendChart.vue'
import AlertModal from '../components/AlertModal.vue'

// ---------- 接口数据（原来是 import 静态 mock，现在改为 onMounted 里请求后端） ----------
const points = ref([]) // 监测点位列表
const alerts = ref([]) // 预警事件列表
const loading = ref(true) // 是否正在加载（用于骨架/提示）
const loadError = ref('') // 加载失败时的提示文案

const loadPoints = async () => {
  const res = await request.get('/monitor/points')
  points.value = res.data.list
}

const loadAlerts = async () => {
  const res = await request.get('/alerts')
  alerts.value = res.data.list
}

// 组件挂载后（DOM 已渲染）再去拉数据，避免页面白屏
onMounted(async () => {
  try {
    // Promise.all：两个请求并行发出，比串行快一倍
    await Promise.all([loadPoints(), loadAlerts()])
  } catch (err) {
    loadError.value = err.message
    showToast(err.message, 'error')
  } finally {
    loading.value = false
  }
})

// ---------- 统计卡片数据（computed：随源数据自动重算） ----------
const stats = computed(() => [
  { icon: 'fa-map-pin', value: points.value.length, suffix: '个', label: '监测点位' },
  { icon: 'fa-check-circle', value: points.value.filter(p => p.status === 'normal').length, suffix: '个', label: '运行正常', color: 'var(--success)' },
  { icon: 'fa-exclamation-triangle', value: points.value.filter(p => p.status === 'warning').length, suffix: '个', label: '待复核预警', color: 'var(--warning)' },
  { icon: 'fa-shield-halved', value: points.value.filter(p => p.status === 'danger').length, suffix: '个', label: '紧急危险', color: 'var(--danger)' },
])

// ---------- 状态过滤 ----------
const filter = ref('all') // all / normal / warning / danger

// 过滤后的点位列表：filter 变化时自动重算（纯前端筛选，数据已一次性加载）
const filteredPoints = computed(() => {
  if (filter.value === 'all') return points.value
  return points.value.filter(p => p.status === filter.value)
})

// 过滤按钮配置（v-for 渲染）
const filters = [
  { key: 'all', label: '全部' },
  { key: 'normal', label: '正常' },
  { key: 'warning', label: '预警' },
  { key: 'danger', label: '危险' },
]

// ---------- 点位卡片交互 ----------
// 监听 MonitorCard 子组件发出的 select 事件
// 点击卡片时，向后端请求该点位的「详情接口」，验证路径参数 :id 的用法
const onSelectPoint = async (point) => {
  try {
    const res = await request.get(`/monitor/points/${point.id}`)
    const d = res.data
    showToast(
      `${d.name}：振动 ${d.vibration} mm/s / 倾斜 ${d.tilt}° / 电量 ${d.battery}%`,
      'info'
    )
  } catch (err) {
    showToast(err.message, 'error')
  }
}

// ---------- 预警弹窗交互 ----------
const selectedAlert = ref(null)
const openAlert = (alert) => {
  selectedAlert.value = alert
}
// 关闭弹窗：顺手重新拉一次预警列表
// 这样「标记已处置」成功后，待处理数量能立刻刷新（不用手动刷新页面）
const closeAlert = () => {
  selectedAlert.value = null
  loadAlerts().catch((err) => showToast(err.message, 'error'))
}
</script>

<template>
  <div class="monitor-page">
    <!-- 顶部横幅 -->
    <section class="page-hero">
      <div class="container">
        <h1>县域房屋安全监测平台</h1>
        <p>实时掌握每一栋监测房屋的结构安全状态</p>
      </div>
    </section>

    <!-- 加载中 / 加载失败提示（loading、loadError 由接口请求状态驱动） -->
    <div v-if="loading" class="data-tip">监测数据加载中…</div>
    <div v-else-if="loadError" class="data-tip data-tip-error">
      数据加载失败：{{ loadError }}（请确认后端服务已启动 http://localhost:3000）
    </div>

    <!-- 统计卡片 -->
    <section class="section stat-section">
      <div class="container">
        <div class="stats-grid">
          <StatCard
            v-for="s in stats"
            :key="s.label"
            :icon="s.icon"
            :value="s.value"
            :suffix="s.suffix"
            :label="s.label"
            :color="s.color"
          />
        </div>
      </div>
    </section>

    <!-- 趋势图 + 预警面板 -->
    <section class="section dashboard-section">
      <div class="container">
        <div class="dashboard-grid">
          <RiskTrendChart />
          <AlertPanel :alerts="alerts" @select="openAlert" />
        </div>
      </div>
    </section>

    <!-- 点位列表 -->
    <section class="section points-section">
      <div class="container">
        <div class="section-header">
          <h2>监测点位</h2>
          <p>点击状态标签可快速筛选点位</p>
        </div>

        <!-- 状态筛选按钮组 -->
        <div class="filter-bar">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-btn"
            :class="{ active: filter === f.key }"
            @click="filter = f.key"
          >
            {{ f.label }}
          </button>
        </div>

        <!-- 点位卡片网格：v-for 循环渲染 -->
        <div class="points-grid">
          <MonitorCard
            v-for="p in filteredPoints"
            :key="p.id"
            :point="p"
            @select="onSelectPoint"
          />
        </div>

        <!-- 空状态提示 -->
        <p v-if="filteredPoints.length === 0" class="empty-tip">当前筛选条件下没有点位</p>
      </div>
    </section>

    <!-- 预警详情弹窗（父组件控制显示与否） -->
    <AlertModal :alert="selectedAlert" @close="closeAlert" />
  </div>
</template>

<style scoped>
.stat-section {
  padding-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.dashboard-section {
  padding-top: 48px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
  align-items: stretch;
}

.points-section {
  padding-top: 24px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 28px;
}

.filter-btn {
  padding: 8px 22px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.empty-tip {
  text-align: center;
  color: var(--text-light);
  padding: 40px 0;
}

/* 接口状态提示条 */
.data-tip {
  margin: 24px auto 0;
  max-width: 720px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-light);
}

.data-tip-error {
  color: var(--danger);
  background: rgba(245, 34, 45, 0.06);
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .points-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .points-grid {
    grid-template-columns: 1fr;
  }
}
</style>
