import { ChatService } from "../services/chat.service.js";

export class ChatController {
    chatService = new ChatService();

    sendMessage = async ({ chat, userId, roomId }) => {
        try {
            const message = await this.chatService.createChat({ chat, userId, roomId });
            return message;
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    };

    saveChatMessage = async (req, res) => {
        try {
            const { chat, userId, roomId } = req.body;
            const savedChat = await this.chatService.saveChatMessage(chat, userId, roomId);
            res.status(201).json({ data: savedChat });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    };

    getChatHistory = async (req, res) => {
        try {
            const { roomId } = req.params;
            const chatHistory = await this.chatService.getChatHistory(roomId);
            res.status(200).json({ data: chatHistory });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    };
}