# ============================================================
# 数据层：用 JSON 文件当"数据库"
# 对照 Express 版 index.js 的 readData() / writeData() + 四个内存变量
#
# Express 的写法：启动时读进内存 -> 读请求查内存 -> 写请求落盘
# Python 这里用同样的策略，只是把"同步读写文件"换成了 pathlib + json。
# ============================================================
import json
import os
import threading
from pathlib import Path

# __file__ 是当前文件路径，parent 就是 zhenanju-fastapi/ 目录
# 上线后如果挂了持久化磁盘，只要设环境变量 DATA_DIR=/var/data 就能换目录，不用改代码
DATA_DIR = Path(os.getenv("DATA_DIR") or (Path(__file__).parent / "data"))

# 写文件时加锁：避免两个请求同时写同一个 JSON 导致内容写坏
_lock = threading.Lock()

# 模块级"内存缓存"，由 load_all() 在服务启动时填充
points: list[dict] = []
alerts: list[dict] = []
news: list[dict] = []
inquiries: list[dict] = []


def _read(file_name: str, fallback):
    """读 JSON 文件；文件不存在或格式坏了就返回兜底值，不让服务启动失败"""
    file_path = DATA_DIR / file_name
    try:
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:  # noqa: BLE001 —— 演示项目，读失败就告警 + 兜底
        print(f"读取 {file_name} 失败，使用默认值：{exc}")
        return fallback


def _write(file_name: str, data) -> bool:
    """写 JSON 文件：ensure_ascii=False 才能让中文正常显示，而不是转义成 \\uXXXX

    上线环境（比如只读文件系统、或容器里的临时目录）可能写不进去。
    这里只打日志、不让请求崩掉，返回 False 让调用方自己决定要不要回滚内存状态。
    """
    file_path = DATA_DIR / file_name
    try:
        with _lock:
            with file_path.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except OSError as exc:
        print(f"写入 {file_name} 失败（当前环境可能不可写）：{exc}")
        return False


def load_all() -> None:
    """服务启动时调用一次：把 4 个文件读进内存"""
    global points, alerts, news, inquiries
    points = _read("points.json", [])
    alerts = _read("alerts.json", [])
    news = _read("news.json", [])
    inquiries = _read("inquiries.json", [])


def save_alerts() -> bool:
    """预警被处置/恢复后落盘，重启服务状态还在"""
    return _write("alerts.json", alerts)


def save_inquiries() -> bool:
    """新咨询提交后落盘"""
    return _write("inquiries.json", inquiries)
