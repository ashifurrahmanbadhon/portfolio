import urllib.request
import json
import pyotp
import sys

BASE_URL = "http://localhost:5000"

def post(endpoint, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=json.dumps(data).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def get(endpoint, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

print("=== STARTING 2FA TEST SUITE ===")

import sqlite3
conn = sqlite3.connect("portfolio.db")
conn.execute("UPDATE admins SET two_factor_enabled = 0, totp_secret = NULL, failed_2fa_attempts = 0, locked_2fa_until = NULL WHERE username = 'admin'")
conn.execute("DELETE FROM admin_recovery_codes WHERE admin_id = 1")
conn.execute("DELETE FROM admin_sms_otps WHERE admin_id = 1")
conn.commit()
conn.close()

# Test 1: Direct Login with 2FA disabled initially
status, res = post("/api/auth/login", {"identifier": "ashifur.badhon@gmail.com", "password": "admin123"})
assert status == 200, f"Expected 200, got {status}: {res}"
assert res.get("token") is not None, "Token missing on direct login"
jwt_token = res["token"]
print("[PASS] Test 1: Direct Login (2FA Disabled) passed.")

# Test 2: Check 2FA status
status, res = get("/api/auth/2fa/status", token=jwt_token)
assert status == 200, f"Status failed: {res}"
assert res["two_factor_enabled"] is False, "2FA should be disabled initially"
assert res["masked_phone"] == "******7284", f"Masked phone incorrect: {res['masked_phone']}"
print("[PASS] Test 2: 2FA Status check passed.")

# Test 3: Initiate 2FA Setup
status, res = post("/api/auth/2fa/setup", {}, token=jwt_token)
assert status == 200, f"Setup failed: {res}"
setup_token = res["setup_token"]
manual_key = res["manual_key"]
assert res.get("qr_code", "").startswith("data:image/png;base64,"), "QR code data url missing"
print(f"[PASS] Test 3: 2FA Setup initialized. Key generated: {manual_key[:4]}****")

# Test 4: Enable 2FA with TOTP code
totp = pyotp.TOTP(manual_key)
current_code = totp.now()
status, res = post("/api/auth/2fa/enable", {"setup_token": setup_token, "code": current_code}, token=jwt_token)
assert status == 200, f"Enable failed: {res}"
assert len(res["recovery_codes"]) == 8, "Expected 8 recovery codes"
recovery_codes = res["recovery_codes"]
print(f"[PASS] Test 4: 2FA Enabled successfully! 8 Recovery codes generated: {recovery_codes[:2]}...")

# Test 5: Verify status now enabled
status, res = get("/api/auth/2fa/status", token=jwt_token)
assert status == 200 and res["two_factor_enabled"] is True
assert res["recovery_codes_remaining"] == 8
print("[PASS] Test 5: Status confirms 2FA Enabled and 8 codes remaining.")

# Test 6: Login now triggers 2FA challenge
status, res = post("/api/auth/login", {"identifier": "ashifur.badhon@gmail.com", "password": "admin123"})
assert status == 200, f"Login failed: {res}"
assert res.get("requires_2fa") is True, "requires_2fa flag missing"
two_factor_token = res["two_factor_token"]
assert res["masked_phone"] == "******7284"
print("[PASS] Test 6: Login successfully returned 2FA Challenge Token.")

# Test 7: Verify invalid TOTP code is rejected
status, res = post("/api/auth/2fa/verify", {"two_factor_token": two_factor_token, "code": "000000", "method": "totp"})
assert status == 401, f"Expected 401, got {status}: {res}"
print(f"[PASS] Test 7: Invalid code correctly rejected: {res['error']}")

# Test 8: Verify valid TOTP code succeeds
valid_totp_code = totp.now()
status, res = post("/api/auth/2fa/verify", {"two_factor_token": two_factor_token, "code": valid_totp_code, "method": "totp"})
assert status == 200, f"TOTP verification failed: {res}"
assert res.get("token") is not None
new_jwt = res["token"]
print("[PASS] Test 8: Valid TOTP authentication succeeded! JWT issued.")

# Test 9: Login again, test single-use recovery code
status, res = post("/api/auth/login", {"identifier": "ashifur.badhon@gmail.com", "password": "admin123"})
challenge_tok2 = res["two_factor_token"]
test_recovery_code = recovery_codes[0]

# First use of recovery code
status, res = post("/api/auth/2fa/verify", {"two_factor_token": challenge_tok2, "code": test_recovery_code, "method": "recovery_code"})
assert status == 200, f"Recovery code verification failed: {res}"
print("[PASS] Test 9a: Recovery code verified successfully!")

# Check remaining codes is now 7
status, res = get("/api/auth/2fa/status", token=res["token"])
assert res["recovery_codes_remaining"] == 7, f"Expected 7, got {res['recovery_codes_remaining']}"
print(f"[PASS] Test 9b: Verified code consumed. Remaining: {res['recovery_codes_remaining']}")

# Test 9c: Re-use of same recovery code MUST FAIL
status, res = post("/api/auth/login", {"identifier": "ashifur.badhon@gmail.com", "password": "admin123"})
challenge_tok3 = res["two_factor_token"]
status, res = post("/api/auth/2fa/verify", {"two_factor_token": challenge_tok3, "code": test_recovery_code, "method": "recovery_code"})
assert status == 401, f"Reused recovery code should fail: {res}"
print("[PASS] Test 9c: Used recovery code reuse attempt correctly BLOCKED.")

# Test 10: SMS OTP Fallback
status, res = post("/api/auth/2fa/send-sms-otp", {"two_factor_token": challenge_tok3})
assert status == 200, f"Send SMS failed: {res}"
assert res["masked_phone"] == "******7284"
print("[PASS] Test 10a: SMS OTP dispatched to verified phone (******7284).")

# Immediate second SMS OTP request must be rate-limited (60s cooldown)
status, res = post("/api/auth/2fa/send-sms-otp", {"two_factor_token": challenge_tok3})
assert status == 429, f"Expected 429 rate limit, got {status}: {res}"
print(f"[PASS] Test 10b: SMS OTP rate limiting (60s cooldown) enforced: {res['error']}")

# Test 11: Regenerate Recovery Codes
status, res = post("/api/auth/2fa/regenerate-recovery-codes", {"password": "admin123"}, token=new_jwt)
assert status == 200, f"Regenerate failed: {res}"
assert len(res["recovery_codes"]) == 8
new_codes = res["recovery_codes"]
print("[PASS] Test 11: Recovery codes regenerated successfully.")

# Test 12: Disable 2FA
totp_disable_code = totp.now()
status, res = post("/api/auth/2fa/disable", {"password": "admin123", "code": totp_disable_code}, token=new_jwt)
assert status == 200, f"Disable failed: {res}"
print("[PASS] Test 12: 2FA Disabled successfully with password + TOTP confirmation.")

# Test 13: Direct login after disable
status, res = post("/api/auth/login", {"identifier": "ashifur.badhon@gmail.com", "password": "admin123"})
assert status == 200 and res.get("token") is not None and not res.get("requires_2fa")
print("[PASS] Test 13: Direct login working seamlessly after 2FA disabled.")

print("\n=== ALL 13 TEST CASES PASSED WITH 100% SUCCESS ===")
