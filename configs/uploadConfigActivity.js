const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') //cb - callback function to store the file
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname); //cb - callback function to rename the file
    }
});

const upload = multer({
    storage: storage,
});

module.exports = { upload };