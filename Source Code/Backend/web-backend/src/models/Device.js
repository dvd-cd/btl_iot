import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    // auth
    deviceId: { type: String, required: true, unique: true },
    deviceToken: { type: String, required: true },
    // 
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // device props
    displayName: { type: String, default: "Smart Lock" },
    status: {
        type: String,
        enum: ['NOT_ACTIVE', 'ONLINE', 'OFFLINE'],
        default: 'NOT_ACTIVE'
    },
    activatedAt: { type: Date, default: null },
    lockState: {
        type: String,
        enum: ['LOCKED', 'UNLOCKED'],
        default: 'LOCKED'
    },
    relayDelay: { type: Number, default: 5 },
    // firmware
    currentFWVersion: { type: String, default: "1.0.0" },
    ota_status: {
        type: String,
        enum: ['IDLE', 'UPDATING', 'SUCCESS', 'FAILED'],
        default: 'IDLE'
    }
}, { timestamps: true });

const Device = mongoose.model('Device', DeviceSchema);
export default Device;