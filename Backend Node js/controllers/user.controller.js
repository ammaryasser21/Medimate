const User = require("../models/user.model");
const wrapper = require("../ErrorWrapper/asyncwrapper");
const AppError = require("../utilitis/AppError")
const bcrypt = require("bcrypt");

exports.getAllUsers = wrapper(
  async (req, res) => {
    const users = await User.find().select("-password -__v");
    return  res.status(200).json({ Status: "Success", Data: users });
  });

exports.getUserById = wrapper(
  async (req, res, next) => {
    const user = await User.findById(req.params.id).select("-password -__v"); 
    if (!user) {
      return next(AppError.create(404, "User not found"));
    }
    return res.status(200).json({ Status: "Success", Data: user });
  });
exports.deleteUser = wrapper(
  async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(AppError.create(404, "User not found"));
    }
    return res.status(200).json({ Status: "Success", message: "User deleted successfully" });
  });
exports.updateUser = wrapper(
  async (req, res,next) => {
    const { username, email, bio } = req.body;
    const user = await User.findById(req.params.id); 
    if (!user) {
      return next(AppError.create(404, "User not found"));
    }
    if (req.params.id !== req.user.userId) {
      return next(AppError.create(403, "You can't update this profile"));
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, bio },
      { new: true, runValidators: true }
    ).select("-password");
    return res.status(200).json({ Status: "Success", Data: updatedUser });
  });

exports.updateImage = wrapper(async (req, res, next) => {
  const user1 = await User.findById(req.params.id);
  if (!user1) {
    return next(AppError.create(404, "User not found"));
  }
  if (req.params.id !== req.user.userId) {
    return next(AppError.create(403, "You can't update this profile"));
  }
  if (!req.file) {
    return next(AppError.create(400, "Please upload image"));
  }
  const user = await User.findByIdAndUpdate(req.params.id, { profileImage: req.file.filename }, { new: true });
  return res.status(200).json({ Status: "Success", Data: user });
});

exports.changePassword = wrapper(
  async (req, res, next) => {
    const { CurrentPassword, NewPassword,ConfirmPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(AppError.create(404, "User not found"));
    }
    if (req.params.id !== req.user.userId) {
      return next(AppError.create(403, "You can't update this profile"));
    }
    if (!CurrentPassword || !NewPassword || !ConfirmPassword)
    {
      return next(AppError.create(400, "Please fill all fields"));
    }
    const isMatch = await user.comparePassword(CurrentPassword);
    if (!isMatch) {
      return next(AppError.create(400, "Current password is incorrect"));
    }
    if (NewPassword != ConfirmPassword) {
      return next(AppError.create(400, "New password and Confirm password don't match"));
    }
    const hashedPassword = await bcrypt.hash(NewPassword, 5);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true });
    return res.status(200).json({ Status: "Success", message: "Password updated successfully" });
  });

