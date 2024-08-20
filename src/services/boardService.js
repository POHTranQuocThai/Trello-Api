

/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { boardModel } from '~/models/boardModel'
import slugify from '~/utils/formatters'

const createNew = async (reqBody) => {
    // eslint-disable-next-line no-useless-catch
    try {
        //Xử lý logic dữ liệu tùy đặc thù dự án
        const newBoard = {
            ...reqBody,
            slug: slugify(reqBody.title)
        }

        //Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
        const createdBoard = await boardModel.createNew(newBoard)
        //Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
        //Bắn email, notification về cho admin khi có 1 cái board mới được tạo

        //Trả kết quả về, trong service luôn phải có return
        return createdBoard
    } catch (error) { throw error }
}

export const boardService = {
    createNew
}