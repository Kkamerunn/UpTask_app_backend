import Project from "../models/Project.js";
import User from "../models/User.js";

const getProjects = async (req, res) => {
    const projects = await Project.find({
        $or: [
            { collaborators: { $in: req.user } },
            { creator: { $in: req.user } }
        ]
    }).select("-tasks");

    res.json(projects);
};

const newProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.user._id;

    try {
        const projectSaved = await project.save();
        res.json(projectSaved);
    } catch (error) {
        console.log(error);
    }
};

const getProject = async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id)
        .populate({
            path: "tasks",
            populate: { path: "completed", select: "name" }
        })
        .populate("collaborators", "name email");

    if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ msg: error.message });
    }

    if (project.creator.toString() !== req.user._id.toString() && 
        !project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
        const error = new Error("Invalid action");
        return res.status(401).json({ msg: error.message });
    }

    // get all project's tasks
    //const tasks = await Task.find().where("project").equals(project._id);

    res.json(project);
};

const editProject = async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ msg: error.message });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid action");
        return res.status(401).json({ msg: error.message });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.deliveryDate = req.body.deliveryDate || project.deliveryDate;
    project.customer = req.body.customer || project.customer;

    try {
        const projectUpdated = await project.save();
        res.json(projectUpdated);
    } catch (error) {
        console.log(error);
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ msg: error.message });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid action");
        return res.status(401).json({ msg: error.message });
    }

    try {
        await project.delete();
        res.json({ msg: "Project deleted correctly!" });
    } catch (error) {
        console.log(error);
    }
};

const findCollaborator = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('-confirmed -createdAt -password -token -updatedAt -__v');

    if (!user) {
        const error = new Error("User not found");
        return res.status(404).json({ msg: error.message });
    }
    
    res.json(user);
};

const addCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ msg: error.message });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid action");
        return res.status(404).json({ msg: error.message });
    }

    const { email } = req.body;
    const user = await User.findOne({ email }).select(
        "-confirmed -createdAt -password -token -updatedAt -__v"
    );

    if (!user) {
        const error = new Error("User not found");
        return res.status(404).json({ msg: error.message });
    }

    // The collaborator can't be a collaborator
    if (project.creator.toString() === user._id.toString()) {
        const error = new Error("The project's creator can't be a collaborator");
        return res.status(404).json({ msg: error.message });
    }

    // Check that the collaborator is not yet added to the project
    if (project.collaborators.includes(user._id)) {
        const error = new Error("The user already belongs to the project");
        return res.status(404).json({ msg: error.message });
    }

    // Now is ok
    project.collaborators.push(user._id);
    await project.save();
    res.json({ msg: 'Collaborator added correctly' });
};

const deleteCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        const error = new Error("Project not found");
        return res.status(404).json({ msg: error.message });
    }

    if (project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("Invalid action");
        return res.status(404).json({ msg: error.message });
    }

    // Now we can delete it
    project.collaborators.pull(req.body.id);
    await project.save();
    res.json({ msg: 'Collaborator deleted correctly' });
};

export {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    addCollaborator,
    deleteCollaborator,
    findCollaborator
}