

import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
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
    //Lấy bản ghi board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    //Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
    //Bắn email, notification về cho admin khi có 1 cái board mới được tạo

    //Trả kết quả về, trong service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}
const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!!')
    }
    //Deep clone board ra một cái mới để xử lý, không ảnh hướng tới board ban đầu
    //tùy mục đích sử dụng về sau mà có cần clone hay không
    const resBoard = cloneDeep(board)
    //Đứa card về đúng column của nó
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })

    delete resBoard.cards
    return resBoard
  } catch (error) { throw error }
}
const update = async (boardId, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}
const moveCardToDifferentColumn = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //B1 Cập nhật mảng cardOrderIds của column ban đầu chứa nó
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    //B2 Cập nhật mảng cardOrderIds của column tiếp theo
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //B3 Cập nhật lại trường  columnId mới của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}
const getBoards = async (userId, page, itemsPerPage) => {
  try {
    if (!page) page = DEFAULT_ITEMS_PER_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    return results
  } catch (error) { throw error }
}
export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}