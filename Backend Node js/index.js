require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const historyRoutes = require("./routes/history.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly!' });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle AppError instances
  if (err.statusCode) {
    return res.status(err.statusCode).json({ 
      Status: "Failed", 
      message: err.message 
    });
  }
  
  // Handle other errors
  res.status(500).json({ 
    Status: "Failed", 
    message: "Internal server error" 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
 