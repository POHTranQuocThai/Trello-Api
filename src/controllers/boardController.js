/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
    try {

        // Có kết quả thì trả về phía Client
        res.status(StatusCodes.CREATED).json({ message: 'POST from Controller:API craete new boards' })
    } catch (error) { next(error) }
}

export const boardController = {
    createNew
}