import mongoose from "mongoose";

const FaceBiometricSchema = new mongoose.Schema({
  name: { type: String, required: true },

  deviceId: { type: String, required: true, ref: 'Device' },

  faceFeature: [{
    _id: false,
    imageURL: { type: String },
    public_id: { type: String },
    faceVector: {
      type: [Number],
      required: true
    }
  }]
}, { timestamps: true });


const FaceBiometric = mongoose.model('FaceBiometric', FaceBiometricSchema);
export default FaceBiometric;