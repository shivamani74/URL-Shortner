require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const urlRoutes = require("./routes/urlRoutes.js");
const authRoutes = require("./routes/authRoutes.js");

const cors = require("cors");

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/url", urlRoutes);
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_DB_URI)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});