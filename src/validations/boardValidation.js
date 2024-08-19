/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  /**
     * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì vì để FE tự validate và custom phía FE cho đẹp
     * BE chỉ cần validate Đảm bảo dữ liệu Chuẩn xác, và trả về mesage mặc định từ thư viện là được
     * Quan trọng : Việc Validate dữ liệu Bắc Buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào database.
     * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
    */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })
  try {
    //Chỉ định abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang Controller 
    next()
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })

  }
}

export const boardValidation = {
  createNew
}