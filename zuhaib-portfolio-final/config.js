/* ============================================================
   SITE CONFIG — toggle availability & CV download, then publish.
   true = ON (advertised / visible on site) · false = OFF

   You can also edit availability live from the Portfolio Manager
   app (Availability tab), which stages to a draft and publishes.
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
