# ============================================================
# 震安居 —— 农村老旧房屋低成本微震动监测预警系统 后端服务（FastAPI 版）
# 技术栈：Python 3.10+ / FastAPI / Uvicorn
#
# 与 Express 版 index.js 完全对齐：接口路径、查询参数、请求体、响应格式都不变，
# 所以前端 src/api/request.js 的 baseURL 一行都不用改，只要端口仍是 3000。
#
# 启动：pip install -r requirements.txt
#       python main.py
# 地址：http://localhost:3000        交互式文档：http://localhost:3000/docs
#
# 接口一览：
#   GET  /api/health                     健康检查
#   GET  /api/monitor/points             点位列表（?status= & ?keyword=）
#   GET  /api/monitor/points/{id}        单个点位详情
#   GET  /api/monitor/stats              看板统计
#   GET  /api/monitor/trend              24 小时振动趋势
#   GET  /api/alerts                     预警列表（?level= & ?handled=）
#   POST /api/alerts/{id}/handle         处理预警事件
#   POST /api/alerts/{id}/unhandle       撤销处置，恢复为未处理
#   GET  /api/news                       新闻动态
#   POST /api/contact                    提交咨询
#   GET  /api/contact                    查看咨询记录
# ============================================================
import logging
import os
import time
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

import storage
from common import AppError, fail
from routers import alerts, contact, monitor, news

# 端口保持 3000：让前端不用改配置；想改就设环境变量 PORT
PORT = int(os.getenv("PORT", "3000"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
logger = logging.getLogger("zhenanju")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """生命周期：启动时加载数据，关闭时打一行日志

    对应 Express 里「启动时一次性读进内存」那几行 readData()。
    FastAPI 推荐用 lifespan 而不是老式的 @app.on_event("startup")。
    """
    storage.load_all()
    logger.info(
        "数据加载完成：点位 %s 条 / 预警 %s 条 / 新闻 %s 条 / 咨询 %s 条",
        len(storage.points), len(storage.alerts), len(storage.news), len(storage.inquiries),
    )
    logger.info("数据目录：%s", storage.DATA_DIR)
    logger.info("允许的前端来源：%s", ", ".join(ALLOWED_ORIGINS) or "-")
    logger.info(
        "咨询记录查阅口令：%s",
        "已设置（需请求头 X-Admin-Token）" if os.getenv("ADMIN_TOKEN", "").strip() else "未设置（任何人可查）",
    )
    yield
    logger.info("服务已停止")


app = FastAPI(
    title="震安居后端接口",
    description="农村老旧房屋低成本微震动监测预警系统 —— FastAPI 实现，接口与 Express 版一一对应",
    version="1.1.0",
    lifespan=lifespan,
)

# ---------- 中间件 ----------
# 1) CORS：等价于 Express 的 app.use(cors())
#    本地开发默认放开全部来源；上线后用环境变量限定前端域名：
#    ALLOWED_ORIGINS=https://你的站点.netlify.app,http://localhost:5173
def _cors_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "*")
    origins = [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
    return origins or ["*"]


ALLOWED_ORIGINS = _cors_origins()
# Netlify 每次推送都会生成形如 https://deploy-preview-12--xxx.netlify.app 的预览域名，
# 想放行预览环境就设这个正则；不需要就留空
ALLOW_ORIGIN_REGEX = os.getenv("ALLOW_ORIGIN_REGEX") or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2) 访问日志：等价于 Express 里手写的那个 app.use((req,res,next)=>{...})
@app.middleware("http")
async def access_log(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    cost_ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s -> %s (%.1f ms)", request.method, request.url.path, response.status_code, cost_ms)
    return response


# ---------- 异常处理：把各种报错都收敛成 {code, msg, data} ----------
def friendly_message(errors: list[dict]) -> str:
    """把 Pydantic 的英文校验错误翻译成前端能直接弹 toast 的中文

    这样前端拦截器拿到的 msg 和 Express 版一模一样，
    不用去解析 FastAPI 默认的 {"detail": [...]} 结构。
    """
    for err in errors:
        field = (err.get("loc") or ("",))[-1]
        kind = err.get("type", "")

        if kind in ("missing", "string_too_short"):
            return "姓名、邮箱、咨询内容均为必填项"
        if kind == "string_pattern_mismatch" and field == "email":
            return "邮箱格式不正确"
        if kind == "string_too_long" and field == "content":
            return "咨询内容不能超过 500 字"
        if kind == "string_too_long" and field == "name":
            return "姓名不能超过 30 字"

    return "请求参数校验失败"


@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError):
    """业务异常（比如点位不存在），由接口里 raise AppError 触发"""
    return fail(exc.code, exc.msg)


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    """请求体/参数校验失败：默认返回 422 + detail 数组，这里统一成 400 + 中文 msg"""
    return fail(400, friendly_message(exc.errors()))


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(request: Request, exc: StarletteHTTPException):
    """FastAPI 自带的 HTTPException（如 405 方法不允许）也套上统一外壳"""
    return fail(exc.status_code, str(exc.detail))


@app.exception_handler(Exception)
async def handle_unknown_error(request: Request, exc: Exception):
    """兜底：任何没被接住的异常都返回 500，不把堆栈暴露给前端"""
    logger.exception("服务异常：%s", exc)
    return fail(500, "服务器内部错误")


# ---------- 路由注册 ----------
app.include_router(monitor.router)
app.include_router(alerts.router)
app.include_router(news.router)
app.include_router(contact.router)


# ---------- 健康检查 ----------
@app.get("/api/health", tags=["系统"], summary="服务健康检查")
def health():
    from datetime import datetime, timezone

    return {
        "code": 200,
        "msg": "success",
        "data": {
            "status": "running",
            "time": datetime.now(timezone.utc).isoformat(),
            "version": "1.1.0",
        },
    }


# ---------- 兜底 404：必须放在所有路由之后 ----------
@app.api_route(
    "/{full_path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    include_in_schema=False,
)
async def not_found(request: Request, full_path: str):
    """等价于 Express 最后的 app.use((req,res)=> fail(404, ...))"""
    return fail(404, f"接口不存在：{request.method} {request.url.path}")


if __name__ == "__main__":
    logger.info("震安居后端服务启动中：http://localhost:%s", PORT)
    uvicorn.run("main:app", host="0.0.0.0", port=PORT)
