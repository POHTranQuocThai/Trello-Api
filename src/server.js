

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, ClOSE_DB } from './config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()
  //Cấu hình cookie parser
  app.use(cookieParser())

  //Fix cái lỗi Cache from disk của ExpressJs
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cors(corsOptions))
  //enable req.body json data
  app.use(express.json())
  //Use APIs V1
  app.use('/v1', APIs_V1)
  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  //Tạo một cái server mới bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(app)
  //khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })
  //Môi trường production
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello ${env.AUTHOR}, Production: I am running at ${process.env.PORT}`)
    })
  } else {
    //Môi trường Local dev
    //Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello ${env.AUTHOR}, Dev:I am running at ${env.LOCAL_DEV_APP_HOST} and ${env.LOCAL_DEV_APP_PORT}`)
    })
  }
  //Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    ClOSE_DB()
  })
}

CONNECT_DB()
  .then(() => console.log('Connected to MongoDB Cloud Atlas'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })


