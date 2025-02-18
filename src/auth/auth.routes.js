import { Router } from 'express';
import { login, register} from './auth.controller.js';
import { registerValidator, loginValidator} from "../middlewares/validator.js";
import { deleteFileOnError } from "../middlewares/deleteFileOnError.js";

const router = Router();

router.post(
    '/login',
    loginValidator,
    login
);  

router.post(
    '/register',
    registerValidator,
    deleteFileOnError,
    register
);


export default router;