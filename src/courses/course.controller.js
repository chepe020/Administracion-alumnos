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
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Guardar El Curso",
            error
        })
    }
}

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
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Obtener El Curso",
            error
        })
    }
}

export const searchCourse = async (req, res) =>{
    const {id} = req.params;

    try {
        const course = await Course.findById(id);

        if(!course){
            return res.status(404).json({
                success: false,
                message: "Curso No Encontrado"
            })
        }
        
        res.status(200).json({
            success: true,
            course
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al buscar el curso",
            error
        })
    }
}

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
            message: "Curso Eliminado Exitosamente y Desasignado de los Estudiantes"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Al Eliminar El Curso",
            error
        });
    }
};


export const updateCourse = async(req, res = response) => {
    try {
        const { id } = req.params; // ID del curso que se va a actualizar
        const { _id, students, ...data } = req.body; // Extraer la información del cuerpo de la solicitud

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                msg: "Curso no encontrado"
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
            msg: "Curso Actualizado y Alumnos Asignados!",
            course: updatedCourse
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error Al Actualizar El Curso",
            error
        });
    }
};
