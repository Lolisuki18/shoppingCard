import { Router } from 'express'
import {
  serveImageController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/static.controllers'
import { wrapAsync } from '~/utils/handlers'

const staticRouter = Router()

//view image
staticRouter.get('/image/:namefile', serveImageController)
//namefile : là param

//view video
staticRouter.get('/video/:namefile', wrapAsync(serveVideoStreamController))
export default staticRouter
