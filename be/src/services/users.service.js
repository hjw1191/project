import { UsersRepository } from '../repositories/users.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UsersService {
    usersRepository = new UsersRepository();

    findAllUsers = async () => {
        const users = await this.usersRepository.findAllUsers();
        return users.map(user => this.excludePassword(user));
    };

    findUserById = async (id) => {
        const user = await this.usersRepository.findUserById(id);
        if (!user) throw new Error('User not found');
        return this.excludePassword(user);
    };

    findUserByEmail = async (email) => {  // Modified to find by email
        const user = await this.usersRepository.findUserByEmail(email);
        if (!user) throw new Error('User not found');
        return this.excludePassword(user);
    };

    getCurrentUser = async (user) => {
        return this.excludePassword(user);
    }

    createUser = async (email, password, name, gender, role = "USER") => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await this.usersRepository.createUser(email, hashedPassword, name, gender, role);
        return this.excludePassword(createdUser);
    };

    updateUser = async (id, data) => {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const user = await this.usersRepository.updateUser(id, data);
        if (!user) throw new Error('User not found');
        return this.excludePassword(user);
    };

    deleteUser = async (id) => {
        const result = await this.usersRepository.deleteUser(id);
        if (!result) throw new Error('User not found');
        return result;
    };

    loginUser = async (email, password) => {
        const user = await this.usersRepository.findUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        return jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    };

    excludePassword(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    getUserReservations = async (userId) => {
        const user = await this.usersRepository.getUserReservations(userId);

        return this.excludePassword(user)
    }

    getUserPosts = async (userId) => {
        const user = await this.usersRepository.getUserPosts(userId);
        return this.excludePassword(user)
    }
}