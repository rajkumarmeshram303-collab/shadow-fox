const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async (dbStatus) => {
    if (dbStatus && dbStatus.isMemory) {
        const importData = require('./seeder_function');
        await importData();
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set static folder for frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
