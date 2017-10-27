import { Context } from 'koa'

/**
 * Middleware ping
 */
export async function ping (ctx: Context, next: Function) {
    await next()

    ctx.body = 'pong'
}