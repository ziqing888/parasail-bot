import chalk from "chalk";
import fs from "fs";
import { ParasailNetwork } from "./core/parasailNetwork";
import { ProxyManager } from "./core/proxyManager";
import { logMessage } from "./utils/logger";

const proxyManager = new ProxyManager();

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
╔════╗╔════╗╔════╗╔════╗╔════╗
║ 风帆║ 网路║ 自动║ 工具║ v1.0║
╚════╝╚════╝╚════╝╚════╝╚════╝
     
      使用风险自负，请谨慎操作
    `)
  );

  try {
    const accounts = fs
      .readFileSync("privatekey.txt", "utf8")
      .split("\n")
      .filter(Boolean);
    if (accounts.length === 0) throw new Error("没有找到有效的私钥");

    const proxiesLoaded = proxyManager.loadProxies();
    if (!proxiesLoaded) logMessage("代理加载失败，将使用默认 IP", "warning");
    logMessage(`已加载 ${accounts.length} 个账户`, "success");

    const chunkSize = 10;
    for (let i = 0; i < accounts.length; i += chunkSize) {
      const chunk = accounts.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (privatekey) => {
          const currentProxy = await proxyManager.getRandomProxy();
          const network = new ParasailNetwork(privatekey, currentProxy);
          await network.singleProcess();
        })
      );
      await new Promise(resolve => setTimeout(resolve, 1000)); // 每批延迟 1 秒
    }
  } catch (error) {
    logMessage(`程序出错: ${error instanceof Error ? error.message : "未知错误"}`, "error");
  }
}

main().catch((err) => {
  console.error(chalk.red("程序崩溃:"), err);
  process.exit(1);
});
