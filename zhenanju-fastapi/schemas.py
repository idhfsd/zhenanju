# ============================================================
# Pydantic 模型：负责"请求体校验"
# 对照 Express 版里手写的那段逻辑：
#   if (!nameStr || !emailStr || !contentStr) return fail(400, ...)
#   if (!EMAIL_RE.test(emailStr))              return fail(400, ...)
#   if (contentStr.length > 500)               return fail(400, ...)
#
# FastAPI 里这些校验交给 Pydantic 声明式完成，函数体里不用再写 if。
# ============================================================
from pydantic import BaseModel, ConfigDict, Field

# 和 Express 版同一条邮箱正则
EMAIL_PATTERN = r"^[\w.+-]+@[\w-]+\.[\w.-]+$"


class ContactIn(BaseModel):
    """POST /api/contact 的请求体"""

    # str_strip_whitespace：自动去掉首尾空格（等价于 JS 的 .trim()）
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_schema_extra={
            "example": {
                "name": "张工",
                "email": "zhang@zhenanju.com",
                "content": "我们村有 3 栋老屋想接入监测，怎么联系？",
            }
        },
    )

    name: str = Field(min_length=1, max_length=30, description="联系人姓名")
    email: str = Field(min_length=1, pattern=EMAIL_PATTERN, description="联系邮箱")
    content: str = Field(min_length=1, max_length=500, description="咨询内容，最多 500 字")


class HandleIn(BaseModel):
    """POST /api/alerts/{id}/handle 的请求体，可以不传"""

    model_config = ConfigDict(str_strip_whitespace=True)

    operator: str | None = Field(None, max_length=20, description="处置人，不传默认「系统管理员」")
