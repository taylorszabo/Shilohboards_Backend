require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());


const userRoutes = require("./routes/users");
const gameoverRoutes = require("./routes/gameover");
const alphabetRoutes = require("./routes/alphabet");
const numbersRoutes = require("./routes/numbers");


app.use("/users", userRoutes);
app.use("/gameover", gameoverRoutes);
app.use("/alphabet", alphabetRoutes);
app.use("/numbers", numbersRoutes);

if (process.env.NODE_ENV !== "test") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;

