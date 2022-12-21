const jwt = require("jsonwebtoken");

const generateAuthToken = (
  _id,
  name,
  lastName,
  userName,
  email,
  isAdmin,
  createdAt,
  image
) => {
  return jwt.sign(
    { _id, name, lastName, userName, email, isAdmin, createdAt, image },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3h" }
  );
};

module.exports = generateAuthToken;
