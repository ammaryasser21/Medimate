const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const appError = require('../utilitis/AppError')
//const multer = require('multer');
// const diskStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split('/')[1];
//         const filename = `user-${Date.now()}.${ext}`;
//         cb(null, filename)
//     }
// });
// const fileFilter = (req, file, cb) => {
//     const imageType = file.mimetype.split('/')[0];
//     if (imageType === 'image') {
//         return cb(null, true);
//     }
//     else {
//         return cb(appError.create(400, "file must be image"), false);
//     }
// }
//const upload = multer({ storage: diskStorage, fileFilter });
router.post('/register', authController.register);
router.post('/login', authController.login);
module.exports = router;