const Category = require("../models/CategoryModel");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { imageProfileValidate } = require("../utils/imageValidate");

const getAllCategories = async (req, res, next) => {
  try {
    const category = await Category.find({}).orFail();
    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).orFail();
    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

const addNewCategory = async (req, res, next) => {
  try {
    const { name, attrs } = req.body;
    const categoryExist = await Category.find({ name });
    if (categoryExist.length > 0)
      return res.status(400).send("category already exist");
    if (attrs) {
      const createCategory = await Category.create({
        name: name,
        attrs: attrs,
      });
      res.status(201).send({ categoryCreated: createCategory });
    }
  } catch (error) {
    next(error);
  }
};
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).orFail();
    if (category?.image !== "/img/category/default.png") {
      const finalPath = path.resolve("../frontend/public") + category.image;
      fs.unlink(finalPath, (err) => {
        if (err) return res.status(500).send(err);
      });
    }
    category.remove();
    res.send("category deleted");
  } catch (error) {
    next(error);
  }
};

const categoryImageUpload = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).send("No file were uploaded.");
    }
    let validateResult = imageProfileValidate(req.files.images);
    if (validateResult.error) return res.status(400).send(validateResult.error);
    const category = await Category.findById(req.params.id).orFail();
    const uploadDirectory = path.resolve(
      __dirname,
      "../../frontend",
      "public",
      "img",
      "category"
    );
    let imageTables = [];
    let oldImage = category.image;
    if (oldImage !== "/img/category/default.png") {
      const finalPath = path.resolve("../frontend/public") + oldImage;
      fs.unlink(finalPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }
    if (Array.isArray(req.files.images)) {
      imageTables = req.files.images;
    } else {
      imageTables.push(req.files.images);
    }
    for (let image of imageTables) {
      let fileName = uuidv4() + path.extname(image.name);
      let uploadPath = uploadDirectory + "/" + fileName;
      category.image = "/img/category/" + fileName;
      image.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }
    await category.save();
    return res.status(201).send("files uploaded");
  } catch (error) {
    next(error);
  }
};

const categoryImageDeleted = async (req, res, next) => {
  const imagePath = decodeURIComponent(req.params.imagePath);
  try {
    const finalPath = path.resolve("../frontend/public") + imagePath;
    fs.unlink(finalPath, function (err) {
      if (err) return res.status(500).send(err);
    });
    const category = await Category.findById(req.params.categoryId);
    category.image = "/img/category/default.png";
    category.save();
    res.send("image deleted");
  } catch (error) {
    next(error);
  }
};

const categoryUpdate = async (req, res, next) => {
  try {
    const { name, attrs } = req.body;
    const category = await Category.findById(req.params.id).orFail();
    if (name !== category.name) {
      let existed = await Category.find({ name });
      if (existed.length > 0)
        return res.status(400).send("Category name already existed!");
    }
    category.name = name || category.name;
    category.attrs = attrs || category.attrs;

    category.save();
    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategory,
  addNewCategory,
  deleteCategory,
  categoryImageUpload,
  categoryImageDeleted,
  categoryUpdate,
};
