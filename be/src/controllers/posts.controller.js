import { PostsService } from "../services/posts.service.js";

export class PostsController {
    postsService = new PostsService();

    createPost = async (req, res, next) => {
        try {
            const { title } = req.body
            let { type } = req.body
            if (type == "탑승자") {
                type = "USER";
            }
            else if (type == "운전자") {
                type = "DRIVER";
            }
            else {
                type = "TAXI";
            }

            const authorId = req.user.id;
            const post = await this.postsService.createPost(title, type, authorId);
            res.status(201).json({ data: post });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }

    getPostById = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const post = await this.postsService.getPostById(id);
            res.status(200).json({ data: post });
        } catch (error) {
            res.status(404).json({ error: error.message });
            console.log(error)
        }
    }

    getAllPosts = async (req, res, next) => {
        try {
            const posts = await this.postsService.getAllPosts();
            res.status(200).json({ data: posts });
        } catch (error) {
            res.status(500).json({ error: error.message });
            console.log(error)
        }
    }

    updatePost = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;
            const userId = req.user.id;
            const updatedPost = await this.postsService.updatePost(id, data, userId);
            res.status(200).json({ data: updatedPost });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }

    deletePost = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            await this.postsService.deletePost(id);
            res.status(204).json({ message: 'Completely Deleted' })
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }
}