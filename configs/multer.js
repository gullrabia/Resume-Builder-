import multer from "multer";

// simple storage (temp files)
const storage = multer.diskStorage({});

const upload = multer({ storage });

export default upload;