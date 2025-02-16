
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { paginSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  memberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)

})
//Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật trong hàm update
const INVALID_UPDATE_FILEDS = ['_id', 'createdAt']
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) { throw new Error(error) }

}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error) }
}
//Query tổng hợp (aggregate) để lấy toàn bộ Columns và cards thuộc về Board
const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners',
          //pipeline: trong lookup là để xử lý một or nhiều luồng cần thiết
          //$project: để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}
//Nhiệm vụ của func này là push một cái giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' })
    return result
  } catch (error) { throw new Error(error) }
}
const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' })
    return result
  } catch (error) { throw new Error(error) }
}
//Lấy một phần tử columnId ra khỏi mảng columnOrderIds
//Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' })
    return result
  } catch (error) { throw new Error(error) }
}
const update = async (boardId, updateData) => {
  try {
    //Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FILEDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument: 'after' }) //Sẽ trả về kết quả mới sau khi cập nhật
    return result
  } catch (error) { throw new Error(error) }
}
// const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
//   try {
//     // Chuyển userId thành ObjectId
//     const userObjectId = new ObjectId(userId);

//     const queryConditions = [
//       // Điều kiện board chưa bị xóa
//       { _destroy: false },
//       // Điều kiện userId phải thuộc một trong ownerIds hoặc memberIds
//       {
//         $or: [
//           { ownerIds: { $all: [userObjectId] } },
//           { memberIds: { $all: [userObjectId] } }
//         ]
//       }
//     ];

//     // Xử lý các filter tìm kiếm (nếu có)
//     if (queryFilters) {
//       Object.keys(queryFilters).forEach(key => {
//         const filterValue = queryFilters[key];
//         // Sử dụng RegExp để tìm kiếm không phân biệt chữ hoa chữ thường
//         queryConditions.push({ [key]: { $regex: new RegExp(filterValue, 'i') } });
//       });
//     }

//     // Thực hiện truy vấn MongoDB
//     const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
//       { $match: { $and: queryConditions } },
//       { $sort: { title: 1 } }, // Sắp xếp theo title
//       {
//         $facet: {
//           'queryBoards': [
//             { $skip: paginSkipValue(page, itemsPerPage) }, // Skip các bản ghi của các trang trước
//             { $limit: itemsPerPage } // Giới hạn số lượng bản ghi trả về
//           ],
//           'queryTotalBoards': [{ $count: 'countedAllBoards' }] // Đếm tổng số boards
//         }
//       }
//     ], { collation: { locale: 'en' } }).toArray();

//     // Kiểm tra kết quả truy vấn

//     const res = query[0];

//     return {
//       boards: res.queryBoards || [],
//       totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
//     };
//   } catch (error) {
//     console.error('Error fetching boards:', error);
//     throw error;
//   }
// };

const getBoards = async (userId, page, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
      //Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      //Điều kiện 02 : userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds or memberIds,sử dụng toán tử $all của mongo
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]
    //Xử lý query filter cho từng trường hợp search board,vd search theo title
    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
        //queryFilters[key] vd queryFilters[title] nếu phía FE đẩy lên q[title]
        //Có phân biệt chứ hoa thường
        //queryConditions.push({ [key]: { $regex: queryFilters[key] } })
        //Ko phân biệt
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilters[key], 'i') } })
      })
    }
    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      //Sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường)
      { $sort: { title: 1 } },
      // $facet để xử lý nhiều luông ftrong 1 query
      {
        $facet: {
          //Luồng thứ nhất: Query boards
          'queryBoards': [
            { $skip: paginSkipValue(page, itemsPerPage) }, //Bỏ qua số lượng bản ghi của những page trước đó
            { $limit: itemsPerPage } //Giới hạn tối đa số lượng bản ghi trả về trên 1 page
          ],
          //Luồng 02: Query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về gán vào cái biến tự đặt tên countedAllBoards
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        }
      }
    ],
      //Khai báo thêm thuộc tính collation locale 'en' fix vụ chữ B trc a
      { collation: { locale: 'en' } }
    ).toArray()
    console.log('🚀 ~ getBoards ~ query:', query)

    const res = query[0]
    console.log('🚀 ~ getBoards ~ res:', res)
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw error }
}
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds

}


