declare module config {
    
        export interface Oauth2 {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
            refreshToken: string;
            openId: string;
            openKey: string;
            csfrState: string;
        }
    
        export interface Mysql {
            host: string;
            port: number;
            user: string;
            db: string;
            pass: string;
            char: string;
        }
    
        export interface Sms {
            user: string;
            pass: string;
            subcode: number;
            url: string;
        }
    
        export interface RootObject {
            port: string;
            oauth2: Oauth2;
            mysql: Mysql;
            jwtSecret: string;
            sms: Sms;
        }
    
    }
    
    