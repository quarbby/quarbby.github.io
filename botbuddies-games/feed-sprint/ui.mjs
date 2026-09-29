import { WIDTH, HEIGHT, GROUND, END_X, SIGNAL_GOAL, BUDDIES, SPECIALS, ACTIONS, actionHint, powerHint, cameraFor, abilityFor, createRun, start, jump, pulse, act, special, step, score } from './game.mjs';

const $ = id => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const localSprite = new Image();
localSprite.src = './assets/self-declared-bot.png';
const sprites = new Map();
for (const buddy of BUDDIES) {
  const option = document.createElement('option');
  option.value = buddy.id; option.textContent = buddy.name;
  $('buddySelect').append(option);
  if (buddy.image) {
    const img = new Image(); img.src = `https://botbuddies.co/bot_images/${buddy.image}`;
    sprites.set(buddy.id, img);
  }
}
$('buddySelect').value = BUDDIES[Math.floor(Math.random() * BUDDIES.length)].id;
let run = createRun($('buddySelect').value);
let lastTime = 0;
let finished = false;
let cueUntil = 0;
let feedback = null;
let best = 0;
try { best = Number(localStorage.getItem('feed-sprint-best') || 0) || 0; } catch {}
const buddy = () => BUDDIES.find(candidate => candidate.id === run.buddyId);

function showCue(kind, title, caption, seconds = 2.4) {
  $('cueKind').textContent = kind;
  $('cueTitle').textContent = title;
  $('cueCaption').textContent = caption;
  $('cue').classList.toggle('noise', kind.includes('PURPLE') || kind === 'FEED NOISE' || kind === 'UP NEXT');
  $('cue').classList.toggle('power', kind === 'ABILITY' || kind === 'BUDDY ACTION' || kind === 'READY');
  cueUntil = performance.now() + seconds * 1000;
}

function previewBuddy() {
  const b = buddy(), preview = $('portrait');
  preview.replaceChildren(); preview.style.background = b.color;
  const img = sprites.get(b.id);
  if (img) {
    const portraitImage = document.createElement('img');
    portraitImage.src = img.src; portraitImage.alt = '';
    portraitImage.onerror = () => { portraitImage.remove(); preview.textContent = b.icon; };
    preview.append(portraitImage);
  } else {
    preview.textContent = b.icon;
  }
  $('roleName').textContent = b.name;
  $('itemHudLabel').textContent = b.item.toUpperCase();
  $('collectTarget').textContent = `${b.icon} ${b.item}`;
  [$('abilityName').textContent, $('abilityText').textContent] = abilityFor(b.id);
  const [action, description, icon] = SPECIALS[b.id];
  $('specialName').textContent = `${icon} ${action}`;
  $('specialText').textContent = description;
  $('specialButton').querySelector('span').firstChild.textContent = `${action} `;
  $('specialButton').setAttribute('aria-label', `${action}: ${description} Press C.`);
  $('shotName').textContent = `${ACTIONS[b.id][2]} ${ACTIONS[b.id][0]}`;
  $('moveButtonLabel').firstChild.textContent = `${ACTIONS[b.id][0]} `;
  $('shootButton').setAttribute('aria-label', `${ACTIONS[b.id][0]}: ${ACTIONS[b.id][1]} Press F or J.`);
}

function fillRound(x, y, w, h, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

function reset() {
  run = createRun($('buddySelect').value); finished = false; feedback = null;
  $('buddySelect').disabled = false;
  previewBuddy();
  const b = buddy();
  showCue('HOW TO PLAY', 'Gold: touch · Purple: F/J clear or jump', 'Any buddy can clear purple with F/J when close. Touching purple costs a heart.', 99999);
  $('overlayTag').textContent = 'A QUICK MINI GAME';
  $('overlayTitle').textContent = 'Collect gold. Avoid purple.';
  $('overlayText').textContent = `Touch six gold ${b.item}. For every purple bubble, press F/J to clear it or jump over it. Touching purple costs a heart.`;
  $('startButton').textContent = 'Start running';
  $('overlay').classList.remove('hidden');
  updateHud();
}

function begin() {
  if (run.phase !== 'ready') {
    const next = BUDDIES.filter(candidate => candidate.id !== run.buddyId);
    $('buddySelect').value = next[Math.floor(Math.random() * next.length)].id;
    reset();
  }
  start(run); $('overlay').classList.add('hidden'); $('buddySelect').disabled = true; cueUntil = 0;
  const [passiveName, passiveText] = abilityFor(buddy().id);
  run.effectLabel = passiveName.toUpperCase(); run.effectIcon = buddy().icon; run.effectTime = 1.25; run.flash = .75;
  showCue('ABILITY', `${buddy().icon} ${passiveName}`, passiveText, 1.7);
  $('announcer').textContent = `Run started as ${buddy().name}. Collect six ${buddy().item}.`;
  updateHud();
}

function finish() {
  if (finished || run.phase === 'playing' || run.phase === 'ready') return;
  finished = true;
  const points = score(run);
  if (run.phase === 'won' && points > best) {
    best = points;
    try { localStorage.setItem('feed-sprint-best', String(best)); } catch {}
  }
  $('overlayTag').textContent = run.phase === 'won' ? 'FEED COMPLETE' : 'TRY AGAIN';
  $('overlayTitle').textContent = run.phase === 'won' ? `${buddy().name} made it!` : run.lives === 0 ? 'Too much noise!' : `Need more ${buddy().item}!`;
  $('overlayText').textContent = `${run.signals} ${buddy().item} · ${run.lives} hearts · ${Math.round(run.time)} seconds · ${points.toLocaleString()} points.${run.phase === 'won' ? ' You crossed the feed.' : ' Give it another run.'}`;
  $('startButton').textContent = 'Play another buddy';
  $('overlay').classList.remove('hidden');
  $('buddySelect').disabled = false;
  $('announcer').textContent = $('overlayTitle').textContent + ' ' + $('overlayText').textContent;
  updateHud();
}

function updateHud() {
  const hint = actionHint(run), power = powerHint(run);
  $('signals').textContent = `${run.signals} / ${SIGNAL_GOAL}`;
  $('hearts').textContent = '♥ '.repeat(run.lives).trim() || '—';
  $('hearts').setAttribute('aria-label', `${run.lives} hearts`);
  $('distance').textContent = `${Math.min(100, Math.floor((run.x - 80) / (END_X - 80) * 100))}%`;
  $('best').textContent = best ? best.toLocaleString() : '—';
  $('pulseButton').disabled = run.phase !== 'playing' || !run.pulseReady;
  $('shootButton').disabled = !hint.ready;
  $('actionPrompt').classList.toggle('ready', hint.ready);
  $('actionPrompt').classList.toggle('visible', run.phase === 'playing');
  $('promptTitle').textContent = `F TO ${hint.label.toUpperCase()}`;
  $('promptDetail').textContent = hint.ready && hint.target ? `${hint.kind === 'noise' ? 'PURPLE NOISE' : 'GOLD ITEM'} · ${hint.target.label} · PRESS NOW` :
    run.buddyId !== 'self' && run.actionCharges === 0 ? 'Collect an item to recharge' : hint.guidance;
  $('powerPrompt').classList.toggle('ready', power.ready);
  $('powerPrompt').classList.toggle('visible', run.phase === 'playing');
  $('powerTitle').textContent = `C TO ${power.label.toUpperCase()}`;
  $('powerDetail').textContent = power.ready && power.target ? `${power.kind === 'noise' ? 'PURPLE NOISE' : 'GOLD ITEM'} · ${power.target.label} · PRESS NOW` : power.guidance;
  $('ammo').textContent = run.buddyId === 'news' ? `${run.actionCharges} paper${run.actionCharges === 1 ? '' : 's'}` : `${run.actionCharges} charge${run.actionCharges === 1 ? '' : 's'}`;
  $('pulseButton').querySelector('small').textContent = `X / P · ${run.pulseCharges}`;
  $('specialButton').disabled = !power.ready;
  $('specialCharge').classList.toggle('ready', power.ready);
  $('specialCharge').classList.toggle('spent', run.specialUsed);
  $('chargeText').textContent = run.specialUsed ? 'USED' : `${Math.min(2, run.pickupsCollected)} / 2`;
  $('specialCharge').setAttribute('aria-label', run.specialUsed ? 'Power used' : power.ready ? 'Power ready, press C' : power.guidance);
  $('tip').textContent = run.specialUsed ? `${SPECIALS[buddy().id][0]} used. ${run.pulseCharges} pulse left.` : power.ready ? `${SPECIALS[buddy().id][0]} ready: press C or tap Power.` : power.guidance;
}

function drawBackground(camera) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#dcecff'); sky.addColorStop(.72, '#ffe1ed'); sky.addColorStop(1, '#fff1d9');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 15; i++) {
    const x = i * 340 - camera * .26 + 35;
    if (x < -270 || x > WIDTH + 40) continue;
    const y = 85 + (i % 3) * 32;
    fillRound(x, y, 225, 105, 17, '#ffffff8c');
    fillRound(x + 17, y + 17, 44, 44, 11, i % 2 ? '#b8daf7' : '#f9bfd0');
    fillRound(x + 73, y + 22, 120, 10, 5, '#9fb5cf88');
    fillRound(x + 73, y + 43, 85, 9, 5, '#9fb5cf66');
    fillRound(x + 17, y + 74, 169, 8, 4, '#9fb5cf66');
  }
  ctx.fillStyle = '#fff1c2'; ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);
  ctx.fillStyle = '#302936'; ctx.fillRect(0, GROUND, WIDTH, 5);
  for (let x = -((camera * .72) % 64); x < WIDTH; x += 64) fillRound(x, GROUND + 35, 30, 7, 4, '#f9c5aa');
}

function drawObjects(camera) {
  for (const pickup of run.pickups) {
    if (pickup.collected) continue;
    const x = pickup.x - camera;
    if (x < -30 || x > WIDTH + 30) continue;
    ctx.fillStyle = '#fff3c4'; ctx.strokeStyle = '#292533'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, pickup.y, 23, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#292533'; ctx.font = 'bold 24px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(pickup.icon, x, pickup.y + 1);
    fillRound(x - 48, pickup.y - 95, 96, 18, 7, '#fffaf5');
    ctx.fillStyle = '#292533'; ctx.font = '800 11px Nunito, sans-serif'; ctx.fillText(pickup.label, x, pickup.y - 86, 91);
    fillRound(x - 59, pickup.y - 72, 118, 24, 8, '#ffd166');
    ctx.fillStyle = '#292533'; ctx.font = '900 14px Nunito, sans-serif'; ctx.fillText('TOUCH GOLD', x, pickup.y - 60, 111);
    ctx.strokeStyle = '#a46b00'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, pickup.y - 46); ctx.lineTo(x, pickup.y - 30); ctx.stroke();
    ctx.fillStyle = '#a46b00'; ctx.beginPath(); ctx.moveTo(x, pickup.y - 25); ctx.lineTo(x - 8, pickup.y - 35); ctx.lineTo(x + 8, pickup.y - 35); ctx.fill();
  }
  for (const obstacle of run.obstacles) {
    if (obstacle.cleared) continue;
    const x = obstacle.x - camera;
    if (x < -80 || x > WIDTH + 80) continue;
    ctx.fillStyle = '#7553b7'; ctx.strokeStyle = '#292533'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x + obstacle.w / 2, obstacle.y + obstacle.h / 2, obstacle.w / 2, obstacle.h / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '900 27px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', x + obstacle.w / 2, obstacle.y + obstacle.h / 2 - 7);
    ctx.font = '900 12px Nunito, sans-serif'; ctx.fillText('−1 ♥', x + obstacle.w / 2, obstacle.y + obstacle.h / 2 + 17);
    fillRound(x - 29, obstacle.y - 81, 120, 18, 8, '#fffaf5');
    ctx.fillStyle = '#292533'; ctx.font = '800 12px Nunito, sans-serif'; ctx.fillText(obstacle.label, x + obstacle.w / 2, obstacle.y - 72, 112);
    fillRound(x - 47, obstacle.y - 57, 156, 25, 8, '#f8b2d0');
    ctx.fillStyle = '#292533'; ctx.font = '900 13px Nunito, sans-serif'; ctx.fillText('F/J CLEAR · ↑ JUMP', x + obstacle.w / 2, obstacle.y - 44, 149);
    ctx.strokeStyle = '#753e9e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x + obstacle.w / 2, obstacle.y - 30); ctx.lineTo(x + obstacle.w / 2, obstacle.y - 13); ctx.stroke();
    ctx.fillStyle = '#753e9e'; ctx.beginPath(); ctx.moveTo(x + obstacle.w / 2, obstacle.y - 7); ctx.lineTo(x + obstacle.w / 2 - 8, obstacle.y - 18); ctx.lineTo(x + obstacle.w / 2 + 8, obstacle.y - 18); ctx.fill();
  }
  const gateX = END_X - camera + 20;
  if (gateX < WIDTH + 120) {
    fillRound(gateX, GROUND - 160, 20, 160, 8, '#292533');
    fillRound(gateX - 95, GROUND - 160, 115, 44, 11, '#ffb4c8');
    ctx.fillStyle = '#292533'; ctx.font = '900 17px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FINISH', gateX - 39, GROUND - 138);
  }
}

function drawBuddy(camera) {
  const x = run.x - camera;
  const b = buddy();
  ctx.fillStyle = '#29253345'; ctx.beginPath(); ctx.ellipse(x + 33, GROUND + 5, 38, 8, 0, 0, Math.PI * 2); ctx.fill();
  if (run.invulnerable > 0 && Math.floor(run.invulnerable * 12) % 2 === 0) ctx.globalAlpha = .42;
  fillRound(x - 3, run.y - 3, 72, 88, 15, '#292533');
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, run.y, 66, 82, 12); ctx.clip();
  ctx.fillStyle = '#fff'; ctx.fillRect(x, run.y, 66, 82);
  const art = sprites.get(b.id);
  if (art?.complete && art.naturalWidth) {
    const scale = Math.min(66 / art.naturalWidth, 70 / art.naturalHeight);
    const w = art.naturalWidth * scale, h = art.naturalHeight * scale;
    ctx.drawImage(art, x + (66 - w) / 2, run.y + (72 - h) / 2, w, h);
  } else if (localSprite.complete && localSprite.naturalWidth) {
    ctx.drawImage(localSprite, 275, 422, 620, 685, x - 1, run.y - 2, 68, 88);
  } else { ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🤖', x + 33, run.y + 53); }
  fillRound(x, run.y + 65, 66, 17, 0, b.color);
  ctx.fillStyle = '#292533'; ctx.font = '900 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.icon, x + 33, run.y + 73);
  ctx.restore(); ctx.globalAlpha = 1;
  fillRound(x - 16, run.y - 27, 98, 21, 8, '#fffaf5');
  ctx.fillStyle = '#292533'; ctx.font = '900 12px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.name, x + 33, run.y - 16, 92);
  if (run.flash > 0) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + 33, run.y + 38, 56 + run.flash * 45, 0, Math.PI * 2); ctx.stroke(); }
  if (run.safeTime > 0 || run.shieldReady) {
    ctx.strokeStyle = run.safeTime > 0 ? '#5acbb2' : '#69acd7'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(x + 33, run.y + 41, 46, 54, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (run.magnetTime > 0) {
    ctx.strokeStyle = '#e59650'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.arc(x + 33, run.y + 40, 111, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
}

function drawProjectiles(camera) {
  for (const projectile of run.projectiles) {
    const x = projectile.x - camera, y = projectile.y;
    if (x < -30 || x > WIDTH + 30) continue;
    ctx.strokeStyle = buddy().color; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x - 12, y); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#292533'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 23px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#292533'; ctx.fillText(projectile.icon, x, y + 1);
  }
}

function drawActionTarget(camera) {
  const hint = actionHint(run), target = hint.target;
  if (run.phase !== 'playing') return;
  const x = target ? target.x - camera + (hint.kind === 'noise' ? target.w / 2 : 0) : run.x - camera + 33;
  const y = target ? hint.kind === 'noise' ? target.y + target.h / 2 : target.y : run.y + 41;
  if (x < 90 || x > WIDTH - 35) return;
  ctx.save();
  ctx.globalAlpha = hint.ready ? 1 : .48;
  ctx.strokeStyle = '#ffde6a';
  ctx.lineWidth = hint.ready ? 7 : 4;
  ctx.setLineDash(hint.ready ? [] : [9, 8]);
  ctx.beginPath(); ctx.arc(x, y, 51, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  fillRound(x - 65, y - 139, 130, 30, 12, '#292533');
  ctx.fillStyle = '#fff'; ctx.font = '900 18px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(hint.ready ? 'PRESS F / J' : 'GET CLOSER', x, y - 124, 122);
  ctx.restore();
}

function drawPowerTarget(camera) {
  const hint = powerHint(run), target = hint.target;
  if (run.phase !== 'playing' || !hint.charged) return;
  const x = target ? target.x - camera + (hint.kind === 'noise' ? target.w / 2 : 0) : run.x - camera + 33;
  const y = target ? hint.kind === 'noise' ? target.y + target.h / 2 : target.y : run.y + 41;
  if (x < 90 || x > WIDTH - 35) return;
  ctx.save(); ctx.globalAlpha = hint.ready ? 1 : .45;
  ctx.strokeStyle = '#f182b9'; ctx.lineWidth = 5; ctx.setLineDash([10, 7]);
  ctx.beginPath(); ctx.arc(x, y, hint.kind === 'noise' ? 65 : target ? 56 : 72, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  if (target !== actionHint(run).target) {
    fillRound(x - 58, y - 153, 116, 30, 11, '#822f66');
    ctx.fillStyle = '#fff'; ctx.font = '900 17px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(hint.ready ? 'PRESS C' : 'C POWER', x, y - 138, 110);
  }
  ctx.restore();
}

function drawEffect(camera) {
  if (run.effectTime <= 0) return;
  const p = 1 - run.effectTime / 1.25, x = run.x - camera + 33, y = run.y + 42;
  ctx.save(); ctx.globalAlpha = Math.min(1, run.effectTime * 2);
  ctx.strokeStyle = buddy().color; ctx.lineWidth = 7;
  for (let ring = 0; ring < 2; ring++) {
    ctx.beginPath(); ctx.arc(x, y, 70 + p * 150 + ring * 34, 0, Math.PI * 2); ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5, radius = 60 + p * 130;
    ctx.font = 'bold 27px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(run.effectIcon, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  }
  fillRound(WIDTH / 2 - 225, 22, 450, 63, 18, '#292533');
  ctx.fillStyle = '#fff'; ctx.font = '900 25px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${run.effectIcon} ${run.effectLabel}`, WIDTH / 2, 54, 420);
  ctx.restore();
}

function drawFeedback() {
  if (!feedback || performance.now() >= feedback.until) return;
  const remaining = (feedback.until - performance.now()) / 1100;
  ctx.save(); ctx.globalAlpha = Math.min(1, remaining * 2);
  if (feedback.kind === 'bad') { ctx.fillStyle = '#f4567030'; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
  fillRound(254, Math.max(105, run.y - 96), 270, 52, 14, feedback.kind === 'bad' ? '#ea5577' : '#ffd166');
  ctx.fillStyle = feedback.kind === 'bad' ? '#fff' : '#292533';
  ctx.font = '900 25px Nunito, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(feedback.text, 389, Math.max(105, run.y - 96) + 26, 255);
  ctx.restore();
}

function draw() {
  // The buddy remains at x=180 while the cards, noise, and finish gate scroll by.
  const camera = cameraFor(run);
  drawBackground(camera);
  if (run.slowTime > 0) {
    ctx.fillStyle = '#cceaff66'; ctx.fillRect(0, 0, WIDTH, GROUND);
    fillRound(730, 18, 190, 34, 10, '#b7e5ef');
    ctx.fillStyle = '#292533'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 17px Nunito, system-ui'; ctx.fillText('◐ SLOW FEED', 825, 35);
  }
  if (run.bridgeTime > 0) {
    fillRound(180, GROUND - 10, 260, 13, 6, '#65cfc2');
    ctx.strokeStyle = '#292533'; ctx.lineWidth = 3; ctx.strokeRect(180, GROUND - 10, 260, 13);
  }
  drawObjects(camera); drawActionTarget(camera); drawPowerTarget(camera); drawProjectiles(camera); drawBuddy(camera); drawEffect(camera); drawFeedback();
}

function frame(timestamp) {
  const dt = lastTime ? (timestamp - lastTime) / 1000 : 0; lastTime = timestamp;
  const events = step(run, dt);
  for (const event of events.sort((a, b) => (a.type === 'ability' || a.type === 'ready' || a.type === 'shot' ? 1 : 0) - (b.type === 'ability' || b.type === 'ready' || b.type === 'shot' ? 1 : 0))) {
    if (event.type === 'item') {
      feedback = { kind: 'good', text: `+${event.amount} ${buddy().item.toUpperCase()}`, until: performance.now() + 1100 };
      showCue('GOLD · COLLECTED', `${event.icon} +${event.amount} ${event.label}`, `Good! Touch gold to collect it. ${event.caption}`);
      $('announcer').textContent = `Collected ${event.amount} ${event.label}. ${event.caption}`;
    } else if (event.type === 'noise') {
      feedback = { kind: event.lostHeart ? 'bad' : 'good', text: event.lostHeart ? '−1 HEART · DANGER' : 'SHIELD BLOCKED!', until: performance.now() + 1100 };
      showCue('PURPLE · DANGER', event.lostHeart ? `−1 ♥ ${event.label}` : `Shield blocked ${event.label}`, `Jump over purple or clear it before touching. ${event.caption}`);
      $('announcer').textContent = event.lostHeart ? `Lost one heart to ${event.label}. Jump over purple or clear it.` : `Shield blocked ${event.label}.`;
    } else if (event.type === 'avoid') {
      feedback = { kind: 'good', text: 'SAFE PASS ✓', until: performance.now() + 900 };
      showCue('PURPLE · AVOIDED', `✓ Passed ${event.label}`, 'Good! You kept your heart by avoiding the purple bubble.', 1.6);
      $('announcer').textContent = `Avoided ${event.label}. No heart lost.`;
    } else {
      showCue(event.type === 'ability' ? 'ABILITY' : event.type === 'ready' ? 'READY' : 'SHOT CLEARED NOISE', `${event.icon || '!'} ${event.label}`, event.caption);
      $('announcer').textContent = `${event.type === 'ready' ? 'Ready' : 'Activated'} ${event.label}. ${event.caption}`;
    }
  }
  if (run.phase === 'playing' && performance.now() > cueUntil) {
    const upcoming = run.obstacles.find(o => !o.cleared && o.x > run.x + 65 && o.x < run.x + 390);
    const item = run.pickups.filter(p => !p.collected && p.x > run.x + 65 && p.x < run.x + 390).sort((a, b) => a.x - b.x)[0];
    if (upcoming && (!item || upcoming.x < item.x)) showCue('PURPLE · CLEAR OR JUMP', `F/J clear or ↑ jump over ${upcoming.label}`, `${upcoming.caption} Touching purple costs one heart.`, .5);
    else if (item) showCue('GOLD · COLLECT', `${item.icon} Touch ${item.label}`, 'Run into gold, or jump into high gold, to collect it.', .5);
    else showCue('HOW TO PLAY', 'Gold: collect · Purple: avoid', 'Touch gold for items; jump over purple to keep your hearts.', .5);
  }
  if (run.phase !== 'playing') finish();
  updateHud(); draw(); requestAnimationFrame(frame);
}

$('startButton').addEventListener('click', begin);
$('buddySelect').addEventListener('change', reset);
$('jumpButton').addEventListener('pointerdown', event => { event.preventDefault(); jump(run); });
function usePulse() {
  const cleared = pulse(run);
  if (cleared) showCue('CLEARED', `! ${cleared.label}`, cleared.caption);
  else if (run.phase === 'playing' && run.pulseReady) showCue('OUT OF RANGE', '✳ Pulse', 'Get closer to a noise bubble to clear it.', 1.5);
}
$('pulseButton').addEventListener('pointerdown', event => { event.preventDefault(); usePulse(); });
function useRoleMove() {
  const event = act(run);
  if (event) {
    feedback = { kind: 'good', text: 'PURPLE CLEARED ✓', until: performance.now() + 900 };
    showCue('PURPLE · CLEARED', `${event.icon} ${event.label} cleared ${event.targetLabel}`, `${event.caption} Jumping over purple also keeps your heart.`, 1.9);
    $('announcer').textContent = `${event.label} cleared ${event.targetLabel}. ${event.caption}`;
    updateHud();
  } else if (run.phase === 'playing' && run.actionCooldown === 0) {
    const message = run.buddyId !== 'self' && run.actionCharges === 0 ? 'Collect an item to recharge your role move.' : actionHint(run).guidance;
    showCue('ROLE MOVE', `${ACTIONS[buddy().id][2]} ${ACTIONS[buddy().id][0]}`, message, 1.4);
  }
}
$('shootButton').addEventListener('pointerdown', event => { event.preventDefault(); useRoleMove(); });
function useSpecial() {
  const events = special(run);
  if (!events) {
    if (run.phase === 'playing' && !run.specialUsed) showCue('POWER', `${SPECIALS[buddy().id][2]} ${SPECIALS[buddy().id][0]}`, powerHint(run).guidance, 1.5);
    return;
  }
  const power = events[0];
  showCue('BUDDY ACTION', `${power.icon} ${power.label}`, power.caption, 2.5);
  $('announcer').textContent = `${power.label} activated. ${power.caption}`;
  updateHud();
}
$('specialButton').addEventListener('pointerdown', event => { event.preventDefault(); useSpecial(); });
canvas.addEventListener('pointerdown', () => jump(run));
window.addEventListener('keydown', event => {
  if (['SELECT', 'INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  if (['Space', 'ArrowUp', 'KeyX', 'KeyP', 'KeyC', 'KeyF', 'KeyJ'].includes(event.code)) event.preventDefault();
  if (event.repeat) return;
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    if (run.phase === 'playing') jump(run); else begin();
  }
  if (event.code === 'KeyX' || event.code === 'KeyP') usePulse();
  if (event.code === 'KeyF' || event.code === 'KeyJ') useRoleMove();
  if (event.code === 'KeyC') useSpecial();
  if (event.code === 'KeyR') { reset(); begin(); }
});

reset(); requestAnimationFrame(frame);
