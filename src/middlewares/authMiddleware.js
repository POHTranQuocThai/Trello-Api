import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'


const isAuthorized = async (req, res, next) => {
  //Lấy access token phía request cookies phía client - trong file authorizedAxios
  const clientAccessToken = req.cookies?.access_token
  //Nếu không tồn tại
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! token not found!'))
    return
  }

  try {
    //b1 Thực hiện giải mã token xem nó có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    //b2 Quan trọng: Nếu như cái token hợp lệ, cần phải lưu thông tin giải mã được vào cái req
    req.jwtDecoded = accessTokenDecoded
    //b3 Cho phép cái request đi tiếp
    next()
  } catch (error) {
    //Nếu accessToken hết hạn thì mình cần trả về một cái lỗi GONE -401 cho phía FE để gọi api refreshToken
    if (error?.message?.includes('jwt exprired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }
    //Nếu cái accessToken đó không hợp lệ do bất kỳ điều gì ngoài hét hạn thì cử trả về lỗi 401 cho FE goi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
  }


}

export const authMiddleware = {
  isAuthorized
}