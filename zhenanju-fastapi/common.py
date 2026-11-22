# ============================================================
# 统一响应格式与业务异常
# 对照 Express 版 index.js 里的 ok() / fail() 两个小函数
#
# 为什么保留 {code, msg, data}？
#   前端 src/api/request.js 的拦截器是按 body.code === 200 判断成功的，
#   所以后端换语言，响应"外壳"必须保持一致，前端才一行都不用改。
# ============================================================
from fastapi import Header
from fastapi.responses import JSONResponse
import hmac
import os


def ok(data=None, msg: str = "success"):
    """成功响应：直接返回 dict，FastAPI 会自动转成 JSON"""
    return {"code": 200, "msg": msg, "data": data}


def fail(code: int, msg: str) -> JSONResponse:
    """失败响应：HTTP 状态码和 body.code 保持一致（400/404/500）"""
    return JSONResponse(
        status_code=code,
        content={"code": code, "msg": msg, "data": None},
    )


class AppError(Exception):
    """业务异常：在接口里 raise，由 main.py 的异常处理器统一转成 fail() 格式

    用法：raise AppError(404, f"点位 {point_id} 不存在")
    好处：接口函数里不用层层 return 错误响应，逻辑更干净。
    """

    def __init__(self, code: int, msg: str):
        self.code = code
        self.msg = msg
        super().__init__(msg)


# ---------- 鉴权：保护含个人信息的接口 ----------
def require_admin(
    x_admin_token: str | None = Header(
        None,
        description="管理口令；服务端设置 ADMIN_TOKEN 后必须携带，值为该口令",
    ),
) -> None:
    """简易口令校验，等价于 Express 里一个 auth 中间件

    - 没设 ADMIN_TOKEN 时直接放行 —— 本地演示不用配任何东西，答辩照常能查记录
    - 线上设了就要求请求头 X-Admin-Token 与之一致
    - 用 hmac.compare_digest 逐字节比较，避免被"按字符逐位试"的计时攻击猜出口令
    """
    expected = os.getenv("ADMIN_TOKEN", "").strip()
    if not expected:
        return

    if not hmac.compare_digest(x_admin_token or "", expected):
        raise AppError(403, "无权查看咨询记录")
