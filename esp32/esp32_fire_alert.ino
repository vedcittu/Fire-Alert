#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <math.h>

// =====================================================
// ESP32-S3 FIRE ALERT SYSTEM
// =====================================================

// ---------------- WIFI ----------------
const char* WIFI_SSID = "ved_cittu";
const char* WIFI_PASSWORD = "1111122222";

// ESP32-S3 Access Point
const char* AP_SSID = "ESP32-S3-FireAlert";
const char* AP_PASSWORD = "firealert123";

// ---------------- SUPABASE ----------------
const char* INGEST_URL =
  "https://pqmnlekqawccnlndgmlb.supabase.co/functions/v1/fire-alert-ingest";

// ---------------- TIMING ----------------
const unsigned long REPORT_INTERVAL_MS = 10000;
const unsigned long WIFI_TIMEOUT_MS = 15000;

// =====================================================
// ESP32-S3 GPIO CONFIGURATION
// =====================================================

// ESP32-S3 Dev Module compatible GPIO layout
// DHT11 sensor
const int DHT_SENSOR_PIN = 4;
const int DHT_TYPE = DHT11;

// MQ-2 smoke sensor
// Use an ADC-capable GPIO on the ESP32-S3 Dev Module.
const int SMOKE_SENSOR_PIN = 5;

// Digital flame sensor
const int FLAME_SENSOR_PIN = 6;

// Digital IR sensor
const int IR_SENSOR_PIN = 7;

// LEDs
const int GREEN_LED_PIN = 15;
const int YELLOW_LED_PIN = 16;
const int RED_LED_PIN = 17;

// Buzzer
const int BUZZER_PIN = 18;

// =====================================================
// SENSOR SETTINGS
// =====================================================

// Most common flame modules:
// LOW  = flame detected
// HIGH = no flame
const bool FLAME_ACTIVE_LOW = true;

// Most IR obstacle modules behave the same way:
// LOW  = obstacle / blockage detected
// HIGH = no obstacle
const bool IR_ACTIVE_LOW = true;

// MQ-2 thresholds for smoke level.
// These are starting values and may need calibration.
const int SMOKE_MODERATE_THRESHOLD = 1500;
const int SMOKE_HIGH_THRESHOLD = 2500;

// =====================================================
// FIRE NODE INFORMATION
// =====================================================

String nodeCode = "SN-01";
String nodeLocation = "IoT LAB";

String buildingId =
  "f2149bf0-2fdb-4747-839f-7e79766f85ad";

DHT dht(DHT_SENSOR_PIN, DHT_TYPE);
float lastTemperatureC = 0.0f;
float lastHumidityPct = 0.0f;

// =====================================================
// CONNECT TO WIFI
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("================================");
  Serial.println("ESP32-S3 WiFi Connection");
  Serial.println("================================");

  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startTime = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - startTime < WIFI_TIMEOUT_MS) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();

  // ---------------- WIFI SUCCESS ----------------

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("WiFi connected successfully!");

    Serial.print("ESP32-S3 IP address: ");
    Serial.println(WiFi.localIP());

    Serial.print("Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");

    return;
  }

  // ---------------- WIFI FAILED ----------------

  Serial.println("WiFi connection failed.");
  Serial.println("Starting ESP32-S3 Access Point...");

  WiFi.mode(WIFI_AP);

  bool apStarted =
    WiFi.softAP(AP_SSID, AP_PASSWORD);

  if (apStarted) {

    Serial.println("ESP32-S3 Access Point started.");

    Serial.print("AP SSID: ");
    Serial.println(AP_SSID);

    Serial.print("AP Password: ");
    Serial.println(AP_PASSWORD);

    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());

  } else {

    Serial.println("ERROR: Failed to start Access Point.");
  }
}

// =====================================================
// DHT11 TEMPERATURE AND HUMIDITY
// =====================================================

bool readDhtValues(float &temperatureC, float &humidityPct) {
  const int retries = 3;

  for (int attempt = 1; attempt <= retries; attempt++) {
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();

    bool zeroOnlyRead = (temp == 0.0f && humidity == 0.0f);
    bool invalid = isnan(temp) || isnan(humidity) || zeroOnlyRead || temp < 0 || temp > 60 || humidity < 0 || humidity > 100;

    if (!invalid) {
      temperatureC = temp;
      humidityPct = humidity;

      lastTemperatureC = temperatureC;
      lastHumidityPct = humidityPct;

      return true;
    }

    Serial.print("DHT11 attempt ");
    Serial.print(attempt);
    Serial.println(" failed. Retrying...");

    delay(250);
  }

  Serial.println("DHT11 read failed. Check wiring, power, and the 10k pull-up resistor.");
  return false;
}

// =====================================================
// FLAME SENSOR
// =====================================================

bool readFlameDetected() {

  int flameState =
    digitalRead(FLAME_SENSOR_PIN);

  Serial.print("Flame raw value: ");
  Serial.println(flameState);

  if (FLAME_ACTIVE_LOW) {

    // LOW = flame detected
    return flameState == LOW;

  } else {

    // HIGH = flame detected
    return flameState == HIGH;
  }
}

// =====================================================
// IR SENSOR
// =====================================================

bool readIrDetected() {

  int irState =
    digitalRead(IR_SENSOR_PIN);

  Serial.print("IR raw value: ");
  Serial.println(irState);

  if (IR_ACTIVE_LOW) {

    return irState == LOW;

  } else {

    return irState == HIGH;
  }
}

// =====================================================
// MQ-2 SMOKE SENSOR
// =====================================================

String readSmokeLevel() {

  int raw =
    analogRead(SMOKE_SENSOR_PIN);

  Serial.print("MQ-2 raw value: ");
  Serial.println(raw);

  if (raw >= SMOKE_HIGH_THRESHOLD) {

    return "high";

  } else if (raw >= SMOKE_MODERATE_THRESHOLD) {

    return "moderate";

  } else {

    return "normal";
  }
}

// =====================================================
// READ ALL SENSORS
// =====================================================

void readSensors(
  float &temperatureC,
  float &humidityPct,
  bool &flameDetected,
  bool &irDetected,
  String &smokeLevel,
  int &loadPct
) {

  bool dhtValid = readDhtValues(temperatureC, humidityPct);

  if (!dhtValid) {
    temperatureC = lastTemperatureC;
    humidityPct = lastHumidityPct;

    if (lastTemperatureC > 0.0f || lastHumidityPct > 0.0f) {
      Serial.println("Using last valid DHT values temporarily.");
    } else {
      Serial.println("No valid DHT reading yet. Keeping zero values until the sensor responds.");
    }
  }

  flameDetected =
    readFlameDetected();

  irDetected =
    readIrDetected();

  smokeLevel =
    readSmokeLevel();

  if (!dhtValid) {
    loadPct = 0;
    return;
  }

  int smokeWeight = smokeLevel == "high" ? 30 : smokeLevel == "moderate" ? 14 : 0;
  int riskWeight = (flameDetected || irDetected) ? 25 : 0;

  loadPct =
    constrain(
      (int)(
        temperatureC * 1.2f +
        humidityPct * 0.45f +
        smokeWeight +
        riskWeight
      ),
      0,
      100
    );
}

// =====================================================
// PRINT SENSOR READINGS
// =====================================================

void printSensorReadings(
  float temperatureC,
  float humidityPct,
  bool flameDetected,
  bool irDetected,
  String smokeLevel,
  int loadPct
) {

  Serial.println();
  Serial.println("--------- SENSOR DATA ---------");

  Serial.print("Temperature : ");
  Serial.print(temperatureC, 2);
  Serial.println(" °C");

  Serial.print("Humidity    : ");
  Serial.print(humidityPct, 1);
  Serial.println(" %");

  Serial.print("Flame       : ");

  if (flameDetected) {

    Serial.println("🔥 DETECTED");

  } else {

    Serial.println("CLEAR");
  }

  Serial.print("IR          : ");
  Serial.println(irDetected ? "🚧 DETECTED" : "CLEAR");

  Serial.print("Smoke       : ");
  Serial.println(smokeLevel);

  Serial.print("Load        : ");
  Serial.print(loadPct);
  Serial.println(" %");

  Serial.println("--------------------------------");
}

// =====================================================
// LED + BUZZER STATUS
// =====================================================

void updateStatusIndicators(
  bool connected,
  float temperatureC,
  bool flameDetected,
  bool irDetected,
  String smokeLevel
) {

  bool tempWarning =
    temperatureC >= 35.0 &&
    !flameDetected &&
    !irDetected;

  bool smokeWarning =
    smokeLevel == "moderate";

  bool riskAlert =
    flameDetected ||
    irDetected ||
    smokeLevel == "high" ||
    temperatureC >= 45.0;

  // -------------------------------------------------
  // GREEN LED
  // -------------------------------------------------

  if (connected &&
      !riskAlert &&
      !tempWarning &&
      !smokeWarning) {

    digitalWrite(
      GREEN_LED_PIN,
      HIGH
    );

  } else {

    digitalWrite(
      GREEN_LED_PIN,
      LOW
    );
  }

  // -------------------------------------------------
  // YELLOW LED
  // -------------------------------------------------

  if (connected &&
      (tempWarning || smokeWarning) &&
      !riskAlert) {

    digitalWrite(
      YELLOW_LED_PIN,
      HIGH
    );

  } else {

    digitalWrite(
      YELLOW_LED_PIN,
      LOW
    );
  }

  // -------------------------------------------------
  // RED LED
  // -------------------------------------------------

  if (connected &&
      riskAlert) {

    digitalWrite(
      RED_LED_PIN,
      HIGH
    );

  } else {

    digitalWrite(
      RED_LED_PIN,
      LOW
    );
  }

  // -------------------------------------------------
  // BUZZER
  // -------------------------------------------------

  if (connected &&
      riskAlert) {

    tone(
      BUZZER_PIN,
      2000
    );

  } else {

    noTone(
      BUZZER_PIN
    );
  }
}

// =====================================================
// SEND DATA TO SUPABASE
// =====================================================

void postTelemetry() {

  // ===================================================
  // CHECK WIFI
  // ===================================================

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println();
    Serial.println("WiFi connection lost.");
    Serial.println("Trying to reconnect...");

    connectWiFi();
  }

  // ===================================================
  // WIFI STILL NOT CONNECTED
  // ===================================================

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "ESP32-S3 is not connected to router."
    );

    Serial.println(
      "Access Point mode may be active."
    );

    updateStatusIndicators(
      false,
      0.0f,
      false,
      false,
      "normal"
    );

    return;
  }

  // ===================================================
  // SENSOR VARIABLES
  // ===================================================

  float temperatureC = 0;

  float humidityPct = 0;

  bool flameDetected = false;

  bool irDetected = false;

  String smokeLevel = "normal";

  int loadPct = 0;

  // ===================================================
  // READ SENSORS
  // ===================================================

  readSensors(
    temperatureC,
    humidityPct,
    flameDetected,
    irDetected,
    smokeLevel,
    loadPct
  );

  // ===================================================
  // UPDATE LEDS + BUZZER
  // ===================================================

  updateStatusIndicators(
    true,
    temperatureC,
    flameDetected,
    irDetected,
    smokeLevel
  );

  // ===================================================
  // PRINT DATA
  // ===================================================

  Serial.println();
  Serial.println("WiFi connected.");
  Serial.println("Sending live telemetry...");

  printSensorReadings(
    temperatureC,
    humidityPct,
    flameDetected,
    irDetected,
    smokeLevel,
    loadPct
  );

  // ===================================================
  // CREATE JSON
  // ===================================================

  DynamicJsonDocument doc(1024);

  doc["code"] =
    nodeCode;

  doc["location"] =
    nodeLocation;

  doc["building_id"] =
    buildingId;

  doc["status"] =
    "online";

  doc["temperature_c"] =
    temperatureC;

  doc["humidity_pct"] =
    humidityPct;

  doc["smoke_level"] =
    smokeLevel;

  doc["flame_detected"] =
    flameDetected;

  doc["ir_detected"] =
    irDetected;

  doc["load_pct"] =
    loadPct;

  // ===================================================
  // SERIALIZE JSON
  // ===================================================

  String payload;

  serializeJson(
    doc,
    payload
  );

  Serial.println();
  Serial.println("JSON Payload:");
  Serial.println(payload);

  // ===================================================
  // HTTPS CLIENT
  // ===================================================

  Serial.println();
  Serial.println("Connecting to Supabase...");

  WiFiClientSecure client;

  // TESTING ONLY
  // Certificate verification is disabled.

  client.setInsecure();

  HTTPClient http;

  if (!http.begin(
        client,
        INGEST_URL
      )) {

    Serial.println(
      "ERROR: Failed to initialize HTTP client."
    );

    return;
  }

  // ===================================================
  // HTTP HEADERS
  // ===================================================

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "Accept",
    "application/json"
  );

  http.setTimeout(10000);

  http.setReuse(false);

  // ===================================================
  // POST REQUEST
  // ===================================================

  Serial.println(
    "Sending POST request..."
  );

  int httpCode =
    http.POST(payload);

  // ===================================================
  // RESPONSE
  // ===================================================

  if (httpCode > 0) {

    Serial.print(
      "HTTP Response Code: "
    );

    Serial.println(
      httpCode
    );

    String response =
      http.getString();

    Serial.println(
      "Supabase Response:"
    );

    Serial.println(
      response
    );

    if (httpCode >= 200 &&
        httpCode < 300) {

      Serial.println(
        "SUCCESS: Telemetry uploaded!"
      );

    } else {

      Serial.println(
        "WARNING: Server returned an error."
      );
    }

  } else {

    Serial.print(
      "HTTP request failed. Code: "
    );

    Serial.println(
      httpCode
    );

    Serial.print(
      "Error: "
    );

    Serial.println(
      http.errorToString(
        httpCode
      ).c_str()
    );
  }

  // ===================================================
  // CLOSE CONNECTION
  // ===================================================

  http.end();
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  // ---------------- SERIAL ----------------

  Serial.begin(115200);

  delay(2000);

  Serial.println();
  Serial.println();

  Serial.println(
    "======================================"
  );

  Serial.println(
    "      ESP32-S3 FIRE ALERT SYSTEM"
  );

  Serial.println(
    "======================================"
  );

  Serial.println(
    "Starting ESP32-S3..."
  );

  // ===================================================
  // SENSOR PINS
  // ===================================================

  pinMode(
    DHT_SENSOR_PIN,
    INPUT_PULLUP
  );

  dht.begin();

  pinMode(
    FLAME_SENSOR_PIN,
    INPUT_PULLUP
  );

  pinMode(
    IR_SENSOR_PIN,
    INPUT_PULLUP
  );

  pinMode(
    SMOKE_SENSOR_PIN,
    INPUT
  );

  // ===================================================
  // LED PINS
  // ===================================================

  pinMode(
    GREEN_LED_PIN,
    OUTPUT
  );

  pinMode(
    YELLOW_LED_PIN,
    OUTPUT
  );

  pinMode(
    RED_LED_PIN,
    OUTPUT
  );

  // ===================================================
  // BUZZER
  // ===================================================

  pinMode(
    BUZZER_PIN,
    OUTPUT
  );

  // ===================================================
  // INITIAL LED STATE
  // ===================================================

  digitalWrite(
    GREEN_LED_PIN,
    LOW
  );

  digitalWrite(
    YELLOW_LED_PIN,
    LOW
  );

  digitalWrite(
    RED_LED_PIN,
    LOW
  );

  noTone(
    BUZZER_PIN
  );

  // ===================================================
  // ADC CONFIGURATION
  // ===================================================

  analogReadResolution(12);

  analogSetPinAttenuation(
    SMOKE_SENSOR_PIN,
    ADC_11db
  );

  Serial.println(
    "ADC initialized."
  );

  // ===================================================
  // RESET WIFI
  // ===================================================

  WiFi.disconnect(true);

  delay(500);

  WiFi.setAutoReconnect(true);

  WiFi.persistent(false);

  // ===================================================
  // CONNECT WIFI
  // ===================================================

  connectWiFi();

  Serial.println();

  Serial.println(
    "ESP32-S3 setup completed."
  );

  Serial.println(
    "Starting sensor telemetry..."
  );
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  Serial.println();

  Serial.println(
    "========== TELEMETRY CYCLE =========="
  );

  // Display current WiFi status

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println(
      "WiFi Status: CONNECTED"
    );

    Serial.print(
      "IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );

    Serial.print(
      "RSSI: "
    );

    Serial.print(
      WiFi.RSSI()
    );

    Serial.println(
      " dBm"
    );

  } else {

    Serial.println(
      "WiFi Status: NOT CONNECTED"
    );
  }

  // Send telemetry

  postTelemetry();

  Serial.println();

  Serial.print(
    "Waiting "
  );

  Serial.print(
    REPORT_INTERVAL_MS / 1000
  );

  Serial.println(
    " seconds..."
  );

  delay(
    REPORT_INTERVAL_MS
  );
}