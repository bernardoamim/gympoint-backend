import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentSessionController from './app/controllers/StudentSessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import InscriptionController from './app/controllers/InscriptionController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

/**
 *    =======================  UNAUTHENTICATED ROUTES  ======================== //
 */

// Unauthenticated user's routes
routes.post('/users', UserController.store);

// Unauthenticated sessions's routes
routes.post('/sessions', SessionController.store);
routes.post('/students/sessions', StudentSessionController.store);

// Unauthenticated student's checkins routes
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

/**
 *    =========================  AUTHENTICATED ROUTES  ========================= //
 */

routes.use(authMiddleware);

// Authenticated user's routes
routes.put('/users', UserController.store);

// Authenticated student's routes
routes.get('/students', StudentController.index);
routes.get('/students/:id', StudentController.show);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

// Authenticated plan's routes
routes.get('/plans', PlanController.index);
routes.get('/plans/:id', PlanController.show);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

// Authenticated inscription's routes
routes.get('/inscriptions', InscriptionController.index);
routes.get('/inscriptions/:id', InscriptionController.show);
routes.post('/inscriptions', InscriptionController.store);
routes.put('/inscriptions/:id', InscriptionController.update);
routes.delete('/inscriptions/:id', InscriptionController.delete);

// Authenticated help order's routes
routes.get('/help-orders', HelpOrderController.index);
routes.get('/students/:id/help-orders', HelpOrderController.show);
routes.post('/students/:id/help-orders', HelpOrderController.store);

// Authenticated answer routes
routes.post('/help-orders/:id/answer', AnswerController.store);

export default routes;
