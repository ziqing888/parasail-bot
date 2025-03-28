import chalk from "chalk";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const prompt = (question: string, timeoutMs: number = 30000): Promise<string> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      rl.close();
      reject(new Error("输入超时"));
    }, timeoutMs);
    rl.question(question, (answer) => {
      clearTimeout(timer);
      resolve(answer);
    });
  });

type LogType = "信息" | "成功" | "错误" | "警告" | "处理" | "调试";
const COLORS = {
  信息: chalk.blueBright,
  成功: chalk.greenBright,
  错误: chalk.redBright,
  警告: chalk.yellowBright,
  处理: chalk.cyanBright,
  调试: chalk.blue,
} as const;

const EMOJIS = {
  信息: "ℹ️",
  成功: "✅",
  错误: "❌",
  警告: "⚠️",
  处理: "🔄",
  调试: "🐞",
} as const;

export function logMessage(message: string = "", type: LogType = "信息"): void {
  const time = new Date().toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(/\//g, "-");

  const logColor = COLORS[type] || chalk.white;
  const emoji = EMOJIS[type] || "❓";
  const logText = logColor(`${emoji} ${message}`);

  console.log(`${chalk.white("[")}${chalk.dim(time)}${chalk.white("]")} ${logText}`);
}

process.on("exit", () => rl.close());
