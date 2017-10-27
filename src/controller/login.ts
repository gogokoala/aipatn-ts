import { Context } from 'koa'
import { redisStore } from '../redis/redisstore'
import * as moment from 'moment'
import * as jwt from 'jsonwebtoken'
import * as config from 'config'
import * as Debug from 'debug'
import { getManager } from "typeorm";
import { User } from "../entity/User";

const debug = Debug('aipatn.register')
const jwtSecret = config.get<string>('jwtSecret')

/**
 * Middleware login
 */
export async function login (ctx: Context, next: Function) {
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
        throw new Error('无效的请求')
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

    // 验证用户
    const usrRepository = getManager().getRepository(User)
    let vo = await usrRepository.findOne({ mobilePhone: user.phone })
    
    if (!vo) {
        throw new Error('用户未注册')
    }

    // 更新用户信息
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    vo.lastLoginTime = now

    vo = await usrRepository.save(vo)

    // jwt授权
    const issuedAt = moment().valueOf()
    const expireAt = moment().add('m', 10).valueOf()
    const token = await jwt.sign({ 
        iss: user.phone,
        iat: issuedAt,
        exp: expireAt
    }, jwtSecret)

    // 更新Session
    session.verificationCode = null
    session.access_token = token
    sid = await redisStore.set(session, sid)

    // TODO - 更新日志
    
    ctx.state.data = { status: 0, message: "登录成功", sid, access_token: token }
}