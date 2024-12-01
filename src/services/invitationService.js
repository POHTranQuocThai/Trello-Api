import { StatusCodes } from 'http-status-codes'
import { invitationModel } from '~/models/invitationModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    //Người đi mời
    const inviter = await userModel.findOneById(inviterId)
    //Người được mời
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    const board = await userModel.findOneById(reqBody.boardId)

    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!!')
    }

    //Tạo data cần thiết để lưu vào trong DB
    //Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), //chuyển về string vì sang model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    //Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    //Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      inviteeL: pickUser(invitee)
    }
    return resInvitation
  } catch (error) { throw error }
}

export const invitationService = {
  createNewBoardInvitation
}