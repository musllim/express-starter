import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import router from "./auth.js";
import config from "./config.js";
import { authenticateJWT } from "./middlewares/auth.js";
import profileRouter from "./profile/user.js";

import { User } from "./schemas/user.js";
const app = express();

mongoose
	.connect(config.MONGODB_URI)
	.then(async () => {
		console.log("MongoDB connected");

		await User.setupDefaultRolesAndPermissions(); // setup roles and permissions
	})
	.catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.set("trust proxy", true);
app.use(express.json());
app.use(router);
app.use(authenticateJWT);

app.use("/profile", authenticateJWT, profileRouter);

app.listen(config.PORT, () =>
	console.log(`Server running on port ${config.PORT}`),
);
