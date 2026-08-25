window.BR = window.BR || {};

BR.UI = {
  currentScreen: 'menu',

  elements: {},

  init() {
    this.elements = {
      mainMenu: document.getElementById('mainMenu'),
      btnPlay: document.getElementById('btnPlay'),
      btnUpgrades: document.getElementById('btnUpgrades'),
      btnAchievements: document.getElementById('btnAchievements'),
      btnSettings: document.getElementById('btnSettings'),
      bestScoreDisplay: document.getElementById('bestScoreDisplay'),
      coinBalance: document.getElementById('coinBalance'),
      bgCanvas: document.getElementById('bgCanvas'),
      gameCanvas: document.getElementById('gameCanvas'),
      gameHud: document.getElementById('gameHud'),
      hudLevel: document.getElementById('hudLevel'),
      hudWave: document.getElementById('hudWave'),
      hudScore: document.getElementById('hudScore'),
      hudCoins: document.getElementById('hudCoins'),
      hudCombo: document.getElementById('hudCombo'),
      btnPause: document.getElementById('btnPause'),
      upgradeOverlay: document.getElementById('upgradeOverlay'),
      upgrade1: document.getElementById('upgrade1'),
      upgrade2: document.getElementById('upgrade2'),
      upgrade3: document.getElementById('upgrade3'),
      bossBar: document.getElementById('bossBar'),
      bossName: document.getElementById('bossName'),
      bossHpFill: document.getElementById('bossHpFill'),
      gameOverOverlay: document.getElementById('gameOverOverlay'),
      finalScore: document.getElementById('finalScore'),
      finalBest: document.getElementById('finalBest'),
      finalCoins: document.getElementById('finalCoins'),
      newHighScore: document.getElementById('newHighScore'),
      btnRetry: document.getElementById('btnRetry'),
      btnMenuGO: document.getElementById('btnMenuGO'),
      pauseOverlay: document.getElementById('pauseOverlay'),
      btnResume: document.getElementById('btnResume'),
      btnQuit: document.getElementById('btnQuit'),
      settingsOverlay: document.getElementById('settingsOverlay'),
      toggleMusic: document.getElementById('toggleMusic'),
      toggleSound: document.getElementById('toggleSound'),
      toggleMotion: document.getElementById('toggleMotion'),
      btnReset: document.getElementById('btnReset'),
      btnSettingsBack: document.getElementById('btnSettingsBack'),
      achievementsOverlay: document.getElementById('achievementsOverlay'),
      achievementList: document.getElementById('achievementList'),
      btnAchBack: document.getElementById('btnAchBack'),
      shopOverlay: document.getElementById('shopOverlay'),
      shopList: document.getElementById('shopList'),
      btnShopBack: document.getElementById('btnShopBack'),
      victoryOverlay: document.getElementById('victoryOverlay'),
      victoryRewards: document.getElementById('victoryRewards'),
      btnContinue: document.getElementById('btnContinue'),
      shopCoinBalance: document.getElementById('shopCoinBalance'),
      resetModal: document.getElementById('resetModal'),
      btnResetConfirm: document.getElementById('btnResetConfirm'),
      btnResetCancel: document.getElementById('btnResetCancel'),
      coinAnim: document.getElementById('coinAnim'),
    };

    this._bindEvents();
    this.updateMenuInfo();
  },

  _bindEvents() {
    var self = this;

    this.elements.btnPlay?.addEventListener('click', function () {
      BR.Audio?.resume();
      BR.Audio?.buttonClick();
      self.showScreen('game');
      BR.Game?.start();
    });

    this.elements.btnUpgrades?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('shop');
      self.renderShop();
    });

    this.elements.btnAchievements?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('achievements');
      self.renderAchievements();
    });

    this.elements.btnSettings?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('settings');
      self.renderSettings();
    });

    this.elements.btnPause?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('paused');
      BR.Game?.pause();
    });

    this.elements.btnResume?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('game');
      BR.Game?.resume();
    });

    this.elements.btnQuit?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      BR.Game?.quit();
      self.showScreen('menu');
    });

    this.elements.btnRetry?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('game');
      BR.Game?.start();
    });

    this.elements.btnMenuGO?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.toggleMusic?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      var settings = BR.Storage.get('settings');
      settings.music = !settings.music;
      BR.Storage.set('settings', settings);
      BR.Audio.musicEnabled = settings.music;
      self.renderSettings();
    });

    this.elements.toggleSound?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      var settings = BR.Storage.get('settings');
      settings.sound = !settings.sound;
      BR.Storage.set('settings', settings);
      BR.Audio.soundEnabled = settings.sound;
      self.renderSettings();
    });

    this.elements.toggleMotion?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      var settings = BR.Storage.get('settings');
      settings.reduceMotion = !settings.reduceMotion;
      BR.Storage.set('settings', settings);
      self.renderSettings();
    });

    this.elements.btnReset?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.elements.resetModal.removeAttribute('hidden');
      self.elements.resetModal.style.display = 'flex';
    });

    this.elements.btnResetConfirm?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      BR.Storage.reset();
      self.elements.resetModal.style.display = 'none';
      self.elements.resetModal.setAttribute('hidden', '');
      self.updateMenuInfo();
      self.renderSettings();
    });

    this.elements.btnResetCancel?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.elements.resetModal.style.display = 'none';
      self.elements.resetModal.setAttribute('hidden', '');
    });

    this.elements.btnSettingsBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnAchBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnShopBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnContinue?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      BR.Game?.continueAfterBoss();
      self.showScreen('game');
    });
  },

  showScreen(screen) {
    this.currentScreen = screen;

    var overlayIds = [
      'mainMenu', 'gameHud', 'upgradeOverlay', 'bossBar',
      'gameOverOverlay', 'pauseOverlay', 'settingsOverlay',
      'achievementsOverlay', 'shopOverlay', 'victoryOverlay'
    ];

    for (var i = 0; i < overlayIds.length; i++) {
      var el = this.elements[overlayIds[i]];
      if (el) {
        el.style.display = 'none';
        el.removeAttribute('hidden');
      }
    }

    var shown = [];

    switch (screen) {
      case 'menu':
        shown.push('mainMenu');
        this.updateMenuInfo();
        break;
      case 'game':
        shown.push('gameHud');
        if (BR.Game && BR.Game.boss && BR.Game.boss.alive) {
          shown.push('bossBar');
        }
        break;
      case 'paused':
        shown.push('gameHud', 'pauseOverlay');
        break;
      case 'upgrade':
        shown.push('gameHud', 'upgradeOverlay');
        break;
      case 'gameover':
        shown.push('gameOverOverlay');
        break;
      case 'boss':
        shown.push('gameHud', 'bossBar');
        break;
      case 'settings':
        shown.push('settingsOverlay');
        break;
      case 'achievements':
        shown.push('achievementsOverlay');
        break;
      case 'shop':
        shown.push('shopOverlay');
        break;
      case 'victory':
        shown.push('victoryOverlay');
        break;
    }

    for (var j = 0; j < shown.length; j++) {
      var showEl = this.elements[shown[j]];
      if (showEl) {
        showEl.removeAttribute('hidden');
        showEl.style.display = shown[j] === 'bossBar' ? 'block' : 'flex';
      }
    }
  },

  updateHUD(score, coins, level, wave, combo, comboTimerRatio) {
    if (this.elements.hudScore) this.elements.hudScore.textContent = score.toLocaleString();
    if (this.elements.hudCoins) this.elements.hudCoins.textContent = coins.toLocaleString();
    if (this.elements.hudLevel) this.elements.hudLevel.textContent = 'Lv.' + level;
    if (this.elements.hudWave) this.elements.hudWave.textContent = 'W' + wave;
    if (this.elements.hudCombo) {
      var comboEl = this.elements.hudCombo;
      var comboVal = document.getElementById('hudComboValue');
      var comboBar = document.getElementById('hudComboBar');
      if (combo > 1) {
        if (comboVal) comboVal.textContent = 'x' + combo;
        comboEl.style.display = 'flex';
        comboEl.classList.remove('mega', 'ultra');
        if (combo >= 50) comboEl.classList.add('ultra');
        else if (combo >= 25) comboEl.classList.add('mega');
      } else {
        comboEl.style.display = 'none';
      }
      if (comboBar && combo > 1) {
        comboBar.style.width = ((comboTimerRatio || 0) * 100) + '%';
      }
    }
  },

  updateBossBar(name, hp, maxHp) {
    if (this.elements.bossBar) this.elements.bossBar.style.display = 'block';
    if (this.elements.bossName) this.elements.bossName.textContent = name;
    if (this.elements.bossHpFill) {
      var ratio = Math.max(0, hp / maxHp) * 100;
      this.elements.bossHpFill.style.width = ratio + '%';
    }
  },

  hideBossBar() {
    if (this.elements.bossBar) {
      this.elements.bossBar.style.display = 'none';
      this.elements.bossBar.setAttribute('hidden', '');
    }
  },

  showGameOver(score, bestScore, coinsEarned, isNewHighScore) {
    if (this.elements.finalScore) this.elements.finalScore.textContent = score.toLocaleString();
    if (this.elements.finalBest) this.elements.finalBest.textContent = bestScore.toLocaleString();
    if (this.elements.finalCoins) this.elements.finalCoins.textContent = '+' + coinsEarned;
    if (this.elements.newHighScore) {
      this.elements.newHighScore.style.display = isNewHighScore ? 'block' : 'none';
    }
    this.showScreen('gameover');
  },

  showUpgradeSelection(choices) {
    this.showScreen('upgrade');

    var cards = [this.elements.upgrade1, this.elements.upgrade2, this.elements.upgrade3];

    for (var i = 0; i < 3; i++) {
      var card = cards[i];
      var choice = choices[i];
      if (!card || !choice) continue;

      card.innerHTML =
        '<div class="upgrade-icon" style="color: ' + choice.color + '">' + choice.icon + '</div>' +
        '<div class="upgrade-name">' + choice.name + '</div>' +
        '<div class="upgrade-desc">' + choice.description + '</div>';
      card.style.borderColor = choice.color;
      card.onclick = (function (c) {
        return function () {
          BR.Audio?.buttonClick();
          BR.Upgrades.applyRoguelike(c);
          BR.Game?.onUpgradeChosen();
        };
      })(choice);
    }
  },

  showVictory(coins) {
    var rewards = this.elements.victoryRewards;
    if (rewards) rewards.innerHTML = '<div class="victory-stat">+' + coins + ' COINS</div>';
    this.showScreen('victory');
  },

  renderShop() {
    var list = this.elements.shopList;
    if (!list) return;

    list.innerHTML = '';
    var saveData = BR.Storage.load();
    var upgrades = saveData.permanentUpgrades;

    for (var i = 0; i < BR.Upgrades.PERMANENT_DEFS.length; i++) {
      var def = BR.Upgrades.PERMANENT_DEFS[i];
      var level = upgrades[def.id] || 0;
      var cost = BR.Upgrades.getCost(level);
      var canAfford = saveData.coins >= cost;

      var item = document.createElement('div');
      item.className = 'shop-item';
      item.style.opacity = canAfford ? '1' : '0.5';
      item.innerHTML =
        '<div class="shop-item-icon" style="color: ' + def.color + '">' + def.icon + '</div>' +
        '<div class="shop-item-info">' +
          '<div class="shop-item-name">' + def.name + '</div>' +
          '<div class="shop-item-desc">' + def.description + '</div>' +
          '<div class="shop-item-level">Level ' + level + '</div>' +
        '</div>' +
        '<div class="shop-item-cost' + (canAfford ? '' : ' too-expensive') + '">' +
          cost +
        '</div>';

      if (canAfford) {
        item.addEventListener('click', (function (defId) {
          return function () {
            BR.Audio?.buttonClick();
            if (BR.Storage.buyUpgrade(defId)) {
              list.innerHTML = '';
              BR.UI.renderShop();
              BR.UI.updateMenuInfo();
            }
          };
        })(def.id));
      }

      list.appendChild(item);
    }
  },

  renderAchievements() {
    var list = this.elements.achievementList;
    if (!list) return;

    list.innerHTML = '';
    var saveData = BR.Storage.load();
    var achievements = saveData.achievements || {};

    var allAchievements = [
      { id: 'first_break', name: 'FIRST BREAK', desc: 'Hancurkan brick pertama', icon: '\u{1F9F1}' },
      { id: 'combo_master', name: 'COMBO MASTER', desc: 'Capai combo x50', icon: '\u26A1' },
      { id: 'demolition', name: 'DEMOLITION', desc: 'Hancurkan 1.000 brick', icon: '\u{1F4A3}' },
      { id: 'boss_slayer', name: 'BOSS SLAYER', desc: 'Kalahkan boss pertama', icon: '\u2694' },
      { id: 'millionaire', name: 'MILLIONAIRE', desc: 'Kumpulkan 10.000 koin', icon: '\u{1F4B0}' },
      { id: 'unstoppable', name: 'UNSTOPPABLE', desc: 'Capai wave 50', icon: '\u{1F3C6}' },
      { id: 'first_upgrade', name: 'FIRST UPGRADE', desc: 'Ambil upgrade pertama', icon: '\u2B06' },
      { id: 'survivor', name: 'SURVIVOR', desc: 'Selamat dari 5 wave', icon: '\u{1F6E1}' },
    ];

    for (var i = 0; i < allAchievements.length; i++) {
      var ach = allAchievements[i];
      var unlocked = achievements[ach.id];
      var item = document.createElement('div');
      item.className = 'achievement-item' + (unlocked ? ' unlocked' : '');
      item.innerHTML =
        '<div class="achievement-icon">' + (unlocked ? ach.icon : '\u{1F512}') + '</div>' +
        '<div class="achievement-info">' +
          '<div class="achievement-name">' + ach.name + '</div>' +
          '<div class="achievement-desc">' + ach.desc + '</div>' +
        '</div>';
      list.appendChild(item);
    }
  },

  renderSettings() {
    var settings = BR.Storage.get('settings');
    this._updateToggle(this.elements.toggleMusic, settings.music);
    this._updateToggle(this.elements.toggleSound, settings.sound);
    this._updateToggle(this.elements.toggleMotion, settings.reduceMotion);
  },

  _updateToggle(el, isOn) {
    if (!el) return;
    el.classList.toggle('toggle-on', isOn);
    el.classList.toggle('toggle-off', !isOn);
    el.setAttribute('aria-checked', String(isOn));
  },

  updateMenuInfo() {
    var saveData = BR.Storage.load();
    if (this.elements.bestScoreDisplay) {
      this.elements.bestScoreDisplay.textContent = 'Best: ' + saveData.bestScore.toLocaleString();
    }
    if (this.elements.coinBalance) {
      this.elements.coinBalance.textContent = saveData.coins.toLocaleString();
    }
  },

  shake(intensity, duration) {
    intensity = intensity || 5;
    duration = duration || 0.2;

    if (BR.Storage.get('settings')?.reduceMotion) return;

    var canvas = this.elements.gameCanvas;
    if (!canvas) return;

    var elapsed = 0;
    var shakeLoop = function () {
      elapsed += 1 / 60;
      if (elapsed >= duration) {
        canvas.style.transform = '';
        return;
      }
      var decay = 1 - elapsed / duration;
      var x = (Math.random() - 0.5) * intensity * decay;
      var y = (Math.random() - 0.5) * intensity * decay;
      canvas.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      requestAnimationFrame(shakeLoop);
    };
    requestAnimationFrame(shakeLoop);
  },

  coinAnimation(fromX, fromY, amount) {
    if (BR.Storage.get('settings')?.reduceMotion) return;

    var coinEl = document.createElement('div');
    coinEl.className = 'coin-fly';
    coinEl.textContent = '+' + amount;
    coinEl.style.left = fromX + 'px';
    coinEl.style.top = fromY + 'px';

    document.body.appendChild(coinEl);

    setTimeout(function () {
      if (coinEl.parentNode) coinEl.parentNode.removeChild(coinEl);
    }, 1000);
  }
};
