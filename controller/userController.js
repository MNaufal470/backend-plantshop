const User = require("../models/UserModel");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const generateAuthToken = require("../utils/generateAuthToken");
const { imageProfileValidate } = require("../utils/imageValidate");

const registerUser = async (req, res, next) => {
  try {
    const { name, userName, lastName, email, password } = req.body;
    if (!(name && lastName && email && password && userName))
      return res.status(400).send("All inputs are required");
    const emailExist = await User.findOne({ email });
    const userExist = await User.findOne({ userName });
    if (userExist) return res.status(400).send("user already exist");
    if (emailExist) return res.status(400).send("email already exist");
    const hashedPassword = hashPassword(password);
    const user = await User.create({
      name,
      userName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    res.status(201).json({
      success: "User created",
      userCreated: {
        _id: user._id,
        userName: user.userName,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { userLogin, password, doNotLogout = false } = req.body;
    let user = "";
    if (!(userLogin && password))
      return res.status(400).send("All inputs are required");

    if (userLogin.includes("@")) {
      user = await User.findOne({ email: userLogin });
      if (!user) {
        return res.status(400).send("Email not registered");
      }
    } else {
      user = await User.findOne({ userName: userLogin });
      if (!user) {
        return res.status(400).send("Username not registered");
      }
    }
    // compare password
    if (!comparePassword(password, user.password))
      return res.status(400).send("Incorect password");
    let cookieParams = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    if (doNotLogout) {
      cookieParams = { ...cookieParams, maxAge: 1000 * 60 * 60 * 24 * 3 };
    }
    return res
      .cookie(
        "access_token",
        generateAuthToken(
          user._id,
          user.name,
          user.lastName,
          user.userName,
          user.email,
          user.isAdmin,
          user.createdAt,
          user.image
        ),
        cookieParams
      )
      .json({
        success: "User logged in",
        userLoggedIn: {
          _id: user._id,
          name: user.name,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          isAdmin: user.isAdmin,
          doNotLogout,
          phoneNumber: user.phoneNumber,
          address: user.address,
          country: user.country,
          zipCode: user.zipCode,
          city: user.city,
          state: user.state,
        },
      });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).orFail();
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).orFail();
    user.name = req.body.name || user.name;
    user.lastName = req.body.lastName || user.lastName;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;
    user.country = req.body.country || user.country;
    user.zipCode = req.body.zipCode || user.zipCode;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;
    if (req.body.password !== "") {
      user.password = hashPassword(req.body.password);
    } else {
      user.password = user.password;
    }
    await user.save();
    res.json({
      success: "User Updated",
      userUpdated: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateImageProfile = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).send("No file were uploaded.");
    }
    let validateResult = imageProfileValidate(req.files.images);
    if (validateResult.error) return res.status(400).send(validateResult.error);
    const user = await User.findById(req.params.id).orFail();
    const uploadDirectory = path.resolve(
      __dirname,
      "../../frontend",
      "public",
      "img",
      "user_profile"
    );
    let imageTables = [];
    if (Array.isArray(req.files.images)) {
      imageTables = req.files.images;
    } else {
      imageTables.push(req.files.images);
    }
    for (let image of imageTables) {
      let fileName = uuidv4() + path.extname(image.name);
      let uploadPath = uploadDirectory + "/" + fileName;
      user.image = "/img/user_profile/" + fileName;
      image.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }
    await user.save();
    return res.status(201).send(user.image);
  } catch (error) {
    next(error);
  }
};

const editImageProfile = async (req, res, next) => {
  const imagePath = decodeURIComponent(req.params.imagePath);
  const user = await User.findById(req.params.id).orFail();
  try {
    if (imagePath !== "/img/user_profile/default.png") {
      const finalPath = path.resolve("../frontend/public") + imagePath;
      fs.unlink(finalPath, (err) => {
        if (err) return res.status(500).send(err);
      });
      user.save();
    }
    return res.send("clear");
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").orFail();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name userName lastName email isAdmin image")
      .orFail();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const adminUpdateUser = async (req, res, next) => {
  try {
    const { name, userName, lastName, email, isAdmin, password } = req.body;
    const user = await User.findById(req.params.id).orFail();
    user.name = name || user.name;
    user.lastName = lastName || user.lastName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.isAdmin = isAdmin;
    if (password !== "") {
      user.password = hashPassword(password);
    } else {
      user.password = user.password;
    }
    await user.save();
    user.save();
    res.status(200).send("user updated");
  } catch (error) {
    next(error);
  }
};
const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).orFail();
    if (user.image && user.image !== "/img/user_profile/default.png") {
      const finalPath = path.resolve("../frontend/public") + user.image;
      fs.unlink(finalPath, (err) => {
        if (err) return res.status(500).send(err);
      });
    }
    user.remove();
    res.send("user deleted");
  } catch (error) {
    next(error);
  }
};

const decoded = async (req, res, next) => {
  try {
    const decoded = encodeURIComponent(
      "/img/user_profile/1a4f9ce9-95d5-4933-8917-10603b3cffa6.jpg"
    );
    res.send(decoded);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateImageProfile,
  editImageProfile,
  getAllUsers,
  getUser,
  adminUpdateUser,
  adminDeleteUser,
  decoded,
};
