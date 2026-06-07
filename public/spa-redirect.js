// Counterpart to public/404.html: GitHub Pages redirected a direct visit to
// e.g. /settings here as /?/settings. Restore the original URL via
// history.replaceState before React Router mounts, so the app renders the
// right route instead of the dashboard. Standard GitHub Pages SPA workaround:
// https://github.com/rafgraph/spa-github-pages
(function (l) {
  if (l.search[1] !== "/") return;
  var decoded = l.search
    .slice(1)
    .split("&")
    .map(function (s) {
      return s.replace(/~and~/g, "&");
    })
    .join("?");
  window.history.replaceState(null, "", l.pathname.slice(0, -1) + decoded + l.hash);
})(window.location);
