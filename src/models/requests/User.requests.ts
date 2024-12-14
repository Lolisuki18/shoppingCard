// định nghĩa những gì mà người dùng gửi lên trong request

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import { ParsedQs } from 'qs'

//register
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

//login
export interface LoginReqBody {
  email: string
  password: string
}

//tokenpay load
export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
}

//logout
export interface LogoutReqBody {
  refresh_token: string
}

//email verify
export interface emailVerifyReqQuery extends ParsedQs {
  email_verify_token: string
}

//forgotpassword
export interface ForgotPasswordReqBody {
  email: string
}

//verify forgot password
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

//reset password
export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

//update me
export interface UpdateMeReqBody {
  name?: string //optional
  date_of_birth?: Date //optional
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

//change password
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

//refresh token
export interface RefreshTokenReqBody {
  refresh_token: string
}
