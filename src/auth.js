import express from "express";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { Role, User, userSchema } from "./schemas/user.js";

// Separate Joi schema for login
const loginSchema = userSchema
	.fork(["username", "password"], (field) => field.required())
	.fork(
		Object.keys(userSchema.describe().keys).filter(
			(k) => !["username", "password"].includes(k),
		),
		(field) => field.optional(),
	);

const router = express.Router();

router.post("/register", async (req, res) => {
	const { error, value } = userSchema.validate(req.body);
	if (error) return res.status(400).json({ error: error.details[0].message });

	try {
		const existingUser = await User.findOne({ username: value.username });
		if (existingUser) return res.status(400).send("User already exists");

		const userRole = await Role.findOne({ name: "user" });
		if (userRole) value.roles = [userRole._id];

		const newUser = new User(value);
		await newUser.save();

		res.status(201).send("User created");
	} catch (err) {
		console.error("Register error:", err);
		res.status(500).send("Server error");
	}
});

router.post("/login", async (req, res) => {
	const { error, value } = loginSchema.validate(req.body);
	if (error) return res.status(400).json({ error: error.details[0].message });

	const { username, password } = value;

	try {
		const user = await User.findOne({ username });
		if (!user || !(await user.isValidPassword(password))) {
			return res.status(401).send("Invalid credentials");
		}

		const token = jwt.sign(
			{ id: user._id, username: user.username, roles: user.roles },
			config.JWT_SECRET,
			{ expiresIn: "1h" },
		);

		res.json({ token });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).send("Server error");
	}
});

export default router;
