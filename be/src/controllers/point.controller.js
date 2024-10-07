import { PointService } from "../services/point.service.js";

export class PointController {
    pointService = new PointService();

    makePayment = async (req, res, next) => {
        try {
            const { payerId, receiverId, reservationId, cost } = req.body;
            const payment = await this.pointService.makePayment(payerId, receiverId, reservationId, cost);
            res.status(201).json({ data: payment });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }

    getUserTransactions = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            const transactions = await this.pointService.getTransactionsByUserId(userId);
            res.status(200).json({ data: transactions });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error);
        }
    };
}