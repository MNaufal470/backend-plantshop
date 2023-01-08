require("dotenv").config();
let helmet = require("helmet");
const { createServer } = require("http");
const express = require("express");
const app = express();

app.use(helmet());
const httpServer = createServer(app);

const apiRoutes = require("./routes/apiRoutes");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Connect DB
const connectDB = require("./config/db");
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.use("/api", apiRoutes);
const path = require("path");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.json({ message: "API running..." });
  });
}

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT} `));
