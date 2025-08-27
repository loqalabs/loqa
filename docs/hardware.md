# 🔧 Hardware

Puck hardware specifications, assembly instructions, and embedded development.

## ESP32-S3 Puck Design

The production Loqa Puck is based on the ESP32-S3 microcontroller with the following specifications:

### Core Components

| Component | Model | Purpose |
|-----------|--------|---------|
| MCU | ESP32-S3-WROOM-1 | Main processor, WiFi |  
| Microphone | INMP441 | I2S digital microphone |
| Flash | 8MB | Firmware and model storage |
| PSRAM | 8MB | Audio buffer and processing |
| LED | WS2812B | Status indication |
| Button | Tactile switch | Manual wake/reset |

### Specifications

- **Audio**: 16kHz sample rate, 16-bit depth
- **Connectivity**: WiFi 802.11 b/g/n (2.4GHz)
- **Power**: 3.3V via USB-C or battery
- **Dimensions**: 60mm x 40mm x 15mm
- **Weight**: ~25g

## Schematic Overview

```
ESP32-S3 Pin Connections:
├── I2S Microphone (INMP441)
│   ├── SCK  → GPIO 1  (I2S Clock)
│   ├── WS   → GPIO 2  (Word Select) 
│   ├── SD   → GPIO 42 (Serial Data)
│   └── L/R  → GND    (Left channel)
├── Status LED (WS2812B)
│   └── DIN  → GPIO 48 (Data)
├── Wake Button
│   └── BTN  → GPIO 0  (Boot button)
└── USB-C Connector
    ├── 5V Power with 3.3V regulator
    └── Serial programming/debug
```

## Firmware Features

### Wake Word Detection

- Local "Hey Loqa" detection using EdgeImpulse model
- ~200ms detection latency
- Configurable sensitivity threshold
- False positive filtering

### Audio Pipeline

1. **Continuous Recording**: 16kHz circular buffer
2. **Wake Word Detection**: Real-time neural network inference  
3. **Audio Streaming**: gRPC stream to Hub after wake
4. **Voice Activity Detection**: Automatic end-of-speech detection

### Power Management

- **Active Mode**: ~150mA (recording + WiFi)
- **Sleep Mode**: ~10mA (wake word detection only)
- **Deep Sleep**: ~100µA (manual wake only)
- **Battery Life**: ~8-12 hours with 2000mAh battery

## Development Setup

### Prerequisites

- [ESP-IDF v5.1+](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/get-started/)
- [PlatformIO](https://platformio.org/) (optional, but recommended)
- USB-C cable for programming

### Building Firmware

```bash
# Clone firmware repository
git clone https://github.com/loqalabs/loqa-puck
cd loqa-puck/firmware

# Configure ESP-IDF
. $HOME/esp/esp-idf/export.sh

# Build and flash
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor
```

### PlatformIO Development

```bash
# Using PlatformIO
cd loqa-puck/firmware
pio run --target upload
pio device monitor
```

## Configuration

### WiFi Setup

Pucks support WiFi provisioning via:
1. **Web Portal**: Access point mode for initial setup
2. **WPS**: Push-button WiFi connection
3. **Hardcoded**: Compile-time credentials (development)

### Runtime Configuration

```c
// Configuration stored in NVS (Non-Volatile Storage)
typedef struct {
    char wifi_ssid[32];
    char wifi_password[64]; 
    char hub_hostname[64];
    uint16_t hub_port;
    float wake_threshold;
    bool debug_mode;
} puck_config_t;
```

## Assembly Instructions

### Bill of Materials (BOM)

| Item | Quantity | Notes |
|------|----------|--------|
| ESP32-S3-WROOM-1-N8R8 | 1 | 8MB Flash, 8MB PSRAM |
| INMP441 Microphone | 1 | I2S digital mic |
| WS2812B LED | 1 | Status indicator |
| 3.3V Regulator (AMS1117) | 1 | Power supply |
| USB-C Connector | 1 | Power and programming |
| Tactile Switch | 1 | Wake/reset button |
| 0.1μF Ceramic Capacitors | 3 | Power decoupling |
| 10μF Electrolytic Capacitor | 1 | Power smoothing |
| Custom PCB | 1 | See PCB design files |

### Assembly Steps

1. **SMD Components**: Solder ESP32, regulator, capacitors (reflow recommended)
2. **Through-Hole**: Add USB-C connector, button, headers
3. **Microphone**: Carefully solder I2S microphone (small pitch)
4. **LED**: Add WS2812B status LED 
5. **Testing**: Program test firmware and verify all connections

## Enclosure Design

### 3D Printed Case

- **Material**: PETG or PLA recommended
- **Design**: Acoustic ports for microphone
- **Access**: USB-C port, reset button
- **Mounting**: Wall mount and desk stand options

STL files available in the hardware repository.

### Commercial Options

For production runs:
- Injection molded ABS housing
- Silicone overmolding for tactile feel
- Multiple color options

## Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| No audio | Wake word not detected | Check I2S wiring, mic orientation |
| WiFi fails | Can't connect to network | Verify credentials, check signal strength |
| High power | Battery drains quickly | Review sleep mode configuration |
| Flash errors | Programming fails | Check USB cable, driver installation |

### Debug Tools

```bash
# Monitor serial output
idf.py monitor

# Enable verbose logging  
idf.py menuconfig
# → Component Config → Log Output → Verbose

# Audio debugging
# Enable I2S debug output in firmware
```

## Hardware Variants

### Development Board

Simple breadboard-friendly version:
- ESP32-S3 DevKit-C
- Separate INMP441 breakout
- External LED and button

### Production Puck

Optimized custom PCB:
- Smaller form factor
- Integrated antenna design
- Battery charging circuit
- Professional enclosure

## Future Hardware Plans

### Puck v2 Features

- **Battery**: Integrated LiPo with charging
- **Sensors**: Temperature, humidity, light
- **Display**: Small OLED for status
- **Mesh**: ESP-MESH networking for coverage
- **Thread/Matter**: Smart home protocol support