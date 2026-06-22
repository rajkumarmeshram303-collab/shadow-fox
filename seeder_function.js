const mongoose = require('mongoose');
const dotenv = require('dotenv');
const products = require('./data/products');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const createdUsers = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                isAdmin: true
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                isAdmin: false
            }
        ]);

        await Product.insertMany(products);

        console.log('Memory DB Data Imported!');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = importData;
