const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Isse frontend bina kisi error ke backend se connect hoga

// 1. MongoDB Database Connection
mongoose.connect('mongodb://localhost:27017/codealpha_ecommerce')
  .then(() => console.log("Database Connected Successfully!"))
  .catch(err => console.log("Database Connection Error: ", err));

// 2. Database Schemas (Structure)
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, description: String, image: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userId: String, items: Array, totalAmount: Number, date: { type: Date, default: Date.now }
}));

// 3. Dummy Products Automatically Insert Karne Ka Function
const insertDummyData = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: "Premium Laptop", price: 999, description: "High performance development laptop", image: "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=300&q=80" },
      { name: "Wireless Headphones", price: 99, description: "Noise-canceling over-ear headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
      { name: "Smart Watch", price: 199, description: "Fitness tracker with AMOLED display", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" }
    ]);
    console.log("Initial Products added to database!");
  }
};
insertDummyData();

// 4. API Endpoints (Routes)
// User Registration Route[cite: 1]
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Registration Successful! Now you can Login." });
    } catch (err) { res.status(400).json({ error: "Username already exists!" }); }
});

// User Login Route[cite: 1]
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) res.json({ message: "Login Successful!", userId: user._id });
    else res.status(401).json({ error: "Invalid Username or Password!" });
});

// Get Product List Route[cite: 1]
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Create Order Route[cite: 1]
app.post('/api/orders', async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ message: "Order Placed Successfully!" });
});

// Server Listen
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));