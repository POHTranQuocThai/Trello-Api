/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, ClOSE_DB } from './config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()
  //enable req.body json data
  app.use(express.json())
  //Use APIs V1
  app.use('/v1', APIs_V1)
  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
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


