import * as Router from 'koa-router'
import { ping } from './controller/ping'
import { getVerificationCode } from './controller/vcode'
import { login } from './controller/login'
import { register } from './controller/register'


/**
 * All application routes.
 */
export const router = new Router()

router.get('/ping', ping)

router.get('/vcode', getVerificationCode)

router.post('/register', register)

router.post('/login', login)

