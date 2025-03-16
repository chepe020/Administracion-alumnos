import { response, request } from "express";
import { hash } from "argon2";
import User from "./user.model.js";
import Course from "../courses/course.model.js";

const handleErrorResponse = (res, message, error) => {
    res.status(500).json({ success: false, message, error });
};

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query).skip(Number(desde)).limit(Number(limite))
        ]);

        res.status(200).json({ success: true, total, users });
    } catch (error) {
        handleErrorResponse(res, "Error al obtener usuarios", error);
    }
};

export const getAssignedCourses = async (req, res) => {
    try {
        const user = await User.findById(req.usuario._id).populate('cursos');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            cursos: user.cursos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los cursos asignados",
            error
        });
    }
};


export const assignCourseToStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Estudiante no encontrado" });

        student.cursos = student.cursos || [];
        const MAX_COURSES = 3;
        const newCourseIds = courseId.filter(id => !student.cursos.includes(id));
        
        if (student.cursos.length + newCourseIds.length > MAX_COURSES) {
            return res.status(400).json({ success: false, message: `Máximo ${MAX_COURSES} cursos permitidos` });
        }

        for (const id of newCourseIds) {
            const course = await Course.findById(id);
            if (!course) return res.status(404).json({ success: false, message: "Curso no encontrado" });
            student.cursos.push(id);
        }

        await student.save();
        res.status(200).json({ success: true, message: "Cursos asignados exitosamente", student });
    } catch (error) {
        handleErrorResponse(res, "Error al asignar cursos", error);
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, msg: "Usuario no encontrado" });
        
        res.status(200).json({ success: true, user });
    } catch (error) {
        handleErrorResponse(res, "Error al obtener usuario", error);
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.usuario.role === "STUDENT_ROLE" && id !== req.usuario._id.toString()) {
            return res.status(403).json({ success: false, msg: "No autorizado para modificar otro usuario" });
        }

        const data = req.body;
        if (data.password) data.password = await hash(data.password);
        
        const user = await User.findByIdAndUpdate(id, data, { new: true });
        if (!user) return res.status(404).json({ success: false, msg: "Usuario no encontrado" });

        res.status(200).json({ success: true, msg: "Usuario actualizado", user });
    } catch (error) {
        handleErrorResponse(res, "Error al actualizar usuario", error);
    }
};

export const unsubscribeStudent = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.usuario._id, { estado: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
        
        res.status(200).json({ success: true, msg: 'Usuario dado de baja', user });
    } catch (error) {
        handleErrorResponse(res, "Error al dar de baja al usuario", error);
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.usuario.role !== "TEACHER_ROLE") {
            return res.status(403).json({ success: false, msg: "No autorizado para eliminar usuarios" });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { estado: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });

        res.status(200).json({ success: true, msg: 'Usuario desactivado', user });
    } catch (error) {
        handleErrorResponse(res, "Error al desactivar usuario", error);
    }
};
