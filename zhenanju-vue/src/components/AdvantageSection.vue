<script setup>
// ============================================
// 产品优势对比表（首页 + 技术页复用）
// 知识要点：
// 1. v-for 渲染表格行
// 2. 动态 class 绑定高亮列（:class）
// ============================================

// 对比维度行数据：每个对象对应表格一行
const rows = [
  { dim: '单节点成本', traditional: '千元级以上', home: '百元级，功能单一', ours: '仅传统方案十分之一' },
  { dim: '网络依赖', traditional: '高度依赖专线', home: '依赖家用网络', ours: '弱网可用，断网预警' },
  { dim: '安装运维', traditional: '需专业施工', home: '自行安装，无运维', ours: '简易安装，网格化运维' },
  { dim: '预警触达', traditional: '仅平台端报警', home: '仅手机通知', ours: '多渠道分级预警' },
  { dim: '适用场景', traditional: '城市大型建筑', home: '城市家庭', ours: '县域农村老旧房屋' }
]
</script>

<template>
  <section class="section advantage">
    <div class="container">
      <div class="section-header">
        <h2>产品优势</h2>
        <p>差异化定位，深耕农村细分市场</p>
      </div>

      <div class="table-wrap card">
        <table class="data-table">
          <thead>
            <tr>
              <th>对比维度</th>
              <th>传统工程监测</th>
              <th>普通家用安防</th>
              <th class="highlight-col">震安居系统</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.dim">
              <td class="dim-cell">{{ r.dim }}</td>
              <td>{{ r.traditional }}</td>
              <td>{{ r.home }}</td>
              <td class="highlight-col ours-cell">{{ r.ours }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.advantage {
  background: #fff;
}

.table-wrap {
  overflow-x: auto;
  padding: 8px;
}

.data-table th,
.data-table td {
  text-align: center;
}

.data-table th:first-child,
.data-table td:first-child {
  text-align: left;
  font-weight: 600;
}

/* 高亮列：震安居 */
.highlight-col {
  background: var(--primary-light) !important;
  color: var(--primary-dark);
  font-weight: 600;
}

.dim-cell {
  color: var(--text-main);
}

.ours-cell {
  position: relative;
}

.ours-cell::after {
  content: '★';
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 12px;
  color: var(--warning);
}
</style>
