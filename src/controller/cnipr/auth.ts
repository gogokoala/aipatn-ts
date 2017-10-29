import { getManager } from "typeorm"
import { OAuth2 } from "../../entity/oauth2"
import * as moment from 'moment'
import Axios from 'axios'
import * as config from 'config'

import * as Debug from 'debug'
const debug = Debug('cnipr.auth')

class OAuth2Config {
    clientId: string
    clientSecret: string
    redirectUri: string
    refreshToken: string
    openId: string
    openKey: string

    constructor() { 
        this.clientId = config.get('oauth2.clientId')
        this.clientSecret = config.get('oauth2.clientSecret')
        this.redirectUri = config.get('oauth2.redirectUri')
        this.refreshToken = config.get('oauth2.refreshToken')
        this.openId = config.get('oauth2.openId')
        this.openKey = config.get('oauth2.openKey')
    }
}

export class OAuth2Response {
    status: number
    message: string
    expires_in: number
    refresh_token: string
    access_token: string
}

class OAuth2Instance {

    private options: OAuth2Config
    private oauth2: OAuth2
    private csfrState: string
    
    constructor() {
        this.options = new OAuth2Config()
        this.csfrState = this.options.clientId
    }
    
    async getOAuth2Info(clientId: string) {
        const usrRepository = getManager().getRepository(OAuth2)
        let vo = await usrRepository.findOne({ clientId })
        if (vo) {
            this.oauth2 = vo
        }
    }

    /**
     * 检查Cnipr Access Token是否有效
     */
    checkAccessToken() {
        if (!this.oauth2) {
            return false
        }

        const token = this.oauth2

        //  access_token的过期时长，单位ms,缺省24小时 
        const expires = token.expiresIn ? token.expiresIn * 1000 : 86400 * 1000

        if (moment(token.lastRefreshTime, 'YYYY-MM-DD HH:mm:ss').valueOf() + expires < moment().valueOf()) {
            debug('access_token expired.')
            return true
        } else {
            debug('access_token is ok.')
            return false
        }
    }

    /**
     * 使用Refresh Token 刷新 Access Token
     * {"status":0,
     * "message":"SUCCESS",
     * "expires_in":2592000,
     * "refresh_token":"...",
     * "access_token":"..."}
     * 
     */
    async refreshAccessToken() {
        const clientId = this.options.clientId
        const clientSecret = this.options.clientSecret
        const redirectUri = encodeURI(this.options.redirectUri)
        const refreshToken = this.options.refreshToken
        const state = this.csfrState

        let res = await Axios.get(
            'https://open.cnipr.com/oauth2/access_token',
            {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    state: state
                }
            }
        )

        const authResp: OAuth2Response = res.data
        debug('refreshAccessToken: %o', authResp)
        if (authResp.status) {
            debug('refresh access_token: %s', authResp)
            throw new Error(`${authResp.status} - ${authResp.message}`)
        } else {
            return authResp
        }
    }


}


export const oauth2 = new OAuth2Instance()