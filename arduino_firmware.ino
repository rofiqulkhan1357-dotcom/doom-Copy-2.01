/**
 * RoboControl Studio - Arduino Firmware
 * Target: Arduino Nano (or any Arduino-compatible board)
 * 
 * This firmware listens for serial commands in the format "S<id>:<angle>\n"
 * and moves the corresponding servo to the target angle.
 */

#include <Servo.h>

// Define the number of servos
const int NUM_SERVOS = 6;

// Define the pins for each servo (adjust based on your wiring)
// Common pins for Nano: 3, 5, 6, 9, 10, 11 (all PWM capable)
const int SERVO_PINS[NUM_SERVOS] = {3, 5, 6, 9, 10, 11};

Servo servos[NUM_SERVOS];
String inputString = "";         // A String to hold incoming data
bool stringComplete = false;     // Whether the string is complete

void setup() {
  // Initialize serial communication at 115200 baud
  Serial.begin(115200);
  
  // Reserve 200 bytes for the inputString
  inputString.reserve(200);

  // Attach servos and set initial positions (90 degrees)
  for (int i = 0; i < NUM_SERVOS; i++) {
    servos[i].attach(SERVO_PINS[i]);
    servos[i].write(90);
  }

  Serial.println("RoboControl Hardware Ready");
}

void loop() {
  // Process the command when a newline arrives
  if (stringComplete) {
    processCommand(inputString);
    // Clear the string for the next command
    inputString = "";
    stringComplete = false;
  }
}

/**
 * SerialEvent occurs whenever a new data comes in the hardware serial RX.
 * This routine is run between each time loop() runs.
 */
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    // If the incoming character is a newline, set a flag so the main loop can process it
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}

/**
 * Parses the command "S<id>:<angle>"
 */
void processCommand(String command) {
  command.trim(); // Remove whitespace/newlines
  
  if (command.startsWith("S")) {
    int colonIndex = command.indexOf(':');
    if (colonIndex != -1) {
      // Extract ID and Angle
      int id = command.substring(1, colonIndex).toInt();
      int angle = command.substring(colonIndex + 1).toInt();
      
      // Validate ID and move servo
      if (id >= 0 && id < NUM_SERVOS) {
        // Constrain angle to safe range
        angle = constrain(angle, 0, 180);
        servos[id].write(angle);
        
        // Optional: Send confirmation back to PC
        // Serial.print("Moving Servo ");
        // Serial.print(id);
        // Serial.print(" to ");
        // Serial.println(angle);
      }
    }
  }
}
