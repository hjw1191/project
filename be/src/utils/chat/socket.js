import { ChatController } from '../../controllers/chat.controller.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../../utils/prisma/index.js';

export function socketIo(io) {
    const chatController = new ChatController();
    io.on('connection', (socket) => {
        console.log('User connected', socket.id);

        socket.on('login', async (token, cb) => {
            try {
                let decodingtoken = token.split(" ")[1];
                if (!decodingtoken) {
                    throw new Error('Token is missing');
                }

                let decodedToken;
                try {
                    decodedToken = jwt.verify(decodingtoken, process.env.JWT_SECRET);
                } catch (jwtError) {
                    if (jwtError instanceof jwt.TokenExpiredError) {
                        throw new Error('Token has expired');
                    } else if (jwtError instanceof jwt.JsonWebTokenError) {
                        throw new Error('Invalid token');
                    } else {
                        throw new Error('JWT verification failed');
                    }
                }

                const email = decodedToken.email;
                if (!email) {
                    throw new Error('Email is missing from token payload');
                }

                const user = await prisma.user.findUnique({ where: { email: email } });
                if (!user) {
                    throw new Error('User not found');
                }

                socket.user = user;

                const welcomeMessage = {
                    chat: `${user.name} 님이 입장하셨습니다.`,
                    user: { id: null, name: "system" },
                };
                io.emit('message', welcomeMessage);

                cb({ ok: true, data: user });
            } catch (error) {
                console.error('Login error:', error);
                cb({ ok: false, error: error.message });
            }
        });

        socket.on('join_room', (roomId) => {
            if (!socket.user) {
                return;
            }
            socket.join(roomId);
            console.log(`User ${socket.user.name} joined room: ${roomId}`);
        });

        socket.on('send_message', async (data, cb) => {
            console.log(data);
            if (!socket.user) {
                cb({ ok: false, error: 'User not authenticated' });
                return;
            }

            const { chat, roomId } = data;
            console.log(roomId)

            try {
                const message = await chatController.sendMessage({
                    chat,
                    userId: socket.user.id,
                    roomId,
                });
                // io.to(roomId).emit("receive_message", {
                //     chat,
                //     user: socket.user, // Make sure `user` is attached to socket during login
                // }); 
                io.emit('receive_message', message);
                cb({ ok: true });
            } catch (error) {
                console.error('Error sending message:', error);
                cb({ ok: false, error: error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });
}