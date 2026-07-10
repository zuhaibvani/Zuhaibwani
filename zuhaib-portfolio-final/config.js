/* ============================================================
   SITE CONFIG — toggle availability & CV download, then publish.
   true = ON (advertised / visible on site) · false = OFF

   Edit these from the Portfolio Manager app (Availability tab);
   it stages to a draft and lets you publish.
   ============================================================ */
window.SITE_CONFIG = {
  availability: {
    remote: true,     // Open to remote roles, worldwide
    delhi: true,      // Open to full-time, Delhi NCR
    freelance: false  // Open for freelance
  },
  cvDownload: true    // Show the "Download CV" buttons on the site (false hides them all)
};
(function () {
  function apply(c) {
    try {
      if ('cvDownload' in c) document.documentElement.classList.toggle('cv-off', c.cvDownload === false);
      if (c.availability) {
        var a = c.availability;
        document.documentElement.classList.toggle('avail-active', !!(a.remote || a.delhi || a.freelance));
      }
    } catch (e) {}
  }
  try {
    var st = document.createElement('style');
    st.textContent = 'html.cv-off .cv-link{display:none!important}';
    (document.head || document.documentElement).appendChild(st);
    apply(window.SITE_CONFIG || {});
  } catch (e) {}
  // Lets the Portfolio Manager dashboard preview toggle changes instantly, no rebuild.
  window.addEventListener('message', function (ev) {
    if (ev && ev.data && ev.data.__pm === 'cfg') apply(ev.data.config || {});
  });
})();
