---
title: 'Disable Pinch Zoom on iOS Safari'
date: 2026-01-22
---

How to do it in modern iOS Safari in 2026?

By default Safari on iOS allows users to pinch zoom on web pages. While this is generally a useful feature but for often for mobile web-apps with responsive design you may want to disable it to avoid layout issues or just to improve user experience.

It's been a while since the last time and my usual go-to viewport meta tag method didn't work so I had to do some research.

If you're like me and think just slap `maximum-scale=1` and `user-scalable=no` directives on the page, here's an update for you: modern Safari on iOS no longer respects these directives and allows to pinch zoom as usual.

Modern and robust way to achieve this is by applying `touch-action` CSS property. To disable pinch zoom on iOS Safari I used the following CSS:

```css
* {
  touch-action: pan-x pan-y;
}
```

This will block pinch zooming, double-tap zooming gestures and only vertical and horizontal panning will be allowed.
