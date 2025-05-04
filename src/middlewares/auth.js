import jwt from "jsonwebtoken";
import config from "../config.js";

export const authenticateJWT = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).send("Access denied. No token provided.");

	try {
		const decoded = jwt.verify(token, config.JWT_SECRET);
		// console.log(decoded)
		req.user = decoded;
		next();
	} catch (ex) {
		console.log(ex);
		res.status(400).send("Invalid token.");
	}
};
