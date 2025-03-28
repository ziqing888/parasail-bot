import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { ethers } from "ethers";
import UserAgent from "user-agents";
import { logMessage } from "../utils/logger";
import { ProxyManager } from "./proxyManager";

const userAgent = new UserAgent();
const API_BASE_URL = process.env.API_BASE_URL || "https://www.parasail.network";
const TERMS_MESSAGE = process.env.TERMS_MESSAGE || "此处为 Parasail 服务条款...";

export class ParasailNetwork {
  private proxyManager: ProxyManager;
  private proxy: string | null;
  private privatekey: string;
  private axiosConfig: AxiosRequestConfig;
  private wallet: ethers.Wallet;
  private checkInInterval?: NodeJS.Timeout;
  private statsInterval?: NodeJS.Timeout;
  private currentToken?: string;

  constructor(privatekey: string, proxy: string | null = null) {
    this.privatekey = privatekey;
    this.proxy = proxy;
    this.wallet = new ethers.Wallet(privatekey);
    this.proxyManager = new ProxyManager();
    this.axiosConfig = {
      ...(proxy && { httpsAgent: this.proxyManager.getProxyAgent(proxy) }),
      headers: {
        "User-Agent": userAgent.toString(),
        origin: "https://www.parasail.network",
        Referer: "https://www.parasail.network/season",
      },
    };
  }

  private async makeRequest(method: string, url: string, config: AxiosRequestConfig = {}, retries: number = 3): Promise<AxiosResponse> {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios({ method, url, ...this.axiosConfig, ...config });
      } catch (error: any) {
        if (error.response?.status === 401 && this.currentToken) {
          logMessage("令牌过期，尝试重新登录", "警告");
          const signature = await this.getSignature();
          this.currentToken = await this.loginAccount(signature);
          this.axiosConfig.headers = { ...this.axiosConfig.headers, Authorization: `Bearer ${this.currentToken}` };
          continue;
        }
        if (i === retries - 1) throw new Error(`请求失败: ${error.message}`);
        this.proxy = await this.proxyManager.getRandomProxy();
        this.axiosConfig.httpsAgent = this.proxy ? this.proxyManager.getProxyAgent(this.proxy) : undefined;
        logMessage(`重试中 (${i + 1}/${retries})`, "警告");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error("请求异常");
  }

  async getSignature(): Promise<string> {
    return await this.wallet.signMessage(TERMS_MESSAGE);
  }

  async loginAccount(signature: string): Promise<string> {
    logMessage(`正在登录账户: ${this.wallet.address}`, "信息");
    const payload = { address: this.wallet.address, msg: TERMS_MESSAGE, signature };
    const response = await this.makeRequest("POST", `${API_BASE_URL}/api/user/verify`, { data: payload });
    logMessage(`账户登录成功: ${this.wallet.address}`, "成功");
    return response.data.token;
  }

  async singleProcess(): Promise<void> {
    try {
      const signature = await this.getSignature();
      this.currentToken = await this.loginAccount(signature);
      await this.makeRequest("POST", `${API_BASE_URL}/api/v1/node/onboard`, {
        data: { address: this.wallet.address },
        headers: { Authorization: `Bearer ${this.currentToken}` },
      });
      logMessage(`账户初始化完成: ${this.wallet.address}`, "成功");
      await this.setupIntervals();
    } catch (error: any) {
      logMessage(`处理失败: ${error.message}`, "错误");
    }
  }

  private async setupIntervals(): Promise<void> {
    this.clearIntervals();
    const stats = await this.makeRequest("GET", `${API_BASE_URL}/api/v1/node/node_stats?address=${this.wallet.address}`, {
      headers: { Authorization: `Bearer ${this.currentToken}` },
    });
    if (!stats?.data) return;

    this.showStats(stats.data.points, stats.data.last_checkin_time);
    this.statsInterval = setInterval(async () => {
      const newStats = await this.makeRequest("GET", `${API_BASE_URL}/api/v1/node/node_stats?address=${this.wallet.address}`, {
        headers: { Authorization: `Bearer ${this.currentToken}` },
      });
      if (newStats?.data) this.showStats(newStats.data.points, newStats.data.last_checkin_time);
    }, 60 * 60 * 1000);

    const lastCheckin = stats.data.last_checkin_time ?? Math.floor(Date.now() / 1000);
    const delay = this.getCheckInDelay(lastCheckin);

    this.checkInInterval = setTimeout(async () => {
      await this.makeRequest("POST", `${API_BASE_URL}/api/v1/node/check_in`, {
        data: { address: this.wallet.address },
        headers: { Authorization: `Bearer ${this.currentToken}` },
      });
      logMessage(`签到成功: ${this.wallet.address}`, "成功");
      this.checkInInterval = setInterval(() => this.singleProcess(), 24 * 60 * 60 * 1000);
    }, delay);
  }

  private getCheckInDelay(lastCheckin: number): number {
    const now = Math.floor(Date.now() / 1000);
    const nextCheckIn = lastCheckin + 24 * 60 * 60;
    return Math.max((nextCheckIn - now) * 1000, 0);
  }

  private showStats(points: number, lastCheckin: number | undefined): void {
    const line = "=".repeat(50);
    let checkInInfo = lastCheckin
      ? `下次签到: ${new Date((lastCheckin + 24 * 60 * 60) * 1000).toLocaleString("zh-CN")} (${(((lastCheckin + 24 * 60 * 60) - Math.floor(Date.now() / 1000)) / 3600).toFixed(2)} 小时后)`
      : "签到时间: 未记录";
    const message = [
      `${line}`,
      `🎉 当前积分: ${points}`,
      `⏰ ${checkInInfo}`,
      `🏠 账户地址: ${this.wallet.address}`,
      `${line}`,
    ].join("\n");
    logMessage(message, "信息");
  }

  private clearIntervals(): void {
    if (this.checkInInterval) clearInterval(this.checkInInterval);
    if (this.statsInterval) clearInterval(this.statsInterval);
    this.checkInInterval = this.statsInterval = undefined;
  }
}
