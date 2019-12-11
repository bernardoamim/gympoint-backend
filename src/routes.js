import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';

import authMiddleware from './app/middlewares/auth';
import InscriptionController from './app/controllers/InscriptionController';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// authenticated user's routes
routes.put('/users', UserController.store);

// authenticated student's routes
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

// authenticated plan's routes
routes.get('/plans', PlanController.index);
routes.get('/plans/:id', PlanController.show);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

// authenticated plan's routes
routes.get('/inscriptions', InscriptionController.index);
routes.get('/inscriptions/:id', InscriptionController.show);
routes.post('/inscriptions', InscriptionController.store);

export default routes;
