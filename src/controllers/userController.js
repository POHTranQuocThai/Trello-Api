import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const logout = async (req, res, next) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}
const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookie?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(new ApiError(StatusCodes.FORBIDDEN), 'Please Sign in! (Error from refresh Token)') }
}
const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecode._id
    const userAvatarFile = req.file
    const updateUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updateUser)
  } catch (error) { next(error) }
}
export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}