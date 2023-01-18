require("dotenv").config();
let helmet = require("helmet");
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" }));
const httpServer = createServer(app);

const apiRoutes = require("./routes/apiRoutes");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
// Connect DB
const connectDB = require("./config/db");
connectDB();

app.use(cookieParser());
app.use(fileUpload());

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

app.use("/api", apiRoutes);
const path = require("path");

app.get("/", (req, res) => {
  res.json({ message: "API running for " + process.env.NODE_ENV });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () =>
  console.log(`Server running on port ${PORT} ${process.env.NODE_ENV} `)
);
