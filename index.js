import express from "express";
import connectDB from "./config/db.js";
import cors from 'cors';
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { Server } from "socket.io";

const app = express();
app.use(express.json());

connectDB();

// Config cors
const whitelist = [process.env.FRONT_END_URL];

const corsOptions = {
    origin:function(origin, callback) {
        if(whitelist.includes(origin) || !origin) { //Postman request have not origin 
            callback(null, true)
        } else {
            callback(new Error("Cors Error"))
        }
    }
};

app.use(cors(corsOptions));

// Routing
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const port = process.env.PORT || 4000

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


// Socket.io
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONT_END_URL,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

   // Define the socket.io events
    socket.on("open_project", project => {
        socket.join(project);
    });

    socket.on("new_task", task => {
        const project = task.project;
        socket.to(project).emit("task_added", task);
    }); 

    socket.on("delete_task", task => {
        const project = task.project;
        socket.to(project).emit("task_deleted", task);
    });

    socket.on("update_task", task => {
        const project = task.project._id;
        socket.to(project).emit("task_updated", task);
    });

    socket.on("change_state", task => {
        const project = task.project._id;
        socket.to(project).emit("state_changed", task);
    });
});