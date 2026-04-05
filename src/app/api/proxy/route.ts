import { NextResponse } from "next/server";
import { isIP } from "net";
import { lookup } from "dns/promises";

const BLOCKED_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
]);

// Blocks private/loopback ranges to prevent SSRF
function isPrivateIp(ip: string): boolean {
  const private4 = [
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./,
    /^0\./,
  ];
  const private6 = [/^::1$/, /^fc/, /^fd/, /^fe80/];
  const v = isIP(ip);
  if (v === 4) return private4.some((r) => r.test(ip));
  if (v === 6) return private6.some((r) => r.test(ip));
  return false;
}

async function resolvesSafeHost(hostname: string): Promise<boolean> {
  // Reject bare IPs that are private
  if (isIP(hostname) !== 0) return !isPrivateIp(hostname);
  try {
    const { address } = await lookup(hostname);
    return !isPrivateIp(address);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only allow http/https
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  // SSRF guard: reject requests that resolve to private/loopback addresses
  const safe = await resolvesSafeHost(targetUrl.hostname);
  if (!safe) {
    return NextResponse.json({ error: "Forbidden target" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = upstream.headers.get("content-type") ?? "text/html";

    // For non-HTML responses (images, scripts, etc.) stream through as-is
    if (!contentType.includes("text/html")) {
      const body = await upstream.arrayBuffer();
      const headers = new Headers();
      headers.set("content-type", contentType);
      return new Response(body, { status: upstream.status, headers });
    }

    let html = await upstream.text();

    // Use the final URL after redirects for the base href so that path-relative
    // URLs (e.g. ./app.js on /docs/page.html) resolve correctly
    const finalUrl = upstream.url ?? target;
    const parsedFinal = new URL(finalUrl);
    // Base must include the directory path, not just the origin
    const basePath = parsedFinal.pathname.endsWith("/")
      ? parsedFinal.pathname
      : parsedFinal.pathname.replace(/\/[^/]*$/, "/");
    const base = `${parsedFinal.protocol}//${parsedFinal.host}${basePath}`;

    if (/<head/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${base}">`);
    } else {
      html = `<base href="${base}">` + html;
    }

    // Build response headers, stripping frame-blocking ones
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!BLOCKED_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    responseHeaders.set("content-type", "text/html; charset=utf-8");

    return new Response(html, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 502 });
  }
}
