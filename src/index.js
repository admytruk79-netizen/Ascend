import { renderPage } from "./layout.js";
import { homePage } from "./pages/home.js";
import { roviqPage } from "./pages/roviq.js";
import { stationPage } from "./pages/station.js";
import { connectionPage } from "./pages/connection.js";
import { aboutPage } from "./pages/about.js";
import {
  handleAdminGet,
  handleAdminLogin,
  handleAdminLogout,
  handleAdminSave,
  handleAdminResetField,
  handleAdminUpload,
  handleUploadedAsset,
  loadAllContent
} from "./admin.js";

const PAGES = {
  "/": {
    render: homePage,
    title: "Roviq & Roviq Station — One system, two forms",
    description: "Roviq Core is one backend feeding role-based apps for auto services. Roviq Station is one physical hub bringing fuel, EV charging, café, retail, and wash together. Same architecture, applied twice."
  },
  "/roviq": {
    render: roviqPage,
    title: "Roviq — Real-time dispatch for auto services",
    description: "Roviq Core routes tow, diagnostic, and parts jobs in real time across five role-based apps: Customer, Diagnostic, Shop Partner, Parts Vendor, and Tow Truck."
  },
  "/station": {
    render: stationPage,
    title: "Roviq Station — A Luxury Experience, at an Affordable Price",
    description: "Fuel, EV charging, café, curated wine and retail, and a car wash — one independent brand, one location, staged across a clear Tier 1/2/3 roadmap."
  },
  "/roviq-x-station": {
    render: connectionPage,
    title: "Roviq × Roviq Station — Where the platform meets the hub",
    description: "One backend, many front ends. One hub, many services. How Roviq and Roviq Station connect on the ground."
  },
  "/about": {
    render: aboutPage,
    title: "About — Roviq & Roviq Station",
    description: "The founder story behind Roviq and Roviq Station, and how to get in touch."
  }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    try {
      if (path === "/admin") {
        if (method === "GET") return handleAdminGet(request, env);
        return new Response("Method not allowed", { status: 405 });
      }
      if (path === "/admin/login" && method === "POST") return handleAdminLogin(request, env);
      if (path === "/admin/logout" && method === "POST") return handleAdminLogout(request, env);
      if (path === "/admin/save" && method === "POST") return handleAdminSave(request, env);
      if (path === "/admin/reset-field" && method === "POST") return handleAdminResetField(request, env);
      if (path === "/admin/upload" && method === "POST") return handleAdminUpload(request, env);
      if (path.startsWith("/uploads/") && method === "GET") return handleUploadedAsset(request, env);

      const page = PAGES[path];
      if (page && method === "GET") {
        const content = await loadAllContent(env);
        const body = page.render(content);
        const html = renderPage({
          title: page.title,
          description: page.description,
          activePath: path,
          body
        });
        return new Response(html, {
          headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store" }
        });
      }

      // Static assets (diagram PNGs, etc.) are served automatically by the
      // ASSETS binding for matching paths, but fall through here explicitly
      // in case the request reaches the Worker first.
      if (method === "GET" && env.ASSETS) {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) return assetResponse;
      }

      return new Response("Not found", { status: 404 });
    } catch (err) {
      return new Response(`Internal error: ${err.message}`, { status: 500 });
    }
  }
};
