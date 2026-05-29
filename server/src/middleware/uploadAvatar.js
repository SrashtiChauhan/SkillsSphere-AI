import multer from "multer";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Only JPEG, PNG, or WebP images are allowed");
    err.code = "INVALID_FILE_TYPE";
    cb(err, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: AVATAR_MAX_SIZE },
});

export const uploadAvatarMiddleware = (req, res, next) => {
  upload.single("avatar")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Image must be 5MB or smaller" });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error?.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error) {
      return res.status(500).json({ success: false, message: "Failed to upload image" });
    }
    next();
  });
};
