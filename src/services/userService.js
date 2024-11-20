import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
    try {
        //Kiểm tra email đã tồn tại trong hệ thống chưa
        const existUser = await userModel.findOneByEmail(reqBody.email)
        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!!!')
        }

        const nameFromEmail = reqBody.email.split('@')[0]
        const newUser = {
            email: reqBody.email,
            password: bcryptjs.hashSync(reqBody.password, 8),
            username: nameFromEmail,
            displayName: nameFromEmail,
            verifyToken: uuidv4()
        }
        //Thực hiện lưu thông tin vào db
        const createdUser = await userModel.createNew(newUser)
        //Lấy bản ghi user sau khi gọi
        const getNewUser = await userModel.findOneById(createdUser.insertedId)

        //return trả về dữ liệu cho phía controller
        return pickUser(getNewUser)
    } catch (error) { throw error }

}

export const userService = {
    createNew
}