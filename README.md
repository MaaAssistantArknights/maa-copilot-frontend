# maa-copilot-frontend

MAA 作业站前端！

## 开发流程

后端接口文档：https://maa-docker.kkdy.tech/swagger-ui/index.html

该仓库的主分支为 `dev`，线上分支为 `main`，代码合并到 `main` 后将会自动部署到线上

在自己的 fork 上开发完成后请提交 PR 到 `dev` 分支，由管理员合并

如果有该仓库的权限，可以直接在 `dev` 分支上开发，需要上线时提交 PR 到 `main` 分支，并等待其他成员的 review

## 环境变量

环境变量定义在 `.env` `.dev.development` 文件内

你可以创建 `.env.development.local` 文件来覆盖环境变量，优先级为 `.env.development.local` > `.env.development` > `.env`

## 命令

安装依赖

```bash
yarn
```

运行开发服务器

```bash
yarn dev
```

本地构建

```bash
yarn build
```

Lint fix

```bash
yarn lint:fix
```

## Join us!

QQ Group: 724540644
