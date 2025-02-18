import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El Nombre Es Obligatorio"]
    },
    description: {
        type: String,
        required: [true, "La Descripcion Es Obligatoria"]
    },
    status: {
        type: Boolean,
        default: true
    }
});

CourseSchema.methods.toJSON = function() {
    const {__v,password, _id, ...usuario} = this.toObject();
    usuario.uid = _id;
    return usuario;
}

export default mongoose.model("Course", CourseSchema);