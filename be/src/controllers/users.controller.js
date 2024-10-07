import { UsersService } from "../services/users.service.js";

export class UsersController {
    usersService = new UsersService()

    getUsers = async (req, res, next) => {
        try {
            const users = await this.usersService.findAllUsers();
            return res.status(200).json({ data: users });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    getUserById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = await this.usersService.findUserById(id);
            return res.status(200).json({ data: user });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    getUserByEmail = async (req, res, next) => {
        try {
            const { email } = req.params;
            const user = await this.usersService.findUserByEmail(email);
            return res.status(200).json({ data: user });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    getCurrentUser = async (req, res, next) => {
        try {
            const user = await this.usersService.getCurrentUser(req.user);
            return res.status(200).json({ data: user });
        } catch (error) {
            // next(error); 
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    }

    createUser = async (req, res, next) => {
        try {
            const { email, password, name, gender } = req.body;
            if (!email || !password || !name || !gender) {
                return res.status(400).json({ error: '이메일, 비밀번호, 이름, 성별이 필요합니다.' });
            }
            // // 이메일 유효성 검사(example@example.com) 형태
            // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // if (!email || !emailRegex.test(email)) {
            //     return res.status(400).json({ error: '유효한 이메일 주소를 입력하세요.' });
            // }

            // // 비밀번호 유효성 검사 (영어 숫자 포함 8자 이상)
            // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            // if (!password || !passwordRegex.test(password)) {
            //     return res.status(400).json({ error: '비밀번호는 영어와 숫자를 포함해 8자 이상이어야 합니다.' });
            // }

            // // 이름 검사
            // if (!name) {
            //     return res.status(400).json({ error: '이름을 입력하세요.' });
            // }
            const createdUser = await this.usersService.createUser(email, password, name, gender);
            return res.status(201).json({ data: createdUser });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    updateUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updatedUser = await this.usersService.updateUser(id, req.body);
            return res.status(200).json({ data: updatedUser });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.usersService.deleteUser(id);
            return res.status(204).json({ message: 'Completely Deleted' });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };

    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const token = await this.usersService.loginUser(email, password);
            return res.status(200).setHeader('authorization', `Bearer ${token}`).json({ message: 'Token logged in console' });
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    };
    processPayment = async (req, res, next) => {
        try {
            const { payer, receiver, cost } = req.body;
            const result = await this.usersService.processPayment(payer, receiver, cost);
            return res.status(200).json(result);
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    }

    getUserReservations = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            const reservations = await this.usersService.getUserReservations(userId);
            return res.status(200).json(reservations);
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    }

    getUserPosts = async (req, res, next) => {
        try {
            const userId = parseInt(req.params.userId);
            const posts = await this.usersService.getUserPosts(userId);
            return res.status(200).json(posts);
        } catch (error) {
            // next(err);
            console.log("error : ", error)
            return res.status(500).json({ error, message: '서버 오류' });
        }
    }
}