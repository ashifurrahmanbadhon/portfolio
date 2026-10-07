import threading
import time
import urllib.request
import urllib.error
import json
import http.server
from server import PortfolioHandler, PORT, JWT_SECRET, generate_token
import db

def run_tests():
    print("=== Testing Central CMS APIs ===")

    # 1. Start server in a background thread
    server = http.server.HTTPServer(("127.0.0.1", PORT), PortfolioHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    time.sleep(1)

    base_url = f"http://127.0.0.1:{PORT}"

    # Helper for GET
    def get(url, headers=None):
        req = urllib.request.Request(url, headers=headers or {})
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    # Helper for POST
    def post(url, data, headers=None):
        payload = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', **(headers or {})})
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    # Helper for PUT
    def put(url, data, headers=None):
        payload = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', **(headers or {})}, method='PUT')
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    # Helper for DELETE
    def delete(url, headers=None):
        req = urllib.request.Request(url, headers=headers or {}, method='DELETE')
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))

    # Test 1: Original Portfolio Public Content API
    status, content = get(f"{base_url}/api/content")
    assert status == 200, "Portfolio /api/content failed"
    assert "hero" in content and "projects" in content and "skills" in content, "Portfolio content missing sections"
    assert len(content["projects"]) == 7, f"Expected 7 projects, found {len(content['projects'])}"
    print("[PASS] Test 1: Original Portfolio Public Content API is 100% intact with 7 projects.")

    # Test 2: ToolGhor Public Content API
    status, tg_content = get(f"{base_url}/api/toolghor/content")
    assert status == 200, "ToolGhor /api/toolghor/content failed"
    assert "settings" in tg_content and "categories" in tg_content and "tools" in tg_content, "ToolGhor content structure invalid"
    assert len(tg_content["tools"]) == 6, f"Expected 6 tools, found {len(tg_content['tools'])}"
    print(f"[PASS] Test 2: ToolGhor Public Content API functional with {len(tg_content['tools'])} starter tools and {len(tg_content['categories'])} categories.")

    # Test 3: Public Website Content by Slug
    status, ws_content = get(f"{base_url}/api/websites/toolghor/content")
    assert status == 200 and ws_content["website"]["slug"] == "toolghor", "Website by slug failed"
    print("[PASS] Test 3: Public Website Content API by slug /api/websites/toolghor/content works.")

    # Test 4: Auth Login
    status, login_res = post(f"{base_url}/api/auth/login", {"username": "admin", "password": "admin123"})
    assert status == 200 and "token" in login_res, "Login failed"
    token = login_res["token"]
    auth_header = {"Authorization": f"Bearer {token}"}
    print("[PASS] Test 4: Admin Authentication works, token received.")

    # Test 5: Central Dashboard Admin API
    status, dash_data = get(f"{base_url}/api/admin/central/dashboard", headers=auth_header)
    assert status == 200 and "stats" in dash_data and "websites" in dash_data, "Central dashboard data invalid"
    assert dash_data["stats"]["total_websites"] >= 2, "Expected at least 2 websites"
    print(f"[PASS] Test 5: Central Dashboard API works (Total Sites: {dash_data['stats']['total_websites']}, Total Projects: {dash_data['stats']['portfolio_projects']}, Total Tools: {dash_data['stats']['toolghor_tools']}).")

    # Test 6: Manage Websites (Add new future website, test ping, then delete it)
    test_slug = f"devdocs-hub-{int(time.time())}"
    status, new_site_res = post(f"{base_url}/api/admin/websites", {
        "name": f"DevDocs Hub {int(time.time())}",
        "slug": test_slug,
        "url": "https://devdocs.example.com",
        "cms_url": "https://devdocs.example.com/admin",
        "description": "Developer documentation portal",
        "website_type": "documentation",
        "cms_type": "external",
        "status": "planned"
    }, headers=auth_header)
    assert status in [200, 201] and new_site_res.get("success"), "Create new website failed"
    created_site_id = new_site_res["id"]
    print(f"[PASS] Test 6a: Created new future website with ID {created_site_id}.")

    # Ping test
    status, ping_res = post(f"{base_url}/api/admin/websites/{created_site_id}/ping", {}, headers=auth_header)
    assert status == 200 and "connection_status" in ping_res, "Ping test failed"
    print(f"[PASS] Test 6b: Ping connectivity test response: {ping_res.get('connection_status')} ({ping_res.get('latency_ms', 0)}ms).")

    # Delete test for the new website
    status, del_site_res = delete(f"{base_url}/api/admin/websites/{created_site_id}", headers=auth_header)
    assert status == 200, "Delete created website failed"
    print("[PASS] Test 6c: Successfully deleted test website.")

    # Test 6d: Ensure Primary Portfolio (ID 1) CANNOT be deleted
    try:
        delete(f"{base_url}/api/admin/websites/1", headers=auth_header)
        assert False, "Portfolio website should NOT be deletable!"
    except urllib.error.HTTPError as e:
        assert e.code == 400, f"Expected 400 Bad Request, got {e.code}"
        print("[PASS] Test 6d: Portfolio Protection Guard verified - Primary Portfolio cannot be deleted.")

    # Test 7: ToolGhor Admin CRUD (Add tool, update tool, delete tool)
    status, add_tool_res = post(f"{base_url}/api/admin/toolghor/tools", {
        "category_id": 1,
        "name": "JSON Diff Viewer",
        "slug": "json-diff-viewer",
        "short_description": "Compare two JSON objects side by side.",
        "icon": "fas fa-code-compare",
        "url": "/tools/json-diff",
        "badge": "NEW",
        "is_featured": 1,
        "is_active": 1,
        "sort_order": 7
    }, headers=auth_header)
    assert status in [200, 201], "Add ToolGhor tool failed"
    tool_id = add_tool_res["id"]
    print(f"[PASS] Test 7a: Added new ToolGhor tool with ID {tool_id}.")

    # Update tool
    status, update_tool_res = put(f"{base_url}/api/admin/toolghor/tools/{tool_id}", {
        "category_id": 1,
        "name": "JSON Diff Viewer Pro",
        "slug": "json-diff-viewer",
        "short_description": "Compare and merge two JSON objects.",
        "icon": "fas fa-code-compare",
        "url": "/tools/json-diff",
        "badge": "UPDATED",
        "is_featured": 1,
        "is_active": 1,
        "sort_order": 7
    }, headers=auth_header)
    assert status == 200, "Update ToolGhor tool failed"
    print("[PASS] Test 7b: Updated ToolGhor tool successfully.")

    # Delete tool
    status, del_tool_res = delete(f"{base_url}/api/admin/toolghor/tools/{tool_id}", headers=auth_header)
    assert status == 200, "Delete ToolGhor tool failed"
    print("[PASS] Test 7c: Deleted ToolGhor tool successfully.")

    # Test 8: Activity logs API
    status, logs_res = get(f"{base_url}/api/admin/activity-logs?limit=5", headers=auth_header)
    assert status == 200 and len(logs_res) > 0, "Activity logs retrieval failed"
    print(f"[PASS] Test 8: Activity logs API returned {len(logs_res)} recent entries.")

    server.shutdown()
    print("\nALL 8 CENTRAL CMS INTEGRATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
