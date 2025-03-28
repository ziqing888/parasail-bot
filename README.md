# Parasail Bot

这是一个自动化工具，用于与 Parasail 网络交互，支持账户登录、初始化和定时签到。程序使用 TypeScript 编写，提供中文日志输出，支持代理配置（可选）。

**警告**: 使用风险自负，请谨慎操作。

---

## 功能
- **账户管理**: 从 `privatekey.txt` 加载私钥，支持多账户。
- **代理支持**: 从 `proxy.txt` 加载代理，若为空则直接连接。
- **自动化**: 自动登录、初始化账户，定时获取统计数据和签到。


---

## 依赖
### 运行时依赖
- `axios`: ^1.8.4
- `chalk`: ^4.1.2
- `ethers`: ^6.13.5
- `https-proxy-agent`: ^7.0.6
- `socks-proxy-agent`: ^8.0.5
- `user-agents`: ^1.1.491

### 开发依赖
- `@types/user-agents`: ^1.0.2
- `typescript`: ^5.0.0

---

## 安装
1. **克隆仓库**：
   ```bash
   git clone https://github.com/ziqing888/parasail-bot.git
   cd parasail-bot
   ```
2. 初始化 package.json
```bash
npm init -y
```
3. 安装依赖
```bash
npm install axios chalk@4 ethers https-proxy-agent socks-proxy-agent user-agents
npm install --save-dev @types/user-agents typescript
```
## 配置
私钥文件 (privatekey.txt)：
每行一个私钥，例如
```bash
22233444
```
代理文件 (proxy.txt)（可选）：
每行一个代理，支持 HTTP 和 SOCKS，例如：
```bash
http://192.168.1.1:8080
socks://10.0.0.1:1080
```
## 使用
编译 TypeScript：
```bash
tsc
```
生成 dist/ 目录，包含编译后的 .js 文件。

运行程序：
```bash
node dist/main.js
```

后台运行（可选）：
使用 pm2
```bash
npm install -g pm2
pm2 start dist/main.js --name parasail-bot
pm2 logs parasail-bot
```

   

