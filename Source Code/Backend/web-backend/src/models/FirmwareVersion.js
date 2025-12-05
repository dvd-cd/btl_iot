import mongoose from "mongoose";

const FirmwareVersionSchema = new mongoose.Schema({
    version: { type: String, required: true, unique: true },
    filePath: { type: String, required: true },
    description: { type: String },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    scheduledAt: { type: Date, required: true },
    deploy_status: {
        type: String,
        enum: ['PENDING', 'DELOYED'],
        default: 'PENDING'
    }
}, { timestamps: true });

const FirmwareVersion = mongoose.model('FirmwareVersion', FirmwareVersionSchema);
export default FirmwareVersion;