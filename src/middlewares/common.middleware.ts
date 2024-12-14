//update me -> dùng để lọc dữ liệu -> chỉ lấy nhưntx
//những liệu mà mình cho phép cập nhập thôi
//nếu chuyền lên những dữ liệu khác thì mình sẽ không chò phép

import { Request, Response, NextFunction } from 'express'
import { pick } from 'lodash'

//đây là 1 middleware chỉ lọc lấy những thứ mình muốn thôi, còn những cái mình k muốn thì bỏ đi
//ví dụ nếu truyền lên password thì mình sẽ không lấy
type FilterKeys<T> = Array<keyof T>
//mảng các key của object T nào đó  -> có thể thiếu nhưng ko thể dư -> ko thêm thuộc tính khác vào được

export const filterMiddleware = <T>(filterKeys: FilterKeys<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //middleware này sẽ mod lại req.body bằng những filterKeys đã liệt kê
    //pick : nó chỉ lấy đúng những thuộc tính mà mình liệt kê thôi
    req.body = pick(req.body, filterKeys)
    next()
  }
}
