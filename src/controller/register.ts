import { Context } from 'koa'
import { redisStore } from '../redis/redisstore'

import * as Debug from 'debug'
const debug = Debug('aipatn.register')

import { getManager } from "typeorm";
import { User } from "../entity/User";

import * as moment from 'moment'

/**
 * Loads all posts from the database.
 */
export async function register (ctx: Context, next: Function) {
    const req = ctx.request;
    const user = req.body;

    debug('req.body: %o', req.body)
    if (!user || !user.phone || !user.vcode || !user.sid) {
        throw new Error('无效的请求')
    }

    const session = await redisStore.get(user.sid)
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
    vo = new User()
    vo.username = user.phone
    vo.mobilePhone = user.phone
    const now = moment().toString()
    vo.createTime = now
    vo.lastLoginTime = now
    vo.state = 'active'
    
    // 创建用户
    vo = await usrRepository.save(vo)
    
    ctx.state.data = { status: 0, message: "恭喜您！注册成功" }
}