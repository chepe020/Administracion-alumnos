import { Router } from "express";
import { check } from "express-validator";
import { getUsers, getUserById, updateUser, deleteUser, assignCourseToStudent, unsubscribeStudent,getAssignedCourses} from "./user.controller.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarRol } from "../middlewares/validar-roles.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();


router.get("/", getUsers);

router.get('/findCourse',
    [
        validarJWT
    ] ,
    getAssignedCourses
);


router.get(
    "/findUser/:id",
    [
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    getUserById
)

router.post(
    "/assign-course", [
        validarJWT,
        validarRol("TEACHER_ROLE")
    ],assignCourseToStudent

    );

router.put(
        "/:id",
        [
            validarJWT,
            check("id", "No es un ID Válido").isMongoId(),
            check("id").custom(existeUsuarioById),
            validarCampos
        ],
        updateUser
);
    
router.delete(
        "/unsubscribe",
        [
            validarJWT,
            validarRol("STUDENT_ROLE") 
        ],
        unsubscribeStudent
);
    

router.delete(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID Valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarRol("TEACHER_ROLE"),
        validarCampos
    ],
    deleteUser
)


export default router;