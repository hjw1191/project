import { ReservationsService } from "../services/reservations.service.js";

export class ReservationsController {
    reservationsService = new ReservationsService();

    createReservation = async (req, res, next) => {
        try {
            const { from, to, date, postId } = req.body;
            const bookerId = req.user.id;
            const reservation = await this.reservationsService.createReservation(from, to, new Date(date), postId, bookerId);
            res.status(201).json({ data: reservation });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }

    getReservationById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const reservation = await this.reservationsService.getReservationById(id);
            res.status(200).json({ data: reservation });
        } catch (error) {
            res.status(404).json({ error: error.message });
            console.log(error)
        }
    }

    getAllReservations = async (req, res, next) => {
        try {
            const reservations = await this.reservationsService.getAllReservations();
            res.status(200).json({ data: reservations });
        } catch (error) {
            res.status(500).json({ error: error.message });
            console.log(error)
        }
    }

    updateReservation = async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedReservation = await this.reservationsService.updateReservation(id, data);
            res.status(200).json({ data: updatedReservation });
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }

    deleteReservation = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.reservationsService.deleteReservation(id);
            res.status(204).json({ message: 'Completely Deleted' })
        } catch (error) {
            res.status(400).json({ error: error.message });
            console.log(error)
        }
    }
}
