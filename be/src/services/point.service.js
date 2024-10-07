import { PointRepository } from "../repositories/point.repository.js";

export class PointService {
    pointRepository = new PointRepository();

    makePayment = async (payerId, receiverId, reservationId, cost) => {
        const createdPost = await this.pointRepository.makePayment(payerId, receiverId, reservationId, cost);
        return createdPost;
    }

    getTransactionsByUserId = async (userId) => {
        return await this.pointRepository.getPointTransactionsByUserId(userId);
    };


}