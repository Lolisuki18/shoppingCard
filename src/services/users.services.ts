//userService chứa các method giúp xử lý liên quan đến users collection

import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { ChangePasswordReqBody, LoginReqBody, RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import dotenv from 'dotenv'
import { after, update } from 'lodash'
import { access } from 'fs'
dotenv.config
//payload là cái kiện dữ liệu và mình sẽ mô tả trong đó
class UsersServices {
  //viết hàm dùng jwt để ký access_token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  //viết hàm dùng jwt để ký Refresh_token
  private signRefreshToken(user_id: string) {
    //-> signToken là promise mà mình ko đợi awai .. -> SignRefreshToken cũng trở thành Promise luôn
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  //Viêt hàm dùng jwt để ký email_verify_token
  private signEmailVerifyToken(user_id: string) {
    //-> signToken là promise mà mình ko đợi awai .. -> SignRefreshToken cũng trở thành Promise luôn
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }
  //viết hàm dùng jwt để ký forgot_password_token
  private signForgotPasswordToken(user_id: string) {
    //-> signToken là promise mà mình ko đợi awai .. -> SignRefreshToken cũng trở thành Promise luôn
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }

  //hàm dùng để check refresh token
  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshToken = await databaseService.refresh_tokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    return refreshToken
  }
  //hàm check email
  async checkEmailExist(email: string) {
    //vào database và tìm user sở hữa database đó nếu có thì nghĩa là có người xài rồi
    const user = await databaseService.users.findOne({ email })
    return Boolean(user) // ép kiểu user thành dạng boolean
  }

  //hàm tìm user bằng userid
  async findUserById(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND, //404
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //nếu có thì
    return user
  }
  //đăng ký
  async register(payload: RegisterReqBody) {
    //tạo trước luôn user ID -> dùng để xác thực bằng email luôn từ đầu
    //-> mỗi người dùng sẽ chỉ cần verify 1 lần
    let user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await databaseService.users.insertOne(
      new User({
        //payload là object nên phải phân rã
        _id: user_id,
        username: `user${user_id.toString()}`, // tạo thêm prop username vào
        email_verify_token,
        ...payload,
        //sẽ lỗi vì mình định nghĩa date_of_birth của người dùng là Date mà mình gửi lên là string nên
        //-> phải định nghĩa lại
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    //sau khi tạo tài khoản và lưu lên database ta sẽ ký ac và rf token để đưa cho người dùng
    //nhưng mà muốn ký cần user ID của account đó
    //const user_id = result.insertedId.toString() // -> ví nó có dạng ObjectID nên phải toString để lấy dạng String
    //ký
    const [access_token, refresh_token] = await Promise.all([
      // -> dùng Promise.all để ký 1 phát 2 cái luôn ko cần đợi nhau tốn nhìu time hơn -> làm nhìu tác vụ bất đồng bộ trong cùng 1 lúc
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])

    //Ký thêm email_verify_token gửi vào email của người đăng ký
    console.log(`Gửi mail link xác thực sau: 
          http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
      `)

    //lưu cái refreshToken lại
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    ) // call để nhét vào data base chứ ko có nhu cầu hứng -> 1 người dùng có thể có rất nhiều rf
    return {
      access_token,
      refresh_token
    }
  }
  //hàm đăng nhập
  async login({ email, password }: LoginReqBody) {
    //dùng email và password để tìm user
    const user = await databaseService.users.findOne({
      email,
      password: hashPassword(password)
    })

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    //nếu có user thì tạo at và rf
    const user_id = user._id.toString() // ko đc xài as string
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //lưu cái refreshToken lại
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    ) // call để nhét vào data base chứ ko có nhu cầu hứng
    return { access_token, refresh_token }
    // tất cả đều phải là Object
  }
  //hàm đăng xuất
  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
  }
  //hàm check email verify
  async checkEmailVerifyToken({ user_id, email_verify_token }: { user_id: string; email_verify_token: string }) {
    //tìm xem user nào có sở hữu 2 thông tin này cùng lúc -> nếu có thì nghĩa là token hợp lệ
    //nếu ko có nghĩa là token đã bị thay thế rồi
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id), //người dùng đưa cho mình là string mà mình cần ObjectId
      email_verify_token
    })
    //nếu k tìm được thì  có nghĩa là token này đã bị thay thế
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID
      })
    }
    //nếu có thì
    return user
  }
  //gọi hàm này khi đã kiểm tra email_verify_token đúng mã
  // đúng người dùng
  async verifyEmail(user_id: string) {
    //cập nhập trạng thái trong account
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified, //
            email_verify_token: '',
            updated_at: '$$NOW' //lấy thời gian của sever / new DATE là thấy thời gian trên máy mình
          }
        }
      ]
    )
    //ký lại access và rf
    const [access_token, refresh_token] = await Promise.all([
      // -> dùng Promise.all để ký 1 phát 2 cái luôn ko cần đợi nhau tốn nhìu time hơn -> làm nhìu tác vụ bất đồng bộ trong cùng 1 lúc
      this.signAccessToken(user_id.toString()),
      this.signRefreshToken(user_id.toString())
    ])
    //lưu lại trên database
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    ) // call để nhét vào data base chứ ko có nhu cầu hứng -> 1 người dùng có thể có rất nhiều rf
    return {
      access_token,
      refresh_token
    }
  }

  //gửi lại link verifyEmail
  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    console.log(`Gửi mail link xác thực sau: 
      http://localhost:3000/users/verify-email/?email_verify_token=${email_verify_token}
  `)
    //lưu vào lại database
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id.toString())
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }
  //forgot Password
  async forgotPassword(email: string) {
    //dùng email tìm user lấy _id tạo forgot_password_token
    const user = await databaseService.users.findOne({ email })
    if (user) {
      const user_id = user._id.toString()
      //ký forgot_password_token
      const forgot_password_token = await this.signForgotPasswordToken(user_id)
      //lưu vào database
      await databaseService.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            $set: {
              forgot_password_token,
              updated_at: '$$NOW'
            }
          }
        ]
      )
      //gửi email cái link cho người dùng
      //3000 : back
      //8000: front
      console.log(`Gửi mail link xác thực sau: 
        http://localhost:8000/reset-password/?forgot_password_token=${forgot_password_token}
    `)
    }
  }
  //reset password
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    //tìm user có user_id này và cập nhập password
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      //tìm
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
  }
  //get me
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          //muốn giấu cái gì thì bỏ số 0 vào cái đó
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
        //trong dó projection(phép chiếu pi) giúp ta loại bỏ lấy về các thuộc tính như password,
        //email_verify_token, forgot_password_token
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    // sẽ ko có những thuộc tính nêu trên , tránh bị lộ thông tin
    return user
  }

  //update me
  //do req.body có quá nhiều thông tin thì đặt tên là payload,
  async updateMe({
    user_id,
    payload
  }: {
    user_id: string //
    payload: UpdateMeReqBody
  }) {
    //trong payload có 2 trường dữ liệu cần xử lý
    //date_of_birth
    //_ là ám chỉ cho việc nó private
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload // không biết lúc cập nhập thông tin m có gửi lên date_if_birth cho t hay không ?
    //nếu có thì chuyển qua kiểu date còn ko thì cứ bt

    //username
    if (_payload.username) {
      //nếu có thì tìm xem có ai giống không? có ai bị trùng không ?
      const user = await databaseService.users.findOne({ username: _payload.username })
      if (user) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
        })
      }
    }
    //nếu userName truyền lên mà không có người trùng thì ok -> mình bắt đầu cập nhập
    const user = await databaseService.users.findOneAndUpdate(
      // trả về người dùng đã update cho mình
      { _id: new ObjectId(user_id) }, //
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after', //-> sau tất cả thì đưa user lại cho mình
        projection: {
          //loại bỏ những thông tin nhạy cảm đi-> không muốn cho người dùng xem
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  //changepassword
  async changePassword({
    user_id,
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    //tìm user bằng username và old_password
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })
    //nếu ko có user nào khớp thì mình throw lỗi
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //nếu có thì cập nhập lại password
    //cập nhập lại password và forgot_password_token
    //lưu password đã hash rồi
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
    //nếu muốn nta đổi mk xong tự đăng nhập luôn thì trả về rf và ac token
    //nhưng ở đây mình chỉ cho người ta đổi mk thôi , nên trả về message
  }

  //refresh token
  async refreshToken({
    user_id,
    refresh_token //
  }: {
    user_id: string
    refresh_token: string
  }) {
    // tạo 2 ac và rf(chưa tính đến vấn đề nó sẽ bị route timing)
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
    //xoá mã cũ
    databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    //lưu mã mới
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    //ném ra ac và rf mới
    return {
      access_token,
      refresh_token: new_refresh_token
    }
  }
}

//chơi với database phải await async vì nó sẽ tốn thời gian
let usersServices = new UsersServices()
export default usersServices
