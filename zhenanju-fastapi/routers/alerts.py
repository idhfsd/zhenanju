# ============================================================
# 预警事件接口
# 对照 Express 版 index.js 第 6~7 段
#
# 重点：一个是 GET 带筛选参数，一个是 POST 路径参数 + 请求体，
# 正好覆盖 FastAPI 教程的「查询参数」「路径参数」「请求体」三章。
# ============================================================
from datetime import datetime

from fastapi import APIRouter, Query

import storage
from common import AppError, ok
from schemas import HandleIn

router = APIRouter(prefix="/api/alerts", tags=["预警事件"])


@router.get("", summary="预警事件列表")
def list_alerts(
    level: str | None = Query(None, description="danger / warning / info"),
    handled: str | None = Query(None, description="true 只看已处置 / false 只看待处理"),
):
    items = list(storage.alerts)

    if level and level != "all":
        items = [a for a in items if a["level"] == level]

    if handled in ("true", "false"):
        target = handled == "true"
        items = [a for a in items if bool(a.get("handled")) == target]

    return ok({"total": len(items), "list": items})


@router.post("/{alert_id}/handle", summary="处理预警事件")
def handle_alert(alert_id: str, payload: HandleIn | None = None):
    """把 handled 置为 True 并落盘

    payload 类型是 Pydantic 模型，FastAPI 会自动解析 JSON 请求体；
    默认 None 表示这个请求可以不带 body（和 Express 版的容错一致）。
    """
    found = next((a for a in storage.alerts if a["id"] == alert_id), None)
    if found is None:
        raise AppError(404, f"预警 {alert_id} 不存在")

    found["handled"] = True
    found["handledAt"] = datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    found["handledBy"] = (payload.operator if payload and payload.operator else "") or "系统管理员"

    storage.save_alerts()  # 落盘，重启服务后处置状态还在
    return ok(found, "预警已处理")


@router.post("/{alert_id}/unhandle", summary="撤销处置，恢复为未处理")
def unhandle_alert(alert_id: str):
    """把 handled 置回 False，并清掉处置人和处置时间

    对应前端弹窗里的「恢复为未处理」按钮。
    写入磁盘失败时要把内存里的状态回滚，否则接口报错了但页面看着已经改了。
    """
    found = next((a for a in storage.alerts if a["id"] == alert_id), None)
    if found is None:
        raise AppError(404, f"预警 {alert_id} 不存在")

    # 先存一份原状态，写盘失败时用
    backup = {key: found.get(key) for key in ("handled", "handledAt", "handledBy")}

    found["handled"] = False
    found.pop("handledAt", None)
    found.pop("handledBy", None)

    if not storage.save_alerts():
        for key, value in backup.items():
            if value is None:
                found.pop(key, None)
            else:
                found[key] = value
        raise AppError(500, "恢复失败：数据写入异常")

    return ok(found, "预警已恢复为未处理")
