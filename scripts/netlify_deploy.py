import os, json, io, sys, zipfile, urllib.request, urllib.parse, time

ROOT = sys.argv[1] if len(sys.argv) > 1 else "deploy"
TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "")
SITE = os.environ.get("NETLIFY_SITE_ID", "bbf5c4dd-a26a-4515-a8b7-bc01aaa75a28")
API = "https://api.netlify.com/api/v1/sites/" + SITE

def raw_req(method, url, payload=None, ctype="application/json"):
    r = urllib.request.Request(url, data=payload, method=method)
    r.add_header("Authorization", f"Bearer {TOKEN}")
    r.add_header("Content-Type", ctype)
    try:
        with urllib.request.urlopen(r, timeout=180) as resp:
            body = resp.read()
            try: return json.loads(body.decode())
            except Exception: return body
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:600])
        return None

if not TOKEN:
    print("NETLIFY_AUTH_TOKEN is not set"); sys.exit(1)

buf = io.BytesIO()
with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
    for base, _, names in os.walk(ROOT):
        for f in names:
            full = os.path.join(base, f)
            rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
            z.write(full, rel)
zipdata = buf.getvalue()
print("zip size:", len(zipdata))

d = raw_req("POST", f"{API}/deploys", json.dumps({"title": "Deploy from GitHub Actions", "branch": "master"}).encode())
if not d: sys.exit(1)
deploy_id = d["id"]
print("deploy:", deploy_id)

r = raw_req("PUT", f"{API}/deploys/{deploy_id}", zipdata, ctype="application/zip")
if not r: sys.exit(1)

for _ in range(30):
    st = raw_req("GET", f"{API}/deploys/{deploy_id}")
    state = st.get("state") if isinstance(st, dict) else None
    if state in ("ready", "error", "dead"):
        break
    time.sleep(5)
if state == "ready":
    print("Deploy live:", st.get("deploy_ssl_url"))
else:
    print("Deploy failed, state:", state, "| error:", st.get("error_message"))
    sys.exit(1)
