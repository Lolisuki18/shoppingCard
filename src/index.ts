//dựng sever với express
import express from 'express'
import userRouter from './routes/users.routers'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routers'

const app = express()
const PORT = 3000

//call server mongo chạy

databaseService.connect()
initFolder() // mỗi lần sever chạy thì nó sẽ tạo luôn thư mục upload cho mình luôn
app.use(express.json()) // cho sever xài 1 middleware biến đổi json -> ko có cái này sẽ bị biến thành undefined
//server dùng cái route đã tạo
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter)
//http://localhost:3000/users/login body{email, password}

app.use(defaultErrorHandler)
//-> điểm tập kết lỗi của hệ thốnng -> điểm tập kết lỗi

app.listen(PORT, () => {
  console.log('SERVER BE đang chạy trên port : ' + PORT)
})
