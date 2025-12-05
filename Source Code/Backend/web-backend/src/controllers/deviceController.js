import Device from "../models/Device.js";
import FaceBiometric from "../models/FaceBiometric.js";
// import mongoose from "mongoose";
import { generateDeviceId, generateDeviceToken } from '../services/DeviceService.js'

/**
 * get all device
 * - role=ADMIN => all devices in system
 * - role=USER => user divices of user
 * GET /api/devices
 */
const getAllDevices = async (req, res) => {
    try {
        const { id, role } = req.user;
        console.log(`[deviceController.js] get all devices request by user ${id} with role ${role}`);
        // 
        let devices;
        if (role === "USER") {
            devices = await Device.find({ owner: id }).populate('owner', '_id fullname role');
        } else {
            devices = await Device.find().populate('owner', '_id fullname role');
        }
    
        devices = devices.map(device => ({
            id: device._id,
            deviceId: device.deviceId,
            deviceToken: device.deviceToken,
            displayName: device.displayName,
            status: device.status,
            lockState: device.lockState,
            currentFWVersion: device.currentFWVersion,
            ota_status: device.ota_status,
            owner: {
                id: device.owner._id,
                fullname: device.owner.fullname,
                role: device.owner.role
            }
        }));

        return res.status(200).json({
            success: true,
            data: {
                devices: devices
            }
        })

    } catch (error) {
        console.log(`[deviceController.js] get all devices error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * get one device
 * GET /api/devices/:deviceId
 */
const getDevice = async (req, res) => {
    try {
        const { id } = req.user;
        const { deviceId } = req.params;
        
        console.log(deviceId);
        const device = await Device.findOne({
            deviceId: deviceId,
            owner: id
        }).populate('owner', '_id fullname role');

        console.log("Object:", device);
        if (!device) return res.status(404).json({
            success: false,
            message: "Device not found"
        });

        const faces = await FaceBiometric.find({
            deviceId: deviceId
        });

        return res.status(200).json({
            success: true,
            data: {
                device: {
                    id: device._id,
                    deviceId: device.deviceId,
                    deviceToken: device.deviceToken,
                    displayName: device.displayName,
                    status: device.status,
                    lockState: device.lockState,
                    currentFWVersion: device.currentFWVersion,
                    ota_status: device.ota_status,
                    owner: {
                        id: device.owner._id,
                        fullname: device.owner.fullname,
                        role: device.owner.role
                    },
                    faces: faces.map(face => ({
                        name: face.name,
                        imageURL: face.faceFeature.map(f => f.imageURL)
                    }))
                }
            }
        });
    } catch (error) {
        console.log(`[deviceController.js] get device error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * add device
 * POST api/devices/new
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
        console.log(`[deviceController.js] add new device error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * update device
 * PUT /api/devices/:deviceId
 */
const updateDevice = async (req, res) => {
    try {
        const { id } = req.user;
        const { deviceId } = req.params;
        const { displayName } = req.body;

        const device = await Device.findOne({
            deviceId: deviceId,
            owner: id
        })

        if (!device) return res.status(404).json({
            success: true,
            message: "Device not found"
        })

        device.displayName = displayName;
        await device.save();

        device.populate('owner', '_id fullname role')

        return res.status(200).json({
            success: true,
            data: {
                updatedDevice: {
                    id: device._id,
                    deviceId: device.deviceId,
                    deviceToken: device.deviceToken,
                    displayName: device.displayName,
                    status: device.status,
                    lockState: device.lockState,
                    currentFWVersion: device.currentFWVersion,
                    ota_status: device.ota_status,
                    owner: {
                        id: device.owner._id,
                        fullname: device.owner.fullname,
                        role: device.owner.role
                    }
                }
            }
        })

    } catch (error) {
        console.log(`[deviceController.js] update device error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * delete device
 * DELETE /api/devices/:deviceId
 */
const deleteDevice = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { deviceId } = req.params;

        let deleted;
        if (role === "ADMIN") {
            deleted = await Device.findByIdAndDelete(deviceId);
        } else {
            deleted = await Device.findOneAndDelete({
                deviceId: deviceId,
                owner: id
            });
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Device not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                deletedDevice: deleted,
            }
        })

    } catch (error) {
        console.log(`[deviceController.js] delete device error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export {
    getAllDevices,
    getDevice,
    addDevice,
    deleteDevice,
    updateDevice
}