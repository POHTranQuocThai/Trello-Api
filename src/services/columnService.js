
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
    // eslint-disable-next-line no-useless-catch
    try {
        //Xử lý logic dữ liệu tùy đặc thù dự án
        const newColumn = {
            ...reqBody
        }

        //Gọi tới tầng Model để xử lý lưu bản ghi newColumn vào trong Database
        const createdColumn = await columnModel.createNew(newColumn)
        //Lấy bản ghi column sau khi gọi
        const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
        //Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
        //Bắn email, notification về cho admin khi có 1 cái column mới được tạo
        if (getNewColumn) {
            getNewColumn.cards = []
        }

        await boardModel.pushColumnOrderIds(getNewColumn)
        //Trả kết quả về, trong service luôn phải có return
        return getNewColumn
    } catch (error) { throw error }
}

export const columnService = {
    createNew

}