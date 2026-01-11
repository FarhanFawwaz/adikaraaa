# Backend Utility Scripts

Kumpulan script utility untuk development dan debugging.

## 📁 Scripts Available:

### 1. **fetch_firebase.sh**

Fetch data dari Firebase sekali dan tampilkan dengan format rapi.

**Usage:**

```bash
cd scripts
./fetch_firebase.sh
```

### 2. **monitor_firebase.sh**

Monitor data Firebase secara real-time dengan auto-refresh.

**Usage:**

```bash
cd scripts
./monitor_firebase.sh          # Default: refresh setiap 2 detik
./monitor_firebase.sh 5        # Custom: refresh setiap 5 detik
```

**Stop:** Press `Ctrl+C`

---

## 📖 Full Documentation

Lihat dokumentasi lengkap di:

- [FIREBASE_TOOLS.md](../FIREBASE_TOOLS.md)

---

## 🔧 Requirements

- `curl` - untuk HTTP requests
- `jq` - untuk JSON parsing (optional, akan fallback ke Python)
- `python3` - untuk data processing

---

## 💡 Tips

- Gunakan `fetch_firebase.sh` untuk quick check
- Gunakan `monitor_firebase.sh` saat testing IoT device
- Script otomatis mendeteksi apakah `jq` tersedia
