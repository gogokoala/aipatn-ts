import { Context } from 'koa'
import { redisStore } from '../redis/redisstore'

import * as Debug from 'debug'
const debug = Debug('aipatn.register')

import { getManager } from "typeorm";
import { User } from "../entity/User";

import * as moment from 'moment'

/**
 * Middleware register
 */
export async function register (ctx: Context, next: Function) {
    const req = ctx.request;
    const user = req.body;
    debug('req.body: %o', req.body)
    
    let sid = (req.query && req.query.sid) || (req.body && req.body.sid) || req.headers['x-session-id']
    debug('sid: %o', sid)

    if (!user || !user.phone || !user.vcode || !sid) {
        throw new Error('无效的请求')
    }

    let session = await redisStore.get(sid)
    debug('session: %o', session)

    if (!session) {
        throw new Error('验证码无效')
    }
    if (user.phone != session.phone) {
        throw new Error('手机号错误')
    }
    if (user.vcode != session.verificationCode.code) {
        throw new Error('验证码不正确')
    }
    if (moment().valueOf() >= session.verificationCode.expireAt) {
        throw new Error('验证码已过期')
    }

    const usrRepository = getManager().getRepository(User)
    let vo = await usrRepository.findOne({ mobilePhone: user.phone })
    
    if (vo) {
        throw new Error('该手机号已注册')
    }
    
    // 生成注册用户信息
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    vo = new User()
    vo.username = user.phone
    vo.password = sid.slice(-6)
    vo.mobilePhone = user.phone
    vo.email = ''
    vo.emailVerified = false
    vo.createTime = now
    vo.lastLoginTime = now
    vo.state = 'active'
    
    // 创建用户
    vo = await usrRepository.save(vo)

    // TODO - 更新日志

    // 更新Session
    session.verificationCode = null
    sid = await redisStore.set(session, sid)
    
    ctx.state.data = { status: 0, message: "恭喜您！注册成功", sid }
}