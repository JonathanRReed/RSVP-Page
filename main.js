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

  const btn = document.getElementById('nokoSurpriseBtn');
  const rewardWrap = document.getElementById('reward');
  const rewardCard = rewardWrap?.querySelector('.reward__card');
  const rewardEmoji = rewardWrap?.querySelector('.reward__emoji');
  const rewardTitle = rewardWrap?.querySelector('.reward__title');
  const rewardText = rewardWrap?.querySelector('.reward__text');
  const rewardCta = rewardWrap?.querySelector('.reward__cta');
  const announce = document.getElementById('announce');
  const tryAgainEl = document.getElementById('tryAgainToggle');
  const resetSurpriseBtn = document.getElementById('resetSurpriseBtn');
  const rewardShareBtn = document.getElementById('rewardShareBtn');

  if (!btn || !rewardWrap || !rewardCard) return;

  // Rewards config with weights
  const rewards = [
    { id: 'sample', title: 'Free Noko Sample', emoji: '🧊', text: 'Chill vibes incoming. We\'ll email how to claim your sample.', weight: 3 },
    { id: 'early', title: 'Early Access', emoji: '⏰', text: 'Be first to sip our next drop. Watch your inbox for a heads-up.', weight: 2 },
    { id: 'merch', title: 'Limited‑Edition Merch', emoji: '🧢', text: 'Exclusive drip unlocked. We\'ll send details shortly.', weight: 1 },
    { id: 'match', title: 'Your Flavor Match', emoji: '🍑', text: 'Today feels like Peach Glow — bright, soft, a little cheeky.', weight: 2 },
    { id: 'perk', title: 'Fun Branded Perks', emoji: '🎉', text: 'Stickers & wallpapers for your world. Link below.', weight: 2, cta: { href: '#', label: 'Get perks' } },
  ];

  const weightedPick = () => {
    const total = rewards.reduce((s, r) => s + (r.weight || 1), 0);
    let n = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32 * total;
    for (const r of rewards) {
      n -= (r.weight || 1);
      if (n <= 0) return r;
    }
    return rewards[0];
  };

  const SESSION_KEY = 'noko-surprise-claimed';
  const TRY_AGAIN_KEY = 'noko-try-again';

    confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.2, y: 0.4 }, colors }), 120);
    setTimeout(() => confetti({ particleCount: 40, spread: 80, origin: { x: 0.8, y: 0.4 }, colors }), 200);
  };

  const reveal = (r) => {
    rewardEmoji.textContent = r.emoji;
    rewardTitle.textContent = r.title;
    rewardText.textContent = r.text;
    if (r.cta) {
      rewardCta.hidden = false;
      rewardCta.href = r.cta.href;
      rewardCta.textContent = r.cta.label;
    } else {
      rewardCta.hidden = true;
    }
    rewardWrap.hidden = false;
    btn.setAttribute('aria-expanded', 'true');

    // Announce and focus
    if (announce) announce.textContent = `${r.title} — ${r.text}`;
    requestAnimationFrame(() => rewardCard.focus());
    // color map by reward
    const colorMap = {
      sample: ['#87E2C7', '#6AD6BA', '#e6fff6'],
      early: ['#8fb5ff', '#b3ccff', '#e8f0ff'],
      merch: ['#FFCDB7', '#ffb199', '#fff3e8'],
      match: ['#FFCDB7', '#FFDCCB', '#ffeade'],
      perk: ['#87E2C7', '#FFCDB7', '#fff3e8']
    };
    shootConfetti(colorMap[r.id] || undefined);

    // Apply theme to the reward card and prep a share URL
    try {
      rewardCard.dataset.theme = r.id;
      const [c1, c2, c3] = colorMap[r.id] || [];
      if (c1 && c2 && c3) {
        rewardCard.style.setProperty('--r1', c1);
        rewardCard.style.setProperty('--r2', c2);
        rewardCard.style.setProperty('--r3', c3);
      }
      const url = new URL(location.href);
      url.searchParams.set('reward', r.id);
      rewardCard.dataset.shareUrl = url.toString();
    } catch {}

    // Analytics placeholder
    try { console.log('[analytics] reward_revealed', { id: r.id, title: r.title }); } catch {}
  };

  const handleClick = () => {
    if (btn.disabled) return;

    // Optional: one per session
    const allowTryAgain = !!tryAgainEl?.checked;
    if (!allowTryAgain && sessionStorage.getItem(SESSION_KEY)) {
      reveal({
        emoji: '✨',
        title: 'Already Claimed',
        text: 'You\'ve already unlocked a surprise this session. Refresh to try again!',
      });
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Mixing your sparkle…';

    // Anticipation delay 600ms
    setTimeout(() => {
      const reward = weightedPick();
      if (!allowTryAgain) sessionStorage.setItem(SESSION_KEY, '1');
      reveal(reward);
      btn.textContent = original;
      btn.disabled = false;
    }, 600);
  };

  btn.addEventListener('click', handleClick);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  });

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
        if (announce) announce.textContent = 'Link copied to clipboard!';
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

  // If a reward is specified in the URL, reveal it on load (deep link)
  try {
    const url = new URL(location.href);
    const forced = url.searchParams.get('reward');
    if (forced) {
      // Removed since rewards are gone
    }
  } catch {}

  // Persist Try Again toggle (initialize and save)
  if (tryAgainEl) {
    const saved = localStorage.getItem(TRY_AGAIN_KEY);
    if (saved !== null) tryAgainEl.checked = saved === '1';
    tryAgainEl.addEventListener('change', () => {
      localStorage.setItem(TRY_AGAIN_KEY, tryAgainEl.checked ? '1' : '0');
    });
  }

  // Share reward copy
  rewardShareBtn?.addEventListener('click', async () => {
    const shareUrl = rewardCard?.dataset?.shareUrl || location.href;
    const text = `I just unlocked a Noko Surprise: ${rewardTitle.textContent} ${rewardEmoji.textContent} — ${rewardText.textContent}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      if (announce) announce.textContent = 'Copied reward to clipboard!';
    } catch {
      alert(text);
    }
  });

  // Reset Surprise: clears session and hides card
  resetSurpriseBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    rewardWrap.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (announce) announce.textContent = '';
    btn.focus();
  });

  // Tilt interaction on reward card (motion-safe)
  (function enableTilt() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!rewardCard || prefersReduced) return;
    const maxTilt = 6; // degrees
    function onMove(e) {
      const rect = rewardCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * (maxTilt * 2);
      const ry = (x - 0.5) * (maxTilt * 2);
      rewardCard.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
    function reset() {
      rewardCard.style.transition = 'transform 220ms ease';
      rewardCard.style.transform = 'none';
      setTimeout(() => (rewardCard.style.transition = ''), 240);
    }
    rewardCard.addEventListener('mouseenter', () => (rewardCard.style.willChange = 'transform'));
    rewardCard.addEventListener('mousemove', onMove);
    rewardCard.addEventListener('mouseleave', reset);
  })();

  // ----------------------
  // Raffle Drawer
  // ----------------------
  const namesInput = document.getElementById('namesInput');
  const drawBtn = document.getElementById('drawBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultsEl = document.getElementById('raffleResults');
  const copyResultsBtn = document.getElementById('copyResultsBtn');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const drawCountEl = document.getElementById('drawCount');

  const pickWeighted = () => weightedPick();
  const pickUniform = () => rewards[Math.floor(Math.random() * rewards.length)];

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawWinners() {
    const raw = (namesInput?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
    const unique = Array.from(new Set(raw));
    if (!unique.length) {
      resultsEl.textContent = 'Add some names above to draw.';
      resultsEl.focus();
      return;
    }
    // Determine number of winners
    const maxUniqueRewards = rewards.length;
    let desired = parseInt(drawCountEl?.value || '', 10);
    if (!Number.isFinite(desired) || desired <= 0) desired = Math.min(unique.length, maxUniqueRewards);
    desired = Math.min(desired, unique.length);

    drawBtn.disabled = true; resetBtn.disabled = true;
    const original = drawBtn.textContent; drawBtn.textContent = 'Drawing…';

    setTimeout(() => {
      const winners = [];
      const usedRewardIds = new Set();

      // First pass with weights, ensure no duplicate rewards until we run out
      for (const name of unique.slice(0, desired)) {
        let r = pickWeighted();
        let safety = 0;
        while (usedRewardIds.has(r.id) && safety++ < 20) r = pickWeighted();
        if (usedRewardIds.has(r.id)) {
          // fallback when all unique rewards consumed
          r = pickUniform();
        }
        winners.push({ name, reward: r });
        usedRewardIds.add(r.id);
      }

      // Render results
      resultsEl.innerHTML = '';
      const list = document.createElement('ul');
      list.setAttribute('role', 'list');
      winners.forEach((w, i) => {
        const li = document.createElement('li');
        li.textContent = `${w.name} → ${w.reward.title} ${w.reward.emoji}`;
        if (!prefersReduced) {
          li.style.opacity = '0';
          li.style.transform = 'translateY(6px)';
          setTimeout(() => {
            li.style.transition = 'opacity 220ms ease, transform 220ms ease';
            li.style.opacity = '1';
            li.style.transform = 'translateY(0)';
          }, 60 * i);
        }
        list.appendChild(li);
      });
      resultsEl.appendChild(list);

      // Focus and celebrate
      resultsEl.focus();
      shootConfetti();

      drawBtn.textContent = original;
      drawBtn.disabled = false; resetBtn.disabled = false;

      // Analytics placeholder
      try { console.log('[analytics] raffle_drawn', { count: winners.length }); } catch {}
    }, 700);
  }

  drawBtn?.addEventListener('click', drawWinners);
  resetBtn?.addEventListener('click', () => {
    namesInput.value = '';
    resultsEl.innerHTML = '';
    namesInput.focus();
  });

  // Copy results
  copyResultsBtn?.addEventListener('click', async () => {
    const text = Array.from(resultsEl.querySelectorAll('li')).map(li => li.textContent).join('\n');
    if (!text) return;
    try { await navigator.clipboard.writeText(text); if (announce) announce.textContent = 'Results copied!'; } catch {}
  });

  // Download CSV
  downloadCsvBtn?.addEventListener('click', () => {
    const rows = [['Name', 'Reward']];
    resultsEl.querySelectorAll('li').forEach(li => {
      const parts = (li.textContent || '').split('→');
      if (parts.length === 2) rows.push([parts[0].trim(), parts[1].trim()]);
    });
    if (rows.length === 1) return;
    const csv = rows.map(r => r.map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'noko_raffle_results.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
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
