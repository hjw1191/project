import { prisma } from "../utils/prisma/index.js";

export class PointRepository {

    makePayment = async (payerId, receiverId, reservationId, cost) => {
        return await prisma.$transaction(async (prisma) => {
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId }
            })

            if (!reservation) {
                throw new Error('reservation must exist for the transaction');
            }
            if (reservation.status == "COMPLETED") {
                throw new Error('This Reservation was PENDED');
            }
            const payer = await prisma.user.findUnique({
                where: { id: payerId },
                select: { id: true, email: true, name: true, gender: true, point: true, role: true },
            });

            const receiver = await prisma.user.findUnique({
                where: { id: receiverId },
                select: { id: true, email: true, name: true, gender: true, point: true, role: true },
            });

            if (!payer || !receiver) {
                throw new Error('Both users must exist for the transaction');
            }

            if (payer.point < cost) {
                throw new Error('Insufficient points');
            }


            const updatedPayer = await prisma.user.update({
                where: { id: payer.id },
                data: { point: { decrement: cost } },
                select: { id: true, email: true, name: true, gender: true, point: true, role: true },
            });

            const updatedReceiver = await prisma.user.update({
                where: { id: receiver.id },
                data: { point: { increment: cost } },
                select: { id: true, email: true, name: true, gender: true, point: true, role: true },
            });

            const payerTransaction = await prisma.pointTransaction.create({
                data: {
                    userId: payerId,
                    reservationId: reservationId,
                    amount: -cost,
                    description: `${cost} points transferred to ${receiver.name}`,
                },
            });

            const receiverTransaction = await prisma.pointTransaction.create({
                data: {
                    userId: receiverId,
                    reservationId: reservationId,
                    amount: cost,
                    description: `${cost} points received from ${payer.name}`,
                },
            });

            // Update the reservation status
            const updatedReservation = await prisma.reservation.update({
                where: { id: reservationId },
                data: { status: "COMPLETED" },
            });

            return {
                updatedPayer,
                updatedReceiver,
                payerTransaction,
                receiverTransaction,
                updatedReservation,
            };
        });
    };

    getPointTransactionsByUserId = async (userId) => {
        return await prisma.pointTransaction.findMany({
            where: {
                userId: userId,
            },
            include: {
                reservation: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        gender: true,
                        point: true,
                        role: true,
                    },
                },
            },
        });
    };
}

