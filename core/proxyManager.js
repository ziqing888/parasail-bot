"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyManager = void 0;
var axios_1 = require("axios");
var fs_1 = require("fs");
var https_proxy_agent_1 = require("https-proxy-agent");
var socks_proxy_agent_1 = require("socks-proxy-agent");
var logger_1 = require("../utils/logger");
var ProxyManager = /** @class */ (function () {
    function ProxyManager(proxyFile) {
        if (proxyFile === void 0) { proxyFile = process.env.PROXY_FILE || "proxy.txt"; }
        this.proxies = [];
        this.proxyCache = new Map();
        this.proxyFile = proxyFile;
    }
    ProxyManager.prototype.getProxyAgent = function (proxy) {
        if (this.proxyCache.has(proxy))
            return this.proxyCache.get(proxy);
        try {
            if (!proxy)
                throw new Error("代理地址为空");
            var isSocks = proxy.toLowerCase().startsWith("socks");
            var agent = isSocks
                ? new socks_proxy_agent_1.SocksProxyAgent(proxy)
                : new https_proxy_agent_1.HttpsProxyAgent(proxy.startsWith("http") ? proxy : "http://".concat(proxy));
            this.proxyCache.set(proxy, agent);
            return agent;
        }
        catch (error) {
            (0, logger_1.logMessage)("\u521B\u5EFA\u4EE3\u7406\u5931\u8D25: ".concat(proxy, " - ").concat(error instanceof Error ? error.message : "未知错误"), "错误");
            return undefined;
        }
    };
    ProxyManager.prototype.loadProxies = function () {
        try {
            var data = fs_1.default.readFileSync(this.proxyFile, "utf8");
            var proxyRegex_1 = /^(socks|http|https):\/\/([a-zA-Z0-9.-]+|\d+\.\d+\.\d+\.\d+):(\d+)$/;
            this.proxies = data
                .split("\n")
                .map(function (line) { return line.trim(); })
                .filter(function (line) { return line && proxyRegex_1.test(line.startsWith("http") || line.startsWith("socks") ? line : "http://".concat(line)); })
                .map(function (proxy) { return (proxy.includes("://") ? proxy : "http://".concat(proxy)); });
            if (this.proxies.length === 0)
                throw new Error("文件中没有有效的代理");
            (0, logger_1.logMessage)("\u6210\u529F\u52A0\u8F7D ".concat(this.proxies.length, " \u4E2A\u4EE3\u7406"), "成功");
            return true;
        }
        catch (error) {
            (0, logger_1.logMessage)("\u52A0\u8F7D\u4EE3\u7406\u5931\u8D25: ".concat(error instanceof Error ? error.message : "未知错误"), "错误");
            return false;
        }
    };
    ProxyManager.prototype.checkIP = function () {
        return __awaiter(this, arguments, void 0, function (config) {
            var services, _i, services_1, url, response, error_1;
            if (config === void 0) { config = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        services = ["https://api.ipify.org?format=json", "https://api.myip.com"];
                        _i = 0, services_1 = services;
                        _a.label = 1;
                    case 1:
                        if (!(_i < services_1.length)) return [3 /*break*/, 6];
                        url = services_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(url, config)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data.ip || response.data.ip_address];
                    case 4:
                        error_1 = _a.sent();
                        (0, logger_1.logMessage)("IP \u68C0\u67E5\u5931\u8D25 (".concat(url, "): ").concat(error_1 instanceof Error ? error_1.message : "未知错误"), "警告");
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: throw new Error("所有 IP 检查服务均不可用");
                }
            });
        });
    };
    ProxyManager.prototype.getRandomProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ip_1, getRandomIndex, attempts, proxy, agent, config, ip_2, error_2, ip;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.proxies.length === 0)) return [3 /*break*/, 2];
                        (0, logger_1.logMessage)("没有可用的代理，将使用默认 IP", "警告");
                        return [4 /*yield*/, this.checkIP()];
                    case 1:
                        ip_1 = _a.sent();
                        this.showResult(null, ip_1);
                        return [2 /*return*/, null];
                    case 2:
                        getRandomIndex = function () { return Math.floor(Math.random() * _this.proxies.length); };
                        attempts = this.proxies.length;
                        _a.label = 3;
                    case 3:
                        if (!(attempts > 0)) return [3 /*break*/, 8];
                        proxy = this.proxies[getRandomIndex()];
                        agent = this.getProxyAgent(proxy);
                        if (!agent)
                            return [3 /*break*/, 3];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        config = { httpsAgent: agent };
                        return [4 /*yield*/, this.checkIP(config)];
                    case 5:
                        ip_2 = _a.sent();
                        this.showResult(proxy, ip_2);
                        return [2 /*return*/, proxy];
                    case 6:
                        error_2 = _a.sent();
                        (0, logger_1.logMessage)("\u4EE3\u7406 ".concat(proxy, " \u4E0D\u53EF\u7528\uFF0C\u6B63\u5728\u5C1D\u8BD5\u4E0B\u4E00\u4E2A"), "警告");
                        return [3 /*break*/, 7];
                    case 7:
                        attempts--;
                        return [3 /*break*/, 3];
                    case 8:
                        (0, logger_1.logMessage)("所有代理均不可用，将使用默认 IP", "警告");
                        return [4 /*yield*/, this.checkIP()];
                    case 9:
                        ip = _a.sent();
                        this.showResult(null, ip);
                        return [2 /*return*/, null];
                }
            });
        });
    };
    ProxyManager.prototype.showResult = function (proxy, ip) {
        var line = "=".repeat(50);
        var status = proxy ? "成功" : "失败";
        var proxyText = proxy ? "\u4EE3\u7406: ".concat(proxy) : "无代理 (默认 IP)";
        var message = [
            "".concat(line),
            "\uD83C\uDF89 \u4EE3\u7406\u72B6\u6001: ".concat(status),
            "\uD83C\uDF10 ".concat(proxyText),
            "\uD83D\uDCCD \u5F53\u524D IP: ".concat(ip),
            "".concat(line),
        ].join("\n");
        (0, logger_1.logMessage)(message, proxy ? "成功" : "警告");
    };
    return ProxyManager;
}());
exports.ProxyManager = ProxyManager;
