
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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
const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
      //Trường hợp upload file lên Cloud Storage
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      //Lưu lại url(secure_url) của cái file ảnh vào trong database
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.incomingMemberInfo) {
      //Trường hợp ADD or REMOVE
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else if (updateData.commentToAdd) {
      //Tạo dữ liệu comment để thêm vào DB, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    }
    else {
      //Các trường hợp update chung như title,displayName
      updatedCard = await cardModel.update(cardId, updateData)
    }
    return updatedCard
  } catch (error) { throw error }
}
export const cardService = {
  createNew,
  update
}