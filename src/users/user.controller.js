import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js";
import Course from "../courses/course.model.js";

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;

        const query = { estado: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener Usuario",
            error
        });
    }
};

export const getAssignedCourses = async (req, res) => {
    try {
        const userId = req.usuario._id; 


        const user = await User.findById(userId).populate('cursos');

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            cursos: user.cursos 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los cursos asignados',
            error
        });
    }
};

export const assignCourseToStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Estudiante no encontrado"
            });
        }

        if (!Array.isArray(student.cursos)) {
            student.cursos = [];
        }

        const MAXCOURSES = 3;

        const totalCourses = student.cursos.length + courseId.length;

        if (totalCourses > MAXCOURSES) {
            return res.status(400).json({
                success: false,
                message: `El Estudiante Tiene El Máximo de ${MAXCOURSES} Cursos Asignados`
            });
        }

        const newCourseIds = courseId.filter(id => !student.cursos.includes(id));

        if (newCourseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El estudiante ya tiene los cursos seleccionados"
            });
        }

        for (const id of newCourseIds) {
            const course = await Course.findById(id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Curso No Encontrado"
                });
            }

            if (!student.cursos.includes(id)) {
                student.cursos.push(id);
            }
        }

        await student.save();

        res.status(200).json({
            success: true,
            message: "Cursos Asignados Al Estudiante Exitosamente",
            student,
            courseId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Asignar Los Cursos",
            error
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario Not Found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error Al Obtener Usuario",
            error
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { password, ...data } = req.body;

        if (req.usuario.role === "STUDENT_ROLE" && id !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                msg: "No está autorizado para actualizar la información de otro usuario"
            });
        }

        if (password) {
            data.password = await hash(password);
        }

        const user = await User.findByIdAndUpdate(id, data, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Usuario Actualizado!",
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar Usuario",
            error
        });
    }
};


export const unsubscribeStudent = async (req, res) => {
    try {
        const userId = req.usuario._id; 
        const user = await User.findByIdAndUpdate(userId, { estado: false }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Usuario dado de baja',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al dar de baja el usuario',
            error
        });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario.role !== "TEACHER_ROLE") {
            return res.status(403).json({
                success: false,
                msg: "No está autorizado para eliminar a otros usuarios"
            });
        }

        const user = await User.findByIdAndUpdate(id, { estado: false }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Usuario desactivado',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al Desactivar El Usuario',
            error
        });
    }
};
