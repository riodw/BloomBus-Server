/**
 * Written by Daniel Pany
 * Fall Semester, 2016
 * Version 1.2
 * Intended for use with the Bloom Bus Tracking Project.
 *
 *
 * The purpose of this Arduino Sketch is to allow an Arduino Uno to act as a bridge between an Ultimate GPS Breakout v3 and an XBee-Pro.
 * This code initializes communications with both the GPS Unit and the XBee.
 * Then it enters a loop, where it continually queries the GPS Unit for data, and sends it to the XBee to be transmitted to the Bus Tracking Server.
 *
 * This sketch uses code found on the Adafruit GPS Library "Parsing" example.
 *
 */

#include < Adafruit_GPS.h >
#include < SoftwareSerial.h >

int TRACKER_ID = 3;

// Used to identify which Bus Tracking Module is being operated.
// No two bus arduinos should have the same ID, and this MUST be changed accordingly when updating Arduinos.

// -------------------- GPS Setup Code -------------------- //

// If you're using a GPS module:
// Connect the GPS Power pin to 5V
// Connect the GPS Ground pin to ground
// If using software serial (sketch example default):
//   Connect the GPS TX (transmit) pin to Digital 3
//   Connect the GPS RX (receive) pin to Digital 2

// This SoftwareSerial object is used to communicate with the GPS unit
SoftwareSerial mySerial(3, 2);

// This GPS object allow us to interact with the GPS unit
Adafruit_GPS GPS( & mySerial);

// Set GPSECHO to 'false' to turn off echoing the GPS data to the Serial console // Set to 'true' if you want to debug and listen to the raw GPS sentences.
#define GPSECHO true

// this keeps track of whether we're using the interrupt
// off by default!
boolean usingInterrupt = false;
void useInterrupt(boolean); // Func prototype keeps Arduino 0023 happy

// -------------------- XBee Setup Code -------------------- //

//This SoftwareSerial object is used to communicate with the XBee  SoftwareSerial xbee(4, 5); // RX, TX // GRN, WHT
byte temp[256]; //This array is used to construct the entire XBee ZigBee Transmit frame.

// -------------------- Bus Tracker Custom Functions -------------------- //

//This function allows the creation of XBee Transit Frames with messages of up to 238 bytes in length
void constructFrame(String message) {
  unsigned msgLen = message.length(); //Message Length
  unsigned frmLen = msgLen + 14; //Frame Length
  byte frmLenLow = (char) frmLen;
  
  //   byte frmLenHigh = (char) (frmLen/256);
  temp[0] = 0x7E; //Start Transmit
  temp[1] = frmLenHigh; //Length High
  temp[2] = frmLenLow; //Length Low
  temp[3] = 0x10; //Frame Type
  temp[4] = 0x01; //Frame ID
  
  for (unsigned i = 5; i < 13; i++)
    temp[i] = 0x00; // 8 bytes for the 64-bit dest. address
    temp[13] = 0xFF; // 16-bit dest addr. high
    temp[14] = 0xFE; // 16-bit dest addr. low
    temp[15] = 0x00; // Broadcast Radius
    temp[16] = 0x00; // Options
  
  for (short i = 17; i < 17 + msgLen; i++)
    temp[i] = message.charAt(i - 17); // Dedicate as many bytes as needed for the message to be sent.

  char checksum = 0x00; // Checksum of frame
  for (short i = 3; i < 3 + 14 + msgLen; i++)
    checksum = checksum + (char) temp[i]; // Sum every byte of the frame from byte 3 to the last byte.
  
  temp[17 + msgLen] = 0xFF - checksum; // Append the resulting checksum.    }

  // This function takes an integer, and pads it with a leading 0 if it is less than ten. // Example Case 1:  8:23 -> 08:23 // Example Case 2:  11:2 -> 11:02 // Example Case 3: 11:20 -> 11:20
  String timePad(int timer) {
    if (timer < 10) 
      return "0" + String(timer);
    return String(timer);
  }

  // -------------------- Main Setup Function -------------------- //

  // The "main" function for Arduino. void setup()   {        
  // Begin communications with the computer. (Optional. This is only for troubleshooting)
  Serial.begin(9600);
  Serial.println("Bus Tracker Communications has begun.");

  // Begin communications with the XBee/   
  xbee.begin( 9600 );

  // Begin communication with the GPS unit.   GPS.begin(9600);      // uncomment this line to turn on RMC (recommended minimum) and GGA (fix data) including altitude
  GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA); // uncomment this line to turn on only the "minimum recommended" data
  
  //GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCONLY);   // For parsing data, we don't suggest using anything but either RMC only or RMC+GGA since
  // the parser doesn't care about other sentences at this time
  // Set the update rate
  GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ); // 1 Hz update rate   // For the parsing code to work nicely and have time to sort thru the data, and   // print it out we don't suggest using anything higher than 1 Hz

  // Request updates on antenna status, comment out to keep quiet   GPS.sendCommand(PGCMD_ANTENNA);

  // the nice thing about this code is you can have a timer0 interrupt go off   // every 1 millisecond, and read data from the GPS for you. that makes the   // loop code a heck of a lot easier!
  useInterrupt(false);

  delay(1000); // Ask for firmware version
  mySerial.println(PMTK_Q_RELEASE);
}

// -------------------- Necessary GPS Library Functions -------------------- //

// Interrupt is called once a millisecond, looks for any new GPS data, and stores it
SIGNAL(TIMER0_COMPA_vect) {
  char c = GPS.read(); // if you want to debug, this is a good time to do it!
  #ifdef UDR0
  if (GPSECHO)
    if (c) UDR0 = c;
    // writing direct to UDR0 is much much faster than Serial.print
    // but only one character can be written at a time.
  #endif
}

void useInterrupt(boolean v) {
  if (v) { // Timer0 is already used for millis() - we'll just interrupt somewhere     // in the middle and call the "Compare A" function above
    OCR0A = 0xAF;
    TIMSK0 |= _BV(OCIE0A);
    usingInterrupt = true;
  } else { // do not call the interrupt function COMPA anymore
    TIMSK0 &= ~_BV(OCIE0A);
    usingInterrupt = false;
  }
}

// -------------------- Main Loop Function -------------------- //

uint32_t timer = millis();

// This function is called as soon as the setup() function is completed. The code within loop() will repeat as long as the Arduino is powered on or crashes.
void loop() {
  // ________________ START of Necessary GPS Library Code ________________ //
  // in case you are not using the interrupt above, you'll
  // need to 'hand query' the GPS, not suggested :(
  if (!usingInterrupt) {
    // read data from the GPS in the 'main loop'
    char c = GPS.read();
    // if you want to debug, this is a good time to do it!
    if (GPSECHO)
      if (c) delay(1); //Serial.print(c);
  }
  // if a sentence is received, we can check the checksum, parse it...
  if (GPS.newNMEAreceived()) {
    // a tricky thing here is if we print the NMEA sentence, or data
    // we end up not listening and catching other sentences!
    // so be very wary if using OUTPUT_ALLDATA and trytng to print out data
    //Serial.println(GPS.lastNMEA());   // this also sets the newNMEAreceived() flag to false

    if (!GPS.parse(GPS.lastNMEA())) // this also sets the newNMEAreceived() flag to false
      return; // we can fail to parse a sentence in which case we should just wait for another
  }

  // if millis() or timer wraps around, we'll just reset it
  if (timer > millis())
    timer = millis();

  // ________________ END of Necessary GPS Library Code ________________ //

  // ________________ START Sending GPS Message ________________ //

  // approximately every 2 seconds or so, print out the current stats
  if (millis() - timer > 2000) {
    timer = millis(); // reset the timer`

    // This string contains the data to be sent to the server. This data exists whether or not the GPS is currentling getting coordinates.
    String gpsString = String("IDEN(" + String(TRACKER_ID) + "),")
    + "TIME(" + timePad(GPS.hour) + ":" + timePad(GPS.minute) + ":" + timePad(GPS.seconds) + "),"
    + "DATE(" + timePad(GPS.month) + "/" + timePad(GPS.day) + "/" + String(GPS.year) + "),"
    + "FIXQ(" + String(GPS.fix) + "%" + String(GPS.fixquality) + ")";

    // If the GPS is currently getting coordinates, append this other data to the string.
    if (GPS.fix) {
      gpsString += ",LALO(" + String(GPS.latitudeDegrees, 7) + "%" + String(GPS.longitudeDegrees * -1.0, 7) + "),"
      + "SKAA(" + String(GPS.speed) + "%" + String(GPS.angle) + "%" + String(GPS.altitude) + "),"
      + "SATL(" + String((int) GPS.satellites) + ")"
    }

    //Start printing troubleshooting information.
    Serial.print("\nTime: ");
    Serial.print(GPS.hour);
    Serial.print(':');
    Serial.print(GPS.minute);
    Serial.print(':');
    Serial.print(GPS.seconds);
    Serial.print('.');
    Serial.println(GPS.milliseconds);
    Serial.print("Date: ");
    Serial.print(GPS.day, DEC);
    Serial.print('/');
    Serial.print(GPS.month, DEC);
    Serial.print("/20");
    Serial.println(GPS.year, DEC);
    Serial.print("Fix: ");
    Serial.print((int) GPS.fix);
    Serial.print(" quality: ");
    Serial.println((int) GPS.fixquality);
    if (GPS.fix) {
      Serial.print("Location: ");
      Serial.print(GPS.latitude, 4);
      Serial.print(GPS.lat);
      Serial.print(", ");
      Serial.print(GPS.longitude, 4);
      Serial.println(GPS.lon);
      Serial.print("Location (in degrees, works with Google Maps): ");
      Serial.print(GPS.latitudeDegrees, 4);
      Serial.print(", ");
      Serial.println(GPS.longitudeDegrees * -1.0, 4);

      Serial.print("Speed (knots): ");
      Serial.println(GPS.speed);
      Serial.print("Angle: ");
      Serial.println(GPS.angle);
      Serial.print("Altitude: ");
      Serial.println(GPS.altitude);
      Serial.print("Satellites: ");
      Serial.println((int) GPS.satellites);
    }

    Serial.println("\n\nNow Constructing Packet...");
    Serial.println();

    gpsString += ";";

    // Convert the String to a frame, and put into the global "temp" array created earlier.
    constructFrame(gpsString);

    // Print the resulting frame for troubleshooting purposes
    short frameLength = 18 + gpsString.length();
    for (unsigned i = 0; i < frameLength; i++) Serial.print((char) temp[i]);
    Serial.println();
    Serial.println();
    Serial.println();
    Serial.println();

    //Send the frame to XBee
    xbee.write(temp, frameLength);

    // ________________ END Sending GPS Message ________________ //
  }
}
