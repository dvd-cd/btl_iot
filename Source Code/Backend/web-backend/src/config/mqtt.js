import mqtt from 'mqtt';

const mqttClient = mqtt.connect(
    process.env.MQTT_BROKER_URL,
    {
        port: 8883,
        username: process.env.MQTT_BROKER_USERNAME,
        password: process.env.MQTT_BROKER_PASSWORD,
        protocol: 'mqtts',
    }
)
mqttClient.on('connect', () => {
    console.log("[index.js] MQTT Broker connected")
    // subcribe to topics
    mqttClient.subscribe('smartlock/+/state', (error) => {
        if (!error) console.log(`[mqtt.js] Subcribed to topic ${"smartlock/+/state"}`)
    });

    // setInterval(() => {
    //     const msg = {"action": "open"};
    //     mqttClient.publish('smartlock/lock-01/command', JSON.stringify(msg));
    // }, 10000);
})

mqttClient.on('error', (err) => {
    console.log("[index.js] MQTT Broker connect error", err.message);
});

export default mqttClient;