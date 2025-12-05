#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// =========================
// hard config
// ========================
#define RELAY_PIN 2
#define BUTTON_PIN 14
// flash signal
#define FLASH_PIN 4
// relay logic
#define RELAY_ON HIGH
#define RELAY_OFF LOW
// keep open period
#define LOCK_DELAY 5

// ========================
// camera config
// ========================
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

// ========================
// mqtt config
// ========================
const char *mqtt_server = "0390765cc5644b65a0794e5719f11794.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char *mqtt_user = "smartlock_dev";
const char *mqtt_pass = "SmartLock@123";
// device info
String device_id = "";
String secret_token = "";
// mqtt device's topic
// smartlock/{id}/command  ->  device commands // open/close
String topic_command = "";
// smartlock/{id}/image  -> send pics
String topic_image = "";
// smartlock/{id}/state  -> device states // lock/unlock
String topic_state = "";

// ========================
// esp
// ========================
WiFiClientSecure espClient;
PubSubClient client(espClient);
Preferences preferences;

// time vars
// avoid press too much
unsigned long lastButtonPress = 0;
// last unlock time
unsigned long unlockTime = 0;
bool isUnlocked = false;
// tránh nhiễu khi khóa đóng
// làm BUTTON_PIN tự động chuyển sang mức LOW // tự gửi ảnh lên server dù không bấm nút
unsigned long lastRelayActionTime = 0;

// ========================
// capture + send pics to mqtt broker
// ========================
void captureAndSend()
{
  digitalWrite(FLASH_PIN, HIGH);
  // delay(500);
  camera_fb_t *fb = NULL;
  // xả ảnh cũ để tránh delay ảnh trong queue
  fb = esp_camera_fb_get();
  esp_camera_fb_return(fb);
  // chụp ảnh mới nhất
  fb = esp_camera_fb_get();
  if (!fb)
  {
    Serial.println(">> Loi Camera!");
    return;
  }

  Serial.printf(">> Kich thuoc anh: %u bytes\n", fb->len);

  // binary raw file
  // send to: smartlock/{id}/image
  if (client.beginPublish(topic_image.c_str(), fb->len, false))
  {
    client.write(fb->buf, fb->len);
    client.endPublish();
    Serial.println(">> Da gui anh len MQTT!");

    // flash signal
    // delay(100);
  }
  else
  {
    Serial.println(">> Loi gui MQTT! (Anh qua nang hoac buffer nho)");
  }
  digitalWrite(FLASH_PIN, LOW);

  esp_camera_fb_return(fb);
}

// ========================
// open door
// send state signal to smartlock/{id}/state
// ========================
void openDoor()
{
  Serial.println("===> MO CUA!");
  digitalWrite(RELAY_PIN, RELAY_ON);

  isUnlocked = true;
  // save unlocked time
  unlockTime = millis();

  // create json contain token
  String msg = "{\"token\": \"" + secret_token + "\", \"status\": \"online\", \"lock_state\": \"unlocked\"}";
  // send open signal
  client.publish(topic_state.c_str(), msg.c_str());
}

// ========================
// close door
// send state signal to smartlock/{id}/state
// ========================
void closeDoor()
{
  Serial.println("===> DONG CUA!");
  digitalWrite(RELAY_PIN, RELAY_OFF);

  isUnlocked = false;
  lastRelayActionTime = millis();
  // save unlocked time
  // unlockTime = millis();

  // create json contain token
  String msg = "{\"token\": \"" + secret_token + "\", \"status\": \"online\", \"lock_state\": \"locked\"}";
  // send open signal
  client.publish(topic_state.c_str(), msg.c_str());
}

// ========================
// mqtt callback
// if command === {"action": "open"} => call openDoor()
// ========================
void callback(char *topic, byte *payload, unsigned int length)
{
  String message;
  for (unsigned int i = 0; i < length; i++)
    message += (char)payload[i];
  Serial.printf("Nhan lenh [%s]: %s\n", topic, message.c_str());

  // json parser
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, message);
  if (!error)
  {
    // for command: {"action": "open"}
    const char *action = doc["action"];
    if (action && strcmp(action, "open") == 0)
    {
      openDoor();
    }
    else if (action && strcmp(action, "close") == 0)
    {
      closeDoor();
    }
  }
}

// ========================
// mqtt broker connect
// auto call at the first time
// recall after 5 seconds if the connection was failed
// ========================
void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Connecting HiveMQ...");
    String clientId = "ESP32-" + device_id + "-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass))
    {
      Serial.println(" Connected!");

      // subcribe /command topic
      client.subscribe(topic_command.c_str());
      Serial.println("Subscribed: " + topic_command);

      // send heartbeat to /state
      String msg = "{\"token\": \"" + secret_token + "\", \"status\": \"online\", \"lock_state\": \"" + String(isUnlocked ? "unlocked" : "locked") + "\"}";
      client.publish(topic_state.c_str(), msg.c_str());
    }
    else
    {
      Serial.print(" failed, rc=");
      Serial.print(client.state());
      // delay 5s
      delay(5000);
    }
  }
}

// ========================
// SETUP()
// ========================
void setup()
{
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  Serial.begin(115200);

  // ----------------------------------
  // config GPIO
  pinMode(RELAY_PIN, OUTPUT);
  // turn off
  digitalWrite(RELAY_PIN, RELAY_OFF);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  // flash signal
  pinMode(FLASH_PIN, OUTPUT);

  // ----------------------------------
  // load the saved configuration
  // ============ dev env ===================
  // xoa cau hinh cu ---- only dev enviroment
  // device info
  // preferences.begin("smartlock", false);
  // preferences.clear();  // clear all namespace
  // preferences.end();
  // ============ dev env ===================
  //
  // for production
  // read saved infor
  preferences.begin("smartlock", true);
  device_id = preferences.getString("device_id", "");
  secret_token = preferences.getString("token", "");
  preferences.end();

  // ----------------------------------
  // init cam
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  // image quality
  config.frame_size = FRAMESIZE_XGA;
  // compress quality
  config.jpeg_quality = 12;
  config.fb_count = 1;

  if (esp_camera_init(&config) != ESP_OK)
  {
    Serial.println("Camera Init Failed!");
    return;
  }

  // ----------------------------------
  // wifi manager
  WiFiManager wm;
  // ============ dev env ===================
  // wm.resetSettings();
  // ============ dev env ===================
  WiFiManagerParameter custom_device_id("deviceid", "Device ID (e.g., lock-01)", device_id.c_str(), 40);
  WiFiManagerParameter custom_token("token", "Secret Token", secret_token.c_str(), 60);
  wm.addParameter(&custom_device_id);
  wm.addParameter(&custom_token);
  // time out
  wm.setConfigPortalTimeout(120);
  // connect failed
  if (!wm.autoConnect("SmartLock_Setup", "00000000"))
  {
    Serial.println("WiFi Failed -> Restart");
    ESP.restart();
  }
  // connect ok
  // save new config
  String new_id = custom_device_id.getValue();
  String new_token = custom_token.getValue();
  if (new_id != device_id || new_token != secret_token)
  {
    preferences.begin("smartlock", false);
    preferences.putString("device_id", new_id);
    preferences.putString("token", new_token);
    preferences.end();
    device_id = new_id;
    secret_token = new_token;
  }
  Serial.println("WiFi OK! Device ID: " + device_id);

  // config topic
  if (device_id == "")
    device_id = "unknown";
  topic_image = "smartlock/" + device_id + "/image"; // Sửa thành /image cho chuẩn
  topic_command = "smartlock/" + device_id + "/command";
  topic_state = "smartlock/" + device_id + "/state";

  // config mqtt
  // secure wifi for tls connection // port 8883
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  // mqtt package buffer size
  client.setBufferSize(51200);
}

// ========================
// LOOP()
// ========================
void loop()
{
  if (!client.connected())
    reconnect();
  client.loop();

  // auto close the lock if state=unlocked
  if (isUnlocked && (millis() - unlockTime > LOCK_DELAY * 1000))
  {
    digitalWrite(RELAY_PIN, RELAY_OFF);
    isUnlocked = false;

    lastRelayActionTime = millis();

    Serial.println("Auto LOCK.");
    client.publish(topic_state.c_str(), ("{\"token\": \"" + secret_token + "\", \"status\": \"online\", \"lock_state\": \"locked\"}").c_str());
  }

  // button logic
  if (digitalRead(BUTTON_PIN) == LOW)
  {
    if (millis() - lastRelayActionTime < 1000)
    {
      return;
    }
    if (millis() - lastButtonPress > 2000)
    {
      Serial.println("Nut bam -> Chup & Gui...");
      captureAndSend();
      lastButtonPress = millis();
    }
  }
}