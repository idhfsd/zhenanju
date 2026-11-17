<script setup>
// ============================================
// 振动趋势图组件（基于 ECharts 图表库）
// 知识要点：
// 1. 第三方库集成：import * as echarts 引入全部 API
// 2. 生命周期配合：onMounted 初始化图表、onBeforeUnmount 销毁释放资源
// 3. ref 模板引用（ref="chartEl" 拿到真实 DOM 节点）
// 4. 窗口 resize 自适应 + 事件清理
// ============================================
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import request from '../api/request'

// 模板引用：<div ref="chartEl"> 渲染后这里就是那个 DOM 节点
const chartEl = ref(null)

let chart = null // 保存图表实例，便于销毁

// 兜底数据：后端没启动时仍能画出一条曲线，页面不至于空白
const FALLBACK_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const FALLBACK_VALUES = [
  0.10, 0.08, 0.09, 0.07, 0.06, 0.05, 0.06, 0.08,
  0.12, 0.18, 0.15, 0.11, 0.09, 0.10, 0.14, 0.22,
  0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.06
]

// 趋势数据统一放在 trend 里，接口返回后整体替换
const trend = ref({
  hours: FALLBACK_HOURS,
  values: FALLBACK_VALUES,
  threshold: 0.5,
  updatedAt: ''
})

// 构建 ECharts 配置（option 是 ECharts 的核心概念）
function buildOption(data) {
  const hours = data.hours
  const values = data.values
  const threshold = data.threshold

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['墙体振动'], top: 0, right: 10 },
    grid: { left: 48, right: 24, top: 44, bottom: 28 },
    xAxis: { type: 'category', data: hours, boundaryGap: false, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: 'mm/s', nameTextStyle: { fontSize: 11 }, axisLabel: { fontSize: 11 } },
    series: [
      {
        name: '墙体振动',
        type: 'line',
        smooth: true,
        data: values,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#1677ff' },
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: 'rgba(22, 119, 255, 0.12)' },
        // 预警阈值参考线（阈值由后端返回，前端不写死）
        markLine: {
          symbol: 'none',
          data: [{ yAxis: threshold, name: '三级预警阈值' }],
          lineStyle: { color: '#f5222d', type: 'dashed', width: 2 },
          label: { formatter: `三级预警阈值 ${threshold}`, fontSize: 11, color: '#f5222d' }
        }
      }
    ]
  }
}

// 把当前 trend 数据渲染到图表：setOption 第二个参数 true 表示「完全替换」，避免旧曲线残留
const render = () => {
  if (chart) chart.setOption(buildOption(trend.value), true)
}

// 请求后端接口，拿到最新的 24h 趋势
const loadTrend = async () => {
  const res = await request.get('/monitor/trend')
  trend.value = res.data
  render()
}

// 窗口尺寸变化时图表自适应
const onResize = () => chart && chart.resize()

// 定时刷新句柄：setInterval 返回的 id，卸载组件时必须清除
let refreshTimer = null
// 刷新间隔：10 分钟（演示时想快点看到效果，可临时改成 60 * 1000 即 1 分钟）
const REFRESH_INTERVAL = 10 * 60 * 1000

const fetchTrendSilently = () => {
  loadTrend().catch((err) => {
    console.warn('趋势数据加载失败，保留当前曲线：', err.message)
  })
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  // 先用兜底数据画一版，避免等接口时图表区域空白
  chart.setOption(buildOption(trend.value))
  window.addEventListener('resize', onResize)

  // 首次拉取真实数据，成功后覆盖曲线；失败则静默保留兜底曲线，不打断页面
  fetchTrendSilently()

  // 定时自动刷新：让界面上的「数据每 10 分钟自动刷新」与实际行为一致
  refreshTimer = setInterval(fetchTrendSilently, REFRESH_INTERVAL)
})

// 组件卸载前：移除监听 + 清除定时器 + 销毁图表实例，避免内存泄漏和定时器泄漏
onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  window.removeEventListener('resize', onResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div class="trend-card card">
    <div class="tc-header">
      <h3><i class="fas fa-chart-line"></i> 全域振动趋势（24h）</h3>
      <span class="tc-tip">{{ trend.updatedAt ? `更新于 ${trend.updatedAt}` : '数据每 10 分钟自动刷新' }}</span>
    </div>
    <!-- ref="chartEl"：把 DOM 引用交给 JS 里的 chartEl -->
    <div ref="chartEl" class="tc-chart"></div>
  </div>
</template>

<style scoped>
.trend-card {
  display: flex;
  flex-direction: column;
}

.tc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tc-header h3 {
  font-size: 17px;
}

.tc-header h3 i {
  color: var(--primary);
  margin-right: 6px;
}

.tc-tip {
  font-size: 12px;
  color: var(--text-light);
}

.tc-chart {
  flex: 1;
  min-height: 320px;
  width: 100%;
}
</style>
