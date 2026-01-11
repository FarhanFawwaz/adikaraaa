#!/bin/bash

# Script untuk mengambil dan menampilkan data Firebase Realtime Database
# Usage: ./fetch_firebase.sh

# Firebase Configuration
FIREBASE_URL="https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_SECRET="YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print header
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}🔥 FIREBASE DATA FETCHER${NC}"
echo -e "${CYAN}============================================================${NC}"
echo -e "${BLUE}📡 URL:${NC} $FIREBASE_URL"
echo -e "${BLUE}⏰ Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Fetch data
echo -e "${YELLOW}🔄 Fetching data from Firebase...${NC}"
response=$(curl -s "${FIREBASE_URL}/.json?auth=${FIREBASE_SECRET}")

# Check if curl was successful
if [ $? -eq 0 ] && [ ! -z "$response" ]; then
    echo -e "${GREEN}✅ Data berhasil diambil!${NC}\n"
    
    # Display raw JSON
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}📋 RAW JSON:${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    # Parse and display sensor data
    echo -e "\n${CYAN}============================================================${NC}"
    echo -e "${CYAN}📊 PARSED DATA:${NC}"
    echo -e "${CYAN}============================================================${NC}"
    
    # Extract sensor values using jq if available, otherwise use python
    if command -v jq &> /dev/null; then
        echo -e "${GREEN}Using jq for parsing...${NC}\n"
        
        # Extract values
        bpm=$(echo "$response" | jq -r '.device1.latest.bpm // "N/A"')
        ecg=$(echo "$response" | jq -r '.device1.latest.ecg // "N/A"')
        flex=$(echo "$response" | jq -r '.device1.latest.flex // "N/A"')
        spo2=$(echo "$response" | jq -r '.device1.latest.spo2 // "N/A"')
        ts_ms=$(echo "$response" | jq -r '.device1.latest.ts_ms // "N/A"')
        
        echo -e "${BLUE}❤️  Heart Rate (BPM):${NC} $bpm"
        echo -e "${BLUE}📈 ECG Value:${NC} $ecg"
        echo -e "${BLUE}🤏 Flex Sensor:${NC} $flex"
        echo -e "${BLUE}💧 SpO2 (%):${NC} $spo2"
        echo -e "${BLUE}⏱️  Timestamp (ms):${NC} $ts_ms"
        
        # Convert timestamp to readable format if it's a valid number
        if [ "$ts_ms" != "N/A" ]; then
            readable_time=$(date -d @$((ts_ms / 1000)) '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Invalid timestamp")
            echo -e "${BLUE}📅 Readable Time:${NC} $readable_time"
        fi
    else
        echo -e "${YELLOW}⚠️  jq not installed, using python for parsing...${NC}\n"
        
        # Use python to parse JSON
        python3 << EOF
import json
import sys
from datetime import datetime

try:
    data = json.loads('''$response''')
    
    if 'device1' in data and 'latest' in data['device1']:
        latest = data['device1']['latest']
        
        print("\033[0;34m❤️  Heart Rate (BPM):\033[0m", latest.get('bpm', 'N/A'))
        print("\033[0;34m📈 ECG Value:\033[0m", latest.get('ecg', 'N/A'))
        print("\033[0;34m🤏 Flex Sensor:\033[0m", latest.get('flex', 'N/A'))
        print("\033[0;34m💧 SpO2 (%):\033[0m", latest.get('spo2', 'N/A'))
        print("\033[0;34m⏱️  Timestamp (ms):\033[0m", latest.get('ts_ms', 'N/A'))
        
        # Convert timestamp
        ts_ms = latest.get('ts_ms')
        if ts_ms and isinstance(ts_ms, (int, float)):
            try:
                readable_time = datetime.fromtimestamp(ts_ms / 1000).strftime('%Y-%m-%d %H:%M:%S')
                print("\033[0;34m📅 Readable Time:\033[0m", readable_time)
            except:
                pass
    else:
        print("\033[1;33m⚠️  Structure tidak sesuai, menampilkan semua data:\033[0m")
        for key, value in data.items():
            print(f"  {key}: {value}")
            
except Exception as e:
    print(f"\033[0;31m❌ Error parsing JSON: {e}\033[0m")
    sys.exit(1)
EOF
    fi
    
    echo -e "\n${CYAN}============================================================${NC}"
    echo -e "${GREEN}✅ Done!${NC}"
    
else
    echo -e "${RED}❌ Gagal mengambil data dari Firebase${NC}"
    echo -e "\n${YELLOW}💡 Tips troubleshooting:${NC}"
    echo -e "  1. Pastikan koneksi internet aktif"
    echo -e "  2. Periksa Firebase URL dan Secret Key"
    echo -e "  3. Pastikan Firebase Realtime Database rules mengizinkan read"
    exit 1
fi
