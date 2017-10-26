import { Context } from 'koa'
import { create } from 'random-seed'
import * as uuidv4 from 'uuid/v4'
import * as config from 'config'
import http from 'axios'
import { md5 } from '../lib/md5'
import * as Debug from 'debug'
import * as jwt from 'jsonwebtoken'
import * as moment from 'moment'
import { TokenExpiredError } from 'jsonwebtoken'

const debug = Debug('aipatn.vcode')
const seed = uuidv4()
const rand = create(seed)
const mobileReg = /^1[0-9]{10}$/ 

const url = config.get<string>('sms.url')
const user = config.get<string>('sms.user')
const subcode = config.get<string>('sms.subcode')
const password = md5(config.get<string>('sms.pass'))

const jwtSecret = config.get<string>('jwtSecret')

/**
 * 生成验证码并发送短信通知
 */
export async function getVerificationCode (ctx: Context, next: Function) {
    const req = ctx.request;
    const query = req.query;
    // 验证手机号
    if (!query || !query.phone || !mobileReg.test(query.phone)) {
        throw new Error('请求参数错误')
    }
    const phone = query.phone
    
    // 生成验证码
    const vcode = rand.intBetween(100000, 999999)

    debug('phone: %s, vcode: %d', phone, vcode)
/*
    let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] || req.headers[''];
    if (!token) {
        const issuedAt = moment().valueOf()
        const expires = moment().add('m', 10).valueOf()
        token = jwt.sign({ 
            iss: phone,
            iat: issuedAt,
            exp: expires
        }, jwtSecret)
    } else {
        jwt.verify(token, jwtSecret, function(err: Error, decoded: object) {
            if (err instanceof TokenExpiredError) {
                throw err
            } else {

            }
            debug('jwt decoded: %o', decoded)
        })
    }
*/
    // 发送短信
    const message = `您的验证码是${vcode}`
    let res = await http({
        url: url,
        method: 'GET',
        params: {
            sdk: user,
            code: password,
            pwdtype: 'md5',
            phones: phone,
            msg: message,
            encode: 'UTF-8',
            resulttype: 'xml',
            subcode: subcode
        }
    })

    res = res.data
    debug('sms send result: %O', res)

    
    
    ctx.state.data = { }
}