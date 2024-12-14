//

import { createHash } from 'crypto'
import dotenv from 'dotenv'
dotenv.config()
//đoạn coden này sẽ mã hoá 1 nội dung nào đó về thành sha256
//đoạn code này của google
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

//hàm nhận vào password và mã hoá password đó bằng hàm sha256 của mình
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
