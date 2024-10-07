import express from 'express';
import UsersRouter from './users.router.js';
import PostsRouter from './posts.router.js';
import ReserveRouter from './reservations.router.js'
// import ChatRouter from './chat.router.js'
import PointRouter from './point.router.js'

const router = express.Router();

router.use('/users', UsersRouter);
router.use('/posts', PostsRouter);
router.use('/reserve', ReserveRouter);
// router.use('/chat', ChatRouter);
router.use('/point', PointRouter);

export default router;
