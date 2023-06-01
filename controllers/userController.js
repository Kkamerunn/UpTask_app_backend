import User from "../models/User.js";
import { generateId, generateJWT } from "../helpers/index.js";
import { emailRegister, emailForgotPassword } from "../helpers/email.js";

const register = async (req, res) => {
    // Avoid duplicated emails
    const { email } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        const error = new Error("This user exists!");
        return res.status(400).json({
            msg: error.message
        });
    }

    try {
        const user = new User(req.body);
        user.token = generateId();
        await user.save();
        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        });
        res.json({
            msg: "User created correctly, check your email to confirm your account"
        });
    } catch (error) {
        console.log(error);
    }
};

const auth = async (req, res) => {
    const { email, password } = req.body;

    // Ask if user exists
    const user = await User.findOne({email});
    if (!user) {
        const error = new Error("The user doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    // Ask if user is confirmed
    if (!user.confirmed) {
        const error = new Error("Your account hasn't been confirmed");
        return res.status(403).json({ msg: error.message });
    }

    // Ask for the password
    if (await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id)
        });
    } else {
        const error = new Error("The password is wrong");
        return res.status(403).json({ msg: error.message });
    }
}

const confirmToken = async (req, res) => {
    const { token } = req.params;
    const userConfirm = await User.findOne({token});

    if (!userConfirm) {
        const error = new Error("Invalid token");
        return res.status(403).json({ msg: error.message });
    }

    try {
        userConfirm.confirmed = true;
        userConfirm.token = '';
        await userConfirm.save();
        res.json({
            msg: "User confirmed correctly"
        });
    } catch (error) {
        console.log(error);
    }
}

const reCreateToken = async (req, res) => {
    const { email }  = req.body

    // Ask if user exists
    const user = await User.findOne({email});
    if (!user) {
        const error = new Error("The user doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = generateId();
        await user.save();

        emailForgotPassword({
            email: user.email,
            name: user.name,
            token: user.token
        });

        res.json({
            msg: "An email with instructions has been sent"
        });  
    } catch (error) {
        console.log(error);
    }
}

const checkToken = async (req, res) => {
    const { token } = req.params;

    const validToken = await User.findOne({ token });

    if (validToken) {
        res.json({
            msg: "Valid token and user currently exists"
        });
    } else {
        const error = new Error("Invalid token");
        return res.status(404).json({ msg: error.message });
    }
}

const newPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ token });

    if (user) {
        user.password = password;
        user.token = "";
        try {
            await user.save();
            res.json({ msg: "Password modified correctly" });   
        } catch (error) {
            console.log(error);
        }
    } else {
        const error = new Error("Invalid token");
        return res.status(404).json({ msg: error.message });
    }
}

const perfil = async (req, res) => {
    const { user } = req;

    res.json(user);
}

export {
    register,
    auth,
    confirmToken,
    reCreateToken,
    checkToken,
    newPassword,
    perfil
}