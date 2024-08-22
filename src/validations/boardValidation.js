
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
const createNew = async (req, res, next) => {
  /**
     * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để FE tự validate và custom phía FE cho đẹp
     * BE chỉ cần validate Đảm bảo dữ liệu Chuẩn xác, và trả về mesage mặc định từ thư viện là được
     * Quan trọng : Việc Validate dữ liệu Bắc Buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào database.
     * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
    */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })
  try {
    //Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller 
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)

  }
}
const update = async (req, res, next) => {

  const correctCondition = Joi.object({
    //Lưu ý không require trong trường hợp update
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  })
  try {
    //Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    //Đối với trường hợp update, cho phép Unknown để không cần đẩy một số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller 
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)

  }
}

export const boardValidation = {
  createNew,
  update
}