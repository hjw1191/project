import { ReservationsRepository } from "../repositories/reservations.repository.js";
export class ReservationsService {
    reservationsRepository = new ReservationsRepository();

    createReservation = async (from, to, date, postId, bookerId) => {
        if (!from || !to || !date || !postId || !bookerId) {
            throw new Error('All details (from, to, date, postId, bookerId) are required');
        }
        const createdReservation = await this.reservationsRepository.createReservation(from, to, date, postId, bookerId);
        return createdReservation;
    }

    getReservationById = async (id) => {
        const findedIdReservation = await this.reservationsRepository.getReservationById(id);
        if (!findedIdReservation) {
            throw new Error('Reservation not found');
        }
        return findedIdReservation;
    }

    getAllReservations = async () => {
        const Reservations = await this.reservationsRepository.getAllReservations();
        return Reservations
    }

    updateReservation = async (id, data) => {
        if (!id || !data) {
            throw new Error('All details (Id, data) are required');
        }
        const updatedReservation = await this.reservationsRepository.updateReservation(id, data);
        return updatedReservation
    }

    deleteReservation = async (id) => {
        if (!id) {
            throw new Error('Id required.');
        }
        const deletedReservation = await this.reservationsRepository.deleteReservation(id);
        return deletedReservation
    }

}