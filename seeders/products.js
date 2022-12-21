const products = [
  {
    name: "Product1 Lenovo Comp1 Name Lorem ipsum dolor sit amet",
    description:
      "Product Description Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    stocks: 5,
    price: 100,
    category: "Computers/Laptops/Lenovo",
    images: [
      { path: "/images/games-category.png" },
      { path: "/images/monitors-category.png" },
      { path: "/images/tablets-category.png" },
    ],
    rating: 5,
    reviewsNumber: 5,
    reviews: [],
    attrs: [{ key: "Color", value: ["white"] }],
  },
  {
    name: "Product2 Lenovo Comp2 Name Lorem ipsum dolor sit amet",
    description:
      "Product Description Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    stocks: 5,
    price: 100,
    category: "Computers/Laptops/Lenovo",
    images: [
      { path: "/images/games-category.png" },
      { path: "/images/monitors-category.png" },
      { path: "/images/tablets-category.png" },
    ],
    rating: 5,
    reviewsNumber: 5,
    reviews: [],
    attrs: [
      { key: "color", value: "black" },
      { key: "RAM", value: "1 TB" },
    ],
  },
  {
    name: "Product3 Dell Comp Name Lorem ipsum dolor sit amet",
    description:
      "Product Description Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    stocks: 5,
    price: 100,
    category: "Computers/Laptops/Dell",
    images: [
      { path: "/images/games-category.png" },
      { path: "/images/monitors-category.png" },
      { path: "/images/tablets-category.png" },
    ],
    rating: 5,
    reviewsNumber: 5,
    reviews: [],
    attrs: [
      { key: "color", value: "black" },
      { key: "RAM", value: "1 TB" },
    ],
  },
  {
    name: "Product4 Tablet Name Lorem ipsum dolor sit amet",
    description:
      "Product Description Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa ducimus architecto explicabo id accusantium nihil exercitationem autem porro esse.",
    stocks: 5,
    price: 100,
    category: "Tablets",
    images: [
      { path: "/images/games-category.png" },
      { path: "/images/monitors-category.png" },
      { path: "/images/tablets-category.png" },
    ],
    rating: 5,
    reviewsNumber: 5,
    reviews: [],
  },
];

module.exports = products;
