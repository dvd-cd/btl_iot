// simple WebSocket helper
let socket = null;
let listeners = new Set();
let url = null;

const connect = (wsUrl) => {
  url = wsUrl;
  if (socket) return socket;
  try {
    socket = new WebSocket(wsUrl);
  } catch (e) {
    console.error("WebSocket connect error:", e);
    return null;
  }

  socket.onopen = () => {
    console.info("WebSocket connected", wsUrl);
  };
  socket.onmessage = (evt) => {
    let data = null;
    try {
      data = JSON.parse(evt.data);
    } catch (e) {
      data = evt.data;
      console.log(e);
    }
    listeners.forEach((cb) => cb(data));
  };
  socket.onclose = () => {
    console.info("WebSocket closed, will attempt reconnect in 3s");
    socket = null;
    setTimeout(() => {
      if (url) connect(url);
    }, 3000);
  };
  socket.onerror = (e) => {
    console.error("WebSocket error", e);
  };
  return socket;
};

const disconnect = () => {
  if (socket) {
    try { socket.close(); } catch (e) {console.log(e);}
  }
  socket = null;
  listeners.clear();
};

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const send = (data) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(typeof data === 'string' ? data : JSON.stringify(data));
  return true;
};

export default { connect, disconnect, subscribe, send };
