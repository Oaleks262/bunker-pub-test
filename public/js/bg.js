(function () {
  var dataEl = document.getElementById('bg-data');
  if (!dataEl) return;

  var list = JSON.parse(dataEl.textContent || '[]');
  if (!list.length) return;

  var bg1 = document.getElementById('bg1');
  var bg2 = document.getElementById('bg2');
  if (!bg1 || !bg2) return;

  // Set first background immediately
  bg1.style.backgroundImage = 'url(' + list[0] + ')';

  if (list.length < 2) return;

  var current = 0;
  var active = 1; // which layer is visible (1 or 2)

  // Preload next image before showing it
  function preload(url, cb) {
    var img = new Image();
    img.onload = cb;
    img.onerror = cb;
    img.src = url;
  }

  function showNext() {
    current = (current + 1) % list.length;
    var nextUrl = list[current];

    preload(nextUrl, function () {
      if (active === 1) {
        bg2.style.backgroundImage = 'url(' + nextUrl + ')';
        bg2.style.opacity = '1';
        bg1.style.opacity = '0';
        active = 2;
      } else {
        bg1.style.backgroundImage = 'url(' + nextUrl + ')';
        bg1.style.opacity = '1';
        bg2.style.opacity = '0';
        active = 1;
      }
    });
  }

  setInterval(showNext, 7000);
})();
