# 震安居 · Express 后端服务

震安居 —— 农村老旧房屋低成本微震动监测预警系统，配套 Vue3 前端的后端实现。

## 目录位置

```
D:\Doubao\chats\2026-10-25\new-chat-3\
├─ zhenanju-vue\      # Vue3 前端（已改为走接口）
└─ zhenanju-server\   # Express 后端（本目录）
   ├─ index.js        # 全部接口代码
   ├─ package.json
   └─ data\           # JSON 文件当数据库
      ├─ points.json   # 监测点位
      ├─ alerts.json   # 预警事件
      ├─ news.json     # 新闻动态
      └─ inquiries.json# 咨询记录（表单提交后写入）
```

## 启动方式

后端（先启动）：

```bash
cd D:\Doubao\chats\2026-10-25\new-chat-3\zhenanju-server
npm install        # 首次运行才需要
npm start          # 或 npm run dev（Node 18+ 支持 --watch 热更新）
```

前端（另开一个终端）：

```bash
cd D:\Doubao\chats\2026-10-25\new-chat-3\zhenanju-vue
npm run dev
```

访问 http://localhost:5173 ，监测平台页面的数据、趋势图、联系表单全部走后端。
开发环境下页面里的 `/api` 请求由 vite 代理转发到 3000 端口（配置见 `vite.config.js`）。

## 只用一个地址访问整站（部署模式）

先构建前端，再直接访问后端端口即可，前后端同源，无跨域：

```bash
cd zhenanju-vue && npm run build      # 产物输出到 zhenanju-vue\dist
cd ../zhenanju-server && npm start
```

然后访问 **http://localhost:3000/** —— 页面和 `/api` 接口都在这个地址下。
上线到公网的具体方案见同目录 `部署上线指南.md`。

## 接口清单

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /api/health | 健康检查 |
| GET | /api/monitor/points | 点位列表，支持 `?status=normal\|warning\|danger`、`?keyword=村名` |
| GET | /api/monitor/points/:id | 单点位详情，如 `/api/monitor/points/ZJ-005` |
| GET | /api/monitor/stats | 看板统计：总数/正常/预警/危险/平均电量/平均信号 |
| GET | /api/monitor/trend | 24 小时振动趋势（含预警阈值） |
| GET | /api/alerts | 预警列表，支持 `?level=`、`?handled=true\|false` |
| POST | /api/alerts/:id/handle | 处理预警，body 可带 `{ "operator": "网格员老王" }` |
| GET | /api/news | 新闻动态 |
| POST | /api/contact | 提交咨询，body: `{ name, email, content }` |
| GET | /api/contact | 查看已提交的咨询记录 |

统一响应格式：

```json
{ "code": 200, "msg": "success", "data": { } }
```

`code` 约定：200 成功 / 400 参数错误 / 404 资源不存在 / 500 服务异常。

## 前端改动点（对比原 mock 版本）

| 文件 | 改动 |
| --- | --- |
| `src/api/request.js` | 新增：axios 实例 + 拦截器；baseURL 用相对路径 `/api`，开发走 vite 代理、线上同源 |
| `src/views/MonitorView.vue` | `import { monitorPoints } from '../data/mockData'` → `onMounted` 里请求 `/monitor/points` 与 `/alerts`，改用 `ref` 存数据 |
| `src/components/RiskTrendChart.vue` | 趋势数据改为请求 `/monitor/trend`，阈值也由后端返回；接口失败保留本地兜底曲线 |
| `src/components/ContactSection.vue` | 提交按钮由「只弹 toast」改为真正 POST `/contact`，带提交中状态防重复点击 |
| `src/data/mockData.js` | 保留未删，作为离线备用数据；页面已不再引用 |

## 为什么这样设计（答辩可用）

- **前后端分离**：前端 5173 端口、后端 3000 端口，通过 CORS 跨域通信，职责清晰，方便以后换成真正数据库。
- **JSON 文件持久化**：不引入数据库也能让数据在重启后保留，演示时提交的咨询记录能真实存在 `inquiries.json` 里。
- **统一响应结构**：`code/msg/data` 三层结构让前端拦截器能统一判断成功失败，页面里不用每个请求都写一套错误分支。
- **接口分层设计**：列表接口支持筛选参数（status、keyword），详情接口用路径参数，统计接口把聚合计算放在后端，前端只做展示。
