import "dotenv/config";

export default {
	PORT: process.env.PORT || "3000",
	MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
	JWT_SECRET: process.env.JWT_SECRET || "",
	NODE_ENV: process.env.NODE_ENV || "development",
};
