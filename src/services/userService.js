import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOAMIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

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

        const verificationLink = `${WEBSITE_DOAMIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
        const customeSubject = 'Trello MERN Stack Advanced: Please verify your email before using our services!'
        const htmlContent = `
            <h3>Here is your verification link:</h3>
            <h3>${verificationLink}</h3>
            <h3>Sincerely,<br />Thai Dev</h3>
        `
        //Gọi tới Provider để gửi mail
        await BrevoProvider.sendEmail(getNewUser.email, customeSubject, htmlContent)
        //return trả về dữ liệu cho phía controller
        return pickUser(getNewUser)
    } catch (error) { throw error }

}

const verifyAccount = async (reqbody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqbody.email)
        if (!existUser) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        }
        if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
        if (reqbody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

        const updateData = {
            isActive: true,
            verifyToken: null
        }
        const updatedUser = await userModel.update(existUser._id, updateData)
        return pickUser(updatedUser)
    } catch (error) { throw error }

}
const login = async (reqbody) => {
    try {
        const existUser = await userModel.findOneByEmail(reqbody.email)
        if (!existUser) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        }
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
        if (!bcryptjs.compareSync(reqbody.password, existUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
        }

        const userInfo = { _id: existUser._id, email: existUser.email }

        //Tạo ra 2 loại token
        const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

        const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

        return { accessToken, refreshToken, ...pickUser() }
    } catch (error) { throw error }
}
export const userService = {
    createNew,
    verifyAccount,
    login
}