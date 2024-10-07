import express from 'express';
import { PostsController } from '../controllers/posts.controller.js';
import authMiddleware from '../middlewares/auth.middlaware.js';

const router = express.Router();

const postsController = new PostsController();

router.post('/post', authMiddleware, postsController.createPost);
router.get('/get/:id', authMiddleware, postsController.getPostById);
router.get('/gets', postsController.getAllPosts);
router.patch('/patch/:id', authMiddleware, postsController.updatePost);
router.delete('/delete/:id', authMiddleware, postsController.deletePost);

export default router;