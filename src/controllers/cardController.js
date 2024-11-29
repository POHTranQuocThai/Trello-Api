
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'


const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createdCard = await cardService.createNew(req.body)
    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const updatedCard = await cardService.update(cardId, req.body)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}
export const cardController = {
  createNew,
  update
}