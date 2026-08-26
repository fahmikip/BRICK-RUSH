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
      btnDaily: document.getElementById('btnDaily'),
      btnCollection: document.getElementById('btnCollection'),
      btnStats: document.getElementById('btnStats'),
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
      btnBuild: document.getElementById('btnBuild'),
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
      btnShopGO: document.getElementById('btnShopGO'),
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
      shopCoinBalance: document.getElementById('shopCoinBalance'),
      shopTabs: document.getElementById('shopTabs'),
      victoryOverlay: document.getElementById('victoryOverlay'),
      victoryRewards: document.getElementById('victoryRewards'),
      btnContinue: document.getElementById('btnContinue'),
      resetModal: document.getElementById('resetModal'),
      btnResetConfirm: document.getElementById('btnResetConfirm'),
      btnResetCancel: document.getElementById('btnResetCancel'),
      coinAnim: document.getElementById('coinAnim'),
      runSummaryOverlay: document.getElementById('runSummaryOverlay'),
      summaryScore: document.getElementById('summaryScore'),
      summaryBestCombo: document.getElementById('summaryBestCombo'),
      summaryBricks: document.getElementById('summaryBricks'),
      summaryCoins: document.getElementById('summaryCoins'),
      summaryLevel: document.getElementById('summaryLevel'),
      summaryNewBest: document.getElementById('summaryNewBest'),
      summaryRewards: document.getElementById('summaryRewards'),
      btnSummaryRetry: document.getElementById('btnSummaryRetry'),
      btnSummaryUpgrades: document.getElementById('btnSummaryUpgrades'),
      btnSummaryMenu: document.getElementById('btnSummaryMenu'),
      collectionOverlay: document.getElementById('collectionOverlay'),
      collectionTabs: document.getElementById('collectionTabs'),
      collectionList: document.getElementById('collectionList'),
      btnCollectionBack: document.getElementById('btnCollectionBack'),
      statsOverlay: document.getElementById('statsOverlay'),
      statsContent: document.getElementById('statsContent'),
      btnStatsBack: document.getElementById('btnStatsBack'),
      dailyOverlay: document.getElementById('dailyOverlay'),
      dailyTheme: document.getElementById('dailyTheme'),
      dailyModifiers: document.getElementById('dailyModifiers'),
      dailyReward: document.getElementById('dailyReward'),
      dailyBest: document.getElementById('dailyBest'),
      dailyStreak: document.getElementById('dailyStreak'),
      btnDailyPlay: document.getElementById('btnDailyPlay'),
      btnDailyBack: document.getElementById('btnDailyBack'),
      buildOverlay: document.getElementById('buildOverlay'),
      buildStats: document.getElementById('buildStats'),
      buildUpgrades: document.getElementById('buildUpgrades'),
      buildSynergies: document.getElementById('buildSynergies'),
      btnBuildBack: document.getElementById('btnBuildBack'),
      btnUpgradeShop: document.getElementById('btnUpgradeShop'),
      permShopOverlay: document.getElementById('permShopOverlay'),
      permShopList: document.getElementById('permShopList'),
      permShopTabs: document.getElementById('permShopTabs'),
      permShopBalance: document.getElementById('permShopBalance'),
      btnPermShopBack: document.getElementById('btnPermShopBack'),
      upgradeNotification: document.getElementById('upgradeNotification'),
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
      BR.Game?.start(false);
    });

    this.elements.btnUpgrades?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('permshop');
      self.renderPermShop();
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

    this.elements.btnDaily?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('daily');
      self.renderDaily();
    });

    this.elements.btnCollection?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('collection');
      self.renderCollection('balls');
    });

    this.elements.btnStats?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('stats');
      self.renderStats();
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
      BR.Game?.start(false);
    });

    this.elements.btnMenuGO?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      BR.Game?.quit();
      self.showScreen('menu');
    });

    this.elements.btnShopGO?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('permshop');
      self.renderPermShop();
    });

    this.elements.btnBuild?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('build');
      self.renderBuild();
    });

    this.elements.btnBuildBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      if (BR.Game.state === 'playing' || BR.Game.state === 'boss') {
        self.showScreen('game');
      } else {
        self.showScreen('menu');
      }
    });

    this.elements.btnUpgradeShop?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('permshop');
      self.renderPermShop();
    });

    this.elements.btnSummaryRetry?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('game');
      BR.Game?.start(false);
    });

    this.elements.btnSummaryUpgrades?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('permshop');
      self.renderPermShop();
    });

    this.elements.btnSummaryMenu?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnCollectionBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnStatsBack?.addEventListener('click', function () {
      BR.Audio?.buttonClick();
      self.showScreen('menu');
    });

    this.elements.btnDailyPlay?.addEventListener('click', function () {
      BR.Audio?.resume();
      BR.Audio?.buttonClick();
      self.showScreen('game');
      BR.Game?.start(true);
    });

    this.elements.btnDailyBack?.addEventListener('click', function () {
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
      BR.PermanentUpgradeManager.init();
      BR.UnlockManager.init();
      BR.CollectionManager.init();
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

    this.elements.btnPermShopBack?.addEventListener('click', function () {
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
      'achievementsOverlay', 'shopOverlay', 'victoryOverlay',
      'runSummaryOverlay', 'collectionOverlay', 'statsOverlay',
      'dailyOverlay', 'buildOverlay', 'permShopOverlay'
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
      case 'run_summary':
        shown.push('runSummaryOverlay');
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
      case 'permshop':
        shown.push('permShopOverlay');
        break;
      case 'victory':
        shown.push('victoryOverlay');
        break;
      case 'collection':
        shown.push('collectionOverlay');
        break;
      case 'stats':
        shown.push('statsOverlay');
        break;
      case 'daily':
        shown.push('dailyOverlay');
        break;
      case 'build':
        shown.push('buildOverlay');
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

  showRunSummary(endResult) {
    var r = endResult.result;
    var earned = endResult.earned;
    if (this.elements.summaryScore) this.elements.summaryScore.textContent = r.score.toLocaleString();
    if (this.elements.summaryBestCombo) this.elements.summaryBestCombo.textContent = 'x' + r.bestCombo;
    if (this.elements.summaryBricks) this.elements.summaryBricks.textContent = r.bricksDestroyed;
    if (this.elements.summaryCoins) this.elements.summaryCoins.textContent = '+' + earned;
    if (this.elements.summaryLevel) this.elements.summaryLevel.textContent = 'Level ' + r.level + ' - Wave ' + r.wave;
    if (this.elements.summaryNewBest) {
      this.elements.summaryNewBest.style.display = endResult.isNewBest ? 'block' : 'none';
    }
    if (this.elements.summaryRewards) {
      this.elements.summaryRewards.innerHTML =
        '<div class="summary-reward">+' + earned + ' Coins</div>' +
        '<div class="summary-reward">+' + r.bricksDestroyed + ' Bricks Destroyed</div>';
    }
    this.showScreen('run_summary');
  },

  showUpgradeSelection(choices) {
    this.showScreen('upgrade');

    var cards = [this.elements.upgrade1, this.elements.upgrade2, this.elements.upgrade3];

    for (var i = 0; i < 3; i++) {
      var card = cards[i];
      var choice = choices[i];
      if (!card || !choice) continue;

      var rarityDef = BR.Upgrades.getRarityDef(choice.rarity);
      var currentLevelText = choice.currentLevel > 0 ? 'Lv.' + choice.currentLevel + ' → Lv.' + choice.nextLevel : 'New';
      var stackText = choice.currentLevel > 0 ? ' (Stack ' + (choice.currentLevel + 1) + ')' : '';

      card.innerHTML =
        '<div class="upgrade-rarity rarity-' + choice.rarity + '">' + rarityDef.name + '</div>' +
        '<div class="upgrade-icon" style="color: ' + choice.color + '">' + choice.icon + '</div>' +
        '<div class="upgrade-name">' + choice.name + '</div>' +
        '<div class="upgrade-desc">' + choice.description + '</div>' +
        '<div class="upgrade-level">' + currentLevelText + stackText + '</div>';
      card.style.borderColor = rarityDef.color;
      card.className = 'upgrade-card card rarity-border-' + choice.rarity;
      card.onclick = (function (c) {
        return function () {
          BR.Audio?.upgradeSelect();
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

  renderPermShop() {
    var self = this;
    var list = this.elements.permShopList;
    if (!list) return;

    list.innerHTML = '';
    var saveData = BR.Storage.load();
    var coins = saveData.coins || 0;

    if (this.elements.permShopBalance) this.elements.permShopBalance.textContent = coins.toLocaleString();

    var categories = ['attack', 'defense', 'economy', 'special'];
    var activeTab = this._activePermTab || 'all';

    if (this.elements.permShopTabs) {
      this.elements.permShopTabs.innerHTML = '';
      var tabs = ['all'].concat(categories);
      var tabNames = { all: 'ALL', attack: 'ATTACK', defense: 'DEFENSE', economy: 'ECONOMY', special: 'SPECIAL' };
      for (var t = 0; t < tabs.length; t++) {
        var tabBtn = document.createElement('button');
        tabBtn.className = 'shop-tab' + (tabs[t] === activeTab ? ' active' : '');
        tabBtn.textContent = tabNames[tabs[t]] || tabs[t].toUpperCase();
        tabBtn.setAttribute('data-tab', tabs[t]);
        tabBtn.addEventListener('click', function() {
          BR.Audio?.buttonClick();
          self._activePermTab = this.getAttribute('data-tab');
          self.renderPermShop();
        });
        this.elements.permShopTabs.appendChild(tabBtn);
      }
    }

    var defs = BR.Upgrades.PERMANENT_DEFS;
    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      if (activeTab !== 'all' && def.category !== activeTab) continue;

      var level = BR.PermanentUpgradeManager.getLevel(def.id);
      var cost = BR.PermanentUpgradeManager.getCost(def.id);
      var canAfford = coins >= cost;
      var isMaxed = level >= def.maxLevel;

      var item = document.createElement('div');
      item.className = 'shop-item' + (isMaxed ? ' maxed' : '') + (!canAfford && !isMaxed ? ' locked' : '');

      var levelText = isMaxed ? 'MAX' : 'Level ' + level + ' / ' + def.maxLevel;
      var effectPerLevel = def.effectPerLevel * 100;
      var effectText = '+' + Math.round(effectPerLevel) + '% per level';

      item.innerHTML =
        '<div class="shop-item-icon" style="color: ' + def.color + '">' + def.icon + '</div>' +
        '<div class="shop-item-info">' +
          '<div class="shop-item-name">' + def.name + '</div>' +
          '<div class="shop-item-desc">' + effectText + '</div>' +
          '<div class="shop-item-level">' + levelText + '</div>' +
        '</div>' +
        (isMaxed ? '<div class="shop-item-cost maxed-text">MAX</div>' :
          '<div class="shop-item-cost' + (canAfford ? '' : ' too-expensive') + '">🪙 ' + cost.toLocaleString() + '</div>');

      if (!isMaxed && canAfford) {
        (function(defId, itemEl) {
          itemEl.addEventListener('click', function () {
            BR.Audio?.upgradePurchased();
            if (BR.PermanentUpgradeManager.purchase(defId)) {
              self._showUpgradeNotification();
              list.innerHTML = '';
              self.renderPermShop();
              self.updateMenuInfo();
            }
          });
        })(def.id, item);
      }

      list.appendChild(item);
    }
  },

  _showUpgradeNotification() {
    var el = this.elements.upgradeNotification;
    if (!el) return;
    el.textContent = 'UPGRADE COMPLETE';
    el.style.display = 'flex';
    el.classList.add('show');
    setTimeout(function() {
      el.classList.remove('show');
      el.style.display = 'none';
    }, 1500);
  },

  renderShop() {
    this.renderPermShop();
  },

  renderCollection(category) {
    var list = this.elements.collectionList;
    if (!list) return;
    list.innerHTML = '';

    if (this.elements.collectionTabs) {
      this.elements.collectionTabs.innerHTML = '';
      var tabs = ['balls', 'paddles'];
      var tabNames = { balls: 'BALLS', paddles: 'PADDLES' };
      var self = this;
      for (var t = 0; t < tabs.length; t++) {
        var tabBtn = document.createElement('button');
        tabBtn.className = 'shop-tab' + (tabs[t] === category ? ' active' : '');
        tabBtn.textContent = tabNames[tabs[t]];
        tabBtn.setAttribute('data-cat', tabs[t]);
        tabBtn.addEventListener('click', function() {
          BR.Audio?.buttonClick();
          self.renderCollection(this.getAttribute('data-cat'));
        });
        this.elements.collectionTabs.appendChild(tabBtn);
      }
    }

    var items = category === 'balls' ? BR.CollectionManager.BALL_SKINS : BR.CollectionManager.PADDLE_SKINS;
    var activeId = category === 'balls' ? BR.CollectionManager.activeBallSkin : BR.CollectionManager.activePaddleSkin;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var unlocked = !item.unlockId || BR.UnlockManager.isUnlocked(item.unlockId);
      var isActive = item.id === activeId;

      var el = document.createElement('div');
      el.className = 'collection-item' + (!unlocked ? ' locked' : '') + (isActive ? ' active' : '');

      var preview = category === 'balls'
        ? '<div class="collection-preview"><div class="ball-preview" style="background:' + item.color + ';box-shadow:0 0 12px ' + item.glow + '"></div></div>'
        : '<div class="collection-preview"><div class="paddle-preview" style="background:linear-gradient(90deg,' + item.gradient.join(',') + ');box-shadow:0 0 12px ' + item.color + '"></div></div>';

      var unlockInfo = '';
      if (!unlocked && item.unlockId) {
        var unlockDef = null;
        for (var j = 0; j < BR.UnlockManager.DEFINITIONS.length; j++) {
          if (BR.UnlockManager.DEFINITIONS[j].id === item.unlockId) {
            unlockDef = BR.UnlockManager.DEFINITIONS[j];
            break;
          }
        }
        unlockInfo = unlockDef ? '🔒 ' + unlockDef.description : '🔒 Locked';
      }

      el.innerHTML =
        preview +
        '<div class="collection-info">' +
          '<div class="collection-name">' + item.name + '</div>' +
          (unlocked ? '<div class="collection-desc">' + item.description + '</div>' : '<div class="collection-locked">' + unlockInfo + '</div>') +
        '</div>' +
        (isActive ? '<div class="collection-badge">EQUIPPED</div>' : '');

      if (unlocked && !isActive) {
        (function(skinId, cat, el) {
          el.addEventListener('click', function() {
            BR.Audio?.buttonClick();
            if (cat === 'balls') BR.CollectionManager.equipBall(skinId);
            else BR.CollectionManager.equipPaddle(skinId);
            self.renderCollection(cat);
          });
        })(item.id, category, el);
      }

      list.appendChild(el);
    }
  },

  renderStats() {
    var content = this.elements.statsContent;
    if (!content) return;
    var save = BR.Storage.load();

    var stats = [
      { label: 'TOTAL RUNS', value: (save.totalRuns || 0).toLocaleString() },
      { label: 'TOTAL BRICKS', value: (save.totalBricksDestroyed || 0).toLocaleString() },
      { label: 'TOTAL COINS', value: (save.totalCoinsEarned || 0).toLocaleString() },
      { label: 'BEST SCORE', value: (save.bestScore || 0).toLocaleString() },
      { label: 'BEST COMBO', value: 'x' + (save.highestCombo || 0) },
      { label: 'HIGHEST LEVEL', value: save.highestLevel || 0 },
      { label: 'HIGHEST WAVE', value: save.highestWave || 0 },
      { label: 'BOSSES DEFEATED', value: save.bossesDefeated || 0 },
      { label: 'TOTAL PLAY TIME', value: this._formatTime(save.totalPlayTime || 0) },
      { label: 'DAILY STREAK', value: BR.DailyChallenge.getStreak() + ' days' },
      { label: 'ACHIEVEMENTS', value: this._countAchievements(save.achievements) + ' / 8' }
    ];

    content.innerHTML = '';
    for (var i = 0; i < stats.length; i++) {
      var row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = '<span class="stat-label">' + stats[i].label + '</span><span class="stat-value">' + stats[i].value + '</span>';
      content.appendChild(row);
    }
  },

  _formatTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + (m % 60) + 'm';
    if (m > 0) return m + 'm ' + (s % 60) + 's';
    return s + 's';
  },

  _countAchievements(achs) {
    if (!achs) return 0;
    var c = 0;
    for (var k in achs) { if (achs[k]) c++; }
    return c;
  },

  renderDaily() {
    var data = BR.DailyChallenge.getData();
    if (this.elements.dailyTheme) {
      this.elements.dailyTheme.innerHTML =
        '<div class="daily-theme-icon" style="color:' + data.theme.color + '">' + data.theme.icon + '</div>' +
        '<div class="daily-theme-name">' + data.theme.name + '</div>';
    }
    if (this.elements.dailyModifiers) {
      this.elements.dailyModifiers.innerHTML =
        '<div class="daily-mod">Damage: +' + Math.round((data.modifiers.damageMultiplier - 1) * 100) + '%</div>' +
        '<div class="daily-mod">Speed: +' + Math.round((data.modifiers.ballSpeed - 1) * 100) + '%</div>' +
        '<div class="daily-mod">Width: ' + Math.round(data.modifiers.paddleWidth * 100) + '%</div>' +
        '<div class="daily-mod">Coins: +' + Math.round((data.modifiers.coinMultiplier - 1) * 100) + '%</div>';
    }
    if (this.elements.dailyReward) {
      this.elements.dailyReward.innerHTML = '🪙 ' + data.reward + ' bonus coins';
    }
    if (this.elements.dailyBest) {
      var best = BR.DailyChallenge.getTodayBest();
      this.elements.dailyBest.textContent = best > 0 ? 'Best: ' + best.toLocaleString() : 'Not completed yet';
    }
    if (this.elements.dailyStreak) {
      this.elements.dailyStreak.textContent = 'Streak: ' + BR.DailyChallenge.getStreak() + ' days';
    }
  },

  renderBuild() {
    var statsEl = this.elements.buildStats;
    var upgradesEl = this.elements.buildUpgrades;
    var synergiesEl = this.elements.buildSynergies;

    if (statsEl) {
      var panel = BR.BuildManager.getStatPanelData();
      statsEl.innerHTML = '';
      for (var i = 0; i < panel.length; i++) {
        var row = document.createElement('div');
        row.className = 'build-stat-row';
        row.innerHTML = '<span class="build-stat-label" style="color:' + panel[i].color + '">' + panel[i].label + '</span><span class="build-stat-value">' + panel[i].value + '</span>';
        statsEl.appendChild(row);
      }
    }

    if (upgradesEl) {
      upgradesEl.innerHTML = '';
      var collected = BR.UpgradeManager.getAllCollected();
      if (collected.length === 0) {
        upgradesEl.innerHTML = '<div class="build-empty">No upgrades collected yet</div>';
      } else {
        for (var i = 0; i < collected.length; i++) {
          var upg = collected[i];
          var def = upg.def;
          var rarityDef = BR.Upgrades.getRarityDef(def.rarity);
          var el = document.createElement('div');
          el.className = 'build-upgrade-item';
          el.innerHTML =
            '<span class="build-upgrade-icon" style="color:' + def.color + '">' + def.icon + '</span>' +
            '<span class="build-upgrade-name">' + def.name + '</span>' +
            '<span class="build-upgrade-level rarity-' + def.rarity + '">Lv.' + upg.level + '</span>';
          upgradesEl.appendChild(el);
        }
      }
    }

    if (synergiesEl) {
      synergiesEl.innerHTML = '';
      var synergies = BR.UpgradeManager.getActiveSynergies();
      if (synergies.length === 0) {
        synergiesEl.innerHTML = '<div class="build-empty">No synergies active</div>';
      } else {
        for (var i = 0; i < synergies.length; i++) {
          var syn = synergies[i];
          var el = document.createElement('div');
          el.className = 'build-synergy-item';
          el.innerHTML =
            '<span class="build-synergy-name" style="color:' + (syn.color || '#ff00aa') + '">' + syn.name + '</span>' +
            '<span class="build-synergy-desc">' + syn.description + '</span>';
          synergiesEl.appendChild(el);
        }
      }
    }
  },

  renderAchievements() {
    var list = this.elements.achievementList;
    if (!list) return;

    list.innerHTML = '';
    var saveData = BR.Storage.load();
    var achievements = saveData.achievements || {};

    var allAchievements = [
      { id: 'first_break', name: 'FIRST BREAK', desc: 'Break your first brick', icon: '🧱' },
      { id: 'combo_master', name: 'COMBO MASTER', desc: 'Reach combo x50', icon: '⚡' },
      { id: 'demolition', name: 'DEMOLITION', desc: 'Destroy 1,000 bricks', icon: '💥' },
      { id: 'boss_slayer', name: 'BOSS SLAYER', desc: 'Defeat your first boss', icon: '⚔' },
      { id: 'millionaire', name: 'MILLIONAIRE', desc: 'Collect 10,000 coins', icon: '💰' },
      { id: 'unstoppable', name: 'UNSTOPPABLE', desc: 'Reach wave 50', icon: '🏆' },
      { id: 'first_upgrade', name: 'FIRST UPGRADE', desc: 'Pick your first upgrade', icon: '⬆' },
      { id: 'survivor', name: 'SURVIVOR', desc: 'Survive 5 waves', icon: '🛡' }
    ];

    for (var i = 0; i < allAchievements.length; i++) {
      var ach = allAchievements[i];
      var unlocked = achievements[ach.id];
      var item = document.createElement('div');
      item.className = 'achievement-item' + (unlocked ? ' unlocked' : '');
      item.innerHTML =
        '<div class="achievement-icon">' + (unlocked ? ach.icon : '🔒') + '</div>' +
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
      this.elements.bestScoreDisplay.textContent = 'Best: ' + (saveData.bestScore || 0).toLocaleString();
    }
    if (this.elements.coinBalance) {
      this.elements.coinBalance.textContent = (saveData.coins || 0).toLocaleString();
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
