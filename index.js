const content = document.getElementById("content");     // основной контент
const container = document.querySelector(".container"); // контейнер для регистрации
const pageName = document.querySelector(".page-name");

const defaultContent = content.innerHTML;
const defaultContentContainer = container.innerHTML
function navigate(page, callback, addToHistory = true) {
  if (page === "home") {
    content.innerHTML = defaultContent;
    pageName.textContent = "Home";
  } else if (page === "index") {
    container.innerHTML = defaultContentContainer;
  } else {
    fetch(`${page}.html`)
      .then(response => {
        if (!response.ok) throw new Error("Страница не найдена");
        return response.text();
      })
      .then(html => {
        content.innerHTML = html;
        if (page !== "register") {
          pageName.textContent = page.charAt(0).toUpperCase() + page.slice(1);
        }
        if (callback) callback();
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Ошибка: ${err.message}</p>`;
      });
  }

  if (addToHistory) {
    const url = page === "home" ? "/" : `/${page}`;
    history.pushState({ page }, "", url);
  }
}
document.body.addEventListener("click", e => {
  if (e.target.closest(".header-nav a")) {
    e.preventDefault();
    const page = e.target.closest("a").dataset.page;
    navigate(page);
  }
});

document.addEventListener("DOMContentLoaded", () => {
 if (!localStorage.getItem("username")) {
      window.location.href = "register.html";
    }
});

window.addEventListener("popstate", e => {
  if (e.state && e.state.page) {
    navigate(e.state.page, false);
  }
});
let player;
let enemy;
const enemies = [
  { name: "Spider", attackZones: 1, defenseZones: 2, health: 150, damage: 15, critChance: 0.1, critMultiplier: 1.5, img: "assets/avatars/Spider.png" },
  { name: "Snow Troll", attackZones: 1, defenseZones: 2, health: 150, damage: 20, critChance: 0.2, critMultiplier: 1.5, img: "assets/avatars/SnowTroll.png" },
  { name: "Orc", attackZones: 1, defenseZones: 2, health: 150, damage: 18, critChance: 0.15, critMultiplier: 1.4, img: "assets/avatars/Orc.png" }
];
function showEnemy() {
  const enemyNameSpan = content.querySelector(".rival-name");
  const enemyImg = content.querySelector(".avatar-wrapper img");
  const enemyHealthBar = content.querySelector(".rival-health-progress");
  const enemyHealthText = content.querySelector(".rival-health-progress-span");

  if (!enemyNameSpan || !enemyImg || !enemyHealthBar) return;

  enemyNameSpan.textContent = enemy.name;
  enemyImg.src = enemy.img;

  enemyHealthBar.max = 150;
  enemyHealthBar.value = enemy.health;
  enemyHealthText.textContent = `${enemy.health}/150`;
  resetPlayerHealth();
}

function resetPlayerHealth() {
  const playerHealthBar = content.querySelector(".player-health-progress");
  const playerHealthText = content.querySelector(".player-health-progress-span");

  if (!playerHealthBar) return;

  playerHealthBar.max = 150;
  playerHealthBar.value = player.health;
  playerHealthText.textContent = `${player.health}/150`;
}
//ДЛЯ КНОПКИ FIGHT
content.addEventListener("click", e => {
  if (e.target.classList.contains("fight-button")) {
    player = { name: "Player", health: 150, damage: 20, critChance: 0.2, critMultiplier: 1.5 };
    enemy = enemies[Math.floor(Math.random() * enemies.length)];
      navigate("battle", () => showEnemy());
  }
});

//ПРОВЕРКА ДЛЯ РАДИОКНОПОК
function checkSelections() {
    const attackButton = document.querySelector(".attack-button");
    const attackRadios = document.querySelectorAll(".attack-zones .radio-input");
    const defenseRadios = document.querySelectorAll(".dafence-zones .radio-input");

    if (!attackButton) return; // страница боя еще не загружена

    const attackSelected = Array.from(attackRadios).some(r => r.checked);
    const defenseSelected = Array.from(defenseRadios).filter(r => r.checked).length;

    attackButton.disabled = !(attackSelected && defenseSelected === 2);
}

content.addEventListener("click", e => {
  if (e.target.classList.contains("radio-input")) {
    const radio = e.target;

    if (radio.wasChecked) {
      radio.checked = false;
      radio.wasChecked = false;
    } else {
      radio.wasChecked = true;
    }
    checkSelections();
  }
  if (e.target.classList.contains("attack-button")) {
    
    const allZones = ["Head","Neck","Body","Belly","Legs"];
    const logContainer = document.querySelector(".battle-info");

    const playerHealthBar = document.querySelector(".player-health-progress");
    const playerHealthText = document.querySelector(".player-health-progress-span");
    const enemyHealthBar = document.querySelector(".rival-health-progress");
    const enemyHealthText = document.querySelector(".rival-health-progress-span");
    const enemyNameSpan = document.querySelector(".rival-name");
    const enemyImg = document.querySelector(".avatar-wrapper img[src*='SnowTroll']");

    enemyNameSpan.textContent = enemy.name;
    if (enemyImg) enemyImg.src = enemy.img;
    enemyHealthBar.max = 150;
    enemyHealthBar.value = enemy.health;
    enemyHealthText.textContent = `${enemy.health}/150`;
    playerHealthBar.max = 150;
    playerHealthBar.value = player.health;
    playerHealthText.textContent = `${player.health}/150`;

    // ФУНКЦИИ БОЯ
    function getRandomZones(zones, count) {
      const copy = [...zones];
      const result = [];
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy[idx]);
        copy.splice(idx, 1);
      }
      return result;
    }

    function calculateDamage(attacker, defender, attackZone, defenderBlocks) {
      let damage = attacker.damage;
      const isBlocked = defenderBlocks.includes(attackZone);
      const isCrit = Math.random() < attacker.critChance;
      if (isCrit) damage *= attacker.critMultiplier;
      return isBlocked && !isCrit ? 0 : Math.round(damage);
    }

    function updateHealthBar(character, barEl, textEl) {
      barEl.value = character.health;
      textEl.textContent = `${character.health}/${barEl.max}`;
    }

    function logAction(attackerName, defenderName, zone, damage, type="player") {
      const logEntry = document.createElement("span");
      logEntry.classList.add("battle-info-text", type);
      logEntry.innerHTML = `${attackerName} attacked ${defenderName} to ${zone} and dealt ${damage} damage.`;
      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
    const attackRadios = document.querySelectorAll(".attack-zones .radio-input");
    const defenseRadios = document.querySelectorAll(".dafence-zones .radio-input");
    const playerAttack = Array.from(attackRadios).find(r => r.checked)?.value;
    const playerDefense = Array.from(defenseRadios)
    .filter(r => r.checked)
    .map(r => r.value);

    const enemyDefense = getRandomZones(allZones, enemy.defenseZones);
    const damageToEnemy = calculateDamage(player, enemy, playerAttack, enemyDefense);
    enemy.health -= damageToEnemy;
    updateHealthBar(enemy, enemyHealthBar, enemyHealthText);
    logAction(player.name, enemy.name, playerAttack, damageToEnemy, "player");

    const enemyAttack = getRandomZones(allZones, enemy.attackZones);
    enemyAttack.forEach(zone => {
      const damageToPlayer = calculateDamage(enemy, player, zone, playerDefense);
      player.health -= damageToPlayer;
      updateHealthBar(player, playerHealthBar, playerHealthText);
      logAction(enemy.name, player.name, zone, damageToPlayer, "rival");
    });

    const attackButton = document.querySelector(".attack-button");
      if (player.health <= 0 || enemy.health <= 0) {
        const attackButton = document.querySelector(".attack-button");
        if (attackButton) attackButton.disabled = true;

        const winner = player.health > 0 ? player.name : enemy.name;
        const endLog = document.createElement("span");
        endLog.classList.add("battle-info-text");
        endLog.innerHTML = `<strong>Battle over!</strong> Winner: <strong>${winner}</strong>`;
        logContainer.appendChild(endLog);
        enemy.health = 150;
        navigate("account");
      }
  }
});


