import Joi from "joi";
import mongoose from "mongoose";

export const userSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(30).required(),
	password: Joi.string()
		.min(6)
		.pattern(/^[a-zA-Z0-9]{3,30}$/)
		.required(),
});

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

export const User = mongoose.model("User", UserSchema);
