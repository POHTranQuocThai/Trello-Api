

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, ClOSE_DB } from './config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'

const START_SERVER = () => {
  const app = express()
  app.use(cors(corsOptions))
  //enable req.body json data
  app.use(express.json())
  //Use APIs V1
  app.use('/v1', APIs_V1)
  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)
  //Môi trường production
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Hello ${env.AUTHOR}, Production: I am running at ${process.env.PORT}`)
    })
  } else {
    //Môi trường Local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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


