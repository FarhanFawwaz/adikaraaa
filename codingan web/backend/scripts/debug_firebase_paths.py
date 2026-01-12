"""Debug Firebase paths for ECG/Flex.

Runs inside docker container (backend image already has requirements installed).
Prints which candidate paths exist and shows ecg/flex values if present.

Avoids printing auth secret.

Usage:
  python3 scripts/debug_firebase_paths.py
  python3 scripts/debug_firebase_paths.py --device device1
"""

from __future__ import annotations

import argparse
from typing import Any, Dict, Optional, Tuple

import requests


FIREBASE_DATABASE_URL = "https://neurorehab-58cd1-default-rtdb.asia-southeast1.firebasedatabase.app"
FIREBASE_DB_SECRET = "YPtFmyP2WHqRb5YOdKgZuEk95jLbp0LIXPBFpxug"


def fetch(path: str) -> Optional[Any]:
    clean = path.lstrip("/")
    url = f"{FIREBASE_DATABASE_URL}/{clean}.json"
    try:
        r = requests.get(url, params={"auth": FIREBASE_DB_SECRET}, timeout=15)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception:
        return None


def extract_ecg_flex(payload: Any) -> Tuple[Optional[Any], Optional[Any]]:
    if not isinstance(payload, dict):
        return None, None
    return payload.get("ecg"), payload.get("flex")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--device", default="device1")
    args = ap.parse_args()

    device = (args.device or "device1").strip() or "device1"

    candidates = [
        ("/sample_100ms", "/sample_100ms"),
        ("/sample_100ms/<device>", f"/sample_100ms/{device}"),
        ("/<device>/latest", f"/{device}/latest"),
        ("/<device>/latest/sample_100ms", f"/{device}/latest/sample_100ms"),
        ("/<device>/sample_100ms", f"/{device}/sample_100ms"),
    ]

    print("=== Firebase ECG/Flex Path Debug ===")
    print(f"Device: {device}")
    print("Candidates:")

    found_any = False
    for label, path in candidates:
        data = fetch(path)
        exists = data is not None
        if exists:
            found_any = True
        ecg, flex = extract_ecg_flex(data)

        # Print compactly
        print(f"- {label}: {path} -> {'FOUND' if exists else 'missing'}")
        if exists:
            keys = list(data.keys())[:12] if isinstance(data, dict) else []
            if keys:
                print(f"  keys(sample): {keys}")
            if ecg is not None or flex is not None:
                print(f"  ecg={ecg} flex={flex}")

    if not found_any:
        print("No candidate paths returned data (HTTP!=200 or JSON null).")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
