import { NextResponse } from "next/server";

const BLOCKED_HEADERS = new Set([
  "x-frame-options",
  "content-security-policy",
  "content-security-policy-report-only",
]);

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

    // Inject <base> so relative URLs resolve against the original origin
    const base = `${targetUrl.protocol}//${targetUrl.host}`;
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
