import { NextRequest, NextResponse } from 'next/server';

// Admin moderation buttons are plain HTML forms, so after the POST send the
// browser back to the page it came from (same origin only).
export function redirectBack(request: NextRequest, fallbackPath: string): NextResponse {
  const fallback = new URL(fallbackPath, request.url);
  const referer = request.headers.get('referer');
  let target = fallback;
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.origin === fallback.origin) target = url;
    } catch {}
  }
  return NextResponse.redirect(target, 303);
}
