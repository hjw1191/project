import express from 'express';
import { ReservationsController } from '../controllers/reservations.controller.js';
import authMiddleware from '../middlewares/auth.middlaware.js';

const router = express.Router();

const reservationsController = new ReservationsController();

router.post('/reserve', authMiddleware, reservationsController.createReservation);
router.get('/get/:id', authMiddleware, reservationsController.getReservationById);
router.get('/gets', reservationsController.getAllReservations);
router.patch('/patch/:id', authMiddleware, reservationsController.updateReservation);
router.delete('/delete/:id', authMiddleware, reservationsController.deleteReservation);

export default router;