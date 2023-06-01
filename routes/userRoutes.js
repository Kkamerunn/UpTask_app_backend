import express from "express";
import { 
    register, 
    auth, 
    confirmToken, 
    reCreateToken, 
    checkToken, 
    newPassword,
    perfil
} from "../controllers/userController.js";
import checkAuth from "../middlewares/checkAuth.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", auth);
router.get("/confirm/:token", confirmToken);
router.post("/forgot_password", reCreateToken);
router.route("/forgot_password/:token").get(checkToken).post(newPassword);
router.get("/perfil", checkAuth, perfil);

export default router;