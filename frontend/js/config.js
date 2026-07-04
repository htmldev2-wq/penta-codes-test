/* Pentacodes site config — loaded before script.js.
   Points the frontend at the deployed Laravel API. The frontend (Vercel) and
   backend (separate PHP/MySQL host) are different origins, so this must be
   an absolute URL in production — local dev auto-detects and talks to
   `php artisan serve` on port 8000 instead.
*/
(function () {
  var isLocal = ['localhost', '127.0.0.1'].indexOf(window.location.hostname) !== -1;
  window.PENTACODES_API_BASE = isLocal
    ? 'http://localhost:8000'
    : 'https://REPLACE_WITH_REAL_API_DOMAIN';
})();
