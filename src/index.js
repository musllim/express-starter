import express from "express";
const app = express();

app.get("/user/:id", (req, res) => {
	res.send(`hello user ${req.params.id}`);
});


app.listen(3000);
