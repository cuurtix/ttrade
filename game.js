const state = {
  wood: 120,
  food: 90,
  metal: 45,
  prestige: 0,
  villagers: 3,
  warriors: 1,
  lumbermills: 0,
  farms: 0,
  mines: 0,
};

const refs = {
  wood: document.getElementById('wood'),
  food: document.getElementById('food'),
  metal: document.getElementById('metal'),
  prestige: document.getElementById('prestige'),
  villagers: document.getElementById('villagers'),
  warriors: document.getElementById('warriors'),
  lumbermills: document.getElementById('lumbermills'),
  farms: document.getElementById('farms'),
  mines: document.getElementById('mines'),
  log: document.getElementById('log'),
};

const buttons = {
  lumber: document.getElementById('build-lumber'),
  farm: document.getElementById('build-farm'),
  mine: document.getElementById('build-mine'),
  villager: document.getElementById('train-villager'),
  warrior: document.getElementById('train-warrior'),
  raid: document.getElementById('raid'),
};

function canAfford(cost) {
  return Object.entries(cost).every(([resource, value]) => state[resource] >= value);
}

function spend(cost) {
  Object.entries(cost).forEach(([resource, value]) => {
    state[resource] -= value;
  });
}

function addLog(message) {
  const item = document.createElement('li');
  item.textContent = `[${new Date().toLocaleTimeString('fr-FR')}] ${message}`;
  refs.log.prepend(item);
  while (refs.log.children.length > 8) {
    refs.log.removeChild(refs.log.lastChild);
  }
}

function updateUI() {
  Object.entries(refs).forEach(([key, element]) => {
    if (key !== 'log') {
      element.textContent = Math.floor(state[key]);
    }
  });

  buttons.lumber.disabled = !canAfford({ wood: 50 });
  buttons.farm.disabled = !canAfford({ wood: 40 });
  buttons.mine.disabled = !canAfford({ wood: 35, food: 20 });
  buttons.villager.disabled = !canAfford({ food: 30 });
  buttons.warrior.disabled = !canAfford({ food: 25, metal: 15 });
  buttons.raid.disabled = state.warriors < 1;
}

function tickEconomy() {
  const workerMultiplier = 1 + state.villagers * 0.15;
  state.wood += (2 + state.lumbermills * 3) * workerMultiplier;
  state.food += (1.5 + state.farms * 3.5) * workerMultiplier;
  state.metal += (0.7 + state.mines * 2.5) * workerMultiplier;
  updateUI();
}

buttons.lumber.addEventListener('click', () => {
  const cost = { wood: 50 };
  if (!canAfford(cost)) return;
  spend(cost);
  state.lumbermills += 1;
  addLog('Une nouvelle scierie augmente la collecte de bois.');
  updateUI();
});

buttons.farm.addEventListener('click', () => {
  const cost = { wood: 40 };
  if (!canAfford(cost)) return;
  spend(cost);
  state.farms += 1;
  addLog('Une ferme a été fondée pour soutenir la croissance.');
  updateUI();
});

buttons.mine.addEventListener('click', () => {
  const cost = { wood: 35, food: 20 };
  if (!canAfford(cost)) return;
  spend(cost);
  state.mines += 1;
  addLog('Vos mineurs extraient davantage de métal.');
  updateUI();
});

buttons.villager.addEventListener('click', () => {
  const cost = { food: 30 };
  if (!canAfford(cost)) return;
  spend(cost);
  state.villagers += 1;
  addLog('Un villageois rejoint votre tribu.');
  updateUI();
});

buttons.warrior.addEventListener('click', () => {
  const cost = { food: 25, metal: 15 };
  if (!canAfford(cost)) return;
  spend(cost);
  state.warriors += 1;
  addLog('Un guerrier est prêt pour la bataille.');
  updateUI();
});

buttons.raid.addEventListener('click', () => {
  const power = state.warriors * (0.7 + Math.random());
  const defense = 3 + Math.random() * 6;

  if (power >= defense) {
    const gainedPrestige = Math.ceil(power - defense + 2);
    const lootWood = Math.ceil(10 + Math.random() * 30);
    const lootFood = Math.ceil(8 + Math.random() * 22);

    state.prestige += gainedPrestige;
    state.wood += lootWood;
    state.food += lootFood;

    addLog(`Raid victorieux ! +${gainedPrestige} prestige, +${lootWood} bois, +${lootFood} nourriture.`);
  } else {
    const loss = Math.min(state.warriors, 1 + Math.floor(Math.random() * 2));
    state.warriors -= loss;
    addLog(`Raid repoussé... vous perdez ${loss} guerrier(s).`);
  }

  updateUI();
});

addLog('Votre colonie est fondée. Développez-la pour gagner en prestige.');
updateUI();
setInterval(tickEconomy, 2000);
