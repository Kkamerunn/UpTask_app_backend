import express from "express";
import {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    addCollaborator,
    deleteCollaborator,
    findCollaborator
} from "../controllers/projectController.js";
import checkAuth from "../middlewares/checkAuth.js";

const router = express.Router();

router
    .route("/")
    .get(checkAuth, getProjects)
    .post(checkAuth, newProject);

router
    .route("/:id")
    .get(checkAuth, getProject)
    .put(checkAuth, editProject)
    .delete(checkAuth, deleteProject);

router.post("/collaborators", checkAuth, findCollaborator);
router.post("/collaborators/:id", checkAuth, addCollaborator);
router.post("/delete-collaborator/:id", checkAuth, deleteCollaborator);

export default router;