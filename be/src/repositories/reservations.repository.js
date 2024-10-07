import { prisma } from '../utils/prisma/index.js';

export class ReservationsRepository {

    createReservation = async (from, to, date, postId, bookerId) => {
        const createdReservation = await prisma.reservation.create({
            data: {
                from,
                to,
                date,
                post: { connect: { id: postId } }, // post
                booker: { connect: { id: bookerId } }, //user
            },
            select: {
                id: true,
                from: true,
                to: true,
                date: true,
                postId: true,
                booker: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        gender: true,
                        role: true,
                    }
                },
            }
        });
        return createdReservation;
    }

    getReservationById = async (id) => {
        const findedIdReservation = await prisma.reservation.findUnique({
            where: { id: parseInt(id) },
            include: {
                post: true,
                booker: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        gender: true,
                        role: true,
                    }
                }
            },
        });
        return findedIdReservation;
    };

    getAllReservations = async () => {
        const Reservations = await prisma.reservation.findMany({
            include: {
                post: true,
                booker: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        gender: true,
                        role: true,
                    }
                }
            },
        });
        return Reservations
    }

    updateReservation = async (id, data) => {
        const updatedReservation = await prisma.reservation.update({
            where: { id: parseInt(id) },
            data: data,
        });
        return updatedReservation;
    };

    deleteReservation = async (id) => {
        const deletedReservation = await prisma.reservation.delete({
            where: { id: parseInt(id) },
        });
        return deletedReservation;
    };
};