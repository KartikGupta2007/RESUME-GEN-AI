import multer from "multer";
import { file } from "zod";

const storage = multer({
    storage: multer.memoryStorage(),
    limits : {
        fileSize : 5*1024*1024, // 5 MB
    },
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
  
export const upload = multer({ 
    storage,
})