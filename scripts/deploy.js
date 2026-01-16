#!/usr/bin/env node

/**
 * 一键部署到 Cloudflare Pages
 * 使用方法: npm run deploy:cf
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 开始部署到 Cloudflare Pages...\n");

// 检查 .env 文件
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.warn("⚠️  警告: .env 文件不存在");
  console.log("💡 建议: 复制 .env.example 为 .env 并配置环境变量\n");
}

try {
  // 1. 构建
  console.log("📦 步骤 1/2: 构建静态文件...");
  execSync("npm run build", { stdio: "inherit" });

  // 2. 部署
  console.log("\n📤 步骤 2/2: 部署到 Cloudflare Pages...");
  execSync("npx wrangler pages deploy public --project-name=blog-hexo-cf", {
    stdio: "inherit",
  });

  console.log("\n✅ 部署成功!");
  console.log("🌐 访问你的站点: https://blog-hexo-cf.pages.dev\n");
} catch (error) {
  console.error("\n❌ 部署失败:", error.message);
  process.exit(1);
}
