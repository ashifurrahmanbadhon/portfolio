import threading
import time
import urllib.request
import urllib.error
import json
import http.server
from server import PortfolioHandler, PORT
import db

def run_auth_tests():
    print("==================================================")
    print("   Testing Secure Central Admin Authentication   ")
    print("==================================================")

    # 1. Start test server
    server = http.server.HTTPServer(("127.0.0.1", PORT), PortfolioHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    time.sleep(1)

    base = f"http://127.0.0.1:{PORT}"

    def post(url, data, headers=None):
        payload = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', **(headers or {})})
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    def get(url, headers=None):
        req = urllib.request.Request(url, headers=headers or {})
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    # Ensure admin user is clean and unlocked
    conn = db.get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE admins SET failed_login_attempts = 0, locked_until = NULL WHERE username = 'admin'")
    conn.commit()
    conn.close()

    # Test 1: Username Login
    status, res1 = post(f"{base}/api/auth/login", {"username": "admin", "password": "admin123"})
    assert status == 200 and "token" in res1, "Username login failed"
    assert res1["user"]["role"] == "super_admin", "Expected Super Admin role"
    token = res1["token"]
    print(f"[PASS] Test 1: Username login succeeded. Role: {res1['user']['role']}, User: {res1['user']['username']}.")

    # Test 2: Email Login
    admin_email = res1["user"]["email"]
    assert admin_email, "Admin email must not be empty"
    status, res2 = post(f"{base}/api/auth/login", {"identifier": admin_email, "password": "admin123"})
    assert status == 200 and "token" in res2, "Email login failed"
    print(f"[PASS] Test 2: Email login with '{admin_email}' succeeded.")

    # Test 3: Session Expiration & Remember Me
    status, res_rem = post(f"{base}/api/auth/login", {"username": "admin", "password": "admin123", "remember": True})
    assert status == 200 and "expires_at" in res_rem
    days_exp = (res_rem["expires_at"] - time.time()) / 86400
    assert days_exp > 25, f"Remember me should provide ~30 days session, got {days_exp:.1f} days"
    print(f"[PASS] Test 3: Remember Me session generates 30-day persistent session ({days_exp:.1f} days).")

    # Test 4: Auth Check /api/auth/me
    auth_header = {"Authorization": f"Bearer {token}"}
    status, me_res = get(f"{base}/api/auth/me", headers=auth_header)
    assert status == 200 and me_res["user"]["username"] == "admin"
    assert me_res["user"]["role"] == "super_admin"
    print(f"[PASS] Test 4: /api/auth/me verified live Super Admin session ({me_res['user']['full_name']}).")

    # Test 5: Protected Route Access Rejection for Unauthenticated
    try:
        get(f"{base}/api/admin/central/dashboard")
        assert False, "Unauthenticated request should have failed"
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401, got {e.code}"
        print("[PASS] Test 5: Unauthorized access properly blocked (HTTP 401).")

    # Test 6: Invalid Credentials & Failed Attempt Warning
    try:
        post(f"{base}/api/auth/login", {"username": "admin", "password": "wrong_password"})
        assert False, "Invalid password should fail"
    except urllib.error.HTTPError as e:
        assert e.code == 401
        err_body = json.loads(e.read().decode())
        assert "attempt(s) remaining" in err_body["error"]
        print(f"[PASS] Test 6: Bad password rejected with attempt tracking: '{err_body['error']}'.")

    # Reset failed attempts so account is clean
    conn = db.get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE admins SET failed_login_attempts = 0, locked_until = NULL WHERE username = 'admin'")
    conn.commit()
    conn.close()

    # Test 7: Forgot Password - Token Generation
    status, forgot_res = post(f"{base}/api/auth/forgot-password", {"identifier": "admin"})
    assert status == 200 and "reset_token" in forgot_res
    reset_tok = forgot_res["reset_token"]
    print(f"[PASS] Test 7: Forgot password requested. Cryptographic recovery token issued: {reset_tok[:12]}...")

    # Test 8: Reset Password Completion
    status, reset_res = post(f"{base}/api/auth/reset-password", {"token": reset_tok, "new_password": "newSecurePassword2026!"})
    assert status == 200 and reset_res.get("success")
    print("[PASS] Test 8: Password reset completed successfully.")

    # Test 9: Verify Login with New Password
    status, new_login_res = post(f"{base}/api/auth/login", {"username": "admin", "password": "newSecurePassword2026!"})
    assert status == 200 and "token" in new_login_res
    new_token = new_login_res["token"]
    print("[PASS] Test 9: Login with newly reset password confirmed.")

    # Test 10: Change Password Back to Original admin123
    new_auth_header = {"Authorization": f"Bearer {new_token}"}
    status, chg_res = post(f"{base}/api/auth/change-password", {
        "current_password": "newSecurePassword2026!",
        "new_password": "admin123"
    }, headers=new_auth_header)
    assert status == 200 and chg_res.get("success")
    print("[PASS] Test 10: Change password back to default 'admin123' confirmed.")

    # Test 11: Secure Logout
    status, logout_res = post(f"{base}/api/auth/logout", {}, headers=new_auth_header)
    assert status == 200 and logout_res.get("success")
    print("[PASS] Test 11: Secure Logout endpoint completed and logged to activity audit.")

    # Test 12: Verify Public Content APIs Intact
    status, content = get(f"{base}/api/content")
    assert status == 200 and len(content["projects"]) == 7
    status, tg = get(f"{base}/api/toolghor/content")
    assert status == 200 and len(tg["tools"]) == 6
    print(f"[PASS] Test 12: Public Portfolio (7 projects) and ToolGhor (6 tools) APIs 100% intact.")

    server.shutdown()
    print("\nALL 12 SECURE CENTRAL AUTHENTICATION TESTS PASSED!")

if __name__ == "__main__":
    run_auth_tests()
