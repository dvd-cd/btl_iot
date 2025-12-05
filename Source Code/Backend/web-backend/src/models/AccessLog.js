import mongoose from "mongoose";

const AccessLogSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, index: true },

    // log info
    timestamp: { type: Date, default: Date.now },
    actionType: {
        type: String,
        enum: ['FACE_UNLOCK', 'REMOTE_UNLOCK', 'FAILED_ATTEMPT'],
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'DENIED'],
        required: true
    },
    // face detect
    detectedFace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FaceBiometric',
        default: null
    },
    snapshotURL: { type: String }
});

const AccessLog = mongoose.model('AccessLog', AccessLogSchema);
export default AccessLog;