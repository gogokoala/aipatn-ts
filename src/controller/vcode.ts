import { Context } from 'koa'
import { create } from 'random-seed'
import * as uuidv4 from 'uuid/v4'
import * as config from 'config'
import http from 'axios'
import { md5 } from '../lib/md5'
import * as Debug from 'debug'

const debug = Debug('aipatn.vcode')
const seed = uuidv4()
const rand = create(seed)
const mobileReg = /^1[0-9]{10}$/ 
const smsConfig = config.get('sms')

debug('sms config: %o', smsConfig)

/**
 * 生成验证码并发送短信通知
 */
export async function getVerificationCode (ctx: Context, next: Function) {
    const query = ctx.request.query;
    // 验证手机号
    if (!query || !query.phone || !mobileReg.test(query.phone)) {
        throw new Error('请求参数错误')
    }
    const phone = query.phone
    
    // 生成验证码
    const vcode = rand.intBetween(100000, 999999)

    debug('phone: %s, vcode: %d', phone, vcode)

    // 发送短信
/*    
    const url = smsConfig.url ? smsConfig.url : '';
    const user = smsConfig.user
    const subcode = smsConfig.subcode
    const password = md5(smsConfig.pass)
    
    const message = encodeURI(`您的验证码是${vcode}`);
    let res = await http({
        url: url,
        method: 'GET',
        params: {
            sdk: user,
            code: password,
            pwdtype: 'md5',
            phones: phone,
            msg: message,
            resulttype: 'xml',
            subcode: subcode
        }
    })

    res = res.data
    debug('sms send result: %O', res)
*/    
    // TODO - 验证码添加到session

    ctx.state.data = 'ok'
}