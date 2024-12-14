import { ObjectId } from 'mongodb'
import { USER_ROLE, UserVerifyStatus } from '~/constants/enums'

//emum nên nằm trong 1 file riêng

//UserType sẽ mô tả bằng muốn tạo 1 User thì cần nhưnngx thông tin nào là đủ?
// DÙng để mô tả -> muốn tạo thì chỉ cần gì là đủ? -> những optional thích thì có ko thì thôi
interface UserType {
  _id?: ObjectId //optional : có cũng được ko có cũng đc -> Mongo sẽ tự tạo cho mình
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date //lúc mới tạo chưa có gì thì nên cho bằng create_at
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus

  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
  role?: USER_ROLE //đây là dạng Enum
}

//muốn tạo và muốn có là khác nhau
//Interface : muốn tạo 1 user thì cần gì? -> bao nhiêu là đủ?

//Tạo ra class User dùng để mô tả 1 user sẽ có những thuộc tính gì
//-> mô tả 1 User phải có những gì?
//Class User sẽ dùng interface UserType để mô tả và tạo user

// ko lưu đc confirm_password -> vì mình đã scheme định nghĩa cái User ko có cái đó

export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus

  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string
  role: USER_ROLE
  constructor(user: UserType) {
    const date = new Date() //tạo này cho ngày created_at updated_at bằng nhau
    this._id = user._id || new ObjectId() // tự tạo id
    this.name = user.name || '' // nếu người dùng tạo mà k truyền ta sẽ để rỗng
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date()
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified

    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
    this.role = user.role || USER_ROLE.User
  }
}
