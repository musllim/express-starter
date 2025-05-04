import crypto from "node:crypto";
import * as path from "node:path";
import bcrypt from "bcryptjs";
import Joi from "joi";
import mongoose from "mongoose";
import multer from "multer";

// Role and Permission schemas
export const permissionSchema = Joi.object({
	name: Joi.string().required(),
	description: Joi.string().optional(),
});

export const roleSchema = Joi.object({
	name: Joi.string().required(),
	description: Joi.string().optional(),
	permissions: Joi.array().items(Joi.string()).default([]),
});

// Address validation schema
export const addressSchema = Joi.object({
	street: Joi.string().required(),
	city: Joi.string().required(),
	state: Joi.string().required(),
	zipCode: Joi.string().required(),
	country: Joi.string().required(),
});

// Enhanced user validation schema
export const userSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(30).required(),
	email: Joi.string().email().required(),
	password: Joi.string()
		.min(8)
		.pattern(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		)
		.required()
		.messages({
			"string.pattern.base":
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
		}),
	firstName: Joi.string().optional(),
	lastName: Joi.string().optional(),
	phoneNumber: Joi.string()
		.pattern(/^\+?[1-9]\d{1,14}$/)
		.optional(),
	address: addressSchema.optional(),
	profilePicture: Joi.string().optional(),
	roles: Joi.array().items(Joi.string()).default(["user"]),
});

// Permission schema definition
const PermissionSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

export const Permission = mongoose.model("Permission", PermissionSchema);

// Role schema definition with permissions
const RoleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		permissions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Permission",
			},
		],
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

export const Role = mongoose.model("Role", RoleSchema);

// Address schema
const AddressSchema = new mongoose.Schema({
	street: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	zipCode: { type: String, required: true },
	country: { type: String, required: true },
});

// Enhanced User schema
const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		phoneNumber: {
			type: String,
			validate: {
				validator: (v) => /^\+?[1-9]\d{1,14}$/.test(v),
				message: (props) => `${props.value} is not a valid phone number!`,
			},
		},
		address: AddressSchema,
		profilePicture: {
			type: String,
			default: "/images/default-profile.png",
		},
		roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Role",
				default: () => {
					// This will be populated with the default 'user' role ID in application setup
					return null;
				},
			},
		],
		mfaEnabled: {
			type: Boolean,
			default: false,
		},
		mfaSecret: {
			type: String,
			default: null,
		},
		recoveryKeys: [
			{
				type: String,
			},
		],
		failedLoginAttempts: {
			type: Number,
			default: 0,
		},
		accountLocked: {
			type: Boolean,
			default: false,
		},
		accountLockedUntil: {
			type: Date,
			default: null,
		},
		lastLogin: {
			type: Date,
		},
		passwordResetToken: String,
		passwordResetExpires: Date,
		createdAt: {
			type: Date,
			default: Date.now,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
	// Only hash the password if it's modified or new
	if (!this.isModified("password")) return next();

	try {
		// Generate salt and hash the password
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to check password validity
UserSchema.methods.isValidPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

// Method to generate TOTP secret for MFA
UserSchema.methods.generateMfaSecret = function () {
	const secret = crypto.randomBytes(20).toString("hex");
	this.mfaSecret = secret;
	return secret;
};

// Method to generate recovery keys
UserSchema.methods.generateRecoveryKeys = function (count = 10) {
	const keys = [];
	for (let i = 0; i < count; i++) {
		keys.push(crypto.randomBytes(8).toString("hex"));
	}
	this.recoveryKeys = keys.map((key) => bcrypt.hashSync(key, 10));
	return keys; // Return plain keys to be shown to user once
};

// Method to check if recovery key is valid
UserSchema.methods.isValidRecoveryKey = async function (providedKey) {
	for (const hashedKey of this.recoveryKeys) {
		if (await bcrypt.compare(providedKey, hashedKey)) {
			// Remove the used key
			this.recoveryKeys = this.recoveryKeys.filter((key) => key !== hashedKey);
			return true;
		}
	}
	return false;
};

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Token expires in 1 hour
	this.passwordResetExpires = Date.now() + 3600000;

	return resetToken;
};

// Add user profile picture handling methods
UserSchema.methods.setProfilePicture = function (filename) {
	this.profilePicture = `/uploads/profile-pictures/${filename}`;
};

// Role-based permission checking
UserSchema.methods.hasPermission = async function (permissionName) {
	// Populate the roles if they're not already populated
	if (!this.roles[0]?.permissions) {
		await this.populate({
			path: "roles",
			populate: {
				path: "permissions",
			},
		});
	}

	// Check if any of the user's roles have the requested permission
	for (const role of this.roles) {
		const hasPermission = role.permissions.some(
			(permission) => permission.name === permissionName,
		);
		if (hasPermission) return true;
	}
	return false;
};

// Check if user has a specific role
UserSchema.methods.hasRole = function (roleName) {
	return this.roles.some(
		(role) =>
			role.name === roleName || (role._id && role._id.toString() === roleName),
	);
};

// Helper method to get full name
UserSchema.virtual("fullName").get(function () {
	if (this.firstName && this.lastName) {
		return `${this.firstName} ${this.lastName}`;
	}
	return this.username;
});

// Static method to create default roles and permissions
UserSchema.statics.setupDefaultRolesAndPermissions = async () => {
	try {
		// Create default permissions
		const readPermission = await Permission.findOneAndUpdate(
			{ name: "read" },
			{ name: "read", description: "Can read content" },
			{ upsert: true, new: true },
		);

		const writePermission = await Permission.findOneAndUpdate(
			{ name: "write" },
			{ name: "write", description: "Can create and edit content" },
			{ upsert: true, new: true },
		);

		const deletePermission = await Permission.findOneAndUpdate(
			{ name: "delete" },
			{ name: "delete", description: "Can delete content" },
			{ upsert: true, new: true },
		);

		const adminPermission = await Permission.findOneAndUpdate(
			{ name: "admin" },
			{ name: "admin", description: "Has full administrative access" },
			{ upsert: true, new: true },
		);

		// Create default roles
		const userRole = await Role.findOneAndUpdate(
			{ name: "user" },
			{
				name: "user",
				description: "Standard user with basic permissions",
				permissions: [readPermission._id],
			},
			{ upsert: true, new: true },
		);

		const editorRole = await Role.findOneAndUpdate(
			{ name: "editor" },
			{
				name: "editor",
				description: "Can create and edit content",
				permissions: [readPermission._id, writePermission._id],
			},
			{ upsert: true, new: true },
		);

		const adminRole = await Role.findOneAndUpdate(
			{ name: "admin" },
			{
				name: "admin",
				description: "Administrator with full access",
				permissions: [
					readPermission._id,
					writePermission._id,
					deletePermission._id,
					adminPermission._id,
				],
			},
			{ upsert: true, new: true },
		);

		return { userRole, editorRole, adminRole };
	} catch (error) {
		console.error("Error setting up default roles and permissions:", error);
		throw error;
	}
};

// Export the models
export const User = mongoose.model("User", UserSchema);

// File upload utility for profile pictures
export const profilePictureUploadConfig = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.join(__dirname, "../uploads/profile-pictures"));
		},
		filename: (req, file, cb) => {
			const ext = path.extname(file.originalname);
			const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
			cb(null, uniqueName);
		},
	}),
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extName = allowedTypes.test(
			path.extname(file.originalname).toLowerCase(),
		);
		const mimeType = allowedTypes.test(file.mimetype);

		if (extName && mimeType) {
			return cb(null, true);
		}
		cb(new Error("Only images (jpeg, jpg, png, gif) are allowed."));
	},
	limits: {
		fileSize: 2 * 1024 * 1024, // 2 MB limit
	},
});
