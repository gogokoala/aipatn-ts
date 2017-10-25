// import "reflect-metadata";
// import { createConnection} from "typeorm";
import * as Koa from 'koa'
import { bodyParser } from './middleware/bodyparser'
import { response } from './middleware/response'
import { router } from './routes'
import * as config from 'config'
import * as Debug from 'debug'

const debug = Debug('aipatn.server')

config.util.loadFileConfigs('./config')
const port = config.get('port')
// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
//createConnection().then(async connection => {

    // create koa app
    const app = new Koa()

    // 使用响应处理中间件
    app.use(response)
    // 解析请求体
    app.use(bodyParser())    

    // 
    app.use(router.routes())
    app.use(router.allowedMethods())

    // 启动程序，监听端口
    app.listen(port, () => debug(`listening on port ${port}`))

//}).catch(error => console.log("TypeORM connection error: ", error));