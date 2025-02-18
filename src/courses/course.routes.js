import { Router } from "express";
import { check } from "express-validator";
import {saveCourse, getCourse, searchCourse, deleteCourse, updateCourse} from "./course.controller.js";
import {validarCampos} from "../middlewares/validar-campos.js";
import {validarJWT} from "../middlewares/validar-jwt.js";
import {validarRol} from "../middlewares/validar-roles.js";


const router = Router();

router.post(
    "/",
    [
        validarJWT,
        check("email", "Este No Es Un Correo Valido").not().isEmpty(),
        validarCampos,
        validarRol("TEACHER_ROLE"),
    ],
    saveCourse
)

router.get("/", getCourse)

router.get(
    "/:id",
    [
        validarJWT,
        check("id", "No Es Un ID Valido").isMongoId(),
        validarCampos
    ],
    searchCourse
)

router.put(
    "/:id",
    [   
        validarJWT,
        validarCampos,
        validarRol("TEACHER_ROLE")
    ],
    updateCourse
)


router.delete(
    "/:id",
    [   
        validarJWT,
        check("id", "No Es Un ID Valido").isMongoId(),
        validarCampos,
        validarRol("TEACHER_ROLE")
    ],
    deleteCourse
)

export default router;