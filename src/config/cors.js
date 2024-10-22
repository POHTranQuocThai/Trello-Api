
import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// Cấu hình CORS Option trong dự án thực tế
export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các yêu cầu không có origin (như khi sử dụng Postman) trong môi trường dev
    if (env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    // Nếu môi trường production, kiểm tra origin có thuộc whitelist không
    if (WHITELIST_DOMAINS.includes(origin) || !origin) {
      // !origin để chấp nhận trường hợp origin là undefined (dùng Postman)
      return callback(null, true)
    }

    // Nếu không, trả về lỗi 403
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin || 'undefined'} not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // Cho phép cookies từ client
  credentials: true
}
