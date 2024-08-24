
import { GET_DB } from '~/config/mongodb'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }

    //Gọi tới tầng Model để xử lý lưu bản ghi newCard vào trong Database
    const createdCard = await cardModel.createNew(newCard)
    //Lấy bản ghi card sau khi gọi
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)
    //Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
    //Bắn email, notification về cho admin khi có 1 cái card mới được tạo
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    //Trả kết quả về, trong service luôn phải có return
    return getNewCard
  } catch (error) { throw error }
}
export const cardService = {
  createNew
}