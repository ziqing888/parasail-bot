"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = void 0;
exports.logMessage = logMessage;
var chalk_1 = require("chalk");
var readline = require("readline");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
var prompt = function (question, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 30000; }
    return new Promise(function (resolve, reject) {
        var timer = setTimeout(function () {
            rl.close();
            reject(new Error("输入超时"));
        }, timeoutMs);
        rl.question(question, function (answer) {
            clearTimeout(timer);
            resolve(answer);
        });
    });
};
exports.prompt = prompt;
var COLORS = {
    信息: chalk_1.default.blueBright,
    成功: chalk_1.default.greenBright,
    错误: chalk_1.default.redBright,
    警告: chalk_1.default.yellowBright,
    处理: chalk_1.default.cyanBright,
    调试: chalk_1.default.blue,
};
var EMOJIS = {
    信息: "ℹ️",
    成功: "✅",
    错误: "❌",
    警告: "⚠️",
    处理: "🔄",
    调试: "🐞",
};
function logMessage(message, type) {
    if (message === void 0) { message = ""; }
    if (type === void 0) { type = "信息"; }
    var time = new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).replace(/\//g, "-");
    var logColor = COLORS[type] || chalk_1.default.white;
    var emoji = EMOJIS[type] || "❓";
    var logText = logColor("".concat(emoji, " ").concat(message));
    console.log("".concat(chalk_1.default.white("[")).concat(chalk_1.default.dim(time)).concat(chalk_1.default.white("]"), " ").concat(logText));
}
process.on("exit", function () { return rl.close(); });
