import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: [true, "El Rol Es Obligatorio"]
    }
});

export default mongoose.model("Role", RoleSchema);