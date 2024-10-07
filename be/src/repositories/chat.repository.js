import { prisma } from "../utils/prisma/index.js";

export class ChatRepository {

    createChat = async ({ chat, userId, roomId }) => {
        try {
            const newChat = await prisma.chat.create({
                data: {
                    chat,
                    userId,
                    roomId,
                },
                include: {
                    user: true,
                },
            });
            return newChat;
        } catch (error) {
            throw new Error('Error creating chat in the database');
        }
    }

    // Get chats by room ID
    getChatsByRoom = async (roomId) => {
        try {
            return await prisma.chat.findMany({
                where: { roomId },
                include: { user: true },
                orderBy: { createdAt: 'asc' },
            });
        } catch (error) {
            throw new Error('Error fetching chat history');
        }
    }
}

export default { ChatRepository };