import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const { name } = req.body;
        return {
            folder: 'smartlock/images/faces',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            public_id: `${name}-${Date.now()}`
            // transformation: [{ width: 500, height: 500, crop: 'limit' }], // (Optional) Resize ảnh luôn khi upload
        }
    },
});

// multer
const uploadCloud = multer({ storage });

export default uploadCloud;