(function () {
  'use strict';

  // ----------------------
  // Utilities
  // ----------------------
  const shootConfetti = (colorsOverride) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof confetti !== 'function') return;
    const colors = colorsOverride || ['#4ecdc4', '#ffa07a', '#e0e0e0', '#1a1a2e'];
    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.2, y: 0.4 }, colors }), 120);
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.8, y: 0.4 }, colors }), 200);
  };

  // ----------------------
  // Feature: Share Page
  // ----------------------
  function initShareButton() {
    const sharePageBtn = document.getElementById('sharePageBtn');
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
  }

  // ----------------------
  // Feature: Scroll Progress
  // ----------------------
  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    function updateScrollProgress() {
      const scrollH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = Math.max(0, Math.min(1, (window.scrollY || document.documentElement.scrollTop) / (scrollH || 1)));
      progressBar.style.width = (scrolled * 100).toFixed(1) + '%';
    }

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
  }

  // ----------------------
  // Feature: Parallax Bubbles
  // ----------------------
  function initParallaxBubbles() {
    const bubbles = document.querySelectorAll('.bubble');
    if (bubbles.length === 0 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const bubbleData = Array.from(bubbles).map((bubble, i) => ({
      el: bubble,
      speed: (i % 5 + 1) * 0.15 + 0.1 // Assign varied speeds
    }));

    const updateBubbleParallax = () => {
      const yOffset = window.scrollY;
      bubbleData.forEach(bubble => {
        const xOffset = Math.sin(yOffset * 0.001 * bubble.speed) * 10;
        bubble.el.style.transform = `translate3d(${xOffset}px, ${yOffset * bubble.speed}px, 0)`;
      });
    };

    window.addEventListener('scroll', updateBubbleParallax, { passive: true });
  }

  // ----------------------
  // Feature: Countdown Timer
  // ----------------------
  function initCountdownTimer() {
    const countdownEl = document.getElementById('countdown');
    const timerEl = {
      days: document.getElementById('days'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds')
    };

    if (!countdownEl || Object.values(timerEl).some(el => !el)) return;

    const eventDate = new Date('2025-10-04T00:00:00').getTime();

    function updateCountdown() {
      const distance = eventDate - new Date().getTime();
      if (distance <= 0) {
        countdownEl.innerHTML = '<div class="countdown__label">Event is Live!</div>';
        return;
      }
      timerEl.days.textContent = Math.floor(distance / 86400000).toString().padStart(2, '0');
      timerEl.hours.textContent = Math.floor((distance % 86400000) / 3600000).toString().padStart(2, '0');
      timerEl.minutes.textContent = Math.floor((distance % 3600000) / 60000).toString().padStart(2, '0');
      timerEl.seconds.textContent = Math.floor((distance % 60000) / 1000).toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ----------------------
  // Feature: Noko Surprise
  // ----------------------
  function initNokoSurprise() {
    const surpriseBtn = document.getElementById('surpriseBtn');
    const rewardEl = document.getElementById('reward');
    if (!surpriseBtn || !rewardEl) return;

    const rewards = [
      { theme: 'sample', emoji: '🥤', title: 'Free Sample Pack!', text: 'Enjoy a variety of our sparkling flavors on us.' },
      { theme: 'early', emoji: '🤫', title: 'Early Access', text: 'You get a sneak peek at our next limited-edition flavor.' },
      { theme: 'merch', emoji: '🧢', title: 'Noko Swag', text: 'A discount code for 20% off our latest merchandise.' },
      { theme: 'match', emoji: '👯', title: 'Noko for a Friend', text: 'We’ll send a free can to a friend of your choice.' },
      { theme: 'perk', emoji: '🌟', title: 'VIP Perk', text: 'You’ve unlocked priority entry to the event.' }
    ];

    const showReward = () => {
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      rewardEl.innerHTML = `
        <div class="reward__card" data-theme="${randomReward.theme}" tabindex="-1">
          <div class="reward__emoji">${randomReward.emoji}</div>
          <h3 class="reward__title">${randomReward.title}</h3>
          <p class="reward__text">${randomReward.text}</p>
          <div class="reward__cta"><a href="#" class="btn btn--ghost" role="button">Claim Now</a></div>
        </div>`;
      rewardEl.querySelector('.reward__card')?.focus();
      shootConfetti();
      surpriseBtn.textContent = 'Enjoy your surprise!';
      surpriseBtn.disabled = true;
    };

    surpriseBtn.addEventListener('click', showReward);
    checkRsvpStatus();
  }

  function checkRsvpStatus() {
    const surpriseBtn = document.getElementById('surpriseBtn');
    if (!surpriseBtn) return;
    try {
      const hasRsvpd = (localStorage.getItem('noko-rsvp-entries') || '[]') !== '[]';
      surpriseBtn.disabled = !hasRsvpd;
      if (!hasRsvpd) {
        surpriseBtn.textContent = 'RSVP to Unlock';
      }
    } catch {}
  }

  // ----------------------
  // Feature: Raffle Drawer
  // ----------------------
  function initRaffleDrawer() {
    const drawBtn = document.getElementById('drawBtn');
    const raffleEntriesEl = document.getElementById('raffleEntries');
    const winnerCountEl = document.getElementById('winnerCount');
    const removeWinnerEl = document.getElementById('removeWinner');
    const raffleResultsEl = document.getElementById('raffleResults');

    if (!drawBtn || !raffleEntriesEl || !winnerCountEl || !removeWinnerEl || !raffleResultsEl) return;

    const drawWinners = () => {
      const entries = raffleEntriesEl.value.split('\n').map(e => e.trim()).filter(Boolean);
      const count = Math.max(1, parseInt(winnerCountEl.value, 10) || 1);
      if (entries.length === 0) {
        raffleResultsEl.innerHTML = '<p>Please enter some names to draw from.</p>';
        return;
      }
      if (count > entries.length) {
         raffleResultsEl.innerHTML = '<p>Not enough entries to draw that many winners!</p>';
         return;
      }
      const winners = [];
      let remainingEntries = [...entries];
      for (let i = 0; i < count; i++) {
        if (remainingEntries.length === 0) break;
        const winnerIndex = Math.floor(Math.random() * remainingEntries.length);
        winners.push(remainingEntries.splice(winnerIndex, 1)[0]);
      }
      raffleResultsEl.innerHTML = `<p><strong>Winner${winners.length > 1 ? 's' : ''}:</strong></p><ul>${winners.map(w => `<li>${w}</li>`).join('')}</ul>`;
      shootConfetti(['#CFF7E6', '#FFDCCB', '#4ecdc4', '#ffa07a', '#1a1a2e']);
      if (removeWinnerEl.checked) {
        raffleEntriesEl.value = remainingEntries.join('\n');
      }
    };
    drawBtn.addEventListener('click', drawWinners);
  }

  // ----------------------
  // Feature: RSVP Form
  // ----------------------
  function initRsvpForm() {
    const rsvpForm = document.getElementById('rsvpForm');
    if (!rsvpForm) return;

    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      rsvpForm.querySelectorAll('.field--invalid').forEach(field => field.classList.remove('field--invalid'));

      if (!rsvpForm.checkValidity()) {
        rsvpForm.reportValidity();
        rsvpForm.querySelectorAll('input:invalid, select:invalid').forEach(input => {
          input.closest('.field')?.classList.add('field--invalid');
        });
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

      const surpriseBtn = document.getElementById('surpriseBtn');
      if (surpriseBtn) {
        surpriseBtn.disabled = false;
        surpriseBtn.textContent = 'Unlock Surprise ✨';
      }
    });
  }

  // ----------------------
  // Initialize all features
  // ----------------------
  function init() {
    initShareButton();
    initScrollProgress();
    initParallaxBubbles();
    initCountdownTimer();
    initNokoSurprise();
    initRaffleDrawer();
    initRsvpForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
