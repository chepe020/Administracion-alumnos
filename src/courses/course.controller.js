import User from "../users/user.model.js";
import Course from "../courses/course.model.js";

export const saveCourse = async (req, res) =>{
    try {
        const { name, description } = req.body;
    
        const course = new Course({
            name,
            description
        });

        await course.save();

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al guardar el curso",
            error
        });
    }
};

export const getCourse = async(req, res) => {
    const {limite = 10, desde = 0} = req.query;
    const query = {status: true};
    try {
        const courses = await Course.find(query)
            .skip(Number(desde))
            .limit(Number(limite));

        if (!courses.length) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron cursos"
            });
        }

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el curso",
            error
        });
    }
};

export const searchCourse = async (req, res) =>{
    const {id} = req.params;

    try {
        const course = await Course.findById(id);

        if(!course){
            return res.status(404).json({
                success: false,
                message: "Curso no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al buscar el curso",
            error
        });
    }
};

export const deleteCourse = async(req, res) => {
    const {id} = req.params;

    try {
        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Curso no encontrado"
            });
        }

        await User.updateMany(
            { cursos: id },
            { $pull: { cursos: id } }  
        );

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Curso eliminado exitosamente y desasignado de los estudiantes"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el curso",
            error
        });
    }
};

export const updateCourse = async(req, res) => {
    try {
        const { id } = req.params;
        const { _id, students, ...data } = req.body; 

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Curso no encontrado"
            });
        }

        const updatedCourse = await Course.findByIdAndUpdate(id, data, { new: true });

        if (students) {
            await User.updateMany(
                { cursos: id },
                { $pull: { cursos: id } }
            );

            await User.updateMany(
                { _id: { $in: students } },
                { $addToSet: { cursos: id } }
            );
        }

        res.status(200).json({
            success: true,
            message: "Curso actualizado y alumnos asignados!",
            course: updatedCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el curso",
            error
        });
    }
};
