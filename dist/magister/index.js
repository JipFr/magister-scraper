"use strict";
/**
 * Big thanks to Red (https://github.com/RedDuckss) for researching a lot of the endpoints and helping me out big-time
 */
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var got_1 = __importDefault(require("got"));
var chalk_1 = __importDefault(require("chalk"));
var url = __importStar(require("url"));
var tough_cookie_1 = require("tough-cookie");
// Generate URL with query parameters
function genUrl(base, params) {
    if (params === void 0) { params = {}; }
    var items = [];
    for (var k in params) {
        items.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
    }
    return items.length > 0 ? base + "?" + items.join("&") : base;
}
var Magister = /** @class */ (function () {
    function Magister(options) {
        this.authority = options.authority;
        this.endpoints = options.endpoints;
        this.hostname = options.hostname;
        // this.authCode = options.authCode; // "99ff92b1611e9d"
        this.defaultState = "0".repeat(32);
        this.defaultNonce = "0".repeat(32);
        this.clientId = "M6-" + this.hostname;
        this.redirectUri = "https://" + this.hostname + "/oidc/redirect_callback.html";
        this.responseType = "id_token token";
        this.scope = "openid profile";
        this.acrValues = "tenant:" + this.hostname; // idk
        this.cookieJar = new tough_cookie_1.CookieJar();
    }
    Magister["new"] = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var authority, endpointUrl, endpoints, clientOptions, client, loginPageUrl, mainHTML, jsPath, jsUrl, js, code, n, authCode, userData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authority = "https://accounts.magister.net";
                        endpointUrl = authority + "/.well-known/openid-configuration";
                        return [4 /*yield*/, got_1["default"](endpointUrl).json()];
                    case 1:
                        endpoints = _a.sent();
                        clientOptions = __assign(__assign({}, options), { authority: authority,
                            endpoints: endpoints });
                        client = new Magister(clientOptions);
                        // ! Initialize session cookies
                        return [4 /*yield*/, client.initCookies()];
                    case 2:
                        // ! Initialize session cookies
                        _a.sent();
                        loginPageUrl = genUrl(authority + "/account/login", {
                            sessionId: client.sessionId,
                            redirect_uri: authority + "/profile/oidc/redirect_callback.html",
                            client_id: client.clientId,
                            returnUrl: genUrl("/connect/authorize/callback", __assign(__assign({}, client.getQuery()), { sessionId: client.sessionId }))
                        });
                        return [4 /*yield*/, got_1["default"](loginPageUrl, {
                                cookieJar: client.cookieJar
                            }).text()];
                    case 3:
                        mainHTML = _a.sent();
                        jsPath = mainHTML.match(/<script src="(.+?)"/)[1];
                        jsUrl = authority + "/" + jsPath;
                        return [4 /*yield*/, got_1["default"](jsUrl).text()];
                    case 4:
                        js = _a.sent();
                        code = js.split(".join(\"\")")[1].split("=").pop();
                        n = "";
                        authCode = eval("n=" + code).join("");
                        // Set authcode
                        client.authCode = authCode;
                        // ! Generate login values and such
                        return [4 /*yield*/, client.login({
                                username: options.username,
                                password: options.password
                            })];
                    case 5:
                        // ! Generate login values and such
                        _a.sent();
                        return [4 /*yield*/, client.get("https://" + options.hostname + "/api/account?noCache=0")];
                    case 6:
                        userData = _a.sent();
                        client.userId = userData.Persoon.Id;
                        return [2 /*return*/, client];
                }
            });
        });
    };
    Magister.prototype.getQuery = function () {
        // I thought I'd move this chunk into its own method instead of plopping it down everywhere
        return {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: this.responseType,
            scope: this.scope,
            acr_values: this.acrValues,
            state: this.defaultState,
            nonce: this.defaultNonce
        };
    };
    Magister.prototype.login = function (loginOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var passwordRes, redirectUrl, redirectRes, hash, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.submitChallenge("current")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.submitChallenge("username", {
                                name: "username",
                                value: loginOptions.username
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.submitChallenge("password", {
                                name: "password",
                                value: loginOptions.password
                            })];
                    case 3:
                        passwordRes = _a.sent();
                        // Verify password is valid
                        if (!passwordRes.redirectURL) {
                            // The greatest error handling of all time!
                            console.error(chalk_1["default"].red("[MAGISTER ERROR]") + " No redirect URL was received. This likely means the credentials are incorrect. Error: " + passwordRes.error);
                            return [2 /*return*/];
                        }
                        redirectUrl = "" + this.authority + passwordRes.redirectURL;
                        return [4 /*yield*/, got_1["default"](redirectUrl, {
                                cookieJar: this.cookieJar,
                                throwHttpErrors: false,
                                followRedirect: false
                            })];
                    case 4:
                        redirectRes = _a.sent();
                        hash = url.parse(redirectRes.headers.location, true).hash;
                        query = hash.split("&").reduce(function (acc, curr) {
                            var v = curr.split("=");
                            acc[v[0]] = v[1];
                            return acc;
                        }, {});
                        // Set fields
                        this.accessToken = query.access_token;
                        this.idToken = query["#id_token"];
                        this.sessionState = query.session_state;
                        return [2 /*return*/];
                }
            });
        });
    };
    Magister.prototype.submitChallenge = function (name, optionalData) {
        if (optionalData === void 0) { optionalData = null; }
        return __awaiter(this, void 0, void 0, function () {
            var jar, XSRFToken, headers, returnUrl, postData, challengeUrl, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        jar = this.cookieJar.toJSON();
                        XSRFToken = jar.cookies.find(function (cookie) { return cookie.key === "XSRF-TOKEN"; }).value;
                        headers = {
                            "content-type": "application/json",
                            "x-xsrf-token": XSRFToken
                        };
                        returnUrl = genUrl("/connect/authorize/callback", this.getQuery());
                        postData = {
                            authCode: this.authCode,
                            sessionId: this.sessionId,
                            returnUrl: returnUrl
                        };
                        if (optionalData) {
                            postData[optionalData.name] = optionalData.value;
                        }
                        challengeUrl = this.authority + "/challenges/" + name;
                        return [4 /*yield*/, got_1["default"]
                                .post(challengeUrl, {
                                cookieJar: this.cookieJar,
                                headers: headers,
                                throwHttpErrors: false,
                                json: postData
                            })
                                .json()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        // _Great_ Error handling.
                        return [2 /*return*/, {
                                redirectURL: null,
                                tenantname: null,
                                username: null,
                                useremail: null,
                                error: err_1
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Magister.prototype.initCookies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cookieUrl, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cookieUrl = genUrl(this.endpoints.authorization_endpoint, this.getQuery());
                        return [4 /*yield*/, got_1["default"](cookieUrl, {
                                cookieJar: this.cookieJar
                            })];
                    case 1:
                        response = _a.sent();
                        this.sessionId = url.parse(response.url, true).query.sessionId;
                        return [2 /*return*/];
                }
            });
        });
    };
    Magister.prototype.get = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, got_1["default"](url, {
                            cookieJar: this.cookieJar,
                            headers: {
                                authorization: "Bearer " + this.accessToken
                            }
                        }).json()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Magister;
}());
exports["default"] = Magister;
