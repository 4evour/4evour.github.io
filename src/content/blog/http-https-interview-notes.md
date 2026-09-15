---
title: "计算机网络八股 · HTTP 与 HTTPS 篇"
description: "按问题、标准回答、讲解和追问整理 HTTP 与 HTTPS 面试复习内容。"
pubDate: 2026-08-17
tags: ["HTTP", "HTTPS", "计算机网络", "面试"]
category: tech
featured: false
coverTone: violet
draft: false
---
# 计算机网络八股 · HTTP 与 HTTPS 篇

> 面试前快速复习版。每节按“问题 → 标准回答 → 讲解 → 追问”展开，不按 PDF 页数切题；导入 Notion 后可按实际版式分页。

---

## 1｜问题：HTTP 报文、方法和状态码怎么理解？

### 面试标准回答

> HTTP 请求由请求行、Header 和可选 Body 组成，响应由状态行、Header 和可选 Body 组成。方法说明客户端想做什么，状态码说明服务端处理结果。GET、HEAD、OPTIONS 是安全方法；PUT、DELETE 在协议语义上幂等，POST 不保证幂等。

### 讲解

```text
GET /users/42 HTTP/1.1          HTTP/1.1 200 OK
Host: api.example.com           Content-Type: application/json
Accept: application/json        Content-Length: ...

                                {"id":42}
```

安全表示客户端没有请求修改服务端状态，不代表没有日志等副作用；幂等表示同一请求执行多次，预期业务效果和执行一次相同。状态码按结果分组：`2xx` 成功，`3xx` 重定向或缓存，`4xx` 请求侧问题，`5xx` 服务端或上游问题。

| 易混状态码 | 区别 |
|---|---|
| 401 / 403 | 需要认证 / 已理解但拒绝授权 |
| 301 / 308 | 都是永久重定向，308 明确保留原方法 |
| 502 / 504 | 网关收到无效上游响应 / 等待上游超时 |

### 追问

- **GET 和 POST 的核心区别？**是协议语义，不是“参数在 URL 还是 Body”。
- **POST 如何实现幂等？**用业务唯一键、幂等键、唯一约束或状态机限制重复效果。

---

## 2｜问题：HTTP 强缓存和协商缓存怎么工作？

### 面试标准回答

> 浏览器先看响应是否仍在 `Cache-Control: max-age` 的新鲜期内，命中就直接使用。过期后携带 `If-None-Match` 或 `If-Modified-Since` 验证；资源没变，服务端返回不带正文的 `304`，变化则返回新的 `200` 和内容。

### 讲解

```text
首次请求 ──> 200 + 内容 + Cache-Control + ETag
新鲜期内 ──> 直接使用本地内容
过期后   ──> If-None-Match: "v1"
             ├─ 未变化：304，复用缓存正文
             └─ 已变化：200 + 新正文 + 新 ETag
```

`no-cache` 允许存储，但复用前必须验证；`no-store` 才是禁止存储。带内容哈希的静态资源适合长 `max-age`，更新时更换 URL；HTML 入口常设较短缓存或用 ETag 验证。

### 追问

- **ETag 和 Last-Modified 怎么选？**ETag 表示资源版本，通常更精确；时间验证会受时间精度影响。
- **304 有响应体吗？**没有资源正文，客户端继续使用缓存内容。

---

## 3｜问题：HTTP/1.1 到 HTTP/2 解决了什么？

### 面试标准回答

> HTTP/1.1 用持久连接减少重复建立 TCP 的成本，但管线化响应仍要按请求顺序返回。HTTP/2 把消息拆成带 Stream ID 的二进制帧，多条请求和响应可在同一 TCP 连接中交错传输，并用 HPACK 压缩 Header。它解决了 HTTP 层排队，TCP 丢包仍会阻塞连接上的所有流。

### 讲解

```text
HTTP/1.1：请求 A ───── 响应 A ── 请求 B ── 响应 B

HTTP/2：  [A头][B头][A数据][C头][B数据][A数据]
           同一条 TCP，按 Stream ID 重组
```

持久连接省掉重复握手，HTTP/2 的分帧再让多个消息交错前进。底层依然是一条有序 TCP 字节流：前面的 TCP 段丢失时，后续字节即使到达，也不能越过缺口交给 HTTP/2。

### 追问

- **HTTP Keep-Alive 和 TCP Keepalive 一样吗？**前者复用 HTTP 连接，后者探测空闲 TCP 对端是否存活。
- **HTTP/2 彻底解决队头阻塞了吗？**只解决 HTTP 层排队，没有消除 TCP 层跨流阻塞。

---

## 4｜问题：HTTP/3 和 QUIC 解决了什么？

### 面试标准回答

> HTTP/3 运行在基于 UDP 的 QUIC 上。QUIC 自行实现可靠传输、多路流和拥塞控制，并集成 TLS 1.3；一个流丢包不会阻止其他流前进。它还用连接 ID 标识连接，网络切换后不必只因 IP、端口变化就重建连接。

### 讲解

```text
HTTP/2：多个流 → 一条 TCP 字节流
                    一个缺口，所有流等待

HTTP/3：Stream A ── 丢包，只等待 A
         Stream B ───────── 正常前进
```

QUIC 把可靠顺序限制在单个流内，消除了跨流的传输层队头阻塞，同一流内部仍要等待缺失数据。恢复连接时可以尝试 0-RTT，但早期数据存在重放风险，只适合允许安全重复执行的请求。

### 追问

- **基于 UDP 为什么还能可靠？**可靠性由 QUIC 在 UDP 之上实现。
- **切换 Wi-Fi 为什么可能不断连？**QUIC 用连接 ID 识别连接，不只依赖网络四元组。

---

## 5｜问题：HTTPS 和 TLS 1.3 握手怎么工作？

### 面试标准回答

> HTTPS 用 TLS 提供机密性、完整性和服务端身份认证。TLS 1.3 中，客户端用 ClientHello 发送参数和密钥份额；服务端返回自己的密钥份额、证书、证书签名和 Finished。客户端验证证书链、域名和签名后，双方从密钥交换结果导出对称会话密钥，再传输 HTTP 数据。

### 讲解

```text
客户端                                      服务端
ClientHello + key_share ──────────────────>
                     <── ServerHello + key_share
                     <── Certificate + 签名 + Finished
验证证书链、域名、有效期和签名
Finished ─────────────────────────────────>
          后续 HTTP 数据用对称密钥保护
```

证书把站点身份和公钥绑定起来，CertificateVerify 证明服务端持有对应私钥。临时密钥交换建立共享秘密，后续用对称 AEAD 加密并校验数据：非对称机制负责认证和建钥，对称算法负责高效传输。完整 TLS 1.3 握手通常用一个 RTT。

### 追问

- **证书里有私钥吗？**没有，证书包含公钥和身份信息，私钥由服务端保管。
- **HTTPS 能防所有攻击吗？**不能，它保护传输链路，不能修复服务端漏洞或阻止用户访问钓鱼域名。

---

## 6｜问题：Cookie、Session、Token 和 JWT 怎么区分？

### 面试标准回答

> Cookie 是浏览器存储并按规则自动携带数据的机制；Session 是服务端保存的登录状态，Cookie 常只存 Session ID；Token 是客户端主动提交的访问凭证。JWT 是一种可自包含的 Token 格式，常见 JWS 只有签名，没有加密，Payload 拿到就能读。

### 讲解

```text
Session：Cookie(session_id) ──> 服务端查询会话
Token：  Authorization: Bearer xxx ──> 服务端验证凭证
JWT：    header.payload.signature
         前两段可读       签名防篡改
```

Session 便于集中撤销，但要保存服务端状态；自包含 Token 减少集中查询，立即注销和权限变更却更麻烦。Cookie 的 `Secure`、`HttpOnly`、`SameSite` 分别限制安全连接发送、脚本读取和跨站携带，不能互相替代。JWT 验签后还要检查 `exp`、`iss`、`aud` 和业务权限。

### 追问

- **JWT 为什么不是加密？**常见 Header 和 Payload 只是 Base64URL 编码，签名只负责防篡改和验证来源。
- **Token 一定放 Cookie 吗？**不一定，也可以放在 Authorization Header 中。

---

## 7｜问题：WebSocket 和长轮询怎么选？

### 面试标准回答

> 双方需要频繁、低延迟地互发消息时适合 WebSocket，例如聊天和协作编辑；更新很少或基础设施只支持普通 HTTP 时，长轮询更简单。WebSocket 建连后的报文开销较低，但要额外处理心跳、重连、消息确认和连接扩容。

### 讲解

```text
长轮询：客户端请求 ── 等待 ── 服务端响应 ── 再次请求

WebSocket：HTTP Upgrade ── 101 Switching Protocols
           客户端 <══════ 全双工帧 ══════> 服务端
```

经典 WebSocket 先借 HTTP/1.1 Upgrade 完成握手，之后在一条连接上双向传输帧。大量长连接会持续占用文件描述符、网关连接和心跳流量，消息很少时未必比长轮询划算。

### 追问

- **WebSocket 天然保证业务消息不丢吗？**不保证，断线补发、确认、顺序和幂等仍由业务设计。
- **为什么要心跳？**用于发现断网、进程退出或被代理回收的半开连接。

---

## 8｜问题：输入 URL 到页面显示，发生了什么？

### 面试标准回答

> 浏览器解析 URL 并检查缓存，再通过 DNS 得到 IP；随后建立 TCP 与 TLS，或直接建立 QUIC，并发送 HTTP 请求。请求经过 CDN、网关和应用得到响应后，浏览器解析 HTML、CSS，执行脚本和加载子资源，最后完成布局、绘制与合成。

### 讲解

```text
解析 URL / 检查缓存
        ↓
DNS → IP → 路由与下一跳
        ↓
TCP + TLS，或 QUIC
        ↓
HTTP → CDN / 网关 / 应用
        ↓
DOM + CSSOM → 渲染树 → 布局 → 绘制 → 合成
```

排查慢请求也按这条时间线拆：DNS 慢看解析器，连接慢看距离、路由和丢包，TTFB 高查 CDN、网关、应用与数据库，下载慢看体积和带宽，渲染慢再看脚本长任务、阻塞资源与频繁布局。

### 追问

- **HTTP/3 还需要 TCP 握手吗？**不需要，它通过 QUIC 建连并集成 TLS 1.3。
- **接口快但页面仍卡？**检查主线程长任务、阻塞资源、布局抖动和子资源依赖。
