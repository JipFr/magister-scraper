/**
 * Big thanks to Red (https://github.com/RedDuckss) for researching a lot of the endpoints and helping me out big-time
 */

import got from "got";
import chalk from "chalk";
import * as url from "url";
import { CookieJar } from "tough-cookie";
import {
	AccountData,
	ChallengeResponse,
	LoginOptions,
	OptionalData,
	RedirectQuery,
} from "./types";

// Generate URL with query parameters
function genUrl(base: string, params = {}) {
	const items = [];
	for (const k in params) {
		items.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
	}
	return items.length > 0 ? `${base}?${items.join("&")}` : base;
}

interface InitOptions {
	/** User"s name. Often an ID */
	username: string;
	/** User"s password */
	password: string;
	/** School domain */
	hostname: string;
}

interface ExpandedOptions extends InitOptions {
	/** Main authority string */
	authority: string;
	/** Endpoints to use */
	endpoints: any;
}

export default class Magister {
	// Lots of basic types...
	public authority: string;
	public hostname: string;

	public userId: number;

	public endpoints: {
		issuer: string;
		jwks_uri: string;
		authorization_endpoint: string;
		token_endpoint: string;
		userinfo_endpoint: string;
		end_session_endpoint: string;
		check_session_iframe: string;
		revocation_endpoint: string;
		[key: string]: string;
	};
	public clientId: string; /** Always M6-hostname */
	public redirectUri: string;
	public responseType: string;
	public scope: string;
	public acrValues: string;
	public sessionId: string;
	public cookieJar: CookieJar;
	public defaultState: string;
	public defaultNonce: string;
	public authCode: string;
	public accessToken: string;
	public idToken: string;
	public sessionState: string;

	constructor(options: ExpandedOptions) {
		this.authority = options.authority;
		this.endpoints = options.endpoints;
		this.hostname = options.hostname;
		// this.authCode = options.authCode; // "99ff92b1611e9d"

		this.defaultState = "0".repeat(32);
		this.defaultNonce = "0".repeat(32);

		this.clientId = `M6-${this.hostname}`;
		this.redirectUri = `https://${this.hostname}/oidc/redirect_callback.html`;
		this.responseType = "id_token token";
		this.scope = "openid profile";
		this.acrValues = `tenant:${this.hostname}`; // idk

		this.cookieJar = new CookieJar();
	}

	static async new(options: InitOptions) {
		let authority = "https://accounts.magister.net";

		// ! Get endpoints
		let endpointUrl = `${authority}/.well-known/openid-configuration`;
		let endpoints = await got(endpointUrl).json();

		// ! Generate client
		let clientOptions = {
			...options,
			authority,
			endpoints,
			// authCode: "99ff92b1611e9d"
		};
		let client = new Magister(clientOptions);

		// ! Initialize session cookies
		await client.initCookies();

		// ! Get authCode
		// Generate URL for login page

		let loginPageUrl = genUrl(`${authority}/account/login`, {
			sessionId: client.sessionId,
			redirect_uri: `${authority}/profile/oidc/redirect_callback.html`,
			client_id: client.clientId,
			returnUrl: genUrl(`/connect/authorize/callback`, {
				...client.getQuery(),
				sessionId: client.sessionId,
			}),
		});

		// Fetch main login page
		let mainHTML = await got(loginPageUrl, {
			cookieJar: client.cookieJar,
		}).text();

		// Get path for JS containing code for authcode
		let jsPath = mainHTML.match(/<script src="(.+?)"/)[1];
		let jsUrl = `${authority}/${jsPath}`;

		let js = await got(jsUrl).text();

		// Get relevant code
		// let code = js.split(`o[ie[0]]=`)[1].split(`.join(""))`)[0] + ")";
		let code = js.split(`.join("")`)[1].split("=").pop();

		// Assign array to be decoded to N, then decode it through eval
		// VSC thinks n is unused. It is not, do not remove!
		let n: string = "";
		let authCode = eval("n=" + code).join(""); // ! YAY !

		// Set authcode
		client.authCode = authCode;

		// ! Generate login values and such
		await client.login({
			username: options.username,
			password: options.password,
		});

		// ! Get ID and such for the user
		let userData: AccountData = await client.get(
			`https://${options.hostname}/api/account?noCache=0`
		);

		client.userId = userData.Persoon.Id;

		return client;
	}

	private getQuery() {
		// I thought I'd move this chunk into its own method instead of plopping it down everywhere
		return {
			client_id: this.clientId,
			redirect_uri: this.redirectUri,
			response_type: this.responseType,
			scope: this.scope,
			acr_values: this.acrValues,
			state: this.defaultState,
			nonce: this.defaultNonce,
		};
	}

	private async login(loginOptions: LoginOptions) {
		await this.submitChallenge("current");
		await this.submitChallenge("username", {
			name: "username",
			value: loginOptions.username,
		});

		// ! Submit password
		let passwordRes = await this.submitChallenge("password", {
			name: "password",
			value: loginOptions.password,
		});

		// Verify password is valid
		if (!passwordRes.redirectURL) {
			// The greatest error handling of all time!
			console.error(
				`${chalk.red(
					"[MAGISTER ERROR]"
				)} No redirect URL was received. This likely means the credentials are incorrect. Error: ${
					passwordRes.error
				}`
			);
			return;
		}

		// ! Extract cookies, session IDs, etc.
		// Get headers and such from the redirect URL.
		const redirectUrl = `${this.authority}${passwordRes.redirectURL}`;
		const redirectRes = await got(redirectUrl, {
			cookieJar: this.cookieJar,
			throwHttpErrors: false,
			followRedirect: false,
		});

		// Get hash
		const { hash } = url.parse(redirectRes.headers.location, true);

		// Parse hash
		const query = hash.split("&").reduce((acc, curr) => {
			let v = curr.split("=");
			acc[v[0]] = v[1];
			return acc;
		}, {}) as RedirectQuery; // Just typing it doesn't work since TS doesn't properly parse reduce

		// Set fields
		this.accessToken = query.access_token;
		this.idToken = query["#id_token"];
		this.sessionState = query.session_state;
	}

	private async submitChallenge(
		name: string,
		optionalData: OptionalData | null = null
	): Promise<ChallengeResponse> {
		try {
			const jar = this.cookieJar.toJSON();
			const XSRFToken = jar.cookies.find(
				(cookie) => cookie.key === "XSRF-TOKEN"
			).value;

			const headers = {
				"content-type": "application/json",
				"x-xsrf-token": XSRFToken,
			};

			const returnUrl = genUrl("/connect/authorize/callback", this.getQuery());

			const postData = {
				authCode: this.authCode,
				sessionId: this.sessionId,
				returnUrl,
			};

			if (optionalData) {
				postData[optionalData.name] = optionalData.value;
			}

			const challengeUrl = `${this.authority}/challenges/${name}`;

			return await got
				.post(challengeUrl, {
					cookieJar: this.cookieJar,
					headers,
					throwHttpErrors: false,
					json: postData,
				})
				.json();
		} catch (err) {
			// _Great_ Error handling.
			return {
				redirectURL: null,
				tenantname: null,
				username: null,
				useremail: null,
				error: err,
			};
		}
	}

	private async initCookies() {
		const cookieUrl = genUrl(
			this.endpoints.authorization_endpoint,
			this.getQuery()
		);

		const response = await got(cookieUrl, {
			cookieJar: this.cookieJar,
		});

		this.sessionId = url.parse(response.url, true).query.sessionId as string;
	}

	async get(url: string): Promise<any> {
		return await got(url, {
			cookieJar: this.cookieJar,
			headers: {
				authorization: `Bearer ${this.accessToken}`,
			},
		}).json();
	}
}
