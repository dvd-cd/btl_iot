import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: String },

    title: { type: String, required: true },
    description: { type: String },

    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'ALARM'],
        default: 'INFO'
    },

    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;