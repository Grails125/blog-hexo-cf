<p align="center">
    <h1 align="center">Hexo Blog on Cloudflare</h1>
    <p align="center">基于 Cloudflare Pages 的现代化 Hexo 博客系统 🚀</p> 
    <p align="center">
        <a href="https://github.com/Grails125/blog-hexo-cf/blob/main/LICENSE" target="_blank">
            <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
        </a>    
        <a href="https://github.com/Grails125/blog-hexo-cf/releases" target="_blank">
            <img src="https://img.shields.io/github/v/release/Grails125/blog-hexo-cf" alt="releases" />
        </a>  
        <a href="https://github.com/Grails125/blog-hexo-cf/issues">
            <img src="https://img.shields.io/github/issues/Grails125/blog-hexo-cf" alt="issues" />
        </a>  
        <a href="https://github.com/Grails125/blog-hexo-cf/stargazers" target="_blank">
            <img src="https://img.shields.io/github/stars/Grails125/blog-hexo-cf" alt="stargazers" />
        </a>  
        <a href="https://github.com/Grails125/blog-hexo-cf/forks" target="_blank">
            <img src="https://img.shields.io/github/forks/Grails125/blog-hexo-cf" alt="forks" />
        </a>
    </p>
</p>

## 📖 项目简介

本项目基于 Hexo 静态博客生成器，部署到 Cloudflare Pages，集成 R2 对象存储和 KV 数据库，实现零成本或低成本运营。

## ✨ 功能特性

- **💰 低成本运营**：部署到 Cloudflare Pages，每月 100,000 次免费请求，适合个人博客

- **📝 在线编辑**：内置管理后台，支持 Markdown 实时编辑，无需本地环境

- **🎨 现代主题**：采用 Solitude 主题，响应式设计，支持暗色模式

- **☁️ 云端存储**：使用 R2 对象存储保存文章和图片，自动同步

- **🔐 安全认证**：JWT 身份验证，环境变量管理敏感信息

- **⚡ 性能优化**：代码压缩、图片懒加载，优化加载速度

- **🛠️ 开发体验**：ESLint + Prettier 代码规范，nodemon 热重载

- **📦 一键部署**：简化部署流程，一条命令发布到生产环境

## 🚀 快速开始

### 环境要求

- Node.js 22 或更高版本
- npm 或 yarn
- Cloudflare 账户

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/Grails125/blog-hexo-cf.git
cd blog-hexo-cf

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入配置

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:4000 预览博客

### 一键部署

```bash
# 1. 登录 Cloudflare (首次使用)
npx wrangler login

# 2. 一键部署到生产环境
npm run deploy:cf
```

## 📚 文档

- **[架构说明](docs/ARCHITECTURE.md)** - 技术栈、目录结构、数据流程
- **[开发指南](docs/DEVELOPMENT.md)** - 快速开始、常用命令、开发规范
- **[部署指南](docs/DEPLOY.md)** - 环境变量配置、部署步骤
- **[变更日志](docs/CHANGELOG.md)** - 版本历史与更新记录

## 🔧 技术栈

### 核心框架

- **[Hexo](https://hexo.io/)** - 静态博客生成器
- **[Solitude](https://docs.solitude.js.org/)** - 现代化博客主题
- **[Vue 3](https://vuejs.org/)** - 管理后台前端框架

### 平台服务

- **[Cloudflare Pages](https://pages.cloudflare.com/)** - 静态网站托管
- **[Cloudflare Functions](https://developers.cloudflare.com/pages/functions/)** - 无服务器API
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** - 键值存储
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** - 对象存储 (S3 兼容)

### 开发工具

- **[Express](https://expressjs.com/)** - 本地开发服务器
- **[ESLint](https://eslint.org/)** - 代码检查
- **[Prettier](https://prettier.io/)** - 代码格式化
- **[nodemon](https://nodemon.io/)** - 自动重启

## 📂 目录结构

```
blog-hexo-cf/
├── source/                 # 博客源文件
│   ├── _posts/            # 文章 Markdown
│   └── img/               # 图片资源
├── functions/              # Cloudflare Functions
│   ├── admin/             # 管理后台
│   │   ├── index.js       # 文章列表页面
│   │   └── editor.js      # 文章编辑器页面
│   └── api/               # RESTful API
│       ├── auth/          # 认证接口
│       ├── posts/         # 文章管理
│       ├── likes/         # 点赞功能
│       ├── stats/         # 统计数据
│       ├── meta.js        # 元数据接口
│       ├── rebuild.js     # 触发构建
│       └── upload.js      # 文件上传
├── admin/                  # 本地管理后台
│   └── server.js          # Express 服务器
├── tools/                  # 独立工具脚本
│   ├── download-r2-posts.js  # R2 同步
│   └── deploy.js          # 部署脚本
├── scripts/                # Hexo 插件脚本(自动加载)
├── docs/                   # 项目文档
│   ├── ARCHITECTURE.md    # 架构说明
│   ├── DEVELOPMENT.md     # 开发指南
│   ├── DEPLOY.md          # 部署指南
│   └── CHANGELOG.md       # 变更日志
├── .env.example           # 环境变量模板
├── _config.yml            # Hexo 主配置
├── _config.solitude.yml   # 主题配置
└── package.json           # 项目配置
```

## 🎯 常用命令

```bash
# 开发
npm run dev              # 开发服务器(含草稿)
npm run admin:dev        # 管理后台(热重载)

# 构建
npm run build            # 标准构建(仅Hexo)
npm run build:full       # 完整构建(含R2同步)
npm run clean            # 清理缓存

# 内容管理
npm run new              # 新建文章
npm run publish          # 发布草稿

# 代码质量
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化

# 部署
npm run deploy:cf        # 一键部署到 Cloudflare
```

## 🔑 环境变量

参考 `.env.example` 配置以下环境变量：

| 变量名                 | 说明                     |
| ---------------------- | ------------------------ |
| `R2_ACCOUNT_ID`        | Cloudflare 账户 ID       |
| `R2_ACCESS_KEY_ID`     | R2 访问密钥 ID           |
| `R2_SECRET_ACCESS_KEY` | R2 密钥                  |
| `ADMIN_PASSWORD_HASH`  | 管理员密码哈希           |
| `PORT`                 | 本地服务器端口(默认3000) |

## ⚙️ 配置文件

### 主要配置

| 文件                   | 说明       | 主要配置项                |
| ---------------------- | ---------- | ------------------------- |
| `_config.yml`          | Hexo主配置 | 站点信息、URL、主题、插件 |
| `_config.solitude.yml` | 主题配置   | 导航菜单、外观、功能模块  |

### 快速配置

**修改博客信息:**

```yaml
# _config.yml
title: 你的博客名
author: 你的名字
url: https://your-domain.com
```

**修改导航菜单:**

```yaml
# _config.solitude.yml
nav:
  menu:
    首页: /
    归档: /archives/
    标签: /tags/
```

**启用代码压缩:**

```yaml
# _config.yml (已配置)
minify:
  html/css/js: enable: true
```

详细配置说明请查看 [架构文档](docs/ARCHITECTURE.md#配置文件说明)

## 📝 许可证

本项目采用 [MIT](LICENSE) 许可证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐

## 📧 联系方式

- GitHub Issues: [提交问题](https://github.com/Grails125/blog-hexo-cf/issues)
