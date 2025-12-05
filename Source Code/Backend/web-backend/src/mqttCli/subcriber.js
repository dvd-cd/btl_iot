import mqttClient from "../config/mqtt.js";
import { getAuthIO } from "../config/socket.js";
import Device from "../models/Device.js";


const subcribeBroker = () => {
    const authIO = getAuthIO();
    mqttClient.on("message", async (topic, message) => {
        try {
            console.log(`[subcriber.js] receive message: ${message} from topic: ${topic}`)

            const topics = topic.split("/");
            // smartlock/deviceID/state
            // smartlock/deviceID/command
            // smartlock/deviceID/image
            // smartlock/deviceID/auth_result
            if (topics.length !== 3) return;

            const type = topics[2];
            if (type === "state") {
                const deviceId = topics[1];
                const { token, status, lock_state } = JSON.parse(message.toString());

                const device = await Device.findOne({ deviceId: deviceId }).populate('owner', '_id');
                // update device
                if (device) {

                    // check token
                    if (token !== device.deviceToken) return;

                    // console.log(`[subcriber.js] lock ${device.deviceId} change state from ${device.lockState} to ${lock_state}`)

                    if (status) {
                        device.status = status.toUpperCase();
                    }
                    device.lockState = lock_state.toUpperCase();
                    await device.save();

                    authIO.to(device.owner._id).emit("change-lock-state", {
                        deviceId: device.deviceId,
                        name: device.name,
                        status: device.status,
                        lockState: device.lockState,
                    })
                }

            }
        }
        catch (error) {
            console.log(`[subcriber.js] Error: ${error.message}`)
        }

    })
}

export default subcribeBroker;