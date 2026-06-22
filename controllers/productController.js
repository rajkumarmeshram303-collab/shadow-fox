const Product = require('../models/Product');

// @desc    Fetch all products (with filtering, sorting, searching)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { keyword, category, brand, rating, sort, minPrice, maxPrice } = req.query;

        let query = {};

        // Search
        if (keyword) {
            query.name = {
                $regex: keyword,
                $options: 'i'
            };
        }

        // Filters
        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (rating) query.rating = { $gte: Number(rating) };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = {};
        if (sort === 'priceAsc') sortOption.price = 1;
        else if (sort === 'priceDesc') sortOption.price = -1;
        else if (sort === 'rating') sortOption.rating = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else sortOption.createdAt = -1; // Default

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getProducts, getProductById };
