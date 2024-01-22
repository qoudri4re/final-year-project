const multer = require("multer");
const path = require("path");
const uuid = require("uuid").v4;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.category === "image") {
      cb(null, "files/images/");
    } else {
      cb(null, "files/documents/");
    }
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(".")[0];
    const extension = path.extname(file.originalname);
    const uniqueName = `${fileName}_${uuid()}_${Date.now()}${extension}`;

    req.fileDetails = {
      fileName: uniqueName,
    };
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
}).single("file");

const fileUploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.send({
        error: true,
        errorMessage: err.message,
      });
    } else if (err) {
      return res.send({
        error: true,
        errorMessage: "Internal server error",
      });
    }
    next();
  });
};

module.exports = fileUploadMiddleware;
