// Noko Surprise — lightweight random reward reveal
// Accessibility: focus moves to the reward card; announcements via aria-live

(function () {
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
  const themeToggle = document.getElementById('themeToggle');
  const sharePageBtn = document.getElementById('sharePageBtn');
  const progressBar = document.getElementById('scrollProgress');

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
  const THEME_KEY = 'noko-theme';

  const shootConfetti = (colorsOverride) => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof confetti !== 'function') return;
    const colors = colorsOverride || ['#87E2C7', '#FFCDB7', '#fff3e8', '#e6fff6'];
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
  // Theme toggle + persistence
  // ----------------------
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'darkmint') {
      root.setAttribute('data-theme', 'darkmint');
      if (themeToggle) { themeToggle.setAttribute('aria-pressed', 'true'); themeToggle.textContent = 'Light ☀️'; }
    } else {
      root.removeAttribute('data-theme');
      if (themeToggle) { themeToggle.setAttribute('aria-pressed', 'false'); themeToggle.textContent = 'Dark Mint 🌙'; }
    }
  }
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'darkmint' ? 'darkmint' : 'light';
    const next = current === 'darkmint' ? 'light' : 'darkmint';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
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
    const text = `I just unlocked a Noko Surprise: ${rewardTitle.textContent} ${rewardEmoji.textContent} — ${rewardText.textContent}`;
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
})();
