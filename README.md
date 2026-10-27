# 游戏攻略站模板（Cloudflare Workers）

Next.js 15 App Router + next-intl + MDX + Tailwind + shadcn/ui 的多语言游戏 wiki 模板。
`output: "export"` 静态导出到 `out/`，通过 wrangler 部署到 Cloudflare Workers。

模板本身不属于任何具体游戏：站名、链接、首页文案都是 `Example Game` 占位，`content/` 为空。
**不要在模板里开发具体游戏**；用 `git clone` 到 `sites/<slug>/` 建站（保留历史，便于以后合并模板更新）。

## URL 约定

- `localePrefix: "always"`、`localeDetection: false`：所有页面都带语言前缀，英语页面为 `/en/...`。
- 部署工作流会把 `out/en/index.html` 复制到 `out/index.html`，让根路径直接显示英语首页。
- canonical、hreflang、sitemap、JSON-LD 和站内链接都经过 `src/i18n/paths.ts` 生成，不要手写 `/${locale}/...`。
- 另一个模板 `site-template-docker` 使用 `as-needed`（英语不带前缀），页面代码共用同一套 `paths.ts`，差异只在 `src/i18n/routing.ts` 的 `LOCALE_PREFIX`。

## 新站替换清单

| 位置 | 需要替换的内容 | 数据来源 |
|------|----------------|----------|
| `src/config/site.ts` | `links`（官网/Discord/YouTube/社区工具）、`youtubeVideoId`、`themeColor`、`paths`（首页 CTA 指向的页面） | P1 |
| `src/locales/en.json` | `site`（名称、简称、wikiName、logo 缩写）、`metadata`（全站默认 SEO）、`nav`、`home.*`、`footer.*`、`sidebarCodes` | P1 / P2 |
| `src/locales/<其他语言>.json` | 只需写要覆盖的键，缺失键自动回退英文；新增语言见 `src/i18n/routing.ts` 注释 | 翻译 |
| `src/config/navigation.ts` | 内容分类（`key` / `path`），与 `content/{locale}/{category}/` 目录一致 | P4 |
| `src/app/globals.css` | `--nav-theme` / `--nav-theme-light` 主题色 | P1 |
| `public/` | `favicon*`、`apple-touch-icon.png`、`android-chrome-*.png`、`images/hero.webp`（1200x630）、`images/hero-trailer-thumbnail.jpg`（1280x720）。当前均为占位图 | P1 |
| `wrangler.jsonc` | `name`、`routes[].pattern`（自定义域名） | 域名 |
| `package.json` | `name` | slug |
| GitHub 仓库 | Variables：`NEXT_PUBLIC_SITE_URL`；Secrets：见下表 | — |
| `content/` | 放入 `seoscout` 产出的 MDX | seoscout |

可选项缺失时入口会自动隐藏：`links.*` 为空不显示对应链接，`youtubeVideoId` 为空不显示 trailer，`sidebarCodes` 为空不显示侧栏兑换码。
站点域名不写在代码里，只来自 `NEXT_PUBLIC_SITE_URL`。

替换后运行 `npm run check:site`（需设置 `NEXT_PUBLIC_SITE_URL`），它会检查：占位内容是否残留、`wrangler.jsonc` 是否替换、`nav.*` 翻译键是否齐全、`home.explore.modules[].href` 与 `site.ts` 的 `paths` 是否指向真实页面、`content/` 目录与导航分类是否一致。部署工作流会在构建前自动执行该检查，所以模板仓库自身不会部署。

## 环境变量

见 `.env.example`。本地开发复制为 `.env.local`；CI 中 `NEXT_PUBLIC_SITE_URL` 来自仓库 Variables，其余来自 Secrets。

| 变量 | 作用 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 站点正式域名（含协议，无尾斜杠）；缺失时回退 `https://example.com` 并在构建日志警告 |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` / `NEXT_PUBLIC_MICROSOFT_CLARITY_ID` | GA4 / Clarity，未设置则不加载 |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | AdSense 脚本、`google-adsense-account` meta 与 `/ads.txt` |
| `NEXT_PUBLIC_AD_*`、`NEXT_PUBLIC_ADSTERRA_NATIVE_HOST` | 各尺寸广告位；未设置则不渲染 |

## 开发

```bash
npm install
npm run dev            # 本地开发
npm run build          # 静态导出到 out/
npm run lint           # tsc + next lint
npm run check:site     # 上线前检查
```

部署：在 GitHub Actions 手动触发 `Build and Deploy to Cloudflare Workers`，需要 Secrets `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

## 内容与导航约定

- 文章：`content/{locale}/{category}/*.mdx`，头部 `export const metadata = { title, description, category, date, lastModified?, image?, badge?, summary? }`。
- 新增/删除分类：改 `src/config/navigation.ts`，同步 `nav.<key>` 翻译；需要自定义列表页标题时，在语言文件加 `"<category>": { "overviewTitle", "overviewDescription" }`，否则用目录名转 Title Case。
- 侧栏分组标题的多语言映射在 `src/lib/content.ts` 的 `GROUP_TITLES*`，未列出的分类自动用目录名。
- `content/` 必须存在（可以只有 `.gitkeep`），否则 MDX 动态导入在构建时找不到目录。

## 合并模板更新

站点仓库通过 `git fetch template && git merge template/main` 获取通用改进。`content/`、`src/locales/`、`src/config/site.ts`、`wrangler.jsonc`、`public/` 冲突时保留站点版本。
