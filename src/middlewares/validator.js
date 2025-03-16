import { body } from 'express-validator';
import { validarCampos } from './validar-campos.js';
import { existenteEmail } from '../helpers/db-validator.js';

const emailValidation = body('email').isEmail().withMessage('You must enter a valid email');
const passwordValidation = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

export const registerValidator = [
    body('name').notEmpty().withMessage('The name is required'),
    body('surname').notEmpty().withMessage('The surname is required'),
    emailValidation,
    body('email').custom(existenteEmail),
    passwordValidation,
    validarCampos
];

export const loginValidator = [
    body('email').optional().isEmail().withMessage('Enter a valid email address'),
    body('username').optional().isString().withMessage('Enter a valid username'),
    passwordValidation,
    validarCampos
];
