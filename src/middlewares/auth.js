import jwt from "jsonwebtoken";
import config from "../config.js";

export const authenticateJWT = (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res.status(401).send("Access Denied");
	}

	try {
		const verified = jwt.verify(token, config.JWT_SECRET);
		req.local.user = verified;
		next();
	} catch (err) {
		res.status(400).send("Invalid Token");
	}
};
