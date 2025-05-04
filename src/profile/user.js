import express from "express";
import { User } from "../schemas/user.js";

const router = express.Router();

// Get current user profile
router.get("/me", async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate("roles");
		if (!user) return res.status(404).send("User not found");

		res.json({
			id: user._id,
			username: user.username,
			email: user.email,
			fullName: user.fullName,
			firstName: user.firstName,
			lastName: user.lastName,
			roles: user.roles.map((r) => r.name),
			address: user.address,
			phoneNumber: user.phoneNumber,
			profilePicture: user.profilePicture,
			mfaEnabled: user.mfaEnabled,
			lastLogin: user.lastLogin,
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

// Update current user profile
router.put("/me", async (req, res) => {
	const allowedFields = [
		"firstName",
		"lastName",
		"phoneNumber",
		"address",
		"profilePicture",
	];

	const updates = {};
	for (const key of allowedFields) {
		if (req.body[key] !== undefined) {
			updates[key] = req.body[key];
		}
	}

	try {
		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ $set: updates },
			{ new: true, runValidators: true },
		);
		if (!user) return res.status(404).send("User not found");

		res.json({ message: "Profile updated", user });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

// Delete current user
router.delete("/me", async (req, res) => {
	try {
		await User.findByIdAndDelete(req.user.id);
		res.send("Account deleted");
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

// (Optional) Get user by ID — for admin use
router.get("/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id).populate("roles");
		if (!user) return res.status(404).send("User not found");

		res.json({
			id: user._id,
			username: user.username,
			email: user.email,
			fullName: user.fullName,
			roles: user.roles.map((r) => r.name),
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error");
	}
});

export default router;
