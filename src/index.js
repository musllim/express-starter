import express from "express";
import mongoose from "mongoose";
import router from "./auth.js";
import config from "./config.js";
import { authenticateJWT } from "./middlewares/auth.js";

const app = express();

mongoose
	.connect(config.MONGODB_URI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

app.set("trust proxy", true);
app.use(express.json());
app.use(router);
app.use(authenticateJWT);

app.get("/user/:id", (req, res) => {
	res.send(`hello user ${req.params.id}`);
});

app.listen(config.PORT, () =>
	console.log(`Server running on port ${config.PORT}`),
);
