const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const wrapper = require("../ErrorWrapper/asyncwrapper");
const AppError = require("../utilitis/AppError")
exports.register = wrapper(
  async (req, res, next) => {

    const allowedGenders = ["Male", "Female"];

    const { username, email, gender, password } = req.body;
    if (!allowedGenders.includes(gender)) {
      const Error = AppError.create(400, "Gender should be Male or Female")
      return next(Error);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const Error = AppError.create(400, "Email already exists")
      return next(Error);
    }
    if (password === "" || password.length <= 8) {
      return next(AppError.create(400, "Password should be at least 8 characters"));
    }
    const hashedPassword = await bcrypt.hash(password, 5);
    const user = new User({ username, email, gender, password: hashedPassword});
        if (gender === "Male") {
      user.profileImage = "Male.jpeg";
    }
    else {
      user.profileImage = "Female.jpeg";
    }
    await user.save();
    res.status(201).json({ Status: "Success", data: { user } });
  });

exports.login = wrapper(
  async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      const Error = AppError.create(400, "Please fill email and password fields")
      return next(Error);
    }
    const user = await User.findOne({ email });
    if (!user) {
      const Error = AppError.create(404, "Email or password incorrect")
      return next(Error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const Error = AppError.create(404, "Email or password incorrect")
      return next(Error);
    }

    const token = jwt.sign({ userId: user._id, email: user.email, Role: user.Role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    res.status(200).json({ Status: "Success", Data: { id: user._id, token, expirationDate } });
  });
