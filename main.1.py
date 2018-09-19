# main.py
import machine, utime
import sys
import urequests
import json
import network
import micropython
import ure # For regular expressions

# Number used for differentiating between the different physical trackers
trackerID = 0

# Regular expression for parsing GPRMC formatted GPS data
gprmcREG = "\$GPRMC,[0-9][0-9][0-9][0-9][0-9][0-9],(A|V),[0-9]+\.[0-9]+,(N|E|S|W),[0-9]+\.[0-9]+,(N|E|S|W),[0-9]+\.[0-9]+,[0-9]+\.[0-9]+,[0-9]+,[0-9]+\.[0-9],[A-Z]\*[0-9][A-Z]"

# `gprmcREG` = the regex object returned by compiling the above regular expression
gprmcREG = ure.compile(gprmcREG)


led = machine.Pin(2, machine.Pin.OUT)
dataBaseURL = "https://bloombus-163620.firebaseio.com/Tracker/.json"
nic = network.WLAN(network.STA_IF)
nic.active(True)
nic.connect('bloomu')
led.on()
if nic.isconnected():
    led.off()

def main():
    micropython.kbd_intr(-1)
    machine.UART(0, 9600).init(9600) # 9600 baud rate recommended by LoLin NodeMcu board
    for line in sys.stdin:

        raw=line

        if not nic.isconnected():
            led.on()
            if not network.STAT_CONNECTING:
                nic.connect('bloomu')

        else:
            led.off()
            if gprmcREG.match(raw):
                raw=raw.split(',')
                raw.pop(0)
                dateTime=raw[8]+raw[0]
                dateTime=dateTime.replace('.','')
                locData = {
                    "lat": raw[2] + raw[3],
                    "long": raw[4] + raw[5],
                    "speed":raw[6]
                }
                data={dateTime:locData}
                urequests.patch(dataBaseURL, data=json.dumps(data), headers = {"content-type":"application/json"})
                data={dateTime:raw}
                urequests.patch("https://bloombus-163620.firebaseio.com/rawLog/.json",data=json.dumps(data),headers={"content-type":"application/json"})



if __name__ == "__main__":
    main()
