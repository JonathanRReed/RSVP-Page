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

  const shootConfetti = () => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof confetti !== 'function') return;
    const colors = ['#87E2C7', '#FFCDB7', '#fff3e8', '#e6fff6'];
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
    shootConfetti();
  };

  const handleClick = () => {
    if (btn.disabled) return;

    // Optional: one per session
    if (sessionStorage.getItem(SESSION_KEY)) {
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
      sessionStorage.setItem(SESSION_KEY, '1');
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
  // Raffle Drawer
  // ----------------------
  const namesInput = document.getElementById('namesInput');
  const drawBtn = document.getElementById('drawBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultsEl = document.getElementById('raffleResults');

  const pickWeighted = () => weightedPick();
  const pickUniform = () => rewards[Math.floor(Math.random() * rewards.length)];

  function drawWinners() {
    const raw = (namesInput?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
    const unique = Array.from(new Set(raw));
    if (!unique.length) {
      resultsEl.textContent = 'Add some names above to draw.';
      resultsEl.focus();
      return;
    }
    drawBtn.disabled = true; resetBtn.disabled = true;
    const original = drawBtn.textContent; drawBtn.textContent = 'Drawing…';

    setTimeout(() => {
      const winners = [];
      const usedRewardIds = new Set();

      // First pass with weights, ensure no duplicate rewards until we run out
      for (const name of unique) {
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
      const frag = document.createDocumentFragment();
      winners.forEach((w, i) => {
        const row = document.createElement('div');
        row.style.opacity = '0';
        row.style.transform = 'translateY(6px)';
        row.textContent = `${w.name} → ${w.reward.title} ${w.reward.emoji}`;
        frag.appendChild(row);
        setTimeout(() => {
          row.style.transition = 'opacity 220ms ease, transform 220ms ease';
          row.style.opacity = '1';
          row.style.transform = 'translateY(0)';
        }, 60 * i);
      });
      resultsEl.appendChild(frag);

      // Focus and celebrate
      resultsEl.focus();
      shootConfetti();

      drawBtn.textContent = original;
      drawBtn.disabled = false; resetBtn.disabled = false;
    }, 700);
  }

  drawBtn?.addEventListener('click', drawWinners);
  resetBtn?.addEventListener('click', () => {
    namesInput.value = '';
    resultsEl.innerHTML = '';
    namesInput.focus();
  });
})();
