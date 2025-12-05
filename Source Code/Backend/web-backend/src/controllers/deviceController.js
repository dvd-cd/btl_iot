import mqttClient from "../config/mqtt.js";
import Device from "../models/Device.js";
import FaceBiometric from "../models/FaceBiometric.js";
import AccessLog from '../models/AccessLog.js'
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

        // console.log(deviceId);
        const device = await Device.findOne({
            deviceId: deviceId,
            owner: id
        }).populate('owner', '_id fullname role');

        // console.log("Object:", device);
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
        console.log(req.params);
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

        await FaceBiometric.deleteMany({
            deviceId: deviceId
        });

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

/**
 * open/close door
 * POST /api/devices/:deviceId/commands
 */
const doorAction = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { id } = req.user;

        const device = await Device.findOne({
            deviceId: deviceId,
            owner: id
        });

        if (!device) return res.status(404).json({
            success: false,
            message: "Device not found"
        });

        const message = req.body;
        message["token"] = device.deviceToken;
        // console.log(message)

        mqttClient.publish(`smartlock/${device.deviceId}/command`, JSON.stringify(message), { qos: 0 },
            async (error) => {
                if (error) {
                    console.log(`[deviceController.js] doorAction() publish error: ${error.message}`);
                    return res.status(500).json({
                        success: false,
                        message: "MQTT Broker error"
                    });
                }

                const accessLog = new AccessLog({
                    deviceId: deviceId,
                    timestamp: Date.now(),
                    actionType: "REMOTE_UNLOCK",
                    status: "SUCCESS",
                    detectedFace: null,
                    snapshotURL: null,
                });

                await accessLog.save()

                return res.status(200).json({
                    success: true
                });
            }
        )
    } catch (error) {
        console.log(`[deviceController.js] doorAction() error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

/**
 * get access log
 * GET /api/devices/:deviceId/access-logs
 */
const getAccessLogs = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { id } = req.user;

        const device = await Device.findOne({
            deviceId: deviceId,
            owner: id
        });

        if (!device) return res.status(404).json({
            success: false,
            message: "device not found"
        });

        const logs = await AccessLog.find({
            deviceId: deviceId
        });

        return res.status(200).json({
            success: true,
            data: {
                logs: logs
            }
        })

    } catch (error) {
        console.log(`[deviceController.js] doorAction() error: ${error.message}`);
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
    updateDevice,
    doorAction,
    getAccessLogs
}