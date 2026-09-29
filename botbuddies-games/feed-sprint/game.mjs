export const WIDTH = 960;
export const HEIGHT = 540;
export const GROUND = 444;
export const END_X = 4220;
export const SIGNAL_GOAL = 6;
export const cameraFor = run => run.x - 180;
const SPEED = 220;
const GRAVITY = 1530;
const JUMP_SPEED = -640;

const obstacleXs = [550, 905, 1260, 1615, 1970, 2325, 2680, 3035, 3390, 3745];
const signalXs = [300, 675, 840, 1080, 1430, 1780, 1920, 2130, 2490, 2850, 3200, 3540, 3880, 4040];
export const BUDDIES = [
  { id: 'amplifier', name: 'Amplifier', item: 'megaphones', singular: 'Megaphone', icon: '📣', color: '#ffbfc6', captions: ['Boost a message into more feeds.', 'Reach grows when others reshare.', 'Amplification can spread any claim.'] },
  { id: 'announcer', name: 'Announcer', item: 'bulletins', singular: 'Bulletin', icon: '📢', color: '#ffd4ad', image: 'announcer.png', captions: ['Broadcast a timely update.', 'A clear notice reaches the crowd.', 'Timing matters for an announcement.'] },
  { id: 'bridging', name: 'Bridging', item: 'links', singular: 'Link', icon: '🔗', color: '#ffe69c', image: 'bridging.png', captions: ['Connect two corners of the feed.', 'A bridge carries posts between groups.', 'New ties can change who sees a message.'] },
  { id: 'chaos', name: 'Chaos', item: 'sparks', singular: 'Spark', icon: '⚡', color: '#d9cefb', image: 'chaos.png', captions: ['Stir a conversation into conflict.', 'A small spark can disrupt the feed.', 'Confusion can travel quickly.'] },
  { id: 'content', name: 'Content Generation', item: 'drafts', singular: 'Draft', icon: '📝', color: '#ffd4ad', captions: ['Create a new post for the feed.', 'Original content starts a new thread.', 'A draft still needs context.'] },
  { id: 'conversational', name: 'Conversational', item: 'replies', singular: 'Reply', icon: '💬', color: '#bff0dd', captions: ['Answer someone directly.', 'A reply keeps dialogue moving.', 'Conversation depends on listening.'] },
  { id: 'coordinated', name: 'Synchronized', item: 'sync signals', singular: 'Sync signal', icon: '✳', color: '#bcd7fb', image: 'sync.png', captions: ['Act at the same time as another account.', 'Timing makes a pattern visible.', 'A shared signal aligns the group.'] },
  { id: 'engagement', name: 'Engagement Generation', item: 'reactions', singular: 'Reaction', icon: '♥', color: '#ebcbf0', image: 'engagementgeneration.png', captions: ['A reaction raises visibility.', 'Likes can draw more attention.', 'Engagement is not agreement.'] },
  { id: 'genre', name: 'Genre Specific', item: 'topic tags', singular: 'Topic tag', icon: '#', color: '#bff0dd', image: 'genrespecific.png', captions: ['Stay close to your niche.', 'A tag finds a topic community.', 'Specialized feeds have their own language.'] },
  { id: 'correction', name: 'Information Correction', item: 'fact checks', singular: 'Fact check', icon: '✓', color: '#c5e8ef', image: 'informationcorrection.png', captions: ['Trace the claim to its source.', 'Check the date and surrounding context.', 'Update the record when evidence changes.'] },
  { id: 'news', name: 'News', item: 'headlines', singular: 'Headline', icon: '🗞', color: '#d9cefb', image: 'news.png', captions: ['Carry a report into the feed.', 'A headline points to a fuller story.', 'Read the source beyond the headline.'] },
  { id: 'repeater', name: 'Repeater', item: 'reposts', singular: 'Repost', icon: '↻', color: '#ffcaa0', image: 'repeater.png', captions: ['Send the same post around again.', 'Repetition can make a claim familiar.', 'A repost is not new evidence.'] },
  { id: 'self', name: 'Self-Declared', item: 'bot labels', singular: 'Bot label', icon: '🤖', color: '#ebcbf0', captions: ['Show clearly that this account is automated.', 'A label makes the actor easier to identify.', 'Transparency helps people read the feed.'] },
  { id: 'influence', name: 'Social Influence', item: 'supporters', singular: 'Supporter', icon: '★', color: '#ffd3e2', image: 'socialinfluence.png', captions: ['Gather social attention.', 'Followers can extend a message.', 'Popularity does not prove a claim.'] },
  { id: 'cyborg', name: 'Cyborg', item: 'human reviews', singular: 'Human review', icon: '◐', color: '#c5e8ef', captions: ['Bring a human into the loop.', 'Review a post before it travels.', 'Automation and oversight work together.'] },
];
const noiseCues = [
  { label: 'No source', caption: 'There is no traceable evidence for this claim.' },
  { label: 'Old clip', caption: 'A past event is passed off as today’s.' },
  { label: 'Cropped context', caption: 'A fragment leaves out important context.' },
  { label: 'Rage bait', caption: 'Strong emotion invites a quick share.' },
  { label: 'False certainty', caption: 'Confidence outruns the available evidence.' },
];
const abilities = {
  amplifier: ['Loud boost', 'Every fourth megaphone counts twice.'],
  announcer: ['Head start', 'Begin a little farther into the feed.'],
  bridging: ['Long reach', 'Grab links from farther away.'],
  chaos: ['Wide pulse', 'Clear noise from farther away.'],
  content: ['First draft', 'Your first draft counts twice.'],
  conversational: ['Check in', 'The fourth reply restores a heart.'],
  coordinated: ['Second beat', 'Recharge your pulse halfway through.'],
  engagement: ['Momentum', 'Every fifth reaction counts twice.'],
  genre: ['Niche radar', 'Collect topic tags from farther away.'],
  correction: ['Evidence shield', 'Ignore the first noise hit.'],
  news: ['Fast report', 'Run a little faster.'],
  repeater: ['Echo', 'Every third repost counts twice.'],
  self: ['Clear identity', 'Start with one extra heart.'],
  influence: ['Reach', 'Gain 200 bonus points on a successful run.'],
  cyborg: ['Human assist', 'Use pulse twice in one run.'],
};
export function abilityFor(buddyId) { return abilities[buddyId]; }
export const SPECIALS = {
  amplifier: ['Broadcast', 'Pull two megaphones close; touch them to collect.', '📣'],
  announcer: ['Bulletin', 'Bring a bulletin close; touch it to collect.', '📢'],
  bridging: ['Bridge', 'Leap forward over the feed.', '🔗'],
  chaos: ['Scramble', 'Clear the next two noise bubbles.', '⚡'],
  content: ['Publish', 'Place a bonus draft ahead; touch it to collect.', '📝'],
  conversational: ['Check in', 'Restore a heart.', '💬'],
  coordinated: ['Sync', 'Recharge one pulse.', '✳'],
  engagement: ['Spotlight', 'Double your next two reactions.', '♥'],
  genre: ['Tag radar', 'Pull in nearby topic tags for three seconds.', '#'],
  correction: ['Verify', 'Raise your evidence shield again.', '✓'],
  news: ['Breaking', 'Dash safely for two seconds.', '🗞'],
  repeater: ['Echo', 'Place a repeat repost ahead; touch it to collect.', '↻'],
  self: ['Declare', 'Become untouchable for two seconds.', '🤖'],
  influence: ['Rally', 'Draw a supporter close; touch it to collect.', '★'],
  cyborg: ['Review', 'Clear the next noise and recharge pulse.', '◐'],
};
export const ACTIONS = {
  amplifier: ['Boost', 'Clear purple noise and draw items closer.', '📣'],
  announcer: ['Call out', 'Clear purple noise and bring a bulletin close.', '📢'],
  bridging: ['Bridge', 'Clear purple noise and cross on a safe bridge.', '🔗'],
  chaos: ['Scramble', 'Turn the next noise bubble into a spark.', '⚡'],
  content: ['Compose', 'Clear purple noise and place a draft ahead.', '📝'],
  conversational: ['Reply', 'Clear purple noise and restore a heart or gain protection.', '💬'],
  coordinated: ['Align', 'Clear purple noise and bring sync signals closer.', '✳'],
  engagement: ['React', 'Clear purple noise and attract reactions.', '♥'],
  genre: ['Filter', 'Remove the purple noise bubble.', '#'],
  correction: ['Check', 'Clear purple noise and add a fact check.', '✓'],
  news: ['Shoot', 'Fire a newspaper page to clear purple noise.', '🗞'],
  repeater: ['Repost', 'Clear purple noise and repeat a collected repost.', '↻'],
  self: ['Disclose', 'Clear purple noise and spring upward.', '🤖'],
  influence: ['Rally', 'Clear purple noise, pull a supporter close, and gain protection.', '★'],
  cyborg: ['Review', 'Clear purple noise and slow the feed.', '◐'],
};

const nextPickups = run => run.pickups.filter(p => !p.collected && p.x > run.x).sort((a, b) => a.x - b.x);
const nextObstacles = run => run.obstacles.filter(o => !o.cleared && o.x > run.x).sort((a, b) => a.x - b.x);
export function actionHint(run) {
  const kind = 'noise', target = nextObstacles(run)[0];
  const nearby = target && target.x - run.x <= (run.buddyId === 'news' ? 620 : 440);
  const ready = run.phase === 'playing' && run.actionCooldown === 0 &&
    run.actionCharges > 0 && nearby;
  const guidance = 'Get near PURPLE noise; press F/J to clear or jump over it';
  return { kind, target, ready: Boolean(ready), guidance, label: ACTIONS[run.buddyId][0] };
}
const powerRules = { amplifier: ['item', 620], announcer: ['item', 620], chaos: ['noise', 620], cyborg: ['noise', 550] };
export function powerHint(run) {
  const [kind, range] = powerRules[run.buddyId] || ['self', 0];
  const target = kind === 'noise' ? nextObstacles(run)[0] : kind === 'item' ? nextPickups(run)[0] : null;
  const charged = run.pickupsCollected >= 2 && !run.specialUsed;
  const prerequisites = run.buddyId === 'conversational' ? run.lives < 4 :
    run.buddyId === 'repeater' ? run.pickupsCollected > 0 : true;
  const ready = run.phase === 'playing' && charged && prerequisites &&
    (kind === 'self' || target && target.x - run.x <= range);
  const guidance = !charged ? 'Collect two items to charge' :
    kind === 'noise' ? 'Use near a PURPLE noise bubble' :
    kind === 'item' ? 'Use near a GOLD collectible' :
    run.buddyId === 'conversational' && run.lives >= 4 ? 'Use after losing a heart' :
    'Ready anywhere in the feed';
  return { kind, target, ready: Boolean(ready), charged, guidance, label: SPECIALS[run.buddyId][0] };
}
function effect(run, label, icon) {
  run.effectLabel = label; run.effectIcon = icon; run.effectTime = 1.25; run.flash = .75;
}

function collect(run, pickup, events) {
  if (pickup.collected) return;
  pickup.collected = true; run.pickupsCollected++;
  const double = (run.buddyId === 'content' && run.pickupsCollected === 1) ||
    (run.buddyId === 'amplifier' && run.pickupsCollected % 4 === 0) ||
    (run.buddyId === 'engagement' && run.pickupsCollected % 5 === 0) ||
    (run.buddyId === 'repeater' && run.pickupsCollected % 3 === 0) || run.doublePickups > 0;
  if (run.doublePickups > 0) run.doublePickups--;
  const amount = double ? 2 : 1;
  run.signals += amount;
  run.actionCharges = Math.min(6, run.actionCharges + 1);
  if (run.buddyId === 'conversational' && run.pickupsCollected === 4) run.lives = Math.min(4, run.lives + 1);
  events.push({ type: 'item', label: pickup.label, amount, caption: `${pickup.caption}${double ? ' Bonus: counts twice!' : ''}${run.buddyId === 'conversational' && run.pickupsCollected === 4 ? ' Check in restored a heart!' : ''}`, icon: pickup.icon });
  if (double || run.buddyId === 'conversational' && run.pickupsCollected === 4) {
    effect(run, double ? 'BONUS ×2' : 'HEART RESTORED', pickup.icon);
    events.push({ type: 'ability', label: double ? 'Bonus item' : 'Check in', caption: double ? 'This item counts twice.' : 'Restored one heart.', icon: pickup.icon });
  }
  if (run.pickupsCollected === 2) events.push({ type: 'ready', label: SPECIALS[run.buddyId][0], caption: 'Power charged. Press C or tap Power.', icon: SPECIALS[run.buddyId][2] });
}

export function createRun(buddyId = 'self') {
  const buddy = BUDDIES.find(candidate => candidate.id === buddyId);
  if (!buddy) throw new Error('Unknown buddy');
  return {
    buddyId, phase: 'ready', x: buddyId === 'announcer' ? 165 : 80, y: GROUND - 82, vy: 0, w: 66, h: 82,
    onGround: true, lives: buddyId === 'self' ? 4 : 3, signals: 0, pickupsCollected: 0,
    pulseReady: true, pulseCharges: buddyId === 'cyborg' ? 2 : 1, shieldReady: buddyId === 'correction',
    time: 0, invulnerable: 0, flash: 0, effectTime: 0, effectLabel: '', effectIcon: '', specialUsed: false, doublePickups: 0, magnetTime: 0, dashTime: 0, safeTime: 0,
    actionCharges: 2, actionCooldown: 0, projectiles: [], slowTime: 0, bridgeTime: 0,
    obstacles: obstacleXs.map((x, i) => ({ x, y: GROUND - (i % 3 === 1 ? 62 : 54), w: 62, h: i % 3 === 1 ? 62 : 54, cleared: false, passed: false, hit: false, ...noiseCues[i % noiseCues.length] })),
    pickups: signalXs.map((x, i) => ({ x, y: i % 4 === 0 || i % 4 === 3 ? 380 : 298, collected: false, label: buddy.singular, caption: buddy.captions[i % buddy.captions.length], icon: buddy.icon })),
  };
}

export function start(run) {
  if (run.phase !== 'ready') return false;
  run.phase = 'playing'; return true;
}

export function jump(run) {
  if (run.phase !== 'playing' || !run.onGround) return false;
  run.vy = JUMP_SPEED; run.onGround = false; return true;
}

export function pulse(run) {
  if (run.phase !== 'playing' || !run.pulseReady) return false;
  const target = run.obstacles.find(obstacle => !obstacle.cleared && obstacle.x >= run.x - 10 && obstacle.x <= run.x + (run.buddyId === 'chaos' ? 405 : 285));
  if (!target) return false;
  target.cleared = true; run.pulseCharges--; run.pulseReady = run.pulseCharges > 0; effect(run, 'NOISE CLEARED', '✳');
  return target;
}

export function act(run) {
  const hint = actionHint(run);
  if (!hint.ready) return false;
  const nextItem = nextPickups(run)[0], nextNoise = hint.target;
  const [label, caption, icon] = ACTIONS[run.buddyId];
  nextNoise.cleared = true;
  switch (run.buddyId) {
    case 'amplifier': run.magnetTime = .8; break;
    case 'announcer': if (nextItem) { nextItem.x = run.x + 105; nextItem.y = 380; } break;
    case 'bridging': run.bridgeTime = 1.2; run.safeTime = 1.2; run.x += 65; break;
    case 'chaos':
      run.pickups.push({ x: nextNoise.x, y: 380, collected: false, label: 'Spark', caption: 'Chaos changed noise into a spark.', icon: '⚡' });
      break;
    case 'content': run.pickups.push({ x: run.x + 115, y: 380, collected: false, label: 'Draft', caption: 'A fresh draft entered the feed.', icon: '📝' }); break;
    case 'conversational': if (run.lives < 4) run.lives++; else run.safeTime = 1.2; break;
    case 'coordinated':
      nextPickups(run).slice(0, 2).forEach((p, i) => { p.x = run.x + 100 + i * 90; p.y = 380; });
      break;
    case 'engagement': run.magnetTime = 1.4; break;
    case 'genre': break;
    case 'correction':
      run.pickups.push({ x: run.x + 105, y: 380, collected: false, label: 'Fact check', caption: `Checked ${nextNoise.label.toLowerCase()}: ${nextNoise.caption}`, icon: '✓' });
      break;
    case 'news': run.projectiles.push({ x: run.x + run.w, y: run.y + run.h * .53, icon: '🗞', label: 'newspaper', targetX: nextNoise.x, targetY: nextNoise.y + nextNoise.h / 2, alive: true }); break;
    case 'repeater': {
      const previous = [...run.pickups].reverse().find(p => p.collected);
      if (previous) run.pickups.push({ ...previous, x: run.x + 110, y: 380, collected: false, caption: 'A familiar repost comes around again.' });
      break;
    }
    case 'self': run.vy = -440; run.onGround = false; run.safeTime = .8; break;
    case 'influence':
      if (nextItem) { nextItem.x = run.x + 120; nextItem.y = 380; }
      run.safeTime = 1.1; break;
    case 'cyborg': run.slowTime = 2; break;
  }
  run.actionCharges--;
  run.actionCooldown = .4; effect(run, label.toUpperCase(), icon);
  return { type: 'action', label, caption, icon, targetLabel: nextNoise.label };
}

export function special(run) {
  if (!powerHint(run).ready) return false;
  const item = nextPickups(run), noise = nextObstacles(run), events = [];
  switch (run.buddyId) {
    case 'amplifier': item.slice(0, 2).forEach((p, i) => { p.x = run.x + 120 + i * 90; p.y = 380; }); run.magnetTime = 1.4; break;
    case 'announcer': if (item[0]) { item[0].x = run.x + 110; item[0].y = 380; } break;
    case 'bridging': run.x += 175; run.safeTime = 1; break;
    case 'chaos': noise.slice(0, 2).forEach(o => { o.cleared = true; }); break;
    case 'content': run.pickups.push({ x: run.x + 125, y: 380, collected: false, label: 'Draft', caption: 'Published a new draft into the feed.', icon: '📝' }); break;
    case 'conversational': if (run.lives >= 4) return false; run.lives++; break;
    case 'coordinated': run.pulseCharges++; run.pulseReady = true; break;
    case 'engagement': run.doublePickups = 2; break;
    case 'genre': run.magnetTime = 3; break;
    case 'correction': run.shieldReady = true; break;
    case 'news': run.dashTime = 2; run.safeTime = 2; break;
    case 'repeater':
      if (!run.pickupsCollected) return false;
      run.pickups.push({ x: run.x + 120, y: 380, collected: false, label: 'Repost', caption: 'An echo brings a familiar repost back.', icon: '↻' });
      break;
    case 'self': run.safeTime = 2; break;
    case 'influence': if (item[0]) { item[0].x = run.x + 120; item[0].y = 380; } run.magnetTime = 1.5; break;
    case 'cyborg': if (noise[0]) noise[0].cleared = true; run.pulseCharges++; run.pulseReady = true; break;
  }
  run.specialUsed = true;
  const [label, caption, icon] = SPECIALS[run.buddyId];
  effect(run, label.toUpperCase(), icon);
  return [{ type: 'ability', label, caption, icon }, ...events];
}

export function score(run) {
  const base = run.signals * 100 + run.lives * 150 + Math.max(0, 700 - Math.round(run.time * 10));
  return base + (run.phase === 'won' ? 500 + (run.buddyId === 'influence' ? 200 : 0) : 0);
}

export function step(run, rawDt) {
  const events = [];
  if (run.phase !== 'playing') return events;
  const dt = Math.min(Math.max(rawDt, 0), .04);
  run.time += dt;
  run.x += SPEED * (run.slowTime > 0 ? .45 : run.dashTime > 0 ? 1.8 : run.buddyId === 'news' ? 1.1 : 1) * dt;
  if (run.buddyId === 'coordinated' && run.x > END_X / 2 && !run.recharged) {
    run.pulseCharges++; run.pulseReady = true; run.recharged = true;
    effect(run, 'PULSE RECHARGED', '✳');
    events.push({ type: 'ability', label: 'Second beat', caption: 'Your pulse is ready again.', icon: '✳' });
  }
  run.vy += GRAVITY * dt;
  run.y += run.vy * dt;
  if (run.y + run.h >= GROUND) { run.y = GROUND - run.h; run.vy = 0; run.onGround = true; }
  run.invulnerable = Math.max(0, run.invulnerable - dt);
  run.flash = Math.max(0, run.flash - dt);
  run.effectTime = Math.max(0, run.effectTime - dt);
  run.actionCooldown = Math.max(0, run.actionCooldown - dt);
  run.slowTime = Math.max(0, run.slowTime - dt);
  run.bridgeTime = Math.max(0, run.bridgeTime - dt);
  run.magnetTime = Math.max(0, run.magnetTime - dt);
  run.dashTime = Math.max(0, run.dashTime - dt);
  run.safeTime = Math.max(0, run.safeTime - dt);

  for (const pickup of run.pickups) {
    const reach = run.magnetTime > 0 ? 110 : run.buddyId === 'genre' ? 47 : run.buddyId === 'bridging' ? 36 : 16;
    if (!pickup.collected && pickup.x + reach > run.x && pickup.x - reach < run.x + run.w &&
        pickup.y + reach > run.y && pickup.y - reach < run.y + run.h) {
      collect(run, pickup, events);
    }
  }
  for (const projectile of run.projectiles) {
    projectile.x += 650 * dt;
    projectile.y += (projectile.targetY - projectile.y) * Math.min(1, dt * 6);
    if (projectile.x >= projectile.targetX || projectile.x > run.x + WIDTH + 80) projectile.alive = false;
  }
  run.projectiles = run.projectiles.filter(projectile => projectile.alive);
  for (const obstacle of run.obstacles) {
    if (!obstacle.cleared && run.invulnerable === 0 && run.safeTime === 0 && run.x + run.w - 12 > obstacle.x &&
        run.x + 12 < obstacle.x + obstacle.w && run.y + run.h - 8 > obstacle.y) {
      const shielded = run.shieldReady;
      if (shielded) run.shieldReady = false; else run.lives--;
      obstacle.hit = true;
      run.invulnerable = 1.15;
      run.vy = -340; run.onGround = false;
      events.push({ type: 'noise', label: obstacle.label, lostHeart: !shielded, caption: obstacle.caption + (shielded ? ' Evidence shield blocked the hit.' : '') });
      if (shielded) { effect(run, 'SHIELD BLOCKED', '✓'); events.push({ type: 'ability', label: 'Evidence shield', caption: 'Blocked one noise hit.', icon: '✓' }); }
      if (run.lives === 0) { run.phase = 'lost'; return events; }
    }
  }
  for (const obstacle of run.obstacles) {
    if (!obstacle.passed && run.x > obstacle.x + obstacle.w) {
      obstacle.passed = true;
      if (!obstacle.hit && !obstacle.cleared) events.push({ type: 'avoid', label: obstacle.label, caption: 'You passed purple noise without losing a heart.' });
    }
  }
  if (run.x >= END_X) run.phase = run.signals >= SIGNAL_GOAL ? 'won' : 'lost';
  return events;
}
