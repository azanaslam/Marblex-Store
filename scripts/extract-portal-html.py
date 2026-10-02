import json
import re
from pathlib import Path

transcript = Path(
    r"C:\Users\HP\.cursor\projects\c-Users-HP-gemini-antigravity-scratch-Marblex-Store"
    r"\agent-transcripts\7d62f8b4-400a-4191-9ad1-ba71dc25921f"
    r"\7d62f8b4-400a-4191-9ad1-ba71dc25921f.jsonl"
)
out = Path(__file__).resolve().parents[1] / "client" / "public" / "marblex-client-portal.html"

html = None
for line in transcript.open(encoding="utf-8"):
    if "DOCTYPE html" not in line:
        continue
    obj = json.loads(line)
    for part in obj.get("message", {}).get("content", []):
        if part.get("type") != "text":
            continue
        text = part.get("text", "")
        # user_query may prefix timestamp
        idx = text.lower().find("<!doctype html>")
        if idx < 0:
            continue
        chunk = text[idx:]
        end = chunk.lower().rfind("</html>")
        if end < 0:
            continue
        html = chunk[: end + len("</html>")]
        break
    if html:
        break

if not html:
    raise SystemExit("HTML not found in transcript")

html = html.replace(
    "else if(d.a==='shop')toast('Opening the MARBLEX shop…');",
    "else if(d.a==='shop')window.top.location.href='/';",
)
html = html.replace(
    "else if(d.a==='out')modal('Sign out?','<p class=\"mut\">You will need to sign in again to access your portal.</p>',()=>toast('Signed out (demo).'),'Sign out');",
    "else if(d.a==='out')modal('Sign out?','<p class=\"mut\">You will need to sign in again to access your portal.</p>',()=>{try{localStorage.removeItem('auth_token');localStorage.removeItem('auth_user');}catch(e){}window.top.location.href='/login';},'Sign out');",
)

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"written {len(html)} bytes -> {out}")
