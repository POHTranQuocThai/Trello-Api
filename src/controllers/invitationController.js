import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'


const createNewBoardInvitation = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecode._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) { next(error) }
}
const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecode._id
    const resInvitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(resInvitations)
  } catch (error) { next(error) }
}
export const invitationController = {
  createNewBoardInvitation,
  getInvitations
}