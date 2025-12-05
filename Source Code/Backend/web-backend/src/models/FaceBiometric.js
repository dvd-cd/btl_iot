import mongoose from "mongoose";

const FaceBiometricSchema = new mongoose.Schema({
  name: { type: String, required: true },

  deviceId: { type: String, required: true, ref: 'Device' },

  faceFeature: [{
    imageURL: { type: String },
    faceVector: {
      type: [Number],
      required: true
    }
  }]
}, { timestamps: true });



const FaceBiometric = mongoose.model('FaceBiometric', FaceBiometricSchema);
export default FaceBiometric;