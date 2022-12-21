const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connection success MONGODB");
  } catch (error) {
    console.log("Connection Fail");
    proccess.exit(1);
  }
};
module.exports = connectDB;
