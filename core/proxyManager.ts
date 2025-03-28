import axios, { AxiosRequestConfig } from "axios";
import fs from "fs";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import { logMessage } from "../utils/logger";

export class ProxyManager {
  private proxies: string[] = [];
  private proxyCache: Map<string, HttpsProxyAgent<string> | SocksProxyAgent> = new Map();
  private proxyFile: string;

  constructor(proxyFile: string = process.env.PROXY_FILE || "proxy.txt") {
    this.proxyFile = proxyFile;
  }

  public getProxyAgent(proxy: string): HttpsProxyAgent<string> | SocksProxyAgent | undefined {
    if (this.proxyCache.has(proxy)) return this.proxyCache.get(proxy);
    try {
      if (!proxy) throw new Error("代理地址为空");
      const isSocks = proxy.toLowerCase().startsWith("socks");
      const agent = isSocks
        ? new SocksProxyAgent(proxy)
        : new HttpsProxyAgent(proxy.startsWith("http") ? proxy : `http://${proxy}`);
      this.proxyCache.set(proxy, agent);
      return agent;
    } catch (error) {
      logMessage(`创建代理失败: ${proxy} - ${error instanceof Error ? error.message : "未知错误"}`, "错误");
      return undefined;
    }
  }

  public loadProxies(): boolean {
    try {
      const data = fs.readFileSync(this.proxyFile, "utf8");
      const proxyRegex = /^(socks|http|https):\/\/([a-zA-Z0-9.-]+|\d+\.\d+\.\d+\.\d+):(\d+)$/;
      this.proxies = data
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && proxyRegex.test(line.startsWith("http") || line.startsWith("socks") ? line : `http://${line}`))
        .map(proxy => (proxy.includes("://") ? proxy : `http://${proxy}`));
      if (this.proxies.length === 0) throw new Error("文件中没有有效的代理");
      logMessage(`成功加载 ${this.proxies.length} 个代理`, "成功");
      return true;
    } catch (error) {
      logMessage(`加载代理失败: ${error instanceof Error ? error.message : "未知错误"}`, "错误");
      return false;
    }
  }

  private async checkIP(config: AxiosRequestConfig = {}): Promise<string> {
    const services = ["https://api.ipify.org?format=json", "https://api.myip.com"];
    for (const url of services) {
      try {
        const response = await axios.get(url, config);
        return response.data.ip || response.data.ip_address;
      } catch (error) {
        logMessage(`IP 检查失败 (${url}): ${error instanceof Error ? error.message : "未知错误"}`, "警告");
      }
    }
    throw new Error("所有 IP 检查服务均不可用");
  }

  public async getRandomProxy(): Promise<string | null> {
    if (this.proxies.length === 0) {
      logMessage("没有可用的代理，将使用默认 IP", "警告");
      const ip = await this.checkIP();
      this.showResult(null, ip);
      return null;
    }

    const getRandomIndex = () => Math.floor(Math.random() * this.proxies.length);
    let attempts = this.proxies.length;

    while (attempts > 0) {
      const proxy = this.proxies[getRandomIndex()];
      const agent = this.getProxyAgent(proxy);
      if (!agent) continue;

      try {
        const config: AxiosRequestConfig = { httpsAgent: agent };
        const ip = await this.checkIP(config);
        this.showResult(proxy, ip);
        return proxy;
      } catch (error) {
        logMessage(`代理 ${proxy} 不可用，正在尝试下一个`, "警告");
      }
      attempts--;
    }

    logMessage("所有代理均不可用，将使用默认 IP", "警告");
    const ip = await this.checkIP();
    this.showResult(null, ip);
    return null;
  }

  private showResult(proxy: string | null, ip: string): void {
    const line = "=".repeat(50);
    const status = proxy ? "成功" : "失败";
    const proxyText = proxy ? `代理: ${proxy}` : "无代理 (默认 IP)";
    const message = [
      `${line}`,
      `🎉 代理状态: ${status}`,
      `🌐 ${proxyText}`,
      `📍 当前 IP: ${ip}`,
      `${line}`,
    ].join("\n");
    logMessage(message, proxy ? "成功" : "警告");
  }
}
