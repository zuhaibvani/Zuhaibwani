/* ============================================================
   SITE CONFIG — availability & CV download.
   true = ON (shown on site) · false = OFF

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
  try {
    var st = document.createElement('style');
    st.textContent = 'html.cv-off .cv-link{display:none!important}';
    (document.head || document.documentElement).appendChild(st);
    if (window.SITE_CONFIG.cvDownload === false) document.documentElement.classList.add('cv-off');
  } catch (e) {}
})();
(function () {
  try {
    var a = (window.SITE_CONFIG && window.SITE_CONFIG.availability) || {};
    if (a.remote || a.delhi || a.freelance) document.documentElement.classList.add('avail-active');
  } catch (e) {}
})();
