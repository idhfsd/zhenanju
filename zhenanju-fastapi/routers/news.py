# ============================================================
# 新闻动态接口
# 对照 Express 版 index.js 第 8 段
# ============================================================
from fastapi import APIRouter

import storage
from common import ok

router = APIRouter(prefix="/api/news", tags=["新闻动态"])


@router.get("", summary="新闻动态列表")
def list_news():
    return ok({"total": len(storage.news), "list": storage.news})
