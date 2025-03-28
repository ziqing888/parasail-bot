"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ParasailNetwork = void 0;
var axios_1 = require("axios");
var ethers_1 = require("ethers");
var user_agents_1 = require("user-agents");
var logger_1 = require("../utils/logger");
var proxyManager_1 = require("./proxyManager");
var userAgent = new user_agents_1.default();
var API_BASE_URL = process.env.API_BASE_URL || "https://www.parasail.network";
var TERMS_MESSAGE = process.env.TERMS_MESSAGE || "此处为 Parasail 服务条款...";
var ParasailNetwork = /** @class */ (function () {
    function ParasailNetwork(privatekey, proxy) {
        if (proxy === void 0) { proxy = null; }
        this.privatekey = privatekey;
        this.proxy = proxy;
        this.wallet = new ethers_1.ethers.Wallet(privatekey);
        this.proxyManager = new proxyManager_1.ProxyManager();
        this.axiosConfig = __assign(__assign({}, (proxy && { httpsAgent: this.proxyManager.getProxyAgent(proxy) })), { headers: {
                "User-Agent": userAgent.toString(),
                origin: "https://www.parasail.network",
                Referer: "https://www.parasail.network/season",
            } });
    }
    ParasailNetwork.prototype.makeRequest = function (method_1, url_1) {
        return __awaiter(this, arguments, void 0, function (method, url, config, retries) {
            var i, error_1, signature, _a, _b;
            var _c;
            if (config === void 0) { config = {}; }
            if (retries === void 0) { retries = 3; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < retries)) return [3 /*break*/, 11];
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, (0, axios_1.default)(__assign(__assign({ method: method, url: url }, this.axiosConfig), config))];
                    case 3: return [2 /*return*/, _d.sent()];
                    case 4:
                        error_1 = _d.sent();
                        if (!(((_c = error_1.response) === null || _c === void 0 ? void 0 : _c.status) === 401 && this.currentToken)) return [3 /*break*/, 7];
                        (0, logger_1.logMessage)("令牌过期，尝试重新登录", "警告");
                        return [4 /*yield*/, this.getSignature()];
                    case 5:
                        signature = _d.sent();
                        _a = this;
                        return [4 /*yield*/, this.loginAccount(signature)];
                    case 6:
                        _a.currentToken = _d.sent();
                        this.axiosConfig.headers = __assign(__assign({}, this.axiosConfig.headers), { Authorization: "Bearer ".concat(this.currentToken) });
                        return [3 /*break*/, 10];
                    case 7:
                        if (i === retries - 1)
                            throw new Error("\u8BF7\u6C42\u5931\u8D25: ".concat(error_1.message));
                        _b = this;
                        return [4 /*yield*/, this.proxyManager.getRandomProxy()];
                    case 8:
                        _b.proxy = _d.sent();
                        this.axiosConfig.httpsAgent = this.proxy ? this.proxyManager.getProxyAgent(this.proxy) : undefined;
                        (0, logger_1.logMessage)("\u91CD\u8BD5\u4E2D (".concat(i + 1, "/").concat(retries, ")"), "警告");
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                    case 9:
                        _d.sent();
                        return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 1];
                    case 11: throw new Error("请求异常");
                }
            });
        });
    };
    ParasailNetwork.prototype.getSignature = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wallet.signMessage(TERMS_MESSAGE)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ParasailNetwork.prototype.loginAccount = function (signature) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, logger_1.logMessage)("\u6B63\u5728\u767B\u5F55\u8D26\u6237: ".concat(this.wallet.address), "信息");
                        payload = { address: this.wallet.address, msg: TERMS_MESSAGE, signature: signature };
                        return [4 /*yield*/, this.makeRequest("POST", "".concat(API_BASE_URL, "/api/user/verify"), { data: payload })];
                    case 1:
                        response = _a.sent();
                        (0, logger_1.logMessage)("\u8D26\u6237\u767B\u5F55\u6210\u529F: ".concat(this.wallet.address), "成功");
                        return [2 /*return*/, response.data.token];
                }
            });
        });
    };
    ParasailNetwork.prototype.singleProcess = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signature, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getSignature()];
                    case 1:
                        signature = _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.loginAccount(signature)];
                    case 2:
                        _a.currentToken = _b.sent();
                        return [4 /*yield*/, this.makeRequest("POST", "".concat(API_BASE_URL, "/api/v1/node/onboard"), {
                                data: { address: this.wallet.address },
                                headers: { Authorization: "Bearer ".concat(this.currentToken) },
                            })];
                    case 3:
                        _b.sent();
                        (0, logger_1.logMessage)("\u8D26\u6237\u521D\u59CB\u5316\u5B8C\u6210: ".concat(this.wallet.address), "成功");
                        return [4 /*yield*/, this.setupIntervals()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        (0, logger_1.logMessage)("\u5904\u7406\u5931\u8D25: ".concat(error_2.message), "错误");
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ParasailNetwork.prototype.setupIntervals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, lastCheckin, delay;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.clearIntervals();
                        return [4 /*yield*/, this.makeRequest("GET", "".concat(API_BASE_URL, "/api/v1/node/node_stats?address=").concat(this.wallet.address), {
                                headers: { Authorization: "Bearer ".concat(this.currentToken) },
                            })];
                    case 1:
                        stats = _b.sent();
                        if (!(stats === null || stats === void 0 ? void 0 : stats.data))
                            return [2 /*return*/];
                        this.showStats(stats.data.points, stats.data.last_checkin_time);
                        this.statsInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var newStats;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.makeRequest("GET", "".concat(API_BASE_URL, "/api/v1/node/node_stats?address=").concat(this.wallet.address), {
                                            headers: { Authorization: "Bearer ".concat(this.currentToken) },
                                        })];
                                    case 1:
                                        newStats = _a.sent();
                                        if (newStats === null || newStats === void 0 ? void 0 : newStats.data)
                                            this.showStats(newStats.data.points, newStats.data.last_checkin_time);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 60 * 60 * 1000);
                        lastCheckin = (_a = stats.data.last_checkin_time) !== null && _a !== void 0 ? _a : Math.floor(Date.now() / 1000);
                        delay = this.getCheckInDelay(lastCheckin);
                        this.checkInInterval = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.makeRequest("POST", "".concat(API_BASE_URL, "/api/v1/node/check_in"), {
                                            data: { address: this.wallet.address },
                                            headers: { Authorization: "Bearer ".concat(this.currentToken) },
                                        })];
                                    case 1:
                                        _a.sent();
                                        (0, logger_1.logMessage)("\u7B7E\u5230\u6210\u529F: ".concat(this.wallet.address), "成功");
                                        this.checkInInterval = setInterval(function () { return _this.singleProcess(); }, 24 * 60 * 60 * 1000);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, delay);
                        return [2 /*return*/];
                }
            });
        });
    };
    ParasailNetwork.prototype.getCheckInDelay = function (lastCheckin) {
        var now = Math.floor(Date.now() / 1000);
        var nextCheckIn = lastCheckin + 24 * 60 * 60;
        return Math.max((nextCheckIn - now) * 1000, 0);
    };
    ParasailNetwork.prototype.showStats = function (points, lastCheckin) {
        var line = "=".repeat(50);
        var checkInInfo = lastCheckin
            ? "\u4E0B\u6B21\u7B7E\u5230: ".concat(new Date((lastCheckin + 24 * 60 * 60) * 1000).toLocaleString("zh-CN"), " (").concat((((lastCheckin + 24 * 60 * 60) - Math.floor(Date.now() / 1000)) / 3600).toFixed(2), " \u5C0F\u65F6\u540E)")
            : "签到时间: 未记录";
        var message = [
            "".concat(line),
            "\uD83C\uDF89 \u5F53\u524D\u79EF\u5206: ".concat(points),
            "\u23F0 ".concat(checkInInfo),
            "\uD83C\uDFE0 \u8D26\u6237\u5730\u5740: ".concat(this.wallet.address),
            "".concat(line),
        ].join("\n");
        (0, logger_1.logMessage)(message, "信息");
    };
    ParasailNetwork.prototype.clearIntervals = function () {
        if (this.checkInInterval)
            clearInterval(this.checkInInterval);
        if (this.statsInterval)
            clearInterval(this.statsInterval);
        this.checkInInterval = this.statsInterval = undefined;
    };
    return ParasailNetwork;
}());
exports.ParasailNetwork = ParasailNetwork;
  }
}
