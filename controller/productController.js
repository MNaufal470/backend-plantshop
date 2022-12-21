const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { imageValidate } = require("../utils/imageValidate");

const getProductBy = async (req, res, next) => {
  try {
    const newArrivals = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    const bestSeller = await Product.find({}).sort({ sales: -1 }).limit(5);
    res.json({
      newArrivals,
      bestSeller,
    });
  } catch (error) {
    next(error);
  }
  // sales: { $gt: 0 }
};

const getRelatedProduct = async (req, res, next) => {
  try {
    const relatedProduct = await Product.find({
      category: req.params.category,
    }).limit(4);
    res.send(relatedProduct);
  } catch (error) {
    next(error);
  }
};

const adminGetProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ category: 1 });
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
};

const getDetailProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews")
      .orFail();
    res.status(200).send(product);
  } catch (error) {
    next(error);
  }
};

const adminCreateProducts = async (req, res, next) => {
  try {
    const product = new Product();

    const { name, description, stocks, price, category, attributesTable } =
      req.body;
    if (!(name, description, stocks, price, category))
      return res.status(400).send("All inputs are required");
    const existedName = await Product.find({ name });
    if (existedName.length > 0)
      return res.status(400).send("Product name already registered!");

    product.name = name;
    product.description = description;
    product.stocks = stocks;
    product.price = price;
    product.category = category;
    if (attributesTable.length > 0) {
      attributesTable.map((item) => {
        product.attrs.push(item);
      });
    }
    // add Total Product
    const categoryExisted = await Category.find({ name: category }).orFail();
    categoryExisted[0].totalProduct =
      Number(categoryExisted[0].totalProduct) + 1;
    await categoryExisted[0].save();
    await product.save();
    res.json({
      message: "product created",
      productId: product._id,
    });
  } catch (error) {
    next(error);
  }
};

const adminUpdateProduct = async (req, res, next) => {
  try {
    const { name, description, stocks, price, category, attributesTable } =
      req.body;
    const product = await Product.findById(req.params.productId).orFail();
    product.name = name || product.name;
    product.description = description || product.description;
    product.stocks = stocks || product.stocks;
    product.price = price || product.price;
    product.category = category || product.category;
    if (attributesTable.length > 0) {
      product.attrs = [];
      attributesTable.map((item) => {
        product.attrs.push(item);
      });
    } else {
      product.attrs = [];
    }
    await product.save();
    res.json({
      message: "product updated",
    });
  } catch (error) {
    next(error);
  }
};

const adminDeleteProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    const finalPath = path.resolve("../frontend/public");
    if (product.images.length > 0) {
      product.images.map((img) =>
        fs.unlink(finalPath + img.path, (err) => {
          if (err) return res.status(500).send(err);
        })
      );
    }
    const categoryExisted = await Category.find({
      name: product.category,
    }).orFail();
    categoryExisted[0].totalProduct =
      Number(categoryExisted[0].totalProduct) - 1;
    await categoryExisted[0].save();
    await product.remove();
    res.send("product deleted");
  } catch (error) {
    next(error);
  }
};

const adminUploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images)
      return res.status(400).send("No files were uploaded.");
    let validateResult = imageValidate(req.files.images);
    if (validateResult.error) return res.status(400).send(validateResult.error);
    const product = await Product.findById(req.params.productId).orFail();

    const limitedImage = product.images.length >= 3;
    if (limitedImage) {
      return res
        .status(400)
        .send("Images has already 3 please remove one and upload ");
    }
    const uploadDirectory = path.resolve(
      __dirname,
      "../../frontend",
      "public",
      "img",
      "products"
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
      product.images.push({ path: "/img/products/" + fileName });
      image.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }
    await product.save();
    return res.status(201).send("files uploaded");
  } catch (error) {
    next(error);
  }
};

const adminDeleteImage = async (req, res, next) => {
  try {
    const imagePath = decodeURIComponent(req.params.pathImage);
    const finalPath = path.resolve("../frontend/public") + imagePath;
    fs.unlink(finalPath, (error) => {
      if (error) return res.status(500).send(error);
    });
    await Product.findByIdAndUpdate(
      { _id: req.params.productId },
      { $pull: { images: { path: imagePath } } }
    ).orFail();
    res.send("image deleted");
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const recordPage = 6;
    let query = {};
    let priceQueryCondition = {};
    let ratingQueryCondition = {};
    let queryCondition = false;
    let categoryQueryCondition = {};
    if (req.query.min && req.query.max) {
      queryCondition = true;
      priceQueryCondition = {
        price: {
          $lte: Number(req.query.max),
          $gte: Number(req.query.min),
        },
      };
    }
    if (req.query.rating) {
      queryCondition = true;
      ratingQueryCondition = { rating: { $in: req.query.rating.split(",") } };
    }
    const categoryName = req.params.categoryName || "";
    if (categoryName) {
      queryCondition = true;
      let a = categoryName.replaceAll("-", " ");
      let regEx = new RegExp("^" + a);
      categoryQueryCondition = { category: regEx };
    }
    if (req.query.category) {
      queryCondition = true;
      let a = req.query.category.split(",").map((item) => {
        if (item) return new RegExp("^" + item);
      });
      categoryQueryCondition = {
        category: { $in: a },
      };
    }
    let attrsQueryCondition = [];
    if (req.query.attrs) {
      attrsQueryCondition = req.query.attrs.split(",").reduce((acc, item) => {
        if (item) {
          let a = item.split("-");
          let values = [...a];
          values.shift();
          let a1 = {
            attrs: {
              $elemMatch: {
                key: a[0],
                value: { $regex: ".*" + values + ".*" },
              },
            },
          };
          acc.push(a1);
          return acc;
        } else return acc;
      }, []);
      queryCondition = true;
    }
    // Sort Products
    const pageNum = Number(req.query.pageNum) || 1;
    let sort = {};
    const sortOption = req.query.sort || "";
    if (sortOption) {
      let sortOpt = sortOption.split("_");
      sort = { [sortOpt[0]]: Number(sortOpt[1]) };
    }
    let select = {};
    const searchQuery = req.params.searchQuery || "";
    let searchQueryCondition = {};
    if (searchQuery) {
      queryCondition = true;
      searchQueryCondition = { $text: { $search: '"' + searchQuery + '"' } };
      select = {
        score: { $meta: "textScore" },
      };
      sort = { score: { $meta: "textScore" } };
    }
    if (queryCondition) {
      query = {
        $and: [
          priceQueryCondition,
          ratingQueryCondition,
          categoryQueryCondition,
          searchQueryCondition,
          ...attrsQueryCondition,
        ],
      };
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select(select)
      .skip(recordPage * (pageNum - 1))
      .sort(sort)
      .limit(recordPage);
    res.status(200).json({
      products,
      pageNum,
      paginationLinksNumber: Math.ceil(totalProducts / recordPage),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminGetProducts,
  getDetailProduct,
  adminCreateProducts,
  adminUploadImages,
  adminDeleteImage,
  adminDeleteProducts,
  adminUpdateProduct,
  getProducts,
  getProductBy,
  getRelatedProduct,
};
