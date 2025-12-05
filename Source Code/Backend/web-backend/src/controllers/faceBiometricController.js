import Device from "../models/Device.js";
import FaceBiometric from "../models/FaceBiometric.js";
import uploadCloud from '../middlewares/upload.js'

/**
 * add new face to device
 * /api/devices/:deviceId/faces/new
 */
const addFace = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { id } = req.user;
        const { name } = req.body;

        const device = await Device.find({ deviceId: deviceId, owner: id });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Device not found"
            })
        }
        console.log("Uploaded files:", req.files);
        const faceFeature = req.files.map(file => ({
            imageURL: file.path,
            public_id: file.filename,
            faceVector: []
        }));


        const face = new FaceBiometric({
            name: name,
            deviceId: deviceId,
            faceFeature: faceFeature
        });

        // call AI server

        res.status(200).json({
            success: true,
            data: {
                faceBiometric: {
                    name: face.name,
                    deviceId: face.deviceId,
                    imageURL: face.faceFeature.map(image => image.imageURL)
                }
            }
        })

        await face.save();
    } catch (error) {
        console.log(`[faceBiometricController.js] add face error: ${error.message}`)
    }
}

/**
 * add new face to device
 * /api/devices/:deviceId/faces/:faceId/:imageURL
 */
const deleteFace = async (req, res) => {
    try {
        const { faceId, imageURL, deviceId } = req.params;
        const { id } = req.user;
        console.log("Deleting face with id:", faceId, "by user:", id);

        const device = await Device.findOne({
            deviceId: deviceId
        }).populate('owner', '_id');

        console.log("Face found:", face);
        console.log("Associated device:", device);

        if (!device || device.owner._id.toString() !== id) return res.status(400).json({
            success: false,
            message: "Not allowed"
        });

        const face = await FaceBiometric.findById(faceId);
        if (!face) return res.status(404).json({
            success: false,
            message: "face not found"
        });

        const url = decodeURIComponent(imageURL).trim();
        face.faceFeature = face.faceFeature.filter(feature => feature.imageURL !== url);

        if (face.faceFeature.length === 0) {
            await FaceBiometric.findByIdAndDelete(faceId);
        } else {
            await face.save();
        }

        return res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log(`[faceBiometricController.js] deleteFace() error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

export { addFace, deleteFace };