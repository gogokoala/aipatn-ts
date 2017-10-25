import { Context } from 'koa'

/**
 * Loads all posts from the database.
 */
export async function ping (ctx: Context, next: Function) {
    await next()

    ctx.body = 'pong'
}