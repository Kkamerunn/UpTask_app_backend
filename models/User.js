import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});
usersSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

usersSchema.methods.checkPassword = async function(passwordForm) {
    return await bcrypt.compare(passwordForm, this.password);
} 

const User = mongoose.model("User", usersSchema);

export default User;