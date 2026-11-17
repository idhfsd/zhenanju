// ============================================
// 模拟数据文件
// 说明：真实项目中，这些数据应由后端 API 返回（如 /api/monitor-points）。
// 前端只用 mock 数据演示，未来把「静态导入」替换为「axios/fetch 请求」即可。
// ============================================

// 监测点位列表（status: normal=正常 / warning=预警 / danger=危险）
export const monitorPoints = [
  { id: 'ZJ-001', name: '西渡镇槐花村李家老宅', address: '西渡镇·槐花村', status: 'normal', battery: 87, signal: 92, vibration: 0.06, tilt: 0.08, lastUpdate: '10:25:31' },
  { id: 'ZJ-002', name: '洪市镇杨村陈氏老屋', address: '洪市镇·杨村', status: 'normal', battery: 76, signal: 85, vibration: 0.09, tilt: 0.11, lastUpdate: '10:25:28' },
  { id: 'ZJ-003', name: '三湖镇龟石村刘家祖屋', address: '三湖镇·龟石村', status: 'warning', battery: 42, signal: 78, vibration: 0.35, tilt: 0.42, lastUpdate: '10:24:59' },
  { id: 'ZJ-004', name: '渣江镇秋夏村王宅', address: '渣江镇·秋夏村', status: 'normal', battery: 91, signal: 95, vibration: 0.05, tilt: 0.06, lastUpdate: '10:25:33' },
  { id: 'ZJ-005', name: '金溪镇登山村赵家老宅', address: '金溪镇·登山村', status: 'danger', battery: 63, signal: 71, vibration: 0.78, tilt: 0.95, lastUpdate: '10:24:12' },
  { id: 'ZJ-006', name: '岘山镇白竹村周氏老屋', address: '岘山镇·白竹村', status: 'normal', battery: 82, signal: 88, vibration: 0.07, tilt: 0.09, lastUpdate: '10:25:26' },
  { id: 'ZJ-007', name: '井头镇青山村冯家老宅', address: '井头镇·青山村', status: 'normal', battery: 68, signal: 90, vibration: 0.08, tilt: 0.10, lastUpdate: '10:25:20' },
  { id: 'ZJ-008', name: '曲兰镇太平村唐家祖屋', address: '曲兰镇·太平村', status: 'warning', battery: 51, signal: 80, vibration: 0.28, tilt: 0.31, lastUpdate: '10:23:47' }
]

// 预警事件列表（level: danger=红色紧急 / warning=橙色预警 / info=蓝色提示）
export const alertEvents = [
  { id: 'AL-1024', time: '2026-10-25 10:24', level: 'danger', point: '金溪镇登山村赵家老宅', message: '墙体振动幅度超过阈值，疑似异常施工或结构松动，已触发短信+广播三级预警。' },
  { id: 'AL-1023', time: '2026-10-25 10:21', level: 'warning', point: '三湖镇龟石村刘家祖屋', message: '墙体倾斜角连续升高，超过黄色预警线，请网格员上门复核。' },
  { id: 'AL-1022', time: '2026-10-25 09:58', level: 'warning', point: '曲兰镇太平村唐家祖屋', message: '设备电池电量低于 60%，建议安排更换电池。' },
  { id: 'AL-1021', time: '2026-10-25 08:30', level: 'info', point: '系统公告', message: '震安居平台例行巡检完成，全部点位运行正常。' }
]

// 新闻动态列表
export const newsList = [
  { id: 1, date: '2026-10-18', tag: '项目动态', title: '震安居系统在衡阳县完成首期 300 户试点部署', summary: '首期试点覆盖 5 个乡镇，系统上线两周即预警 2 起潜在风险，获当地住建部门好评。' },
  { id: 2, date: '2026-10-02', tag: '技术进展', title: '轻量化算法模型迭代至 v2.3，误报率下降 35%', summary: '新模型针对砖木结构优化特征提取，边缘端推理耗时降低 40%。' },
  { id: 3, date: '2026-09-15', tag: '行业动态', title: '农村住房安全监测迎来政策窗口期', summary: '多部门发文要求加强农村自建房安全监管，低成本监测设备需求快速增长。' },
  { id: 4, date: '2026-08-28', tag: '团队故事', title: '驻村调研：我们走过了 21 个村', summary: '项目团队历时三个月走访 21 个行政村，与 300 余位村民面对面交流需求。' }
]
