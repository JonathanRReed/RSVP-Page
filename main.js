// Noko Surprise — lightweight random reward reveal
// Accessibility: focus moves to the reward card; announcements via aria-live

(function () {
  const rsvpForm = document.getElementById('rsvpForm');
  const sharePageBtn = document.getElementById('sharePageBtn');
  const progressBar = document.getElementById('scrollProgress');

  const shootConfetti = (colorsOverride) => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof confetti !== 'function') return;
    const colors = colorsOverride || ['#4ecdc4', '#ffa07a', '#e0e0e0', '#1a1a2e'];
    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.2, y: 0.4 }, colors }), 120);
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.8, y: 0.4 }, colors }), 200);
  };


  // ----------------------
  // Share Page
  // ----------------------
  sharePageBtn?.addEventListener('click', async () => {
    const shareData = { title: document.title, text: 'Join me at Try Noko IRL ✨', url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
      }
    } catch {}
  });

  // ----------------------
  // Scroll progress
  // ----------------------
  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = Math.max(0, Math.min(1, (window.scrollY || document.documentElement.scrollTop) / (scrollH || 1)));
    progressBar.style.width = (scrolled * 100).toFixed(1) + '%';
  }
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  // ----------------------
  // RSVP mock submit (plug & play)
  // - Validates with native HTML5
  // - Stores entries in localStorage under `noko-rsvp-entries`
  // - Shows the #thanks modal and fires confetti
  // ----------------------
  rsvpForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      return;
    }
    const name = (rsvpForm.querySelector('#name')?.value || '').trim();
    const email = (rsvpForm.querySelector('#email')?.value || '').trim();
    const consent = !!rsvpForm.querySelector('#consent')?.checked;

    try {
      const key = 'noko-rsvp-entries';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push({ name, email, consent, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    location.hash = '#thanks';
    shootConfetti();
  });
  // ----------------------
  // Countdown Timer
  // ----------------------
  const countdownEl = document.getElementById('countdown');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (countdownEl && daysEl && hoursEl && minutesEl && secondsEl) {
    // Set event date (demo: October 4, 2025 - adjust as needed)
    const eventDate = new Date('2025-10-04T00:00:00').getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days.toString().padStart(2, '0');
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
      } else {
        // Event has started or passed
        countdownEl.innerHTML = '<div class="countdown__label">Event is Live!</div>';
      }
    }

    updateCountdown(); // Initial call
    setInterval(updateCountdown, 1000); // Update every second
  }

})();
