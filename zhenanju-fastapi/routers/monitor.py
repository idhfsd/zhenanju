# ============================================================
# 监测相关接口
# 对照 Express 版 index.js 第 2~5 段
#
# 这里集中演示 FastAPI 教程里的两个核心概念：
#   1. 查询参数（Query）：/api/monitor/points?status=warning&keyword=三湖
#   2. 路径参数（Path）：/api/monitor/points/ZJ-005
# ============================================================
import random
from datetime import datetime

from fastapi import APIRouter, Query

import storage
from common import AppError, ok

# prefix 统一加前缀，下面写路径时就不用重复 /api/monitor
router = APIRouter(prefix="/api/monitor", tags=["监测点位"])

# 24 小时基准曲线（真实场景由传感器上报，这里模拟）
BASE_CURVE = [
    0.10, 0.08, 0.09, 0.07, 0.06, 0.05, 0.06, 0.08,
    0.12, 0.18, 0.15, 0.11, 0.09, 0.10, 0.14, 0.22,
    0.18, 0.13, 0.10, 0.08, 0.07, 0.06, 0.05, 0.06,
]
THRESHOLD = 0.5  # 三级预警阈值 mm/s


@router.get("/points", summary="监测点位列表")
def list_points(
    status: str | None = Query(
        None, description="normal / warning / danger；传 all 或不传表示全部"
    ),
    keyword: str | None = Query(None, description="按名称、地址、编号模糊搜索"),
):
    """相当于 Express 的 app.get('/api/monitor/points', ...)

    FastAPI 会自动把 ?status=xxx&keyword=yyy 解析成函数参数，
    还会顺带做类型转换和文档，不用再手动读 req.query。
    """
    items = list(storage.points)

    if status and status != "all":
        items = [p for p in items if p["status"] == status]

    if keyword:
        kw = keyword.strip().lower()
        items = [
            p
            for p in items
            if kw in p["name"].lower() or kw in p["address"].lower() or kw in p["id"].lower()
        ]

    return ok({"total": len(items), "list": items})


@router.get("/points/{point_id}", summary="单个点位详情")
def get_point(point_id: str):
    """路径参数 point_id 会自动从 URL 里取出来，不需要 req.params.id"""
    for p in storage.points:
        if p["id"] == point_id:
            return ok(p)

    raise AppError(404, f"点位 {point_id} 不存在")


@router.get("/stats", summary="看板统计")
def get_stats():
    total = len(storage.points)
    if total == 0:
        return ok({"total": 0, "normal": 0, "warning": 0, "danger": 0, "avgBattery": 0, "avgSignal": 0})

    return ok({
        "total": total,
        "normal": len([p for p in storage.points if p["status"] == "normal"]),
        "warning": len([p for p in storage.points if p["status"] == "warning"]),
        "danger": len([p for p in storage.points if p["status"] == "danger"]),
        # 平均电量、平均信号：要看板顶部辅助指标
        "avgBattery": round(sum(p["battery"] for p in storage.points) / total, 1),
        "avgSignal": round(sum(p["signal"] for p in storage.points) / total, 1),
    })


@router.get("/trend", summary="24 小时振动趋势")
def get_trend():
    hours = [f"{i:02d}:00" for i in range(24)]
    # 在基准值上叠加 ±0.02 的随机抖动，模拟实时上报
    values = [round(v + (random.random() - 0.5) * 0.04, 3) for v in BASE_CURVE]

    return ok({
        "unit": "mm/s",
        "threshold": THRESHOLD,
        "hours": hours,
        "values": values,
        "updatedAt": datetime.now().strftime("%H:%M:%S"),
    })
