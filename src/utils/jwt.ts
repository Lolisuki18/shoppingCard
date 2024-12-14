//file này lưu hàm tiện ích giúp mình liên kết với services jwt
//và nhớ nó ký cho mình 1 token
//signToken là hàm ký token

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { TokenPayLoad } from '~/models/requests/User.requests'
dotenv.config()
//jwt.SignOptions giá trị mặc định
//->nên chuyền dưới dạng object
//-> chuyền dưới dạng payload: any, privateKey: string, options: jwt.SignOptions -> nên truyền dưới dạng object phân rã rồi định nghĩa
//từng phần tử
//kí sẽ tồn thời gian -> nên nó sẽ là 1 cái lời hứa
export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer // buffer là những dữ liệu từ bàn phím
  privateKey: string // có thể gửi 1 cái privatekey hoặc ko gửi -> nếu ko gửi thì nó sẽ là giá trị mặc định JWT_SECRET
  options?: jwt.SignOptions // thêm dấu ? thì có cũng được ko có cũng được => nếu ko gửi lên sẽ lấy mặc định là HS256
}) => {
  return new Promise<string>((resolve, reject) => {
    //kêu jwt ký cho mình
    jwt.sign(payload, privateKey, options, (error, token) => {
      //-> này bị bất đồng bộ -> promise cho nó thành đồng bộ
      //thành công thì đc token  sẽ làm gì? -> thất bại sẽ được error sẽ làm gì?
      if (error) throw reject(error)
      else resolve(token as string)
      // -> nếu thành công thì chắc chắn sẽ có kq nên cứ định nghĩa cho nó là kiểu string
    })
  })
}

//signToken là hàm ký token, jwt.SignOptions giá trị măc định
// export const signToken = ({
//   payload,
//   privateKey = process.env.JWT_SECRET as string,
//   options = { algorithm: 'HS256' }
// }: {
//   payload: string | object | Buffer
//   privateKey?: string
//   options?: jwt.SignOptions
// }) => {
//   return new Promise<string>((resolve, reject) => {
//     // kêu jwt ký cho mình
//     jwt.sign(payload, privateKey, options, (error, token) => {
//         if (error) throw reject(error)
//         else resolve(token as string)
//     })
//   })
// }

//làm hàm giúp kiểm tra 1 token có đúng với chữ ký hay không ?
//nếu đúng thì trả ra payload đang có trong token đó

export const verifyToken = ({ token, privateKey }: { token: string; privateKey: string }) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, privateKey, (error, decode) => {
      if (error) throw reject(error)
      else return resolve(decode as TokenPayLoad)
    })
  })
}
//decode chính là payload
