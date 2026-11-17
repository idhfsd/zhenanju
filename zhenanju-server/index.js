// ============================================================
// 震安居 —— 农村老旧房屋低成本微震动监测预警系统 后端服务
// 技术栈：Node.js + Express 4
// 作用：把前端 src/data/mockData.js 里的「写死数据」，改成真正的 HTTP 接口
//
// 启动：npm install   ->   npm start（或 npm run dev 开启热更新）
// 地址：http://localhost:3000
//
// 接口一览：
//   GET  /api/health                     服务健康检查
//   GET  /api/monitor/points             监测点位列表（支持 ?status= & ?keyword=）
//   GET  /api/monitor/points/:id         单个点位详情
//   GET  /api/monitor/stats              看板统计（点位/正常/预警/危险数量）
//   GET  /api/monitor/trend              24 小时全域振动趋势
//   GET  /api/alerts                     预警事件列表（支持 ?level=）
//   POST /api/alerts/:id/handle          处理预警事件
//   GET  /api/news                       新闻动态列表
//   POST /api/contact                    提交咨询（写进 inquiries.json）
//   GET  /api/contact                    查看已提交的咨询记录
// ============================================================

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// ---------- 中间件 ----------
// cors：允许 Vue 开发服务器（http://localhost:5173）跨域请求本服务
app.use(cors())
// express.json：解析 POST 请求体里的 JSON，解析结果放到 req.body
app.use(express.json())

// 简易访问日志：终端里能看到每个请求，方便调试
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${req.method} ${req.originalUrl}`)
  next()
})


// ---------- 数据层：本地 JSON + Netlify Blobs ----------
const LOCAL_DATA_DIR = path.join(__dirname, 'data')
const DEPLOY_DATA_DIR = path.join(__dirname, '..', '..', 'zhenanju-server', 'data')

const DATA_DIR = fs.existsSync(LOCAL_DATA_DIR)
  ? LOCAL_DATA_DIR
  : DEPLOY_DATA_DIR

function readData(fileName, fallback) {
  const filePath = path.join(DATA_DIR, fileName)
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.warn(`读取 ${fileName} 失败，使用默认值：${err.message}`)
    return fallback
  }
}

// 本地开发使用 JSON 文件；Netlify Functions 环境使用 Blobs
const isNetlify =
  process.env.NETLIFY === 'true' ||
  Boolean(process.env.NETLIFY_SITE_ID) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT)
let blobStorePromise

async function getBlobStore() {
  if (!blobStorePromise) {
    blobStorePromise = import('@netlify/blobs').then(({ getStore }) =>
      getStore('zhenanju-data')
    )
  }
  return blobStorePromise
}

let points = readData('points.json', [])
let alerts = readData('alerts.json', [])
let news = readData('news.json', [])
let inquiries = readData('inquiries.json', [])

async function loadPersistentData() {
  if (!isNetlify) return

  const store = await getBlobStore()

  const [savedAlerts, savedInquiries] = await Promise.all([
    store.get('alerts', { type: 'json' }),
    store.get('inquiries', { type: 'json' })
  ])

  if (savedAlerts !== null) alerts = savedAlerts
  if (savedInquiries !== null) inquiries = savedInquiries
}

async function writeData(fileName, data) {
  if (isNetlify) {
    const store = await getBlobStore()
    const key = fileName.replace('.json', '')
    await store.setJSON(key, data)
    return
  }

  const filePath = path.join(DATA_DIR, fileName)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// 第一次收到请求前，先从云端加载已保存的数据
let dataReady

app.use((req, res, next) => {
  if (!dataReady) dataReady = loadPersistentData()

  dataReady.then(() => next()).catch(next)
})


// 统一响应格式：{ code, msg, data }
// code 约定：200 成功 / 400 参数错误 / 404 资源不存在 / 500 服务异常
const ok = (res, data, msg = 'success') => res.json({ code: 200, msg, data })
const fail = (res, code, msg) => res.status(code).json({ code, msg, data: null })

// ============================================================
// 1. 健康检查
// ============================================================
app.get('/api/health', (req, res) => {
  ok(res, { status: 'running', time: new Date().toISOString(), version: '1.0.0' })
})

// ============================================================
// 2. 监测点位列表
//    查询参数：status（normal/warning/danger）  keyword（按名称/地址模糊搜索）
// ============================================================
app.get('/api/monitor/points', (req, res) => {
  const { status, keyword } = req.query

  let list = points.slice()

  if (status && status !== 'all') {
    list = list.filter(p => p.status === status)
  }

  if (keyword) {
    const kw = String(keyword).trim().toLowerCase()
    list = list.filter(
      p =>
        p.name.toLowerCase().includes(kw) ||
        p.address.toLowerCase().includes(kw) ||
        p.id.toLowerCase().includes(kw)
    )
  }

  ok(res, { total: list.length, list })
})

// ============================================================
// 3. 单个点位详情（:id 是路径参数，通过 req.params.id 取到）
// ============================================================
app.get('/api/monitor/points/:id', (req, res) => {
  const found = points.find(p => p.id === req.params.id)
  if (!found) return fail(res, 404, `点位 ${req.params.id} 不存在`)
  ok(res, found)
})

// ============================================================
// 4. 看板统计
// ============================================================
app.get('/api/monitor/stats', (req, res) => {
  const total = points.length
  ok(res, {
    total,
    normal: points.filter(p => p.status === 'normal').length,
    warning: points.filter(p => p.status === 'warning').length,
    danger: points.filter(p => p.status === 'danger').length,
    // 平均电池、平均信号：用于看板顶部辅助指标
    avgBattery: total ? Number((points.reduce((s, p) => s + p.battery, 0) / total).toFixed(1)) : 0,
    avgSignal: total ? Number((points.reduce((s, p) => s + p.signal, 0) / total).toFixed(1)) : 0
  })
})

// ============================================================
// 5. 24 小时振动趋势
//    真实场景由传感器上报，这里用「基准曲线 + 随机抖动」模拟实时数据
// ============================================================
const BASE_CURVE = [
  0.10, 0.08, 0.09, 0.07, 0.06, 0.05, 0.06, 0.08,
  0.12, 0.18, 0.15, 0.11, 0.09, 0.10, 0.14, 0.22,
  0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.06
]
const THRESHOLD = 0.5 // 三级预警阈值 mm/s

app.get('/api/monitor/trend', (req, res) => {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const values = BASE_CURVE.map(v => Number((v + (Math.random() - 0.5) * 0.04).toFixed(3)))

  ok(res, {
    unit: 'mm/s',
    threshold: THRESHOLD,
    hours,
    values,
    updatedAt: new Date().toLocaleTimeString('zh-CN', { hour12: false })
  })
})

// ============================================================
// 6. 预警事件列表
//    查询参数：level（danger/warning/info）、handled（true/false）
// ============================================================
app.get('/api/alerts', (req, res) => {
  const { level, handled } = req.query
  let list = alerts.slice()

  if (level && level !== 'all') list = list.filter(a => a.level === level)

  if (handled === 'true' || handled === 'false') {
    const target = handled === 'true'
    list = list.filter(a => Boolean(a.handled) === target)
  }

  ok(res, { total: list.length, list })
})

// ============================================================
// 7. 处理预警（把 handled 置为 true，并写入处理时间）
// ============================================================
app.post('/api/alerts/:id/handle', async (req, res) => {
  const found = alerts.find(a => a.id === req.params.id)
  if (!found) return fail(res, 404, `预警 ${req.params.id} 不存在`)

  found.handled = true
  found.handledAt = new Date().toLocaleString('zh-CN', { hour12: false })
  found.handledBy = req.body && req.body.operator ? String(req.body.operator) : '系统管理员'

  await writeData('alerts.json', alerts)
  ok(res, found, '预警已处理')
})

// 恢复预警为未处理
app.post('/api/alerts/:id/unhandle', async (req, res) => {
  try {
    const found = alerts.find(a => a.id === req.params.id)

    if (!found) {
      return fail(res, 404, `预警 ${req.params.id} 不存在`)
    }

    // 先保存原状态，写入失败时可以恢复
    const oldHandled = found.handled
    const oldHandledAt = found.handledAt
    const oldHandledBy = found.handledBy

    found.handled = false
    delete found.handledAt
    delete found.handledBy

    try {
      await writeData('alerts.json', alerts)
    } catch (writeError) {
      // 写入失败，恢复内存中的原状态
      found.handled = oldHandled
      if (oldHandledAt !== undefined) found.handledAt = oldHandledAt
      if (oldHandledBy !== undefined) found.handledBy = oldHandledBy
      throw writeError
    }

    return ok(res, found, '预警已恢复为未处理')
  } catch (err) {
    console.error('恢复预警失败：', err)
    return fail(res, 500, `恢复失败：${err.message || '云端数据写入异常'}`)
  }
})

// ============================================================
// 8. 新闻动态
// ============================================================
app.get('/api/news', (req, res) => {
  ok(res, { total: news.length, list: news })
})

// ============================================================
// 9. 提交咨询
//    校验：姓名/邮箱/内容都不能为空；邮箱格式必须合法
// ============================================================
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/

app.post('/api/contact', async (req, res) => {
  const { name, email, content } = req.body || {}

  const nameStr = (name || '').trim()
  const emailStr = (email || '').trim()
  const contentStr = (content || '').trim()

  if (!nameStr || !emailStr || !contentStr) {
    return fail(res, 400, '姓名、邮箱、咨询内容均为必填项')
  }
  if (!EMAIL_RE.test(emailStr)) {
    return fail(res, 400, '邮箱格式不正确')
  }
  if (contentStr.length > 500) {
    return fail(res, 400, '咨询内容不能超过 500 字')
  }

  const record = {
    id: `CQ-${Date.now()}`,
    name: nameStr,
    email: emailStr,
    content: contentStr,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
  }

  inquiries.unshift(record)
  await writeData('inquiries.json', inquiries) // 持久化到文件

  ok(res, record, '提交成功，我们将尽快与您联系！')
})

// 查看咨询记录（答辩/演示时能证明数据真的进了后端）
app.get('/api/contact', (req, res) => {
  ok(res, { total: inquiries.length, list: inquiries })
})

// ============================================================
// 10. 托管前端构建产物（部署成「一个地址」的关键）
//     执行 npm run build 后，Vue 的产物在 ../zhenanju-vue/dist
//     Express 直接把它当静态目录发出去，于是：
//        http://localhost:3000/         → 震安居网页
//        http://localhost:3000/api/xxx  → 后端接口（同源，无跨域）
//     部署到云服务器/Render 时，只暴露这一个端口就够了
// ============================================================
const DIST_DIR = path.join(__dirname, '..', 'zhenanju-vue', 'dist')

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  console.log('已托管前端构建产物：', DIST_DIR)
} else {
  console.log('未找到前端 dist（先到 zhenanju-vue 执行 npm run build）')
}

// ============================================================
// 兜底：404 与统一错误处理（必须放在所有路由之后）
// ============================================================
// 接口路径没匹配上的，一律按接口 404 返回 JSON
app.use('/api', (req, res) => fail(res, 404, `接口不存在：${req.method} ${req.originalUrl}`))

// 非接口路径（页面刷新、直接访问首页）交给前端首页处理
app.get('*', (req, res) => {
  const indexFile = path.join(DIST_DIR, 'index.html')
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile)
  } else {
    fail(res, 404, '前端未构建，请先执行 npm run build')
  }
})

app.use((err, req, res, next) => {
  console.error('服务异常：', err)
  fail(res, 500, '服务器内部错误')
})

app.listen(PORT, () => {
  console.log('============================================')
  console.log(`  震安居后端服务已启动：http://localhost:${PORT}`)
  console.log(`  健康检查：http://localhost:${PORT}/api/health`)
  console.log(`  点位列表：http://localhost:${PORT}/api/monitor/points`)
  console.log('============================================')
})
