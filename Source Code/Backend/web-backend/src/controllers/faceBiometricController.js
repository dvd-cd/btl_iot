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
 * /api/devices/:deviceId/faces/:faceId
 */
// const deleteFace = async (req, res) => {
//     const { faceId } = req.params;
//     const { id } = req.user;

    
// }

export { addFace };