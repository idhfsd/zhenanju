# 震安居 · FastAPI 后端

Express 版 `zhenanju-server` 的等价替换：10 个接口、路径、查询参数、请求体、
`{code, msg, data}` 响应格式全部保持一致，前端 `src/api/request.js` 不用改。

## 目录

```
zhenanju-fastapi\
├─ main.py          # 应用入口：CORS、访问日志、异常处理、路由注册、启动
├─ common.py        # 统一响应 ok()/fail()、业务异常 AppError
├─ schemas.py       # Pydantic 模型：ContactIn、HandleIn（请求体校验）
├─ storage.py       # JSON 文件数据层（对照 Express 的 readData/writeData）
├─ routers\
│  ├─ monitor.py    # /api/monitor/*：列表、详情、统计、趋势
│  ├─ alerts.py     # /api/alerts：列表、处置
│  ├─ news.py       # /api/news
│  └─ contact.py    # /api/contact：提交、查看
├─ data\            # 4 个 JSON，和 Express 版内容相同
├─ requirements.txt
└─ .venv\           # 已用本机 Python 3.13 建好并装好依赖（可删掉重建）
```

## 启动

已建好 `.venv` 并装好依赖，直接跑：

```powershell
cd C:\Users\yy\Doubao\chats\2026-11-22\new-chat\zhenanju-fastapi
.\.venv\Scripts\python.exe main.py
```

看到 `Uvicorn running on http://0.0.0.0:3000` 即启动成功：

- 健康检查 <http://localhost:3000/api/health>
- 接口文档 <http://localhost:3000/docs>（FastAPI 自动生成，可直接点“Try it out”调试）

换台机器 / 想自己重建环境：

```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

端口默认 3000（和 Express 版一致，前端零改动）。想改端口：

```powershell
$env:PORT=8000; python main.py
```

改用 8000 时，同步把 `zhenanju-vue\src\api\request.js` 第 13 行改成 `http://localhost:8000/api`。

开发时想改代码自动重启，用 uvicorn 的 reload：

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 3000
```

## 上线部署（Netlify 前端 + Render 后端）

完整步骤见根目录 `上线部署.md`，仓库根目录的 `render.yaml` / `netlify.toml` 已配好。
后端只认环境变量，不需要改代码：

| 变量 | 作用 | 本地默认 | Render 上填 |
| --- | --- | --- | --- |
| `PORT` | 监听端口 | 3000 | 平台自动注入，不用管 |
| `ALLOWED_ORIGINS` | 允许跨域的前端地址，逗号分隔 | `*` | `https://你的站点.netlify.app` |
| `ALLOW_ORIGIN_REGEX` | 放行 Netlify 的推送预览域名 | 空 | 可选，如 `https://.*\.netlify\.app` |
| `ADMIN_TOKEN` | `GET /api/contact` 的管理口令 | 空（放行） | 随机字符串，如 `znj-8f3a...` |
| `DATA_DIR` | 数据文件目录 | 项目内 `data/` | 免费实例不用填；挂持久盘后改成 `/var/data` |

`ADMIN_TOKEN` 是干什么的：`GET /api/contact` 会返回所有咨询人的姓名、邮箱、咨询内容，
挂公网后不能任人查看。设了这个变量，就必须带请求头才能读：

```powershell
curl.exe -H "X-Admin-Token: 你的口令" https://你的后端域名/api/contact
```

不设（本地开发）则自动放行，答辩时照常能演示"数据真的进了后端"。

注意：Render 免费实例的磁盘不持久，重启或重新部署后 `data/*.json` 会回到仓库里的初始版本，
演示当场没问题，长期保存需要升付费挂盘。

## 接口对照

| 方法 | 路径 | Express 版位置 | FastAPI 版位置 |
| --- | --- | --- | --- |
| GET | /api/health | index.js 第 1 段 | main.py `health()` |
| GET | /api/monitor/points | 第 2 段 | routers/monitor.py `list_points()` |
| GET | /api/monitor/points/{id} | 第 3 段 | `get_point()` |
| GET | /api/monitor/stats | 第 4 段 | `get_stats()` |
| GET | /api/monitor/trend | 第 5 段 | `get_trend()` |
| GET | /api/alerts | 第 6 段 | routers/alerts.py `list_alerts()` |
| POST | /api/alerts/{id}/handle | 第 7 段 | `handle_alert()` |
| POST | /api/alerts/{id}/unhandle | 第 7 段（新增） | `unhandle_alert()` |
| GET | /api/news | 第 8 段 | routers/news.py `list_news()` |
| POST | /api/contact | 第 9 段 | routers/contact.py `create_inquiry()` |
| GET | /api/contact | 第 9 段 | `list_inquiries()` |

响应格式不变：

```json
{ "code": 200, "msg": "success", "data": { } }
```

`code` 约定：200 成功 / 400 参数错误 / 404 资源不存在 / 500 服务异常。

## 和 Express 版的行为一致性

- 点位列表支持 `?status=`、`?keyword=`（名称/地址/编号模糊搜索）。
- 预警列表支持 `?level=`、`?handled=true|false`。
- 不存在的点位/预警返回 HTTP 404 + `{code:404}`，提示文案与 Express 相同。
- 咨询表单校验失败返回 HTTP 400，提示分别是
  「姓名、邮箱、咨询内容均为必填项」「邮箱格式不正确」「咨询内容不能超过 500 字」。
  这靠 `main.py` 里的 `friendly_message()` 把 Pydantic 的英文错误翻成中文。
- 未匹配的路径返回 404 + `接口不存在：GET /xxx`。
- 处置预警、提交咨询都会立刻写回 JSON 文件，重启服务数据仍在。

## 迁移对照（答辩可讲）

| Express | FastAPI |
| --- | --- |
| `req.query.status` | `status: str \| None = Query(None)` |
| `req.params.id` | 路径里的 `{point_id}` 直接成为函数参数 |
| `req.body` + 手写 if 校验 | Pydantic 模型 `ContactIn` + `Field(min_length/max_length/pattern)` |
| `app.use(cors())` | `CORSMiddleware` |
| 手写访问日志中间件 | `@app.middleware("http")` |
| `res.json({code,msg,data})` | 返回 dict，FastAPI 自动序列化 |
| 兜底 404 + 错误处理中间件 | `AppError` / 异常处理器 + `/{full_path:path}` 兜底路由 |
| 无接口文档 | `/docs` 自动生成 Swagger 文档 |
