#include <Adafruit_NeoPixel.h>
const int buttonPin = 12;
#define PIN            2
#define NUMPIXELS      12

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

bool buttonPressed = false;
int counter = 1;

int incomingByte = 0;

void setup() {
  Serial.begin(115200);
  pinMode(buttonPin, INPUT);
  pixels.begin(); // This initializes the NeoPixel library.

  clear();
  Serial.println("1");
}

void loop() {
  if (Serial.available() > 0) {
    // read the incoming byte:
    incomingByte = Serial.read();

    // say what you got:
    //Serial.print("I received: ");
    //Serial.println(incomingByte, DEC);
    if (incomingByte == 'r') {
      rainbow(5);
      clear();
    }
  }

  if (digitalRead(buttonPin) == HIGH && buttonPressed == false) {
    buttonPressed = true;
    counter++;
    Serial.println(counter);
    if (counter > 12) counter = 1;
    for (int i = 0; i <= NUMPIXELS; i++) {
      // pixels.Color takes RGB values, from 0,0,0 up to 255,255,255
      if (i <= counter - 1)
        pixels.setPixelColor(i, pixels.Color(0, 30, 0)); // Moderately bright green color.
      else
        pixels.setPixelColor(i, pixels.Color(0, 0, 0)); // Clear led
    }
    pixels.show();
  }
  if (digitalRead(buttonPin) == LOW) {
    if (buttonPressed == true) {
      //Serial.println("released");
      buttonPressed = false;
      delay(100);
    }
  }
}

// From Adafruit samples
void rainbow(uint8_t wait) {
  uint16_t i, j;

  for (j = 0; j < 256; j++) {
    for (i = 0; i < pixels.numPixels(); i++) {
      pixels.setPixelColor(i, Wheel((i + j) & 255));
    }
    pixels.show();
    delay(wait);
  }
}

void clear() {
  pixels.setPixelColor(0, pixels.Color(0, 30, 0));
  for (int i = 1; i <= NUMPIXELS; i++) {
    pixels.setPixelColor(i, pixels.Color(0, 0, 0));
  }
  pixels.show();
  counter = 1;
}

// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if (WheelPos < 85) {
    return pixels.Color(255 - WheelPos * 3, 0, WheelPos * 3, 0);
  }
  if (WheelPos < 170) {
    WheelPos -= 85;
    return pixels.Color(0, WheelPos * 3, 255 - WheelPos * 3, 0);
  }
  WheelPos -= 170;
  return pixels.Color(WheelPos * 3, 255 - WheelPos * 3, 0, 0);
}