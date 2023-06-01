import Project from "../models/Project.js";
import Task from "../models/Task.js";

const addTask = async (req, res) => {
    const { project } = req.body;
    const projectExists = await Project.findById(project);

    if (!projectExists) {
        const error = new Error("The project doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    if (projectExists.creator.toString() !== req.user._id.toString()) {
        const error = new Error("You don't have the necessary permissions");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const taskSaved = await Task.create(req.body);
        projectExists.tasks.push(taskSaved._id);
        await projectExists.save();
        res.json(taskSaved);
    } catch (error) {
        console.log(error);
    }
};

const getTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("The task doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("You don't have the necessary permissions");
        return res.status(403).json({ msg: error.message });
    }

    res.json(task);
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("The task doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("You don't have the necessary permissions");
        return res.status(403).json({ msg: error.message });
    }

    task.name = req.body.name || task.name
    task.description = req.body.description || task.description
    task.priority = req.body.priority || task.priority
    task.deliveryDate = req.body.deliveryDate || task.deliveryDate

    try {
       const savedTask = await task.save();
       res.json(savedTask); 
    } catch (error) {
        console.log(error);
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("The task doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    if (task.project.creator.toString() !== req.user._id.toString()) {
        const error = new Error("You don't have the necessary permissions");
        return res.status(403).json({ msg: error.message });
    }

    try {
        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);
        await Promise.allSettled([await project.save(), await task.deleteOne()]);
        res.json({ msg: "Task deleted correctly" }); 
    } catch (error) {
        console.log(error);
    }
};

const changeState = async (req, res) => {
    const { id } = req.params;
    const task = await Task.findById(id).populate("project");

    if (!task) {
        const error = new Error("The task doesn't exist");
        return res.status(404).json({ msg: error.message });
    }

    if (task.project.creator.toString() !== req.user._id.toString() && 
        !task.project.collaborators.some(collaborator => collaborator._id.toString() === req.user._id.toString())) {
        const error = new Error("Invalid action");
        return res.status(401).json({ msg: error.message });
    }

    task.state = !task.state
    task.completed = req.user._id
    await task.save()

    const taskSaved = await Task.findById(id)
        .populate("project")
        .populate("completed");

    res.json(taskSaved)
};

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeState
}