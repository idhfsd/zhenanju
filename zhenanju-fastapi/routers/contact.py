# ============================================================
# 咨询表单接口
# 对照 Express 版 index.js 第 9 段
#
# 这里最能体现 FastAPI 的优势：请求体校验全交给 Pydantic，
# 函数体里只剩「造记录 + 存文件 + 返回」三件事。
# ============================================================
import time
from datetime import datetime

from fastapi import APIRouter, Depends

import storage
from common import ok, require_admin
from schemas import ContactIn

router = APIRouter(prefix="/api/contact", tags=["咨询表单"])


@router.post("", summary="提交咨询")
def create_inquiry(data: ContactIn):
    """data 已通过 Pydantic 校验（必填、邮箱格式、500 字上限），可以放心使用"""
    record = {
        "id": f"CQ-{int(time.time() * 1000)}",
        "name": data.name,
        "email": data.email,
        "content": data.content,
        "createdAt": datetime.now().strftime("%Y/%m/%d %H:%M:%S"),
    }

    storage.inquiries.insert(0, record)
    storage.save_inquiries()

    return ok(record, "提交成功，我们将尽快与您联系！")


@router.get("", summary="查看咨询记录", dependencies=[Depends(require_admin)])
def list_inquiries():
    """答辩时用来证明数据真的进了后端

    线上设置了 ADMIN_TOKEN 时，必须带请求头 X-Admin-Token 才能看，
    否则这里会把所有人的姓名、邮箱、咨询内容全部公开出去。
    """
    return ok({"total": len(storage.inquiries), "list": storage.inquiries})
