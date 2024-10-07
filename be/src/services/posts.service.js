import { PostsRepository } from "../repositories/posts.repository.js";
export class PostsService {
    postsRepository = new PostsRepository();

    createPost = async (title, type, authorId) => {
        if (!title) {
            throw new Error('Title is required');
        }
        const createdPost = await this.postsRepository.createPost(title, type, authorId);
        return createdPost;
    }

    getPostById = async (id) => {
        const findedIdPost = await this.postsRepository.getPostById(id);
        if (!findedIdPost) {
            throw new Error('Post not found');
        }
        return findedIdPost;
    }

    getAllPosts = async () => {
        const posts = await this.postsRepository.getAllPosts();
        return posts
    }

    updatePost = async (id, data, userId) => {
        const post = await this.postsRepository.getPostById(id);

        if (!post) {
            throw new Error('Post not found');
        }

        if (post.authorId !== userId) {
            throw new Error('You are not allowed to update this post.');
        }

        const updatedPost = await this.postsRepository.updatePost(id, data);

        return updatedPost
    }

    deletePost = async (id) => {
        const deletedPost = await this.postsRepository.deletePost(id);
        return deletedPost
    }

}