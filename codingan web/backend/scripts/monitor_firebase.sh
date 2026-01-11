#!/bin/bash

# Script untuk monitoring real-time data Firebase Realtime Database
# Usage: ./monitor_firebase.sh [interval_seconds]

# Firebase Configuration
FIREBASE_URL="https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_SECRET="YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"

# Default interval (seconds)
INTERVAL=${1:-2}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to clear screen
clear_screen() {
    clear
}

# Function to fetch and display data
fetch_and_display() {
    local response=$(curl -s "${FIREBASE_URL}/.json?auth=${FIREBASE_SECRET}")
    
    if [ $? -eq 0 ] && [ ! -z "$response" ]; then
        # Clear screen for fresh display
        clear_screen
        
        # Display header
        echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║           🔥 FIREBASE REAL-TIME MONITOR 🔥                ║${NC}"
        echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo -e "${BLUE}📡 URL:${NC} $FIREBASE_URL"
        echo -e "${BLUE}⏰ Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
        echo -e "${BLUE}🔄 Interval:${NC} ${INTERVAL}s (Press Ctrl+C to stop)"
        echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
        
        # Parse data using python
        python3 << EOF
import json
import sys
from datetime import datetime

try:
    data = json.loads('''$response''')
    
    if 'device1' in data and 'latest' in data['device1']:
        latest = data['device1']['latest']
        
        bpm = latest.get('bpm', 'N/A')
        ecg = latest.get('ecg', 'N/A')
        flex = latest.get('flex', 'N/A')
        spo2 = latest.get('spo2', 'N/A')
        ts_ms = latest.get('ts_ms', 'N/A')
        
        print()
        print("\033[0;36m┌─────────────── SENSOR DATA ───────────────┐\033[0m")
        print("\033[0;36m│\033[0m                                           \033[0;36m│\033[0m")
        
        # Heart Rate with color coding
        if isinstance(bpm, (int, float)):
            if bpm < 60:
                bpm_color = "\033[0;34m"  # Blue - low
            elif bpm > 100:
                bpm_color = "\033[0;31m"  # Red - high
            else:
                bpm_color = "\033[0;32m"  # Green - normal
            print(f"\033[0;36m│\033[0m  ❤️  Heart Rate (BPM): {bpm_color}{bpm:>6}\033[0m         \033[0;36m│\033[0m")
        else:
            print(f"\033[0;36m│\033[0m  ❤️  Heart Rate (BPM): {bpm:>6}         \033[0;36m│\033[0m")
        
        # SpO2 with color coding
        if isinstance(spo2, (int, float)):
            if spo2 < 90:
                spo2_color = "\033[0;31m"  # Red - low
            elif spo2 >= 95:
                spo2_color = "\033[0;32m"  # Green - normal
            else:
                spo2_color = "\033[1;33m"  # Yellow - borderline
            print(f"\033[0;36m│\033[0m  💧 SpO2 (%):          {spo2_color}{spo2:>6}\033[0m         \033[0;36m│\033[0m")
        else:
            print(f"\033[0;36m│\033[0m  💧 SpO2 (%):          {spo2:>6}         \033[0;36m│\033[0m")
        
        print(f"\033[0;36m│\033[0m  📈 ECG Value:         {ecg:>6}         \033[0;36m│\033[0m")
        print(f"\033[0;36m│\033[0m  🤏 Flex Sensor:       {flex:>6}         \033[0;36m│\033[0m")
        
        print("\033[0;36m│\033[0m                                           \033[0;36m│\033[0m")
        print("\033[0;36m└───────────────────────────────────────────┘\033[0m")
        
        # Timestamp info
        print()
        print("\033[0;36m┌─────────────── TIMESTAMP INFO ────────────┐\033[0m")
        print(f"\033[0;36m│\033[0m  ⏱️  Raw (ms):    {ts_ms:>20}  \033[0;36m│\033[0m")
        
        if ts_ms != 'N/A' and isinstance(ts_ms, (int, float)):
            try:
                # Try as milliseconds
                if ts_ms > 1000000000000:  # Likely in milliseconds
                    readable_time = datetime.fromtimestamp(ts_ms / 1000).strftime('%Y-%m-%d %H:%M:%S')
                else:  # Likely in seconds
                    readable_time = datetime.fromtimestamp(ts_ms).strftime('%Y-%m-%d %H:%M:%S')
                print(f"\033[0;36m│\033[0m  📅 Readable:    {readable_time:>20}  \033[0;36m│\033[0m")
            except:
                print(f"\033[0;36m│\033[0m  📅 Readable:    {'Invalid timestamp':>20}  \033[0;36m│\033[0m")
        
        print("\033[0;36m└───────────────────────────────────────────┘\033[0m")
        
        # Health status summary
        print()
        print("\033[0;36m┌─────────────── HEALTH STATUS ─────────────┐\033[0m")
        
        issues = []
        if isinstance(bpm, (int, float)):
            if bpm < 60:
                issues.append("⚠️  Low heart rate (bradycardia)")
            elif bpm > 100:
                issues.append("⚠️  High heart rate (tachycardia)")
        
        if isinstance(spo2, (int, float)):
            if spo2 < 90:
                issues.append("❌ Critical: Low oxygen saturation")
            elif spo2 < 95:
                issues.append("⚠️  Warning: Borderline oxygen level")
        
        if issues:
            for issue in issues:
                print(f"\033[0;36m│\033[0m  {issue:<39}\033[0;36m│\033[0m")
        else:
            print("\033[0;36m│\033[0m  \033[0;32m✅ All vitals within normal range\033[0m       \033[0;36m│\033[0m")
        
        print("\033[0;36m└───────────────────────────────────────────┘\033[0m")
        
    else:
        print("\033[1;33m⚠️  Unexpected data structure:\033[0m")
        print(json.dumps(data, indent=2))
            
except Exception as e:
    print(f"\033[0;31m❌ Error: {e}\033[0m")
    sys.exit(1)
EOF
        
    else
        echo -e "${RED}❌ Gagal mengambil data dari Firebase${NC}"
        return 1
    fi
}

# Main loop
echo -e "${CYAN}Starting Firebase Real-Time Monitor...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
sleep 2

while true; do
    fetch_and_display
    sleep $INTERVAL
done
