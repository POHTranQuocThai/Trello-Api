
//thaidev
//MPJ8fjhR5bD8r0wQ

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

//Khởi tạo một đối tượng trelloDatabaseInstall ban đầu là null
let trelloDatabaseInstall = null
const mongoClientInstance = new MongoClient(env.MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }


})

//Kết nối tới Database
export const CONNECT_DB = async () => {
  //Gọi kết nối tới mongoDB Atlas với Url đã khai báo
  await mongoClientInstance.connect()
  //Kết nối thành công thì lấy
  trelloDatabaseInstall = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstall) throw new Error('Must connect to Database first!')
  return trelloDatabaseInstall
}

//Đóng kết nối tới Database khi cần
export const ClOSE_DB = async () => {
  await mongoClientInstance.close()
}