//file này chứa hàm error handler tổng
import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// lỗi từ toàn bộ hệ thống sẽ được dồn về đây
export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  //lỗi của toàn bộ hệ thống sẽ đổ về đây
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    //lỗi khác ErorrWithStatus, nghĩa là lỗi bth, lỗi k có status
    //lỗi có tùm lum thứ stack, name , ko có status
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    }) // lấy  1 danh sách những cái key của nó, rồi đổi tất cả thuộc tính về true -> bời vì mình ko biết có bao nhiêu thuộc tính trong đó
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    })
  }
  // res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}

//những cái lỗi do kết nối sever bị rớt mạng sẽ ko có status
