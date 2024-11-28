
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'


const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    //Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(userId, req.body)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    //Điều hướng dữ liệu sang tầng Service
    const board = await boardService.getDetails(userId, boardId)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    //Điều hướng dữ liệu sang tầng Service
    const updatedBoard = await boardService.update(boardId, req.body)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const result = await boardService.moveCardToDifferentColumn(req.body)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    //Page và ItemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    const { page, itemsPerPage } = req.query
    const results = await boardService.getBoards(userId, page, itemsPerPage)
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}