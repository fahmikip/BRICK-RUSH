window.BR = window.BR || {};

BR.MissionManager = {
  MISSION_TYPES: [
    {
      id: 'destroyBricks',
      titleFn: function(n) { return 'Destroy ' + n.toLocaleString() + ' Bricks'; },
      descFn: function(n) { return 'Destroy ' + n.toLocaleString() + ' bricks'; },
      event: 'brickDestroyed', statKey: 'totalBricksDestroyed',
      dailyRange: [50, 200], weeklyRange: [500, 2000], xpReward: 100, coinReward: 100
    },
    {
      id: 'reachCombo',
      titleFn: function(n) { return 'Reach Combo x' + n; },
      descFn: function(n) { return 'Reach a combo of x' + n; },
      event: 'comboReached', statKey: 'highestCombo',
      dailyRange: [10, 40], weeklyRange: [50, 150], xpReward: 80, coinReward: 80
    },
    {
      id: 'collectCoins',
      titleFn: function(n) { return 'Collect ' + n.toLocaleString() + ' Coins'; },
      descFn: function(n) { return 'Collect ' + n.toLocaleString() + ' coins'; },
      event: 'coinEarned', statKey: 'runCoins',
      dailyRange: [200, 800], weeklyRange: [2000, 8000], xpReward: 80, coinReward: 60
    },
    {
      id: 'usePowerups',
      titleFn: function(n) { return 'Use ' + n + ' Power-ups'; },
      descFn: function(n) { return 'Collect and use ' + n + ' power-ups'; },
      event: 'powerUpCollected', statKey: 'totalPowerUps',
      dailyRange: [3, 12], weeklyRange: [15, 50], xpReward: 75, coinReward: 75
    },
    {
      id: 'criticalHits',
      titleFn: function(n) { return 'Critical Hits: ' + n; },
      descFn: function(n) { return 'Perform ' + n + ' critical hits'; },
      event: 'criticalHit', statKey: 'totalCriticalHits',
      dailyRange: [10, 40], weeklyRange: [50, 200], xpReward: 80, coinReward: 70
    },
    {
      id: 'completeLevels',
      titleFn: function(n) { return 'Complete ' + n + ' Levels'; },
      descFn: function(n) { return 'Complete ' + n + ' levels'; },
      event: 'levelCompleted', statKey: 'levelsCompleted',
      dailyRange: [2, 8], weeklyRange: [10, 30], xpReward: 120, coinReward: 100
    },
    {
      id: 'defeatElite',
      titleFn: function(n) { return 'Defeat ' + n + ' Elite Waves'; },
      descFn: function(n) { return 'Clear ' + n + ' elite waves'; },
      event: 'eliteDefeated', statKey: 'eliteWavesCleared',
      dailyRange: [1, 5], weeklyRange: [3, 15], xpReward: 100, coinReward: 90
    },
    {
      id: 'defeatBoss',
      titleFn: function(n) { return 'Defeat ' + n + ' Boss' + (n > 1 ? 'es' : ''); },
      descFn: function(n) { return 'Defeat ' + n + ' boss' + (n > 1 ? 'es' : ''); },
      event: 'bossDefeated', statKey: 'bossesDefeated',
      dailyRange: [1, 2], weeklyRange: [1, 5], xpReward: 200, coinReward: 200
    },
    {
      id: 'score',
      titleFn: function(n) { return 'Score ' + n.toLocaleString(); },
      descFn: function(n) { return 'Reach a score of ' + n.toLocaleString(); },
      event: 'scoreEarned', statKey: 'bestScore',
      dailyRange: [10000, 50000], weeklyRange: [100000, 500000], xpReward: 100, coinReward: 100
    },
    {
      id: 'playTime',
      titleFn: function(n) { return 'Play for ' + n + ' Minutes'; },
      descFn: function(n) { return 'Play for ' + n + ' minutes total'; },
      event: 'playTime', statKey: 'sessionPlayTime',
      dailyRange: [10, 30], weeklyRange: [30, 120], xpReward: 60, coinReward: 50
    }
  ],

  _getSessionStats() {
    var session = this._sessionStats;
    if (!session) {
      session = {
        bricksDestroyed: 0, coinsCollected: 0, comboReached: 0,
        powerUpsUsed: 0, criticalHits: 0, levelsCompleted: 0,
        elitesDefeated: 0, bossesDefeated: 0, scoreReached: 0, sessionTime: 0
      };
      this._sessionStats = session;
    }
    return session;
  },

  handleEvent(type, data) {
    var session = this._getSessionStats();
    data = data || {};

    switch (type) {
      case 'brickDestroyed':
        session.bricksDestroyed += (data.amount || 1);
        break;
      case 'coinEarned':
        session.coinsCollected += (data.amount || 0);
        break;
      case 'comboReached':
        session.comboReached = Math.max(session.comboReached, data.combo || 0);
        break;
      case 'powerUpCollected':
        session.powerUpsUsed += (data.amount || 1);
        break;
      case 'criticalHit':
        session.criticalHits += (data.amount || 1);
        break;
      case 'levelCompleted':
        session.levelsCompleted += 1;
        break;
      case 'eliteDefeated':
        session.elitesDefeated += 1;
        break;
      case 'bossDefeated':
        session.bossesDefeated += 1;
        break;
      case 'scoreEarned':
        session.scoreReached = Math.max(session.scoreReached, data.score || 0);
        break;
      case 'playTime':
        session.sessionTime += (data.seconds || 0);
        break;
    }

    this._checkMissionProgress();
  },

  _checkMissionProgress() {
    var session = this._getSessionStats();
    var save = BR.Storage._data;
    var daily = this._getDailyMissions();
    var weekly = this._getWeeklyMissions();
    var allMissions = daily.concat(weekly);

    for (var i = 0; i < allMissions.length; i++) {
      var m = allMissions[i];
      if (m.completed || m.claimed) continue;
      var current = this._getMissionCurrent(m, session);
      m.progress = current;
      if (current >= m.target) {
        m.completed = true;
        m.completedAt = Date.now();
      }
    }

    this._saveMissions();
  },

  _getMissionCurrent(mission, session) {
    var typeDef = this._getMissionType(mission.typeId);
    if (!typeDef) return 0;

    var statKey = typeDef.statKey;
    var sessionVal = 0;

    switch (statKey) {
      case 'totalBricksDestroyed': sessionVal = session.bricksDestroyed; break;
      case 'highestCombo': sessionVal = session.comboReached; break;
      case 'runCoins': sessionVal = session.coinsCollected; break;
      case 'totalPowerUps': sessionVal = session.powerUpsUsed; break;
      case 'totalCriticalHits': sessionVal = session.criticalHits; break;
      case 'levelsCompleted': sessionVal = session.levelsCompleted; break;
      case 'eliteWavesCleared': sessionVal = session.elitesDefeated; break;
      case 'bossesDefeated': sessionVal = session.bossesDefeated; break;
      case 'bestScore': sessionVal = session.scoreReached; break;
      case 'sessionPlayTime': sessionVal = Math.floor(session.sessionTime / 60); break;
    }

    var baseProgress = mission.baseProgress || 0;
    return baseProgress + sessionVal;
  },

  generateDailyMissions() {
    var today = this._getTodayString();
    var save = BR.Storage._data;
    save.missions = save.missions || {};
    save.missions.daily = save.missions.daily || {};

    if (save.missions.daily[today]) return save.missions.daily[today];

    var rng = new BR.SeedRandom('daily-' + today);
    var types = this._pickMissionTypes(rng, 3);
    var missions = [];

    for (var i = 0; i < types.length; i++) {
      var typeDef = types[i];
      var target = rng.nextInt(typeDef.dailyRange[0], typeDef.dailyRange[1]);
      missions.push({
        id: 'daily:' + today + ':' + typeDef.id,
        typeId: typeDef.id,
        title: typeDef.titleFn(target),
        description: typeDef.descFn(target),
        target: target,
        progress: 0,
        completed: false,
        claimed: false,
        reward: { coins: typeDef.coinReward, xp: typeDef.xpReward }
      });
    }

    save.missions.daily[today] = missions;
    BR.Storage.save();
    return missions;
  },

  generateWeeklyMissions() {
    var weekKey = this._getWeekString();
    var save = BR.Storage._data;
    save.missions = save.missions || {};
    save.missions.weekly = save.missions.weekly || {};

    if (save.missions.weekly[weekKey]) return save.missions.weekly[weekKey];

    var rng = new BR.SeedRandom('weekly-' + weekKey);
    var usedTypes = {};
    var missions = [];

    for (var i = 0; i < 3; i++) {
      var typeDef;
      do {
        typeDef = this.MISSION_TYPES[rng.nextInt(0, this.MISSION_TYPES.length - 1)];
      } while (usedTypes[typeDef.id]);
      usedTypes[typeDef.id] = true;

      var target = rng.nextInt(typeDef.weeklyRange[0], typeDef.weeklyRange[1]);
      missions.push({
        id: 'weekly:' + weekKey + ':' + typeDef.id,
        typeId: typeDef.id,
        title: typeDef.titleFn(target),
        description: typeDef.descFn(target),
        target: target,
        progress: 0,
        completed: false,
        claimed: false,
        reward: { coins: typeDef.coinReward * 3, xp: typeDef.xpReward * 3 }
      });
    }

    save.missions.weekly[weekKey] = missions;
    BR.Storage.save();
    return missions;
  },

  claimMission(missionId) {
    var save = BR.Storage._data;
    var daily = this._getDailyMissions();
    var weekly = this._getWeeklyMissions();
    var allMissions = daily.concat(weekly);

    for (var i = 0; i < allMissions.length; i++) {
      var m = allMissions[i];
      if (m.id === missionId && m.completed && !m.claimed) {
        m.claimed = true;
        m.claimedAt = Date.now();
        this._saveMissions();
        return m;
      }
    }
    return null;
  },

  hasUnclaimedMissions() {
    var daily = this._getDailyMissions();
    var weekly = this._getWeeklyMissions();
    var all = daily.concat(weekly);
    for (var i = 0; i < all.length; i++) {
      if (all[i].completed && !all[i].claimed) return true;
    }
    return false;
  },

  getMissions(type) {
    if (type === 'weekly') return this._getWeeklyMissions();
    return this._getDailyMissions();
  },

  isClaimed(missionId) {
    var all = this._getDailyMissions().concat(this._getWeeklyMissions());
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === missionId) return !!all[i].claimed;
    }
    return false;
  },

  getUnclaimedCount() {
    var all = this._getDailyMissions().concat(this._getWeeklyMissions());
    var count = 0;
    for (var i = 0; i < all.length; i++) {
      if (all[i].completed && !all[i].claimed) count++;
    }
    return count;
  },

  completeMissionCallback(screen) {
    if (screen === 'levelup') {
      BR.MetaProgression.grantLevelUpRewards(BR.MetaProgression.getLevel());
    }
  },

  _getDailyMissions() {
    var today = this._getTodayString();
    var save = BR.Storage._data;
    return (save.missions && save.missions.daily && save.missions.daily[today]) || [];
  },

  _getWeeklyMissions() {
    var weekKey = this._getWeekString();
    var save = BR.Storage._data;
    return (save.missions && save.missions.weekly && save.missions.weekly[weekKey]) || [];
  },

  _saveMissions() {
    BR.Storage.save();
  },

  _getMissionType(typeId) {
    for (var i = 0; i < this.MISSION_TYPES.length; i++) {
      if (this.MISSION_TYPES[i].id === typeId) return this.MISSION_TYPES[i];
    }
    return null;
  },

  _pickMissionTypes(rng, count) {
    var shuffled = this.MISSION_TYPES.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = rng.nextInt(0, i);
      var tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return shuffled.slice(0, count);
  },

  _getTodayString() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  _getWeekString() {
    var d = new Date();
    var startOfYear = new Date(d.getFullYear(), 0, 1);
    var weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return d.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
  },

  resetSession() {
    this._sessionStats = null;
  },

  init() {
    this._sessionStats = null;
    this.generateDailyMissions();
    this.generateWeeklyMissions();
  }
};
