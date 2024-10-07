import { ChatRepository } from '../repositories/chat.repository.js';

export class ChatService {
    chatRepository = new ChatRepository();
    // Create a chat message
    createChat = async ({ chat, userId, roomId }) => {
        try {
            // Call repository to create chat entry in the database
            const message = await this.chatRepository.createChat({ chat, userId, roomId });
            return message;
        } catch (error) {
            throw new Error('Error creating chat');
        }
    }

    // Get chat messages by room
    getChatsByRoom = async (roomId) => {
        try {
            return await this.chatRepository.getChatsByRoom(roomId);
        } catch (error) {
            throw new Error('Error fetching chats');
        }
    }
}
