const express = require("express");

const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateImage,
  changePassword,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
const allow = require("../utilitis/allowedTo");
const multer = require("multer");
const appError = require("../utilitis/AppError");
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const filename = `user-${Date.now()}.${ext}`;
    cb(null, filename);
  },
});
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create(400, "file must be image"), false);
  }
};
const upload = multer({ storage: diskStorage, fileFilter });
router.get("/", authMiddleware, getAllUsers); // put here the validation allowed to who ?
router.get("/:id", authMiddleware, getUserById); // put here the validation allowed to who ?
router.delete("/:id", authMiddleware, allow("Admin"), deleteUser);
router.patch("/:id", authMiddleware, updateUser);
router.put("/:id", upload.single("profileImage"), authMiddleware, updateImage);
router.put("/changepassword/:id", authMiddleware, changePassword);
module.exports = router;
