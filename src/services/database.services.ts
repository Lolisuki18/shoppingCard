import { Collection, Db, MongoClient } from 'mongodb'
//npm i dotenv : dùng để tải thử viện để xài .env
import dotenv from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
dotenv.config() //kích hoạt liên kết env
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@shoppingcard.nlpfy.mongodb.net/?retryWrites=true&w=majority&appName=shoppingCard`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  //method
  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect() // từ 4.7 trở lên ko cần câu lệnh này nữa (optional)
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      //finally {
      // Ensures that the client will close when you finish/error
      //await client.close()  -> khi đã bật sever thì ko cần tắt
      console.log(err)
      throw err
    }
  }

  //hàm lấy instance của collection USERS
  get users(): Collection<User> {
    // mình phải dạy cho nó ở trên đó có gì chứ ko nó sẽ hiểu là Document nên mình phải dạy nó
    //accessor property
    return this.db.collection(process.env.DB_USERS_COLLECTION as string) // nếu ko có as String nó sẽ báo lỗi vì sợ ko xd đc kiểu dữ liệu
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
}

let databaseService = new DatabaseService()
export default databaseService
//tất cả những thằng ở services nên là class

//***** cách viết dependency injection -> design pattern
//nếu mình export class thì ra ngoài  thì nó sẽ rất dở -> những thằng sử dụng mình sẽ phải tạo instance  mới xài đc
//-> cứ mỗi 1 file thì nta phải tạo thì mới xài đc
// =>  tạo trước rồi export default cái instance ra để cho nta xài ->những thằng xài ko phải new
//-> ko cần tạo mới -> sẽ giảm tải dung lượng cho chúng ta
