import Device from "../models/Device.js";
// import mongoose from "mongoose";
import { generateDeviceId, generateDeviceToken } from '../services/DeviceService.js'

/**
 * add device
 * POST api/device/new
 */
const addDevice = async (req, res) => {
    try {
        const { id } = req.user;

        const { displayName } = req.body;
        const device = new Device({
            owner: id,
            deviceId: generateDeviceId(),
            deviceToken: generateDeviceToken(),
            displayName: displayName,
        });

        await device.save();

        return res.status(200).json({
            success: true,
            data: {
                device
            }
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export {
    addDevice
}