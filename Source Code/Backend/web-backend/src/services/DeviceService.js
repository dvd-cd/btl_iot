const devices = new Set();

const generateDeviceId = () => {
    const prefix = "LOCK";
    let suffix;
    while (true) {
        suffix = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(8, '0');
        if (!devices.has(suffix)) break;
    }
    devices.add(suffix);
    return `${prefix}-${suffix}`
}
const deleteDeviceId = (deviceId) => {
    const prefix = deviceId.split("-")[1];
    devices.delete(prefix);
}

const generateDeviceToken = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export {
    generateDeviceId,
    generateDeviceToken,
    deleteDeviceId
}