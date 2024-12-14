//định nghĩa lại tất cả các thư viện của mình nếu cần
// định nghĩa lại các interface trong thư viện của mình nếu mình cần
import { Request } from 'express'
import { TokenPayLoad } from './models/requests/User.requests'
declare module 'express' {
  interface Request {
    decode_authorization?: TokenPayLoad
    decode_refresh_token?: TokenPayLoad
    decode_email_verify_token?: TokenPayLoad
    decode_forgot_password_token?: TokenPayLoad
  }
}
