import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'

import mediasService from '~/services/medias.services'

//cung cấp đường dẫn tuyệt đối tới bức hình -> làm cây chỉ dẫn đường
// export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
//   //khi người ta upload hình lên thì mình sẽ kiểm tra hình bằng formidable

//   //__dirname: chứa đường dẫn tuyệt đối đến thư mục chưa file chạy
//   //console.log(__dirname)
//   //path.resolve('uploads') : đường dẫn đến thư mục mà mình sẽ lưu file
//   //console.log(path.resolve('uploads'))

//   const form = formidable({
//     uploadDir: path.resolve('uploads'), //nơi sẽ lưu nếu vượt qua kiểm duyệt
//     maxFiles: 1, // tối đa 1 file
//     keepExtensions: true, // giữ lại đuôi file
//     maxFileSize: 1024 * 300 //tối đa 1 hình không quá 300kb
//   })
//   //tiến hành xài form để kiểm tra hình
//   form.parse(req, (err, fields, files) => {
//     //files là object chứa các file đã tải lên server
//     //Nếu ko upload file nào thì file này sẽ là {} -> object rỗng
//     if (err) {
//       throw err
//     } else {
//       res.json({
//         message: 'upload image successfully'
//       })
//     }
//   })
// }

//upload image
export const uploadImageController = async (
  req: Request, //
  res: Response,
  next: NextFunction
) => {
  const infor = await mediasService.handleUploadImage(req) //

  res.json({
    message: 'upload file success',
    infor
  })
}

//upload video
export const uploadVideoController = async (
  req: Request, //
  res: Response,
  next: NextFunction
) => {
  //mkv là file video của iphone
  //mkv ko thể ép kiểu thành mp4
  //người ta đưa lên video gì thì mình giữ đuôi đó
  const infor = await mediasService.handleUploadVideo(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload video successfully',
    infor
  })
}
