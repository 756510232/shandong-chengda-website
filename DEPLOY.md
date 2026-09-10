# 部署说明 — 山东诚达信息科技有限公司官网

> 部署方式：**GitHub Pages**（方案② · 免费 · 永久可访问 · 无需备案）

## 一、访问地址

| 类型 | 地址 |
|---|---|
| **官网站点** | https://756510232.github.io/shandong-chengda-website/ |
| **代码仓库** | https://github.com/756510232/shandong-chengda-website |

## 二、技术形态

- 纯静态站点：HTML + CSS + JS，无后端、无需编译
- 站点源：`main` 分支根目录 `/`（GitHub Pages legacy 模式自动构建）
- 已忽略 `.workbuddy/` 等工作目录，不会发布到线上

## 三、如何更新网站内容

改完本地文件后，在 `D:/山东诚达官方网站` 目录下执行：

```bash
git add -A
git commit -m "更新说明（如：修改首页文案）"
git push
```

推送后 GitHub Pages 会在 **1 分钟内** 自动重新构建并上线，无需其他操作。

## 四、更换默认域名（可选进阶）

当前是 `xxx.github.io` 默认域名，不够"企业感"。如需绑定自有域名（如 `chengda.com`）：

1. 购买域名并解析 CNAME 指向 `756510232.github.io`
2. 仓库 **Settings → Pages → Custom domain** 填入你的域名
3. 保存后等待 DNS 生效（几分钟到几小时）

> 注意：若要解析到**国内**服务器，则必须走方案③（国内服务器 + ICP 备案），GitHub Pages 服务器在境外，无法用于国内备案域名。

## 五、已知占位待替换

- 客服电话 `400-888-XXXX`、邮箱、办公地址、ICP 备案号 → 替换为实际信息
- 地图区域为装饰性占位 → 可接入高德/百度地图 API
- 联系表单采用「网站风格玻璃容器包裹 WPS 表单」方案（见 `contact.html` 的 `.form-embed-wrap`）→ WPS 表单直接内嵌于与全站一致的玻璃面板中，视觉融入周边环境，数据自动进入 WPS 表格后台，无需自建接口

## 六、如需升级为正式企业官网（方案③）

GitHub Pages 适合长期免费展示，但国内访问偏慢、非品牌域名。
若作为真正面向客户的官网运营，建议购买域名 + 国内云服务器 + ICP 备案，
届时本仓库文件无需改动，直接整体上传到目标服务器即可。

## 七、客户留资表单（网站风格容器内嵌 WPS 表单）

联系我们页的留资表单采用「**网站自有风格的玻璃容器包裹 WPS 表单**」方案：
外层标题、说明、边框均为网站视觉（深蓝+金、玻璃质感），内部直接嵌入 WPS 表单 iframe，访客在页面上即可填写，数据自动进入 WPS 表格后台。

- 容器结构：`contact.html` 中 `.form-embed-wrap`（`.wps-form-embed` 内为 WPS iframe，常驻加载）
- 当前嵌入表单：`https://f.kdocs.cn/g/QrfVAqFo/`（网站留资-收集表-收集表）
- 后台查看：登录 WPS / 金山文档 → 打开该收集表 → 查看提交记录与统计
- 更换表单：若新建 / 替换收集表，只需改 `contact.html` 里 `.wps-form-embed` 中 iframe 的 `src` 地址，重新 `git push` 即可
- ⚠️ 消除「登录提示」：若访客在 WPS 表单中看到要求登录，请在 **WPS 表单后台 → 该收集表设置 → 填写权限** 改为「所有人可填写（无需登录）」。此提示来自 WPS 表单自身设置，与网站代码无关
- 数据合规：WPS（金山）为国内服务，数据存于国内，符合车抵贷客户个人信息合规要求
- 兼容处理：`js/main.js` 中原有的 `FORM_ENDPOINT` 前端提交逻辑因表单元素已移除而自动跳过，无需改动


---

## 八、国内服务器部署（方案③ · 已落地 2026-09-11）

官网已额外部署到自有阿里云服务器，与「车惠融 AI 对接平台」共存、互不影响。

### 访问地址
| 类型 | 地址 |
|---|---|
| **官网（当前）** | http://106.14.224.121/chengda/ |
| 官网独立端口（需在阿里云安全组放行 8085） | http://106.14.224.121:8085/ |
| 车惠融平台（原有，未改动逻辑） | http://106.14.224.121/ |

### 服务器上的结构
- 站点文件：`/opt/chengda-website/www/`（index/about/services/contact + css/js/assets）
- 承载容器：`chengda-web`（nginx:1.27-alpine，`/opt/chengda-website/docker-compose.yml`）
- 接入方式：复用现有 `ai-finance-nginx`（80 端口），新增 `location /chengda/` 反代到 `chengda-web`
- 原配置备份：`/opt/ai-finance/nginx/nginx.conf.bak-<时间戳>`
- 已预留独立域名 server 块（`server_name chengda.example.com`），绑定域名后改写该行即可

### 绑定独立域名的步骤
1. DNS 把域名 A 记录解析到 `106.14.224.121`
2. 把 `/opt/ai-finance/nginx/nginx.conf` 中 `server_name chengda.example.com;` 改成真实域名
3. `docker exec ai-finance-nginx nginx -t && docker exec ai-finance-nginx nginx -s reload`

### 更新官网内容的步骤
```bash
# 本地改完后，把 www 目录同步到服务器
scp -r index.html about.html services.html contact.html css js assets root@106.14.224.121:/opt/chengda-website/www/
```
（静态文件无需重启容器，浏览器强刷即可看到更新）

---

## 九、备案信息 / 域名 / HTTPS（2026-09-11 更新）

### 已接入的备案信息（4 个页面页脚底部居中）
- **ICP 备案**：`鲁ICP备2026051648号-1` → 链接 `https://beian.miit.gov.cn`
- **公安备案**：`鲁公网安备37010302001862号` → 链接 `https://beian.mps.gov.cn/#/query/webSearch?code=37010302001862`

### 隐私清理（按需求）
- 全站移除：客服电话 `13188878975`、总部座机 `0531-XXXXXXXX`、地址「济南市天桥区鑫福盛大厦620室」
- 删除整块「全省服务网点」（济南总部 + 青岛/烟台/潍坊/临沂/菏泽分公司，实际并不存在）
- 联系页信息块只保留「电子邮箱 + 服务时间」；「到访须知/紧急联系」改为「办理须知/服务保障」

### SEO / 收录优化
- 每页新增：`canonical`、Open Graph 分享标签（含自动生成的 `assets/og-image.jpg` 1200×630 分享图）、`twitter:card`
- 新增 `robots.txt`、`sitemap.xml`
- 上线后建议：把 `https://aidaikuan.cn/sitemap.xml` 提交到百度搜索资源平台与 Google Search Console

### 域名与架构
- **官网域名**：`aidaikuan.cn` / `www.aidaikuan.cn` → 官网（nginx 按 `server_name` 分流）
- **车惠融平台**：仍走 IP 默认虚拟主机，逻辑零改动
- 官网新增安全响应头：`X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` / `Permissions-Policy` / `CSP`（放行金山表单 iframe）

### HTTPS 待办（需用户在阿里云控制台操作）
1. **DNS**：`aidaikuan.cn`、`www.aidaikuan.cn` A 记录 → `106.14.224.121`
2. **安全组放行 443**（建议同时放行 8086 备用）
3. 之后执行：certbot（webroot，镜像已就绪）+ chengda-web 监听 443 + 80→443 跳转

> 概念：80=HTTP 明文；443=HTTPS 加密。生产环境标准做法是 443 承接流量、80 只做 301 跳转。

---

## 十、方案 B 落地：官网与车惠融彻底隔离 + HTTPS 全站（2026-09-11）

### 最终架构
| 服务 | 地址 | 容器 | 端口 |
|---|---|---|---|
| **官网** | https://aidaikuan.cn （www 同） | `chengda-web` (nginx:1.27) | 80 / 443 |
| **车惠融 AI 平台** | https://aidaikuan.cn:8086 | `ai-finance-nginx` + `ai-finance-app` | 8086 |
| HTTP 80 | 全部 301 跳转 HTTPS | — | — |

### HTTPS
- Let's Encrypt 证书：`aidaikuan.cn` + `www.aidaikuan.cn`，有效期至 2026-12-09，自动续期
- 证书目录：`/opt/chengda-website/certbot/conf`（已挂载进两个 nginx 容器）
- 续期脚本：`/opt/chengda-website/renew-cert.sh`，cron `/etc/cron.d/chengda-renew`（每天 03:17 检查并热重载）
- 官网安全头：HSTS / X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy / CSP

### 车惠融迁移要点
- 由 `80` 迁到 `8086`（`-p 8086:443`，容器内监听 443 ssl），**app 代码未改动**
- `config/config.json` 的 `app.public_base_url` 已改为 `https://aidaikuan.cn:8086`（客户填单链接来源）
- app 容器启动参数增加 `--forwarded-allow-ips=*`，nginx `Host $http_host`，使 `request.base_url` 生成 `https://aidaikuan.cn:8086/...`
- 部署脚本 `scripts/deploy-standalone.sh` 已同步更新（含新端口 + 证书挂载 + uvicorn 参数）

### 旧链接兼容（重要）
原来发给客户/晴晴的 `http://106.14.224.121/form?token=...`、`/tap/check` 等，官网 nginx 已配置 301 自动跳转到 `https://aidaikuan.cn:8086/...`，**老链接不会失效**。

### 运维提醒
1. **改 `/opt/ai-finance/nginx/nginx.conf` 或 `/opt/chengda-website/nginx.conf` 时，务必用 `cat > 文件`（原地写入）而非 `sed -i`/scp 覆盖**——bind mount 绑定的是 inode，替换文件会让容器继续读旧内容（本次已踩坑）。
2. 车惠融后台 `/admin` 有口令登录，现已 HTTPS；建议再加 IP 白名单。