
import "../../zhenanju-server/index.js";

// 将运行时需要读取的 JSON 数据和前端构建文件
// 一起纳入 Netlify Server 部署包
export const config = {
  includedFiles: [
    "../../zhenanju-server/data/**",
    "../../zhenanju-vue/dist/**"
  ]
};
