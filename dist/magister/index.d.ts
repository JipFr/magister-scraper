/**
 * Big thanks to Red (https://github.com/RedDuckss) for researching a lot of the endpoints and helping me out big-time
 */
import { CookieJar } from "tough-cookie";
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
    authority: string;
    hostname: string;
    userId: number;
    endpoints: {
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
    clientId: string; /** Always M6-hostname */
    redirectUri: string;
    responseType: string;
    scope: string;
    acrValues: string;
    sessionId: string;
    cookieJar: CookieJar;
    defaultState: string;
    defaultNonce: string;
    authCode: string;
    accessToken: string;
    idToken: string;
    sessionState: string;
    constructor(options: ExpandedOptions);
    static new(options: InitOptions): Promise<Magister>;
    private getQuery;
    private login;
    private submitChallenge;
    private initCookies;
    get(url: string): Promise<any>;
}
export {};
