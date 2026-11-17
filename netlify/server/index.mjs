
import express from "express";
import cors from "cors";

import "../../zhenanju-server/index.js";

export const config = {
  includedFiles: [
    "../../zhenanju-server/data/**",
    "../../zhenanju-vue/dist/**"
  ]
};
