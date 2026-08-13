import { CSS } from "./styles.js";
import { escapeHtml, mediaBlock } from "./layout.js";
import { CONTENT_SECTIONS, DEFAULT_CONTENT } from "./content.js";

const COOKIE_NAME = "qremyn_admin";
const SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function hmac(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createSessionCookieValue(secret) {
  const exp = Date.now() + SESSION_MS;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}

async function verifySessionCookieValue(secret, value) {
  if (!value) return false;
  const [expStr, sig] = value.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!exp || Number.isNaN(exp) || exp < Date.now()) return false;
  const expected = await hmac(secret, expStr);
  return timingSafeEqual(expected, sig);
}

function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const out = {};
  header.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

export async function isAuthed(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookies = parseCookies(request);
  return verifySessionCookieValue(env.SESSION_SECRET, cookies[COOKIE_NAME]);
}

function shell(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function renderLoginPage(error) {
  return shell("Admin login — Qremyn", `
<div class="admin-login card">
  <h2>Admin login</h2>
  ${error ? `<div class="flash flash--err">${escapeHtml(error)}</div>` : ""}
  <form method="POST" action="/admin/login">
    <div class="admin-field">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autofocus required>
    </div>
    <button type="submit" class="btn btn--navy" style="width:100%;">Log in</button>
  </form>
</div>
`);
}

export function renderAdminDashboard(content, flash) {
  const sections = CONTENT_SECTIONS.map((section) => `
    <h3 class="admin-section-title">${escapeHtml(section.title)}</h3>
    ${section.fields.map((field) => {
      const value = content[field.key] ?? "";
      if (field.type === "textarea") {
        return `<div class="admin-field">
          <label>${escapeHtml(field.label)} <span class="field-key">${field.key}</span></label>
          <textarea name="${field.key}">${escapeHtml(value)}</textarea>
        </div>`;
      }
      const isDefault = value === (DEFAULT_CONTENT[field.key] ?? "");
      const resetButton = isDefault ? "" : `
          <button type="submit" form="reset-${field.key}" class="btn btn--outline" style="padding:0.3rem 0.7rem; font-size:0.78rem; color:#a33; border-color:#a33;">Reset to default</button>
          <form id="reset-${field.key}" method="POST" action="/admin/reset-field" style="display:none;">
            <input type="hidden" name="key" value="${escapeHtml(field.key)}">
          </form>`;
      if (field.type === "image") {
        return `<div class="admin-field" data-image-field="${escapeHtml(field.key)}">
          <label>${escapeHtml(field.label)} <span class="field-key">${field.key}</span></label>
          <div style="display:flex; gap:0.6rem; align-items:center;">
            <input type="text" name="${field.key}" value="${escapeHtml(value)}" placeholder="https://example.com/photo.jpg" class="upload-url-input" style="flex:1;">
            ${resetButton}
          </div>
          <div style="display:flex; gap:0.6rem; align-items:center; margin-top:0.5rem;">
            <label class="btn btn--outline" style="cursor:pointer; padding:0.4rem 0.9rem; font-size:0.85rem; color:var(--navy); border-color:var(--navy);">
              Upload image
              <input type="file" accept="image/jpeg,image/png,image/webp" class="upload-file-input" style="display:none;">
            </label>
            <span class="upload-status" style="font-size:0.8rem; color:#666;"></span>
          </div>
          <div class="upload-preview" style="max-width:220px; margin-top:0.6rem;">${mediaBlock(value, field.label, "No image set")}</div>
        </div>`;
      }
      return `<div class="admin-field">
        <label>${escapeHtml(field.label)} <span class="field-key">${field.key}</span></label>
        <div style="display:flex; gap:0.6rem; align-items:center;">
          <input type="text" name="${field.key}" value="${escapeHtml(value)}" style="flex:1;">
          ${resetButton}
        </div>
      </div>`;
    }).join("\n")}
  `).join("\n");

  return shell("Admin — Qremyn", `
<div class="admin-shell">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <h2 style="margin-bottom:0;">Content admin</h2>
    <form method="POST" action="/admin/logout"><button type="submit" class="btn btn--outline" style="color:var(--navy); border-color:var(--navy);">Log out</button></form>
  </div>
  <p style="color:#666; font-size:0.9rem;">Edit any block below and save. Changes are written to the CONTENT KV namespace and go live immediately — no redeploy needed. Leave an image field blank to use the site's default photo for that slot (or a labeled placeholder, if there is no default yet).</p>
  ${flash === "saved" ? `<div class="flash flash--ok">Saved. The live site now reflects these changes.</div>` : ""}
  <form method="POST" action="/admin/save">
    ${sections}
    <div class="save-bar">
      <div class="container" style="padding:0; display:flex; gap:1rem;">
        <button type="submit" class="btn btn--gold">Save changes</button>
        <a href="/" class="btn btn--outline" style="color:var(--navy); border-color:var(--navy);">View site</a>
      </div>
    </div>
  </form>
</div>
<script>
(function () {
  document.querySelectorAll('[data-image-field]').forEach(function (wrap) {
    var fileInput = wrap.querySelector('.upload-file-input');
    var urlInput = wrap.querySelector('.upload-url-input');
    var status = wrap.querySelector('.upload-status');
    var preview = wrap.querySelector('.upload-preview');
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      status.textContent = 'Uploading…';
      var fd = new FormData();
      fd.append('file', file);
      fetch('/admin/upload', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) { status.textContent = data.error || 'Upload failed.'; return; }
          urlInput.value = data.url;
          status.textContent = 'Uploaded — click Save changes below to publish it.';
          preview.innerHTML = '<div class="media"><img src="' + data.url + '" alt="" loading="lazy"></div>';
        })
        .catch(function () { status.textContent = 'Upload failed — check your connection and try again.'; });
    });
  });
})();
</script>
`);
}

export async function handleAdminGet(request, env) {
  const authed = await isAuthed(request, env);
  if (!authed) {
    return new Response(renderLoginPage(null), { headers: { "content-type": "text/html;charset=UTF-8" } });
  }
  const url = new URL(request.url);
  const flash = url.searchParams.get("flash");
  const stored = await loadAllContent(env);
  return new Response(renderAdminDashboard(stored, flash), { headers: { "content-type": "text/html;charset=UTF-8" } });
}

export async function handleAdminLogin(request, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return new Response(renderLoginPage("Admin is not configured yet — set ADMIN_PASSWORD and SESSION_SECRET secrets."), {
      status: 500,
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!password || !env.ADMIN_PASSWORD || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return new Response(renderLoginPage("Incorrect password."), {
      status: 401,
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
  const cookieValue = await createSessionCookieValue(env.SESSION_SECRET);
  const headers = new Headers({ Location: "/admin" });
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${cookieValue}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`
  );
  return new Response(null, { status: 303, headers });
}

export async function handleAdminLogout(request, env) {
  const headers = new Headers({ Location: "/admin" });
  headers.append("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
  return new Response(null, { status: 303, headers });
}

export async function handleAdminSave(request, env) {
  const authed = await isAuthed(request, env);
  if (!authed) {
    return new Response(renderLoginPage("Session expired — log in again."), {
      status: 401,
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
  const form = await request.formData();
  const validKeys = new Set(Object.keys(DEFAULT_CONTENT));
  const writes = [];
  for (const [key, value] of form.entries()) {
    if (!validKeys.has(key)) continue;
    writes.push(env.CONTENT.put(`content:${key}`, String(value)));
  }
  await Promise.all(writes);
  return Response.redirect(new URL("/admin?flash=saved", request.url).toString(), 303);
}

export async function handleAdminResetField(request, env) {
  const authed = await isAuthed(request, env);
  if (!authed) {
    return new Response(renderLoginPage("Session expired — log in again."), {
      status: 401,
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
  const form = await request.formData();
  const key = String(form.get("key") || "");
  if (Object.prototype.hasOwnProperty.call(DEFAULT_CONTENT, key)) {
    await env.CONTENT.delete(`content:${key}`);
  }
  return Response.redirect(new URL("/admin?flash=saved", request.url).toString(), 303);
}

const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export async function handleAdminUpload(request, env) {
  const authed = await isAuthed(request, env);
  if (!authed) {
    return Response.json({ ok: false, error: "Session expired — log in again." }, { status: 401 });
  }
  if (!env.UPLOADS) {
    return Response.json({ ok: false, error: "Image uploads aren't configured yet (missing UPLOADS R2 binding)." }, { status: 500 });
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "No file received." }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ ok: false, error: "No file received." }, { status: 400 });
  }
  const ext = ALLOWED_UPLOAD_TYPES[file.type];
  if (!ext) {
    return Response.json({ ok: false, error: "Only JPG, PNG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ ok: false, error: "Image is larger than 8MB." }, { status: 400 });
  }
  const key = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  await env.UPLOADS.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ ok: true, url: `/${key}` });
}

export async function handleUploadedAsset(request, env) {
  if (!env.UPLOADS) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const key = url.pathname.slice(1); // drop leading "/"
  const object = await env.UPLOADS.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}

export async function loadAllContent(env) {
  const keys = Object.keys(DEFAULT_CONTENT);
  const result = { ...DEFAULT_CONTENT };
  await Promise.all(
    keys.map(async (key) => {
      if (!env.CONTENT) return;
      const stored = await env.CONTENT.get(`content:${key}`);
      // An empty string in KV means "never explicitly set" (e.g. a blanket
      // save wrote every field, including ones the admin never touched) --
      // treat it as unset so DEFAULT_CONTENT updates aren't silently
      // shadowed forever. A real (non-empty) DEFAULT_CONTENT value can
      // still be intentionally cleared by saving actual whitespace.
      if (stored !== null && stored !== undefined && stored !== "") result[key] = stored;
    })
  );
  return result;
}
