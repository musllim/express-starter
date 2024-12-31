import { compare, genSalt, hash } from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { User, userSchema } from "./schemas/user.js";

const router = express.Router();

router.post("/register", async (req, res) => {
	const result = userSchema.validate(req.body);
	if (result.error) {
		res.status(400).json(result.error.details[0].message);
		return;
	}
	const { username, password } = result.value;

	try {
		const existingUser = await User.findOne({
			username: result.value.username,
		});
		if (existingUser) {
			res.status(400).send("User already exists");
			return;
		}

		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);

		const newUser = new User({ username, password: hashedPassword });
		await newUser.save();

		res.status(201).send("User created");
	} catch (err) {
		res.status(500).send("Server error");
	}
});

router.post("/login", async (req, res) => {
	const result = userSchema.validate(req.body);
	if (result.error) {
		res.status(400).json(result.error.details[0].message);
		return;
	}
	const { username, password } = result.value;

	try {
		const user = await User.findOne({ username });
		if (!user) {
			res.status(401).send("Invalid credentials");
			return;
		}

		const isMatch = await compare(password, user.password);
		if (!isMatch) {
			res.status(401).send("Invalid credentials");
			return;
		}

		const token = jwt.sign({ username: user.username }, config.JWT_SECRET, {
			expiresIn: "1h",
		});
		res.json({ token });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});
export default router;
