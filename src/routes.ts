import express from 'express'
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import  AuthController  from './controllers/AuthController';
import  {auth}  from './middlewares/auth';



const classesController = new ClassesController();
const connectionsController = new ConnectionsController()
const authController = new AuthController()
const routes = express.Router();

routes.post('/classes', classesController.create )
routes.post('/login', authController.login)
routes.get('/connections', connectionsController.index)
routes.use(auth)
routes.get('/classes', classesController.index )
routes.get('/classesPaginate', classesController.indexPaginate)

routes.post('/connections', connectionsController.create )

 export default routes;