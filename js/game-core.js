// ============================================================
// 遊戲核心邏輯 - 屬性計算、戰鬥系統、存檔管理
// （配置資料見 game-config.js）
// ============================================================

class GameCore {
    constructor() {
        this.gameState = null;
        this.battleTimer = null;
        this.autoSaveTimer = null;
        this.onBattleEvent = null; // UI回撥
        this.onCatch = null;
        this.onLevelUp = null;
        this._nextBattleTimeout = null; // 下一場戰鬥延遲計時器
        this._nextBattleScheduledAt = null; // 下一場戰鬥計劃開始的時間戳
        // 實際經驗/金幣速率跟蹤器
        this.rateTracker = { startTime: null, totalExp: 0, totalGold: 0 };
        this._initWorkerTimer();
        this._initVisibilityHandler();
        this._buildEvolutionCache();
    }

    // 重置速率跟蹤器（切換地圖時呼叫）
    resetRateTracker() {
        this.rateTracker = { startTime: null, totalExp: 0, totalGold: 0 };
    }

    // 更新速率跟蹤器（每次獲得經驗/金幣時呼叫）
    _updateRateTracker(exp, gold) {
        if (!this.rateTracker.startTime) {
            this.rateTracker.startTime = Date.now();
        }
        this.rateTracker.totalExp += exp;
        this.rateTracker.totalGold += gold;
    }

    // 獲取每分鐘實際經驗/金幣速率
    getRatesPerMinute() {
        if (!this.rateTracker.startTime || this.rateTracker.totalExp === 0) {
            return null; // 無資料
        }
        const elapsedMs = Date.now() - this.rateTracker.startTime;
        if (elapsedMs < 1000) return null; // 不足1秒不計算
        const elapsedMin = elapsedMs / 60000;
        return {
            expPerMin: Math.round(this.rateTracker.totalExp / elapsedMin),
            goldPerMin: Math.round(this.rateTracker.totalGold / elapsedMin),
        };
    }

    // ===================== Worker定時器（後臺不被節流） =====================
    _initWorkerTimer() {
        // 建立一個內聯 Web Worker 作為精確定時器
        // Web Worker 不受瀏覽器後臺標籤頁節流限制
        try {
            const workerCode = `
                let timers = {};
                self.onmessage = function(e) {
                    const { type, interval, id } = e.data;
                    if (type === 'start') {
                        if (timers[id]) clearInterval(timers[id]);
                        timers[id] = setInterval(() => {
                            self.postMessage({ id: id });
                        }, interval);
                    } else if (type === 'stop') {
                        if (timers[id]) {
                            clearInterval(timers[id]);
                            delete timers[id];
                        }
                    }
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this._timerWorker = new Worker(URL.createObjectURL(blob));
            this._workerCallbacks = {};
            this._workerNextId = 1;
            this._timerWorker.onmessage = (e) => {
                const cb = this._workerCallbacks[e.data.id];
                if (cb) cb();
            };
            this._useWorkerTimer = true;
            console.log('✅ Worker定時器已啟用，後臺戰鬥不受影響');
        } catch (e) {
            this._useWorkerTimer = false;
            console.warn('⚠️ Worker定時器建立失敗，回退到普通定時器:', e);
        }
    }

    // 使用Worker的setInterval（後臺不被節流）
    _workerSetInterval(callback, interval) {
        if (this._useWorkerTimer) {
            const id = this._workerNextId++;
            this._workerCallbacks[id] = callback;
            this._timerWorker.postMessage({ type: 'start', id, interval });
            return id;
        } else {
            return setInterval(callback, interval);
        }
    }

    // 清除Worker的setInterval
    _workerClearInterval(timerId) {
        if (this._useWorkerTimer) {
            if (this._timerWorker) {
                this._timerWorker.postMessage({ type: 'stop', id: timerId });
            }
            delete this._workerCallbacks[timerId];
        } else {
            clearInterval(timerId);
        }
    }

    // ===================== 頁面可見性處理 =====================
    _initVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this._onPageVisible();
            } else {
                this._onPageHidden();
            }
        });
    }

    _onPageHidden() {
        // 記錄進入後臺的時間
        this._hiddenAt = Date.now();
    }

    _onPageVisible() {
        if (!this._hiddenAt) return;
        const now = Date.now();
        let elapsed = now - this._hiddenAt;
        this._hiddenAt = null;

        // 對戰塔使用即時戰鬥，不套用一般野外離線模擬。
        if (this._towerMode) return;


        // 如果後臺時間超過2秒，進行離線戰鬥結算
        if (elapsed > 2000) {
            // 離線時間上限：擁有離線時間徽章時48小時，否則24小時
            const offlineBonusValue = this.getBadgeEffectValue('offline_time_bonus');
            const maxOffline = offlineBonusValue !== null ? offlineBonusValue : MAX_OFFLINE_TIME;
            this._processOfflineBattles(Math.min(elapsed, maxOffline), elapsed, maxOffline);
            return; // 非同步模擬，不在這裡重啟戰鬥
        }

        // 如果有計劃中的下一場戰鬥延遲，檢查是否已過時
        if (this._nextBattleScheduledAt && now >= this._nextBattleScheduledAt) {
            this._nextBattleScheduledAt = null;
            if (this._nextBattleTimeout) {
                clearTimeout(this._nextBattleTimeout);
                this._nextBattleTimeout = null;
            }
            this.startBattle();
        }
    }

    // 離線戰鬥結算：模擬後臺期間的戰鬥（非同步）
    _processOfflineBattles(elapsedMs, actualElapsedMs = elapsedMs, maxOfflineMs = elapsedMs) {
        if (!this.currentBattle || !this.gameState) return;

        const state = this.gameState;
        this._offlineReportStart = {
            elapsedMs: actualElapsedMs, creditedMs: elapsedMs, maxOfflineMs,
            route: state.currentRoute, team: [...state.team],
            stats: { exp: state.stats.totalExp || 0, gold: state.stats.totalGold || 0 },
            pokemon: Object.fromEntries(Object.entries(state.caughtPokemon).map(([id, p]) => [id, {
                level: p.level, skillLevel: p.skillLevel || 0, ivs: { ...p.ivs },
                shiny: !!state.shinyDex[id]
            }]))
        };

        const wasHealing = !!this.healTimer;
        // 停止當前戰鬥迴圈，防止模擬期間干擾
        this.stopBattle();

        // 離線模擬期間靜默 UI 回撥，避免大量 DOM 操作導致卡頓
        this._isOfflineSimulating = true;
        this._offlineEvents = []; // 收集離線期間的重要事件
        this._savedOnBattleEvent = this.onBattleEvent;
        this._savedOnCatch = this.onCatch;
        this._savedOnLevelUp = this.onLevelUp;
        // 離線期間完全靜默，不接收任何 onBattleEvent，只收集重要事件用於結束後彙總
        this.onBattleEvent = (event, data) => {
            if (['evolved', 'shinyEvolved', 'shinySpread', 'shinyDefeated',
                 'badgeUnlocked', 'regionUnlocked', 'autoRouteSwitch'].includes(event)) {
                this._offlineEvents.push({ event, data });
            }
            // 其他所有事件（包括 offlineStart/offlineProgress/offlineEnd）全部丟棄
        };
        this.onCatch = null;
        this.onLevelUp = null;

        let simulateMs = elapsedMs;

        // 如果正在治療中（玩家被擊敗），先模擬治療
        if (wasHealing || (this.currentBattle && this.currentBattle.playerCurrentHp <= 0)) {
            const maxHp = this.currentBattle.playerMaxHp;
            const healPerSecond = Math.max(1, Math.floor(maxHp * 0.2));
            const healTime = Math.ceil((maxHp - this.currentBattle.playerCurrentHp) / healPerSecond) * 1000;
            const healSeconds = Math.floor(elapsedMs / 1000);
            this.currentBattle.playerCurrentHp = Math.min(maxHp, this.currentBattle.playerCurrentHp + healPerSecond * healSeconds);
            
            if (this.currentBattle.playerCurrentHp >= maxHp) {
                this.currentBattle.playerCurrentHp = maxHp;
                this.gameState.currentEnemy = null;
                simulateMs = Math.max(0, elapsedMs - healTime);
            } else {
                // 還沒治療完，不需要模擬
                this.save();
                this._restoreOfflineCallbacks();
                this._offlineReportStart = null;
                this.startHealingAfterDefeat();
                return;
            }
        }

        if (simulateMs <= 1000) {
            this.save();
            this._restoreOfflineCallbacks();
            this._offlineReportStart = null;
            this.startBattle();
            return;
        }

        // 通知UI開始離線模擬（顯示進度條）— 使用儲存的原始回撥
        if (this._savedOnBattleEvent) {
            this._savedOnBattleEvent('offlineStart', { totalMs: simulateMs });
        }

        // 啟動非同步分批模擬
        this._simulateOfflineBattlesAsync(simulateMs);
    }

    // 非同步分批模擬離線戰鬥
    _simulateOfflineBattlesAsync(totalMs) {
        if (!this.gameState || !this.gameState.currentRoute) {
            this._finishOfflineSimulation(0, totalMs);
            return;
        }
        if (!this.gameState.team || this.gameState.team.length === 0) {
            this._finishOfflineSimulation(0, totalMs);
            return;
        }

        const route = this.getRoute(this.gameState.currentRoute);
        if (!route) {
            this._finishOfflineSimulation(0, totalMs);
            return;
        }

        const activePokemonId = this.gameState.team[this.gameState.activePokemonIndex];
        const playerStats = this.calculateBattleStats(this.gameState.activePokemonIndex);
        if (!playerStats) {
            this._finishOfflineSimulation(0, totalMs);
            return;
        }

        // ===== 最佳化: 預計算離線期間不變的快取值 =====
        const gemBonuses = this.getGemBonuses();

        // #5 快取閃避率（離線期間寶石不變）
        const cachedDodgeRate = Math.min(75, gemBonuses.dodge_rate) / 100;

        // #6 快取暴擊率和暴擊倍率（離線期間不變）
        let cachedCritRate = 0.05 + gemBonuses.crit_rate / 100;
        let cachedCritMultiplier = 1.5;
        const talentCritBonus = this.getTalentValue('crit_damage_bonus');
        if (talentCritBonus > 0) {
            cachedCritMultiplier += talentCritBonus / 100;
        }

        // #7 快取閃光機率（離線期間不變）
        let cachedShinyRate = 1 / 4096;
        const shinyBonusValue = this.getBadgeEffectValue('shiny_bonus');
        if (shinyBonusValue !== null) {
            cachedShinyRate *= (1 + shinyBonusValue);
        }
        if (gemBonuses.shiny_rate) {
            cachedShinyRate *= (1 + gemBonuses.shiny_rate / 100);
        }
        const talentShinyBonus = this.getTalentValue('shiny_bonus');
        if (talentShinyBonus > 0) {
            cachedShinyRate *= (1 + talentShinyBonus / 100);
        }
        const towerShinyBonus = this.getTowerBonus();
        if (towerShinyBonus > 0) {
            cachedShinyRate *= (1 + towerShinyBonus / 100);
        }

        // #7 快取權重降低值（離線期間徽章不變）
        const cachedWeightReduceValue = this.getBadgeEffectValue('completed_weight_reduce');

        // #3 快取經驗/金幣相關加成值（離線期間不變）
        const cachedExpBonusValue = this.getBadgeEffectValue('exp_bonus');
        const cachedTalentExpBonus = this.getTalentValue('exp_bonus');
        const cachedTowerExpBonus = this.getTowerBonus();
        const cachedTeamExpRate = 0.5; // 天賦已改為怪物等級提升，不再影響經驗
        const cachedTalentPokedexExpBonus = this.getTalentValue('pokedex_exp_bonus');
        const cachedBadgePokedexExpBonus = this.getBadgeEffectValue('pokedex_exp_bonus') || 0;
        const cachedReserveExpRate = 0.01 * (1 + cachedTalentPokedexExpBonus / 100 + cachedBadgePokedexExpBonus);
        const cachedHealPercent = 0.1 * (1 + (gemBonuses.victory_heal || 0) / 100);

        // #2 快取隊伍戰鬥屬性（僅升級時重新整理）
        const cachedTeamStats = [];
        const cachedTeamLevels = [];
        for (let i = 0; i < this.gameState.team.length; i++) {
            cachedTeamStats[i] = this.calculateBattleStats(i);
            const storedData = this.getStoredData(this.gameState.team[i]);
            cachedTeamLevels[i] = storedData ? storedData.level : 0;
        }

        // #4 快取玩家 level 和 types
        const storedData = this.getStoredData(activePokemonId);
        const cachedPlayerLevel = storedData ? storedData.level : 5;
        const cachedPlayerTypes = POKEMON_DATA[activePokemonId]?.types || [];

        // 模擬狀態
        const simState = {
            totalMs: totalMs,
            remainingMs: totalMs,
            battlesSimulated: 0,
            defeats: 0,
            routeSwitches: 0,
            route: route,
            activePokemonId: activePokemonId,
            playerStats: playerStats,
            playerHp: this.currentBattle ? this.currentBattle.playerCurrentHp : playerStats.hp,
            playerAttackInterval: this.getAttackInterval(playerStats.speed),
            // 快取
            cachedDodgeRate,
            cachedCritRate,
            cachedCritMultiplier,
            cachedShinyRate,
            cachedWeightReduceValue,
            cachedExpBonusValue,
            cachedTalentExpBonus,
            cachedTowerExpBonus,
            cachedTeamExpRate,
            cachedReserveExpRate,
            cachedHealPercent,
            cachedTeamStats,
            cachedTeamLevels,
            cachedPlayerLevel,
            cachedPlayerTypes,
            // 圖鑑經驗累積器（#3 批次化）
            pokedexExpAccumulator: {},
        };

        this._offlineSimState = simState;
        this._runOfflineBatch();
    }

    // 每批模擬 OFFLINE_BATCH_SIZE 場戰鬥，然後讓出主執行緒更新進度
    _runOfflineBatch() {
        const s = this._offlineSimState;
        if (!s) return;

        let batchCount = 0;

        while (s.remainingMs > 0 && batchCount < OFFLINE_BATCH_SIZE) {
            // #7 使用快取引數生成野生寶可夢
            const wildPokemon = this._generateWildPokemonOffline(s.route, s.cachedShinyRate, s.cachedWeightReduceValue);
            if (!wildPokemon) break;

            // [Bug修復] 每場新敵人生成後執行自動切換最優寶可夢
            // #2 使用快取的隊伍stats
            if (this.gameState.settings?.autoSwitchBest && this.gameState.team.length > 1) {
                const bestIndex = this._getBestTeamMemberForEnemyOffline(wildPokemon, s.cachedTeamStats, s.cachedTeamLevels);
                if (bestIndex !== -1 && bestIndex !== this.gameState.activePokemonIndex) {
                    this.gameState.activePokemonIndex = bestIndex;
                    // 切換後使用快取屬性
                    s.activePokemonId = this.gameState.team[bestIndex];
                    const newStats = s.cachedTeamStats[bestIndex];
                    if (newStats) {
                        s.playerStats = newStats;
                        s.playerAttackInterval = this.getAttackInterval(newStats.speed);
                        // #4 重新整理快取的 level 和 types
                        const sd = this.getStoredData(s.activePokemonId);
                        s.cachedPlayerLevel = sd ? sd.level : 5;
                        s.cachedPlayerTypes = POKEMON_DATA[s.activePokemonId]?.types || [];
                    }
                }
            }

            // 每場新敵人戰鬥開始時回滿生命值。
            s.playerHp = s.playerStats.hp;
            const enemyStats = this.calculateStats(wildPokemon);
            let enemyHp = enemyStats.hp;
            const enemyAttackInterval = this.getAttackInterval(enemyStats.speed);
            const wildTypes = POKEMON_DATA[wildPokemon.id]?.types || [];

            // 獲取最優技能（複用公共方法）
            const bestSkill = this._getBestSkillForEnemy(s.activePokemonId, wildTypes);

            // 模擬單場戰鬥
            let battleTime = 0;
            let playerTimer = 0;
            let enemyTimer = 0;

            while (enemyHp > 0 && s.playerHp > 0) {
                const playerTimeToAttack = s.playerAttackInterval - playerTimer;
                const enemyTimeToAttack = enemyAttackInterval - enemyTimer;
                const nextEvent = Math.min(playerTimeToAttack, enemyTimeToAttack);

                battleTime += nextEvent;
                playerTimer += nextEvent;
                enemyTimer += nextEvent;

                if (battleTime > s.remainingMs) break;

                // 玩家攻擊 — #4 使用快取level/types，#6 使用快取暴擊引數
                if (playerTimer >= s.playerAttackInterval) {
                    playerTimer = 0;
                    const result = this._calculateDamageOffline(
                        s.cachedPlayerLevel,
                        s.playerStats.attack,
                        enemyStats.defense,
                        s.cachedPlayerTypes,
                        wildTypes,
                        true,
                        bestSkill.power,
                        s.cachedCritRate,
                        s.cachedCritMultiplier
                    );
                    enemyHp -= result.damage;
                }

                // 敵方攻擊 — #5 使用快取閃避率
                if (enemyTimer >= enemyAttackInterval) {
                    enemyTimer = 0;
                    if (!(s.cachedDodgeRate > 0 && Math.random() < s.cachedDodgeRate)) {
                        const result = this._calculateDamageOffline(
                            wildPokemon.level,
                            enemyStats.attack,
                            s.playerStats.defense,
                            wildTypes,
                            s.cachedPlayerTypes,
                            false,
                            0,
                            0,
                            0
                        );
                        s.playerHp -= result.damage;
                    }
                }
            }

            s.remainingMs -= battleTime;

            // 玩家被擊敗
            if (s.playerHp <= 0) {
                s.defeats++;
                s.playerHp = 0;
                const healTime = 5000;
                s.remainingMs -= healTime;
                s.playerHp = s.playerStats.hp;
                this.gameState.currentEnemy = null;
                batchCount++;
                continue;
            }

            // 敵方被擊敗 - 使用離線最佳化版結算
            if (enemyHp <= 0) {
                s.battlesSimulated++;
                batchCount++;

                // 呼叫離線最佳化版勝利結算
                const rewards = this._processVictoryRewardsOffline(
                    wildPokemon, s.activePokemonId,
                    s.playerStats.hp, s.playerHp, s
                );
                s.playerHp = rewards.newPlayerHp;

                // [Bug修復] 自動切換地圖後重新整理路線和戰鬥屬性
                if (rewards.autoSwitchResult) {
                    s.routeSwitches++;
                    const newRoute = this.getRoute(this.gameState.currentRoute);
                    if (newRoute) {
                        s.route = newRoute;
                    }
                }

                // #1 僅在升級時才重新整理 playerStats（避免每場都遍歷全圖鑑）
                if (rewards.anyLevelUp) {
                    // 升級了，需要重新整理所有隊伍快取
                    for (let i = 0; i < this.gameState.team.length; i++) {
                        const newLv = this.getStoredData(this.gameState.team[i])?.level || 0;
                        if (newLv !== s.cachedTeamLevels[i]) {
                            s.cachedTeamStats[i] = this.calculateBattleStats(i);
                            s.cachedTeamLevels[i] = newLv;
                        }
                    }
                    const refreshedStats = s.cachedTeamStats[this.gameState.activePokemonIndex];
                    if (refreshedStats) {
                        const oldMaxHp = s.playerStats.hp;
                        s.playerStats = refreshedStats;
                        s.playerAttackInterval = this.getAttackInterval(refreshedStats.speed);
                        s.activePokemonId = this.gameState.team[this.gameState.activePokemonIndex];
                        // 重新整理快取的 level 和 types
                        const sd = this.getStoredData(s.activePokemonId);
                        s.cachedPlayerLevel = sd ? sd.level : 5;
                        s.cachedPlayerTypes = POKEMON_DATA[s.activePokemonId]?.types || [];
                        // 如果maxHp變了（升級），按比例調整當前血量
                        if (refreshedStats.hp !== oldMaxHp && oldMaxHp > 0) {
                            s.playerHp = Math.max(1, Math.floor(s.playerHp * refreshedStats.hp / oldMaxHp));
                        }
                    }
                }

                const delay = s.playerAttackInterval < 800 ? s.playerAttackInterval : 800;
                s.remainingMs -= delay;
            }
        }

        // 計算進度並通知UI — 使用儲存的原始回撥
        const progress = Math.min(1, (s.totalMs - s.remainingMs) / s.totalMs);
        if (this._savedOnBattleEvent) {
            this._savedOnBattleEvent('offlineProgress', {
                progress: progress,
                battles: s.battlesSimulated,
                percent: Math.floor(progress * 100)
            });
        }

        // #3 每批結束時刷寫圖鑑累積經驗
        this._flushPokedexExpAccumulator(s.pokedexExpAccumulator);

        // 還有剩餘時間，繼續下一批
        if (s.remainingMs > 0) {
            setTimeout(() => this._runOfflineBatch(), 0);
        } else {
            this._finishOfflineSimulation(s.battlesSimulated, s.totalMs);
        }
    }

    // 離線模擬完成，儲存並重啟戰鬥
    _finishOfflineSimulation(battlesSimulated, totalMs) {
        const s = this._offlineSimState;
        const report = this._buildOfflineReport(s, battlesSimulated);
        if (s) {
            // 更新當前血量到存檔
            this.gameState.currentEnemy = null;
            this.gameState.battleHp = {
                playerHp: Math.max(0, s.playerHp),
                playerMaxHp: s.playerStats.hp,
                playerTimer: 0,
                enemyTimer: 0,
                enemyHp: 0
            };
        }
        this._offlineSimState = null;

        this.save();

        if (battlesSimulated > 0) {
            console.log(`⚡ 離線結算: 模擬了 ${battlesSimulated} 場戰鬥`);
        }

        this._restoreOfflineCallbacks();

        // 通知UI模擬結束
        if (this.onBattleEvent) {
            this.onBattleEvent('offlineEnd', { battles: battlesSimulated, totalMs: totalMs, report });
        }

        // 重啟戰鬥迴圈
        this.startBattle();
    }

    _buildOfflineReport(sim, wins) {
        const start = this._offlineReportStart;
        this._offlineReportStart = null;
        if (!start || !sim) return null;
        const state = this.gameState;
        const teamIds = new Set(start.team.map(String));
        const team = start.team.map(id => ({ id, before: start.pokemon[id]?.level || 0,
            after: state.caughtPokemon[id]?.level ?? null, skill: state.caughtPokemon[id]?.skillLevel ?? null }));
        let newCaught = 0, ivUpdated = 0, new6v = 0, reserveCount = 0, reserveLevels = 0;
        const newShiny = [];
        const sixV = p => p?.ivs && ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'].every(k => p.ivs[k] === 31);
        for (const [id, p] of Object.entries(state.caughtPokemon)) {
            const old = start.pokemon[id];
            if (!old) newCaught++;
            else if (Object.keys(p.ivs || {}).some(k => p.ivs[k] > (old.ivs[k] ?? -1))) ivUpdated++;
            if (sixV(p) && !sixV(old)) new6v++;
            if (state.shinyDex[id] && !old?.shiny) newShiny.push(id);
            if (!teamIds.has(id) && old && p.level > old.level) { reserveCount++; reserveLevels += p.level - old.level; }
        }
        const routeName = id => this.getRoute(id)?.name || id;
        return { ...start, pokemon: undefined, startRoute: routeName(start.route),
            endRoute: routeName(state.currentRoute), wins, defeats: sim.defeats || 0,
            routeSwitches: sim.routeSwitches || 0, exp: (state.stats.totalExp || 0) - start.stats.exp,
            gold: (state.stats.totalGold || 0) - start.stats.gold, newCaught, ivUpdated, new6v,
            newShiny, team, reserveCount, reserveLevels, events: this._offlineEvents || [],
            currentTeam: state.team.length, ripeBerries: (state.berryPlots || []).filter((_, i) => this.isBerryRipe(i)).length };
    }

    _restoreOfflineCallbacks() {
        this.onBattleEvent = this._savedOnBattleEvent;
        this.onCatch = this._savedOnCatch;
        this.onLevelUp = this._savedOnLevelUp;
        this._isOfflineSimulating = false;
        this._savedOnBattleEvent = null;
        this._savedOnCatch = null;
        this._savedOnLevelUp = null;
    }

    // 預構建進化鏈對映快取：進化形態ID → 基礎形態ID（O(1)查詢）
    _buildEvolutionCache() {
        this._baseIdCache = {};
        for (const id in POKEMON_DATA) {
            const data = POKEMON_DATA[id];
            if (!data.evolvesTo) continue;
            const evos = Array.isArray(data.evolvesTo) ? data.evolvesTo : [data.evolvesTo];
            for (const evo of evos) {
                this._baseIdCache[evo.id] = parseInt(id);
            }
        }
    }

    // ===================== 公共方法 =====================
    // 獲取寶可夢的儲存資料
    getStoredData(pokemonId) {
        return this.gameState.caughtPokemon[pokemonId] || null;
    }

    // ===================== 初始化 =====================
    initNewGame() {
        // 生成初始皮卡丘的個體值（儲存在 caughtPokemon 中）
        const initialIvs = this.generateIVs();

        this.gameState = {
            team: [],               // 隊伍（最多6只）- 只儲存 pokemonId
            activePokemonIndex: 0,  // 出戰寶可夢在隊伍中的索引
            currentRegion: 'kanto',
            currentRoute: 'kanto_route1',
            pokedex: {},            // { pokemonId: 'seen' | 'caught' }
            caughtPokemon: {},      // { pokemonId: { ivs, level, exp } } - 按寶可夢自身ID儲存
            shinyDex: {},           // { pokemonId: true } - 已獲得閃光形態的寶可夢
            pokedexDisplay: {},     // { pokemonId: 'shiny' | undefined } - 圖鑑展示偏好（閃光/原始）
            gold: 0,                // 金幣
            badges: {},             // { regionId: { unlocked: true, gem: null|gemObj } }
            gems: [],               // 揹包寶石陣列，最多50個
            stats: {
                totalBattles: 0,
                totalCatches: 0,
                totalExp: 0,
                totalGold: 0,
                playTime: 0,
            },
            settings: {},
            // 樹果系統
            berryPlots: [],         // 種植槽 [{ berryId, plantedAt }]  成熟判定: Date.now() - plantedAt >= BERRY_GROW_TIME
            berryBag: {},           // 樹果背包 { berryId: count }
            berryFed: {},           // 寶可夢已餵食記錄 { pokemonId: { berryId: count } }
            // 天賦系統
            talents: {},            // { talentId: level, gemAttrChoice: attrId }
            // 挑戰塔系統
            tower: {
                currentFloor: 1,        // 當前挑戰層數（1~100）
                highestFloor: 0,        // 歷史最高通關層數
                enemies: null,          // 當前層敵方寶可夢陣列
                currentEnemyIndex: 0,   // 當前打到第幾只（0~5）
                inBattle: false,        // 是否正在挑戰中
            },
            lastSave: Date.now(),
        };

        // 捕獲初始皮卡丘（進化鏈基礎ID是25）
        this.catchPokemonWithIvs(25, 5, initialIvs);
        // 將皮卡丘加入隊伍
        this.gameState.team.push(25);

        this.save();
        return this.gameState;
    }

    // 生成隨機個體值
    generateIVs() {
        return {
            hp: Math.floor(Math.random() * 32),
            atk: Math.floor(Math.random() * 32),
            def: Math.floor(Math.random() * 32),
            spAtk: Math.floor(Math.random() * 32),
            spDef: Math.floor(Math.random() * 32),
            speed: Math.floor(Math.random() * 32),
        };
    }

    generateWildIVs() {
        return this.generateIVs();
    }

    getBasePokemonId(pokemonId) {
        // 透過快取遞迴查詢最基礎的形態
        const parentId = this._baseIdCache[pokemonId];
        if (parentId !== undefined) {
            return this.getBasePokemonId(parentId);
        }
        return pokemonId;
    }

    // 獲取某隻寶可夢的所有進化型（包括直接和間接進化）
    getAllEvolutions(pokemonId) {
        const evolutions = [];
        const data = POKEMON_DATA[pokemonId];
        if (!data || !data.evolvesTo) return evolutions;

        const directEvolutions = Array.isArray(data.evolvesTo) ? data.evolvesTo : [data.evolvesTo];
        
        for (const evo of directEvolutions) {
            evolutions.push(evo.id);
            // 遞迴獲取間接進化
            const indirectEvolutions = this.getAllEvolutions(evo.id);
            evolutions.push(...indirectEvolutions);
        }
        
        return evolutions;
    }

    // 同步同進化鏈個體值（按每項最大值合併，避免低個體覆蓋高個體）
    syncBestIvsInFamily(baseId, seedIvs = null) {
        const familyIds = [baseId, ...this.getAllEvolutions(baseId)];
        const bestIvs = { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 };

        const mergeIvs = (ivs) => {
            if (!ivs) return;
            for (const stat in bestIvs) {
                bestIvs[stat] = Math.max(bestIvs[stat], ivs[stat] || 0);
            }
        };

        // 先合併本次候選個體值
        mergeIvs(seedIvs);

        // 再合併該進化鏈所有已擁有形態的個體值
        for (const id of familyIds) {
            const stored = this.gameState.caughtPokemon[id];
            if (stored?.ivs) {
                mergeIvs(stored.ivs);
            }
        }

        // 將"家族最優個體值"寫回到所有已擁有形態
        for (const id of familyIds) {
            const stored = this.gameState.caughtPokemon[id];
            if (stored) {
                stored.ivs = { ...bestIvs };
            }
        }

        return bestIvs;
    }


    // 捕獲寶可夢（帶指定個體值）
    catchPokemonWithIvs(pokemonId, level, ivs) {
        // 標記為已捕獲
        this.gameState.pokedex[pokemonId] = 'caught';
        this.gameState.stats.totalCatches++;

        // 直接儲存在捕獲形態自身ID下
        if (!this.gameState.caughtPokemon[pokemonId]) {
            this.gameState.caughtPokemon[pokemonId] = {
                ivs: { ...ivs },
                level: level,
                exp: 0,
                skillLevel: 0,
            };
        }

        // 捕獲時檢查進化
        this.checkEvolutionOnCatch(pokemonId);

        // 同進化鏈個體值對齊為各項最大值（防止前置形態首次捕獲覆蓋進化型高個體）
        const baseId = this.getBasePokemonId(pokemonId);
        this.syncBestIvsInFamily(baseId, ivs);

        if (this.onCatch) {
            this.onCatch({ 
                id: pokemonId, 
                name: POKEMON_DATA[pokemonId].name, 
                level: 1,
                isFirstCatch: true
            });
        }
    }

    // 捕獲時檢查進化（處理捕捉時等級已超過進化等級的情況）
    checkEvolutionOnCatch(baseId) {
        this.checkEvolution(baseId, false);
    }

    // ===================== 寶可夢建立 =====================
    // 從 caughtPokemon 中獲取資料建立寶可夢例項
    createPokemon(pokemonId, useStoredLevel = false) {
        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return null;

        const storedData = this.getStoredData(pokemonId);
        if (!storedData) return null;

        const level = useStoredLevel ? storedData.level : 5;

        const pokemon = {
            uid: this.generateUID(),
            id: pokemonId,
            name: baseData.name,
            level: level,
            exp: getExpForLevel(baseData.expGroup, level),
            ivs: { ...storedData.ivs },
            isShiny: !!this.gameState.shinyDex[pokemonId], // 閃光圖鑑中有記錄則為閃光寶可夢
        };

        // 計算當前屬性
        const stats = this.calculateStats(pokemon);
        pokemon.currentHp = stats.hp;

        return pokemon;
    }

    // 野外每次遭遇的閃光及單項個體值為 31 機率（不含挑戰塔）。
    getWildEncounterRates() {
        let shiny = 1 / 4096;
        shiny *= 1 + (this.getBadgeEffectValue('shiny_bonus') || 0);
        shiny *= 1 + (this.getGemBonuses().shiny_rate || 0) / 100;
        shiny *= 1 + this.getTalentValue('shiny_bonus') / 100;
        shiny *= 1 + this.getTowerBonus() / 100;
        const factor = this.gameState?.currentRoute === 'free_hunting' && !this._towerMode ? 0.7 : 1;
        return { shiny: Math.min(1, shiny) * factor, iv31: factor / 32 };
    }

    reduceHuntingIVs(ivs) {
        for (const stat of Object.keys(ivs)) {
            if (ivs[stat] === 31 && Math.random() >= 0.7) ivs[stat] = Math.floor(Math.random() * 31);
        }
        return ivs;
    }

    // 建立野生寶可夢（用於戰鬥）
    createWildPokemon(pokemonId, level) {
        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return null;

        const ivs = this.generateWildIVs();
        if (this.gameState?.currentRoute === 'free_hunting' && !this._towerMode) this.reduceHuntingIVs(ivs);

        // 閃光判定：基礎 1/4096 機率，閃光徽章加成後翻倍
        let shinyRate = 1 / 4096;
        const shinyBonusValue = this.getBadgeEffectValue('shiny_bonus');
        if (shinyBonusValue !== null) {
            shinyRate *= (1 + shinyBonusValue); // +100% = 機率翻倍
        }
        // 寶石閃光加成
        const gemBonuses = this.getGemBonuses();
        if (gemBonuses.shiny_rate) {
            shinyRate *= (1 + gemBonuses.shiny_rate / 100);
        }
        // 天賦：閃光機率額外增加
        const talentShinyBonus = this.getTalentValue('shiny_bonus');
        if (talentShinyBonus > 0) {
            shinyRate *= (1 + talentShinyBonus / 100);
        }
        // 挑戰塔加成：通關層數%
        const towerShinyBonus = this.getTowerBonus();
        if (towerShinyBonus > 0) {
            shinyRate *= (1 + towerShinyBonus / 100);
        }
        const isShiny = Math.random() < Math.min(1, shinyRate) * (this.gameState?.currentRoute === 'free_hunting' && !this._towerMode ? 0.7 : 1);

        const pokemon = {
            uid: this.generateUID(),
            id: pokemonId,
            name: baseData.name,
            level: level,
            exp: getExpForLevel(baseData.expGroup, level),
            ivs: ivs,
            isShiny: isShiny,
            isWild: true,
        };

        const stats = this.calculateStats(pokemon);
        pokemon.currentHp = stats.hp;

        return pokemon;
    }

    _uidCounter = 0;

    generateUID() {
        // 時間戳 + 自增計數器，兼顧速度與唯一性
        // 時間戳字首保證不同會話不碰撞，自增字尾保證同批次不重複
        return Date.now().toString(36) + '_' + (++this._uidCounter).toString(36);
    }

    // 遷移修復：舊版 generateUID 批次購買時產生重複uid，導致合成失敗
    _migrateFixGemUids() {
        if (!this.gameState?.gems?.length) return;
        const uidMap = new Map(); // oldUid -> newUid
        let fixed = 0;
        for (const gem of this.gameState.gems) {
            if (uidMap.has(gem.uid)) {
                gem.uid = this.generateUID();
                fixed++;
            } else {
                uidMap.set(gem.uid, true);
            }
        }
        if (fixed > 0) console.log(`[遷移] 修復了 ${fixed} 個重複寶石UID`);
    }

    // ===================== 屬性計算（簡化公式） =====================
    // HP = floor((2 * Base + IV) * Level / 100) + Level + 10
    // Other = floor((2 * Base + IV) * Level / 100) + 5
    // 閃光加成 = 種族值 * 1.2（閃光寶可夢種族值提升20%）

    calculateBaseStats(pokemon) {
        const baseRaw = POKEMON_DATA[pokemon.id].baseStats;
        const level = pokemon.level;
        const ivs = pokemon.ivs;

        // 閃光寶可夢種族值增加20%（在種族值上限255之後再乘）
        const shinyBonus = pokemon.isShiny ? 1.2 : 1;

        // 樹果加成（每個樹果+5對應種族值，不含閃光上限255，閃光在封頂後再乘）
        // 只有己方寶可夢才享受樹果加成，野生/敵方怪物不計算
        const berryBonuses = pokemon.isTowerEnemy
            ? Object.fromEntries(Object.entries(baseRaw).map(([stat, value]) => [stat, Math.max(0, BERRY_STAT_CAP - value)]))
            : pokemon.isWild ? {} : this.getBerryBonuses(pokemon.id);

        const base = {
            hp: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.hp + (berryBonuses.hp || 0)) * shinyBonus),
            atk: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.atk + (berryBonuses.atk || 0)) * shinyBonus),
            def: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.def + (berryBonuses.def || 0)) * shinyBonus),
            spAtk: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.spAtk + (berryBonuses.spAtk || 0)) * shinyBonus),
            spDef: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.spDef + (berryBonuses.spDef || 0)) * shinyBonus),
            speed: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.speed + (berryBonuses.speed || 0)) * shinyBonus),
        };

        const hp = Math.floor((2 * base.hp + ivs.hp) * level / 100) + level + 10;
        const atk = Math.floor((2 * base.atk + ivs.atk) * level / 100) + 5;
        const def = Math.floor((2 * base.def + ivs.def) * level / 100) + 5;
        const spAtk = Math.floor((2 * base.spAtk + ivs.spAtk) * level / 100) + 5;
        const spDef = Math.floor((2 * base.spDef + ivs.spDef) * level / 100) + 5;
        const speed = Math.floor((2 * base.speed + ivs.speed) * level / 100) + 5;

        return { hp, atk, def, spAtk, spDef, speed };
    }

    // 獲取含加成的種族值（閃光+樹果），用於圖鑑展示
    getEffectiveBaseStats(pokemonId) {
        const baseRaw = POKEMON_DATA[pokemonId]?.baseStats;
        if (!baseRaw) return null;
        const isShiny = !!this.gameState.shinyDex[pokemonId];
        const shinyBonus = isShiny ? 1.2 : 1;
        const berryBonuses = this.getBerryBonuses(pokemonId);
        return {
            hp: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.hp + (berryBonuses.hp || 0)) * shinyBonus),
            atk: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.atk + (berryBonuses.atk || 0)) * shinyBonus),
            def: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.def + (berryBonuses.def || 0)) * shinyBonus),
            spAtk: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.spAtk + (berryBonuses.spAtk || 0)) * shinyBonus),
            spDef: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.spDef + (berryBonuses.spDef || 0)) * shinyBonus),
            speed: Math.floor(Math.min(BERRY_STAT_CAP, baseRaw.speed + (berryBonuses.speed || 0)) * shinyBonus),
        };
    }

    // 遊戲中的簡化屬性: 生命值、攻擊力(物攻+特攻)、防禦(物防+特防)、速度
    calculateStats(pokemon) {
        const rawStats = this.calculateBaseStats(pokemon);
        return {
            hp: rawStats.hp,
            attack: rawStats.atk + rawStats.spAtk,
            defense: rawStats.def + rawStats.spDef,
            speed: rawStats.speed,
            // 保留原始值用於顯示
            rawAtk: rawStats.atk,
            rawSpAtk: rawStats.spAtk,
            rawDef: rawStats.def,
            rawSpDef: rawStats.spDef,
        };
    }

    // 計算戰力 = (HP + 攻擊×技能威力系數 + 防禦 + 速度) / 10
    // 技能等級透過技能威力影響攻擊力評估：技能威力/50 作為攻擊力系數
    calculatePower(pokemonId, useStoredLevel = true) {
        const pokemon = this.createPokemon(pokemonId, useStoredLevel);
        if (!pokemon) return 0;

        const stats = this.calculateStats(pokemon);

        // 技能等級對攻擊力的加成：取所有技能中最高威力
        let skillMultiplier = 1;
        const skillInfo = this.getSkillForPokemon(pokemonId);
        if (skillInfo && skillInfo.skills.length > 0) {
            const maxSkillPower = Math.max(...skillInfo.skills.map(s => s.power));
            skillMultiplier = maxSkillPower / 50; // 基礎威力為50
        }

        const effectiveAttack = Math.floor(stats.attack * skillMultiplier);
        const totalStats = stats.hp + effectiveAttack + stats.defense + stats.speed;
        return Math.floor(totalStats / 10);
    }

    // 計算潛力值 (0-100%) - 用於評估養成價值
    // 基於: 經驗組評分 + 100級屬性評分
    calculatePotential(pokemonId) {
        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return 0;

        // 獲取儲存的資料
        const storedData = this.getStoredData(pokemonId);
        if (!storedData) return 0;

        // 1. 經驗組評分 (0-9分) - 固定階梯評分
        const EXP_GROUP_SCORES = {
            fast: 9,        // 80萬經驗
            medium: 6,      // 100萬經驗
            mediumSlow: 3,  // ~106萬經驗
            slow: 0         // 125萬經驗
        };
        const expScore = EXP_GROUP_SCORES[baseData.expGroup] || 0;

        // 2. 100級屬性評分 (0-91分) - 基於成長值（6項權重一致）
        const baseStatsRaw = baseData.baseStats;
        const ivs = storedData.ivs;

        // 閃光寶可夢種族值增加20%
        const isShiny = !!this.gameState.shinyDex[pokemonId];
        const shinyBonus = isShiny ? 1.2 : 1;

        // 樹果加成（與 calculateBaseStats 保持一致）
        const berryBonuses = this.getBerryBonuses(pokemonId);

        // 計算各項成長值 = (種族值+樹果加成, 上限255)×閃光×2 + 個體值
        const growthHp = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.hp + (berryBonuses.hp || 0)) * shinyBonus) * 2 + ivs.hp;
        const growthAtk = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.atk + (berryBonuses.atk || 0)) * shinyBonus) * 2 + ivs.atk;
        const growthDef = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.def + (berryBonuses.def || 0)) * shinyBonus) * 2 + ivs.def;
        const growthSpAtk = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.spAtk + (berryBonuses.spAtk || 0)) * shinyBonus) * 2 + ivs.spAtk;
        const growthSpDef = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.spDef + (berryBonuses.spDef || 0)) * shinyBonus) * 2 + ivs.spDef;
        const growthSpeed = Math.floor(Math.min(BERRY_STAT_CAP, baseStatsRaw.speed + (berryBonuses.speed || 0)) * shinyBonus) * 2 + ivs.speed;

        // 6項成長值總和
        const totalGrowth = growthHp + growthAtk + growthDef + growthSpAtk + growthSpDef + growthSpeed;

        // 歸一化到0-91分
        // 最低：鯉魚王0個體值 = (20+10+55+15+20+80)×2 = 400
        // 最高：超夢31個體值 = (106+110+90+154+90+130)×2 + 31×6 = 1554
        const MIN_GROWTH = 400;
        const MAX_GROWTH = 1554;

        const statScore = Math.floor(
            (totalGrowth - MIN_GROWTH) / (MAX_GROWTH - MIN_GROWTH) * 91
        );

        // 總分 (0-100) = 經驗分(0-9) + 屬性分(0-91) 可以超過100
        const potential = expScore + statScore;
        return Math.max(0, potential);
    }

    // 出戰寶可夢的實際屬性 = 自己 + 隊伍其他5只的20% + 圖鑑其餘所有寶可夢的1%
    calculateBattleStats(pokemonIndex) {
        if (!this.gameState || !this.gameState.team) return null;

        const team = this.gameState.team;
        if (pokemonIndex < 0 || pokemonIndex >= team.length) return null;
        
        const pokemonId = team[pokemonIndex];
        const activePokemon = this.createPokemon(pokemonId, true);
        if (!activePokemon) return null;

        const baseStats = this.calculateStats(activePokemon);

        // 隊伍內其他寶可夢的加成 (20%)
        let teamBonus = { hp: 0, attack: 0, defense: 0, speed: 0 };
        for (let i = 0; i < team.length; i++) {
            if (i !== pokemonIndex) {
                const otherPokemon = this.createPokemon(team[i], true);
                if (otherPokemon) {
                    const s = this.calculateStats(otherPokemon);
                    teamBonus.hp += s.hp * 0.2;
                    teamBonus.attack += s.attack * 0.2;
                    teamBonus.defense += s.defense * 0.2;
                    teamBonus.speed += s.speed * 0.2;
                }
            }
        }

        // 圖鑑加成：對戰塔內依樓層逐步恢復，一般戰鬥維持 1%。
        let pokedexBonus = { hp: 0, attack: 0, defense: 0, speed: 0 };
        const pokedexRate = 0.01 * (this._towerMode ? this.getTowerBonusFactors().pokedex : 1);
        const teamSet = new Set(team.map(id => String(id)));
        for (const dexId in this.gameState.pokedex) {
            if (this.gameState.pokedex[dexId] === 'caught' && !teamSet.has(dexId)) {
                const dexPokemon = this.createPokemon(parseInt(dexId), true);
                if (dexPokemon) {
                    const s = this.calculateStats(dexPokemon);
                    pokedexBonus.hp += s.hp * pokedexRate;
                    pokedexBonus.attack += s.attack * pokedexRate;
                    pokedexBonus.defense += s.defense * pokedexRate;
                    pokedexBonus.speed += s.speed * pokedexRate;
                }
            }
        }

        let finalHp = Math.floor(baseStats.hp + teamBonus.hp + pokedexBonus.hp);
        let finalAttack = Math.floor(baseStats.attack + teamBonus.attack + pokedexBonus.attack);
        let finalDefense = Math.floor(baseStats.defense + teamBonus.defense + pokedexBonus.defense);
        let finalSpeed = Math.floor(baseStats.speed + teamBonus.speed + pokedexBonus.speed);

        // 寶石屬性百分比加成
        const gemBonuses = this.getBattleGemBonuses();
        if (gemBonuses.hp_bonus > 0) finalHp = Math.floor(finalHp * (1 + gemBonuses.hp_bonus / 100));
        if (gemBonuses.atk_bonus > 0) finalAttack = Math.floor(finalAttack * (1 + gemBonuses.atk_bonus / 100));
        if (gemBonuses.def_bonus > 0) finalDefense = Math.floor(finalDefense * (1 + gemBonuses.def_bonus / 100));
        if (gemBonuses.speed_bonus > 0) finalSpeed = Math.floor(finalSpeed * (1 + gemBonuses.speed_bonus / 100));

        // 天賦：寶可夢全屬性增加（技能等級之和 × 天賦等級 × 0.02%）
        const talentStatBonus = this.getTalentStatBonusPercent() * (this._towerMode ? this.getTowerBonusFactors().talent : 1);
        if (talentStatBonus > 0) {
            finalHp = Math.floor(finalHp * (1 + talentStatBonus / 100));
            finalAttack = Math.floor(finalAttack * (1 + talentStatBonus / 100));
            finalDefense = Math.floor(finalDefense * (1 + talentStatBonus / 100));
            finalSpeed = Math.floor(finalSpeed * (1 + talentStatBonus / 100));
        }

        return {
            hp: finalHp,
            attack: finalAttack,
            defense: finalDefense,
            speed: finalSpeed,
            baseHp: baseStats.hp,
            baseAttack: baseStats.attack,
            baseDefense: baseStats.defense,
            baseSpeed: baseStats.speed,
            rawAtk: baseStats.rawAtk,
            rawSpAtk: baseStats.rawSpAtk,
            rawDef: baseStats.rawDef,
            rawSpDef: baseStats.rawSpDef,
        };
    }

    // 獲取隊伍寶可夢屬性來源分解，依戰鬥計算的取整順序分配加成。
    getStatSources(teamIndex) {
        if (!this.gameState.team || this.gameState.team.length === 0) return null;
        const idx = teamIndex ?? this.gameState.activePokemonIndex;
        const pokemonId = this.gameState.team[idx];
        if (!pokemonId) return null;

        const pokemon = this.createPokemon(pokemonId, true);
        if (!pokemon) return null;

        const baseStats = this.calculateStats(pokemon);
        // 隊友加成
        const teamBonus = { hp: 0, attack: 0, defense: 0, speed: 0 };
        for (let i = 0; i < this.gameState.team.length; i++) {
            if (i === idx) continue;
            const mate = this.createPokemon(this.gameState.team[i], true);
            if (mate) {
                const ms = this.calculateStats(mate);
                teamBonus.hp += ms.hp * 0.2;
                teamBonus.attack += ms.attack * 0.2;
                teamBonus.defense += ms.defense * 0.2;
                teamBonus.speed += ms.speed * 0.2;
            }
        }
        // 圖鑑加成
        const pokedexBonus = { hp: 0, attack: 0, defense: 0, speed: 0 };
        const pokedexRate = 0.01 * (this._towerMode ? this.getTowerBonusFactors().pokedex : 1);
        const teamSet = new Set(this.gameState.team.map(id => String(id)));
        for (const dexId in this.gameState.pokedex) {
            if (this.gameState.pokedex[dexId] === 'caught' && !teamSet.has(dexId)) {
                const dexPokemon = this.createPokemon(parseInt(dexId), true);
                if (dexPokemon) {
                    const s = this.calculateStats(dexPokemon);
                    pokedexBonus.hp += s.hp * pokedexRate;
                    pokedexBonus.attack += s.attack * pokedexRate;
                    pokedexBonus.defense += s.defense * pokedexRate;
                    pokedexBonus.speed += s.speed * pokedexRate;
                }
            }
        }

        const selfStat = { hp: baseStats.hp, attack: baseStats.attack, defense: baseStats.defense, speed: baseStats.speed };
        const teamStat = { hp: Math.floor(teamBonus.hp), attack: Math.floor(teamBonus.attack), defense: Math.floor(teamBonus.defense), speed: Math.floor(teamBonus.speed) };
        const pokedexStat = {};

        // 寶石加成
        const gemBonuses = this.getBattleGemBonuses();
        const gemStat = {};

        // 天賦加成
        const battleStats = this.calculateBattleStats(idx);
        const talentStat = {};
        const gemKeys = { hp: 'hp_bonus', attack: 'atk_bonus', defense: 'def_bonus', speed: 'speed_bonus' };
        for (const key of Object.keys(gemKeys)) {
            const baseTotal = Math.floor(baseStats[key] + teamBonus[key] + pokedexBonus[key]);
            pokedexStat[key] = baseTotal - baseStats[key] - teamStat[key];
            const gemBonus = gemBonuses[gemKeys[key]];
            const afterGem = gemBonus > 0 ? Math.floor(baseTotal * (1 + gemBonus / 100)) : baseTotal;
            gemStat[key] = afterGem - baseTotal;
            talentStat[key] = battleStats[key] - afterGem;
        }

        return {
            pokemonName: POKEMON_DATA[pokemonId]?.name || `#${pokemonId}`,
            level: pokemon.level,
            battleStats,
            self: selfStat,
            team: teamStat,
            pokedex: pokedexStat,
            gem: gemStat,
            talent: talentStat,
        };
    }

    // ===================== 戰鬥公共方法（線上/離線複用） =====================

    // 獲取對敵方最優技能：返回 { power, name, type } 或 { power: 0, name: '', type: '' }
    _getBestSkillForEnemy(pokemonId, wildTypes) {
        const result = { power: 0, name: '', type: '' };
        const skillInfo = this.getSkillForPokemon(pokemonId);
        if (!skillInfo || skillInfo.skills.length === 0) return result;

        let bestSkill = skillInfo.skills[0];
        if (skillInfo.skills.length > 1) {
            let bestMult = 0;
            for (const sk of skillInfo.skills) {
                const eff = getBestTypeEffectiveness([sk.type], wildTypes);
                if (eff.multiplier > bestMult || bestMult === 0) {
                    bestMult = eff.multiplier;
                    bestSkill = sk;
                }
            }
        }
        result.power = bestSkill.power;
        result.name = bestSkill.name;
        result.type = bestSkill.type;
        return result;
    }

    _getTowerEnemySkill(pokemonId, targetTypes) {
        const types = POKEMON_DATA[pokemonId]?.types || [];
        let best = null;
        let bestScore = -1;
        for (const type of types) {
            const skill = SKILL_DATA[type]?.find(entry => entry.level === MAX_SKILL_LEVEL);
            if (!skill) continue;
            const score = skill.power * getBestTypeEffectiveness([type], targetTypes).multiplier;
            if (score > bestScore) {
                best = { ...skill, type };
                bestScore = score;
            }
        }
        return best;
    }

    // 閃光雙向傳播：將閃光狀態同步到整條進化鏈（基礎型 ↔ 進化型）
    // 當任意形態獲得閃光時呼叫，自動傳播給鏈上所有已擁有的形態
    _syncShinyInFamily(pokemonId) {
        const baseId = this.getBasePokemonId(pokemonId);
        const familyIds = [baseId, ...this.getAllEvolutions(baseId)];

        for (const id of familyIds) {
            if (id === pokemonId) continue; // 跳過自身（已設定）

            if (!this.gameState.shinyDex[id]) {
                this.gameState.shinyDex[id] = true;

                if (this.onBattleEvent) {
                    const name = POKEMON_DATA[id]?.name || `#${id}`;
                    const srcName = POKEMON_DATA[pokemonId]?.name || `#${pokemonId}`;
                    this.onBattleEvent('shinySpread', {
                        sourceId: pokemonId,
                        sourceName: srcName,
                        targetId: id,
                        targetName: name,
                    });
                }
            }
        }
    }

    // 勝利結算公共方法：經驗/金幣/回血/捕獲/閃光/自動切地圖
    // 返回 { expGained, goldGained, healAmount, autoSwitchResult }
    _processVictoryRewards(wildPokemon, activePokemonId, playerMaxHp, playerCurrentHp) {
        this.gameState.stats.totalBattles++;

        // 圖鑑標記
        if (!this.gameState.pokedex[wildPokemon.id]) {
            this.gameState.pokedex[wildPokemon.id] = 'seen';
        }

        // 計算經驗值
        const baseExp = this.getBaseExpYield(wildPokemon.id, wildPokemon.level);
        let expGained = Math.floor(baseExp * wildPokemon.level / 7);
        const expBonusValue = this.getBadgeEffectValue('exp_bonus');
        if (expBonusValue !== null) {
            expGained = Math.floor(expGained * (1 + expBonusValue));
        }
        const talentExpBonus = this.getTalentValue('exp_bonus');
        if (talentExpBonus > 0) {
            expGained = Math.floor(expGained * (1 + talentExpBonus / 100));
        }
        // 挑戰塔加成：通關層數%
        const towerExpBonus = this.getTowerBonus();
        if (towerExpBonus > 0) {
            expGained = Math.floor(expGained * (1 + towerExpBonus / 100));
        }

        // 以戰鬥結算前的隊伍最高等級為共同基準，避免分配順序影響加成。
        const highestTeamLevel = this.getHighestTeamLevel();
        // 出戰精靈獲得100%經驗，落後隊友時額外加成。
        this.addExpToPokemon(activePokemonId, this.getTeamCatchupExp(activePokemonId, expGained, highestTeamLevel));

        // 隊伍內其他精靈獲得50%經驗
        const teamExpRate = 0.5;
        for (let i = 0; i < this.gameState.team.length; i++) {
            if (i !== this.gameState.activePokemonIndex) {
                const id = this.gameState.team[i];
                this.addExpToPokemon(id, this.getTeamCatchupExp(id, Math.floor(expGained * teamExpRate), highestTeamLevel));
            }
        }

        // 圖鑑寶可夢獲得1%經驗
        const talentPokedexExpBonus = this.getTalentValue('pokedex_exp_bonus');
        const badgePokedexExpBonus = this.getBadgeEffectValue('pokedex_exp_bonus') || 0;
        const reserveExpRate = 0.01 * (1 + talentPokedexExpBonus / 100 + badgePokedexExpBonus);
        const reserveExp = Math.ceil(expGained * reserveExpRate);
        for (const pokemonId in this.gameState.caughtPokemon) {
            const id = parseInt(pokemonId);
            if (!this.gameState.team.includes(id)) {
                this.addExpToPokemon(id, reserveExp);
            }
        }
        this.gameState.stats.totalExp += expGained;

        // 金幣掉落
        let goldGained = 0;
        if (this.isGoldUnlocked()) {
            goldGained = this.calculateGoldDrop(wildPokemon);
            this.addGold(goldGained);
        }

        // 更新實際速率跟蹤器
        this._updateRateTracker(expGained, goldGained);

        // 勝利回血
        const gemBonuses = this.getGemBonuses();
        const healPercent = 0.1 * (1 + (gemBonuses.victory_heal || 0) / 100);
        const healAmount = Math.floor(playerMaxHp * healPercent);
        const newPlayerHp = Math.min(playerMaxHp, playerCurrentHp + healAmount);

        // 擊敗處理（捕獲/IV更新/地區解鎖/徽章）
        this.processDefeat(wildPokemon);

        // 閃光記錄：擊敗閃光寶可夢後，雙向傳播閃光給整條進化鏈
        if (wildPokemon.isShiny && !this.gameState.shinyDex[wildPokemon.id]) {
            this.gameState.shinyDex[wildPokemon.id] = true;
            this._syncShinyInFamily(wildPokemon.id);
        }

        // 自動切換地圖
        const autoSwitchResult = this.tryAutoRouteSwitch();

        return { expGained, goldGained, healAmount, newPlayerHp, autoSwitchResult };
    }

    // ===================== 離線最佳化版：勝利結算 =====================
    // #3 圖鑑經驗累積到 accumulator 而非每場呼叫 addExpToPokemon
    // 返回額外欄位 anyLevelUp 用於 #1 判斷是否需要重新整理快取
    _processVictoryRewardsOffline(wildPokemon, activePokemonId, playerMaxHp, playerCurrentHp, simState) {
        this.gameState.stats.totalBattles++;

        // 圖鑑標記
        if (!this.gameState.pokedex[wildPokemon.id]) {
            this.gameState.pokedex[wildPokemon.id] = 'seen';
        }

        // 計算經驗值（使用快取的加成值）
        const baseExp = this.getBaseExpYield(wildPokemon.id, wildPokemon.level);
        let expGained = Math.floor(baseExp * wildPokemon.level / 7);
        if (simState.cachedExpBonusValue !== null) {
            expGained = Math.floor(expGained * (1 + simState.cachedExpBonusValue));
        }
        if (simState.cachedTalentExpBonus > 0) {
            expGained = Math.floor(expGained * (1 + simState.cachedTalentExpBonus / 100));
        }
        if (simState.cachedTowerExpBonus > 0) {
            expGained = Math.floor(expGained * (1 + simState.cachedTowerExpBonus / 100));
        }

        const highestTeamLevel = this.getHighestTeamLevel();
        // 與線上結算使用相同的追趕加成。
        let anyLevelUp = !!this.addExpToPokemon(activePokemonId, this.getTeamCatchupExp(activePokemonId, expGained, highestTeamLevel));

        // 隊伍內其他精靈獲得50%經驗
        for (let i = 0; i < this.gameState.team.length; i++) {
            if (i !== this.gameState.activePokemonIndex) {
                const id = this.gameState.team[i];
                const leveled = this.addExpToPokemon(id, this.getTeamCatchupExp(id, Math.floor(expGained * simState.cachedTeamExpRate), highestTeamLevel));
                if (leveled) anyLevelUp = true;
            }
        }

        // #3 圖鑑寶可夢經驗：累積到 accumulator 中，不立即寫入
        const reserveExp = Math.ceil(expGained * simState.cachedReserveExpRate);
        for (const pokemonId in this.gameState.caughtPokemon) {
            const id = parseInt(pokemonId);
            if (!this.gameState.team.includes(id)) {
                simState.pokedexExpAccumulator[id] = (simState.pokedexExpAccumulator[id] || 0) + reserveExp;
            }
        }
        this.gameState.stats.totalExp += expGained;

        // 金幣掉落
        let goldGained = 0;
        if (this.isGoldUnlocked()) {
            goldGained = this.calculateGoldDrop(wildPokemon);
            this.addGold(goldGained);
        }

        // 更新實際速率跟蹤器
        this._updateRateTracker(expGained, goldGained);

        // 勝利回血（使用快取的回血百分比）
        const healAmount = Math.floor(playerMaxHp * simState.cachedHealPercent);
        const newPlayerHp = Math.min(playerMaxHp, playerCurrentHp + healAmount);

        // 擊敗處理（捕獲/IV更新/地區解鎖/徽章）
        this.processDefeat(wildPokemon);

        // 閃光記錄
        if (wildPokemon.isShiny && !this.gameState.shinyDex[wildPokemon.id]) {
            this.gameState.shinyDex[wildPokemon.id] = true;
            this._syncShinyInFamily(wildPokemon.id);
        }

        // 自動切換地圖
        const autoSwitchResult = this.tryAutoRouteSwitch();

        return { expGained, goldGained, healAmount, newPlayerHp, autoSwitchResult, anyLevelUp };
    }

    // ===================== 離線最佳化版：傷害計算 =====================
    // #6 接受預計算的暴擊率和暴擊倍率，避免每次呼叫 getGemBonuses/getTalentValue
    _calculateDamageOffline(attackerLevel, attackStat, defenseStat, attackerTypes, defenderTypes, isPlayer, skillPower, cachedCritRate, cachedCritMultiplier) {
        const power = skillPower > 0 ? skillPower : 50;

        // 基礎傷害
        let damage = Math.floor(((2 * attackerLevel / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;

        // 屬性相剋倍率
        if (attackerTypes && defenderTypes && attackerTypes.length > 0) {
            const result = getBestTypeEffectiveness(attackerTypes, defenderTypes);
            damage = Math.floor(damage * result.multiplier);
        }

        // 會心一擊判定
        let criticalHit = false;
        const critRate = isPlayer ? cachedCritRate : 0.05;
        if (Math.random() < critRate) {
            const critMult = isPlayer ? cachedCritMultiplier : 1.5;
            damage = Math.floor(damage * critMult);
            criticalHit = true;
        }

        // 隨機數 (85%~100%)
        const random = (Math.floor(Math.random() * 16) + 85) / 100;
        damage = Math.floor(damage * random);

        // 最低1點傷害
        damage = Math.max(1, damage);

        return { damage, criticalHit };
    }

    // ===================== 離線最佳化版：野生寶可夢生成 =====================
    // #7 接受預計算的閃光率和權重降低值，避免每次呼叫 getBadgeEffectValue/getGemBonuses/getTalentValue/getTowerBonus
    _generateWildPokemonOffline(route, cachedShinyRate, cachedWeightReduceValue) {
        if (route?.id === 'free_hunting') route = this.getHuntingRoute();
        if (!route || !route.pokemon || route.pokemon.length === 0) return null;

        // 已完成寶可夢出現權重降低
        const weights = route.pokemon.map(p => {
            let w = p.weight;
            if (route.id !== 'free_hunting' && cachedWeightReduceValue !== null) {
                const caught = this.gameState.pokedex[p.id] === 'caught';
                if (caught) {
                    const storedData = this.getStoredData(p.id);
                    const is6V = storedData && storedData.ivs &&
                        storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                        storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                        storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
                    const hasShiny = !!this.gameState.shinyDex[p.id];
                    if (is6V && hasShiny) {
                        w *= (1 - cachedWeightReduceValue);
                    }
                }
            }
            return w;
        });

        // 按權重隨機選擇
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let rand = Math.random() * totalWeight;

        let selected = route.pokemon[0];
        for (let i = 0; i < route.pokemon.length; i++) {
            rand -= weights[i];
            if (rand <= 0) {
                selected = route.pokemon[i];
                break;
            }
        }

        // 按照地圖/寶可夢配置的等級範圍生成等級
        const minLevel = selected.levelRange[0];
        const maxLevel = selected.levelRange[1];
        let level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

        // 天賦：野生怪物等級提升（離線模式不含挑戰塔，直接應用）
        if (route.id !== 'free_hunting') level = this.getMonsterLevelBoost(level);

        // 內聯建立野生寶可夢，使用快取的閃光率
        const baseData = POKEMON_DATA[selected.id];
        if (!baseData) return null;

        const ivs = this.generateWildIVs();
        if (route.id === 'free_hunting') this.reduceHuntingIVs(ivs);
        const isShiny = Math.random() < Math.min(1, cachedShinyRate) * (route.id === 'free_hunting' ? 0.7 : 1);

        const pokemon = {
            uid: this.generateUID(),
            id: selected.id,
            name: baseData.name,
            level: level,
            exp: getExpForLevel(baseData.expGroup, level),
            ivs: ivs,
            isShiny: isShiny,
            isWild: true,
        };

        const stats = this.calculateStats(pokemon);
        pokemon.currentHp = stats.hp;

        return pokemon;
    }

    // ===================== 離線最佳化版：最優寶可夢選擇 =====================
    // #2 使用快取的隊伍戰鬥屬性，避免每場都呼叫 calculateBattleStats
    _getBestTeamMemberForEnemyOffline(wildPokemon, cachedTeamStats, cachedTeamLevels) {
        if (!this.gameState.team || this.gameState.team.length <= 1) return -1;

        const wildTypes = POKEMON_DATA[wildPokemon.id]?.types || [];
        const enemyStats = this.calculateStats(wildPokemon);
        const enemyHp = enemyStats.hp;
        const oneShotStrategy = this.gameState.settings?.oneShotStrategy || 'fastest';

        const candidates = [];

        for (let i = 0; i < this.gameState.team.length; i++) {
            const pokemonId = this.gameState.team[i];
            const stats = cachedTeamStats[i];
            if (!stats) continue;

            const playerTypes = POKEMON_DATA[pokemonId]?.types || [];
            const level = cachedTeamLevels[i];

            // 獲取最優技能威力
            let skillPower = 0;
            const skillInfo = this.getSkillForPokemon(pokemonId);
            if (skillInfo && skillInfo.skills.length > 0) {
                let bestSkill = skillInfo.skills[0];
                if (skillInfo.skills.length > 1) {
                    let bestMult = 0;
                    for (const sk of skillInfo.skills) {
                        const eff = getBestTypeEffectiveness([sk.type], wildTypes);
                        if (eff.multiplier > bestMult || bestMult === 0) {
                            bestMult = eff.multiplier;
                            bestSkill = sk;
                        }
                    }
                }
                skillPower = bestSkill.power;
            }

            const power = skillPower > 0 ? skillPower : 50;

            const baseDmg = Math.floor(((2 * level / 5 + 2) * power * stats.attack / enemyStats.defense) / 50) + 2;
            const typeResult = getBestTypeEffectiveness(playerTypes, wildTypes);
            const typeMult = typeResult.multiplier;
            const estimatedDmg = Math.floor(baseDmg * typeMult);
            const minDmg = Math.floor(estimatedDmg * 0.85);

            const atkInterval = this.getAttackInterval(stats.speed);
            const canOneShot = minDmg >= enemyHp;
            const dps = estimatedDmg / atkInterval;

            candidates.push({ index: i, estimatedDmg, atkInterval, canOneShot, dps, level });
        }

        if (candidates.length === 0) return -1;

        if (oneShotStrategy === 'no_change') {
            const currentCandidate = candidates.find(c => c.index === this.gameState.activePokemonIndex);
            if (currentCandidate && currentCandidate.canOneShot) {
                return this.gameState.activePokemonIndex;
            }
        }

        candidates.sort((a, b) => {
            if (a.canOneShot && !b.canOneShot) return -1;
            if (!a.canOneShot && b.canOneShot) return 1;
            if (a.canOneShot && b.canOneShot) {
                if (oneShotStrategy === 'lowest_level') {
                    return a.level - b.level;
                }
                return a.atkInterval - b.atkInterval;
            }
            return b.dps - a.dps;
        });

        return candidates[0].index;
    }

    // #3 刷寫圖鑑經驗累積器
    _flushPokedexExpAccumulator(accumulator) {
        for (const id in accumulator) {
            if (accumulator[id] > 0) {
                this.addExpToPokemon(parseInt(id), accumulator[id]);
            }
        }
        // 清空累積器
        for (const id in accumulator) {
            delete accumulator[id];
        }
    }

    // ===================== 傷害計算（官方公式簡化版） =====================
    // Damage = ((2*Level/5+2) * Power * A/D / 50 + 2) * Type * CriticalHit * Random
    // 招式威力固定50，無STAB
    calculateDamage(attackerLevel, attackStat, defenseStat, attackerTypes, defenderTypes, isPlayer = false, skillPower = 0) {
        const power = skillPower > 0 ? skillPower : 50; // 有技能時使用技能威力，否則固定50
        
        // 基礎傷害
        let damage = Math.floor(((2 * attackerLevel / 5 + 2) * power * attackStat / defenseStat) / 50) + 2;
        
        // 屬性相剋倍率（雙屬性攻擊方取最優屬性，倍率×0.75）
        let typeEffectiveness = 1;
        let effectivenessText = '';
        if (attackerTypes && defenderTypes && attackerTypes.length > 0) {
            const result = getBestTypeEffectiveness(attackerTypes, defenderTypes);
            typeEffectiveness = result.multiplier;
            damage = Math.floor(damage * typeEffectiveness);
            
            // 屬性效果文字
            if (typeEffectiveness <= 0.25) effectivenessText = '微弱傷害...';
            else if (typeEffectiveness > 1) effectivenessText = '效果拔群！';
            else if (typeEffectiveness < 1) effectivenessText = '效果不佳...';
        }


        // 會心一擊判定
        let critRate = 0.05; // 預設 ~5%
        if (isPlayer) {
            const bonuses = this.getBattleGemBonuses();
            critRate += bonuses.crit_rate / 100;
        }
        let criticalHit = false;
        if (Math.random() < critRate) {
            // 天賦：會心一擊傷害增加（基礎1.5倍 + 天賦加成）
            let critMultiplier = 1.5;
            if (isPlayer) {
                const talentCritBonus = this.getTalentValue('crit_damage_bonus') * (this._towerMode ? this.getTowerBonusFactors().talent : 1);
                if (talentCritBonus > 0) {
                    critMultiplier += talentCritBonus / 100;
                }
            }
            damage = Math.floor(damage * critMultiplier);
            criticalHit = true;
        }
        
        // 隨機數 (85%~100%)
        const random = (Math.floor(Math.random() * 16) + 85) / 100;
        damage = Math.floor(damage * random);
        
        // 最低1點傷害
        damage = Math.max(1, damage);
        
        return { damage, criticalHit, typeEffectiveness, effectivenessText };
    }

    // ===================== 攻擊間隔計算 =====================
    // 反比例曲線，前期平緩，後期持續有提升，無限趨近100ms
    getAttackInterval(speed) {
        // interval = 100 + 1900 / (1 + speed / 14000)
        // speed=10 → 1999ms, speed=10000 → 911ms, speed=100000 → 377ms
        // speed → ∞ 時趨近100ms，但永遠達不到
        const interval = 100 + 1900 / (1 + speed / 14000);
        return interval;
    }

    // ===================== 戰鬥系統 =====================
    startBattle() {
        if (this._applyPendingSkillRouteCheck()) return;
        if (!this.gameState || !this.gameState.currentRoute) return;
        if (!this.gameState.team || this.gameState.team.length === 0) return;
        if (this.gameState.activePokemonIndex >= this.gameState.team.length) {
            this.gameState.activePokemonIndex = 0;
        }

        const route = this.getRoute(this.gameState.currentRoute);
        if (!route) return;

        // 優先使用儲存的敵方寶可夢（更換寶可夢或重新整理頁面時不重新生成）
        let wildPokemon = this.gameState.currentEnemy;
        let isExistingEnemy = !!wildPokemon; // 標記是否為已存在的敵人（非新生成）
        if (!wildPokemon) {
            wildPokemon = this.generateWildPokemon(route);
            if (!wildPokemon) return;
            this.gameState.currentEnemy = wildPokemon;
            this.save();

            // 自動更換最優寶可夢出戰
            if (this.gameState.settings?.autoSwitchBest && this.gameState.team.length > 1) {
                const bestIndex = this.getBestTeamMemberForEnemy(wildPokemon);
                if (bestIndex !== -1 && bestIndex !== this.gameState.activePokemonIndex) {
                    this.gameState.activePokemonIndex = bestIndex;
                    this.save();
                    // 通知UI重新整理隊伍面板
                    if (this.onBattleEvent) {
                        this.onBattleEvent('autoSwitched', { newIndex: bestIndex });
                    }
                }
            }
        }

        // 標記為已發現
        if (!this.gameState.pokedex[wildPokemon.id]) {
            this.gameState.pokedex[wildPokemon.id] = 'seen';
        }

        // 獲取出戰寶可夢的戰鬥屬性
        const playerStats = this.calculateBattleStats(this.gameState.activePokemonIndex);
        if (!playerStats) return;
        const enemyStats = this.calculateStats(wildPokemon);

        // 新敵人滿血開戰；同一場戰鬥換人或重新載入時仍保留血量。
        const previousHp = this.currentBattle?.playerCurrentHp;
        const previousMaxHp = this.currentBattle?.playerMaxHp;
        const savedBattleHp = this.gameState.battleHp;
        let restoredPlayerHp = playerStats.hp; // 預設滿血
        let restoredEnemyHp = enemyStats.hp;   // 預設滿血

        if (isExistingEnemy && previousHp > 0 && previousMaxHp > 0) {
            // 同一場戰鬥換人時按百分比繼承血量。
            const hpPercent = previousHp / previousMaxHp;
            restoredPlayerHp = Math.max(1, Math.floor(playerStats.hp * hpPercent));
        } else if (isExistingEnemy && savedBattleHp) {
            // 重新整理頁面後從存檔恢復（按百分比）
            if (savedBattleHp.playerHp > 0) {
                if (savedBattleHp.playerMaxHp > 0) {
                    // 有存檔maxHp，按百分比恢復
                    const savedPercent = savedBattleHp.playerHp / savedBattleHp.playerMaxHp;
                    restoredPlayerHp = Math.max(1, Math.floor(playerStats.hp * savedPercent));
                } else {
                    // 舊存檔沒有maxHp欄位，相容回退
                    restoredPlayerHp = Math.min(savedBattleHp.playerHp, playerStats.hp);
                }
            }
            // 只有敵人是重新整理前就存在的（非新生成的）才恢復敵方血量
            if (isExistingEnemy && savedBattleHp.enemyHp > 0) {
                restoredEnemyHp = Math.min(savedBattleHp.enemyHp, enemyStats.hp);
            }
        }

        // 恢復攻擊進度（僅重新整理頁面時，且敵人是同一個）
        let restoredPlayerTimer = 0;
        let restoredEnemyTimer = 0;
        if (!previousHp && savedBattleHp && isExistingEnemy) {
            restoredPlayerTimer = savedBattleHp.playerTimer || 0;
            restoredEnemyTimer = savedBattleHp.enemyTimer || 0;
        }

        this.currentBattle = {
            wild: wildPokemon,
            wildMaxHp: enemyStats.hp,
            wildCurrentHp: restoredEnemyHp,
            wildStats: enemyStats,
            playerMaxHp: playerStats.hp,
            playerCurrentHp: restoredPlayerHp,
            playerStats: playerStats,
            playerNextAttack: this.getAttackInterval(playerStats.speed),
            enemyNextAttack: this.getAttackInterval(enemyStats.speed),
            playerTimer: restoredPlayerTimer,
            enemyTimer: restoredEnemyTimer,
            lastTick: Date.now(),
        };

        // 清除已使用的存檔狀態（避免下一場戰鬥重複恢復）
        if (savedBattleHp) {
            delete this.gameState.battleHp;
        }

        if (this.onBattleEvent) {
            this.onBattleEvent('start', this.currentBattle);
        }

        this.startBattleLoop();
    }

    startBattleLoop() {
        this._stopBattleTimer();

        if (this._useWorkerTimer) {
            const cb = () => { this.battleTick(); };
            this.battleTimer = this._workerSetInterval(cb, 50);
        } else {
            this.battleTimer = setInterval(() => {
                this.battleTick();
            }, 50);
        }
    }

    _stopBattleTimer() {
        if (this.battleTimer) {
            if (this._useWorkerTimer) {
                this._workerClearInterval(this.battleTimer);
            } else {
                clearInterval(this.battleTimer);
            }
            this.battleTimer = null;
        }
    }

    stopBattle() {
        this._stopBattleTimer();
        if (this._nextBattleTimeout) {
            clearTimeout(this._nextBattleTimeout);
            this._nextBattleTimeout = null;
            this._nextBattleScheduledAt = null;
        }
        if (this.healTimer) {
            clearInterval(this.healTimer);
            this.healTimer = null;
        }
    }

    // 失敗後逐步回覆生命值：每秒回覆20%，直到100%
    startHealingAfterDefeat() {
        if (!this.currentBattle) return;

        const maxHp = this.currentBattle.playerMaxHp;
        const healPerSecond = Math.max(1, Math.floor(maxHp * 0.2)); // 每秒回覆20%

        this.healTimer = setInterval(() => {
            if (!this.currentBattle) {
                clearInterval(this.healTimer);
                this.healTimer = null;
                return;
            }

            // 回覆生命值
            this.currentBattle.playerCurrentHp = Math.min(maxHp, this.currentBattle.playerCurrentHp + healPerSecond);

            // 通知UI更新
            if (this.onBattleEvent) {
                this.onBattleEvent('healing', {
                    hp: this.currentBattle.playerCurrentHp,
                    maxHp: maxHp,
                });
            }

            // 回覆滿後重新開始戰鬥
            if (this.currentBattle.playerCurrentHp >= maxHp) {
                this.currentBattle.playerCurrentHp = maxHp;
                clearInterval(this.healTimer);
                this.healTimer = null;
                // 戰鬥失敗後更換敵人
                this.gameState.currentEnemy = null;
                this.save();
                this.startBattle();
            }
        }, 1000); // 每遊戲秒回覆一次
    }

    battleTick() {
        if (!this.currentBattle) return;

        const now = Date.now();
        const delta = now - this.currentBattle.lastTick;
        this.currentBattle.lastTick = now;

        this.currentBattle.playerTimer += delta;
        this.currentBattle.enemyTimer += delta;

        // 玩家攻擊
        if (this.currentBattle.playerTimer >= this.currentBattle.playerNextAttack) {
            this.currentBattle.playerTimer = 0;
            const activePokemonId = this.gameState.team[this.gameState.activePokemonIndex];
            const activePokemon = this.createPokemon(activePokemonId, true);
            const playerTypes = POKEMON_DATA[activePokemonId]?.types || [];
            const wildTypes = POKEMON_DATA[this.currentBattle.wild.id]?.types || [];

            // 獲取最優技能
            const bestSkill = this._getBestSkillForEnemy(activePokemonId, wildTypes);
            const skillPower = bestSkill.power;
            const skillName = bestSkill.name;
            const skillType = bestSkill.type;

            const result = this.calculateDamage(
                activePokemon.level,
                this.currentBattle.playerStats.attack,
                this.currentBattle.wildStats.defense,
                playerTypes,
                wildTypes,
                true, // isPlayer
                skillPower
            );
            this.currentBattle.wildCurrentHp -= result.damage;

            if (this.onBattleEvent) {
                this.onBattleEvent('playerAttack', {
                    damage: result.damage,
                    critical: result.criticalHit,
                    typeEffectiveness: result.typeEffectiveness,
                    effectivenessText: result.effectivenessText,
                    hp: this.currentBattle.wildCurrentHp,
                    maxHp: this.currentBattle.wildMaxHp,
                    skillName: skillName,
                    skillType: skillType,
                });
            }

            // 野生寶可夢被擊敗
            if (this.currentBattle.wildCurrentHp <= 0) {
                this.currentBattle.wildCurrentHp = 0;
                if (this._towerMode) {
                    this.onTowerEnemyDefeated();
                } else {
                    this.onEnemyDefeated();
                }
                return;
            }
        }

        // 敵方攻擊
        if (this.currentBattle.enemyTimer >= this.currentBattle.enemyNextAttack) {
            this.currentBattle.enemyTimer = 0;

            // 閃避判定（寶石加成，上限75%）
            const gemBonuses = this.getBattleGemBonuses();
            const dodgeRate = Math.min(75, gemBonuses.dodge_rate) / 100;
            if (dodgeRate > 0 && Math.random() < dodgeRate) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('playerDodge', {});
                }
                // 閃避成功，不受傷害
            } else {
                const wildTypes = POKEMON_DATA[this.currentBattle.wild.id]?.types || [];
                const activePokemonId = this.gameState.team[this.gameState.activePokemonIndex];
                const playerTypes = POKEMON_DATA[activePokemonId]?.types || [];
                const towerSkill = this._towerMode ? this._getTowerEnemySkill(this.currentBattle.wild.id, playerTypes) : null;
                const result = this.calculateDamage(
                    this.currentBattle.wild.level,
                    this.currentBattle.wildStats.attack,
                    this.currentBattle.playerStats.defense,
                    towerSkill ? [towerSkill.type] : wildTypes,
                    playerTypes,
                    false, // not player
                    towerSkill?.power || 0
                );
                this.currentBattle.playerCurrentHp -= result.damage;

                if (this.onBattleEvent) {
                    this.onBattleEvent('enemyAttack', {
                        damage: result.damage,
                        critical: result.criticalHit,
                        typeEffectiveness: result.typeEffectiveness,
                        effectivenessText: result.effectivenessText,
                        skillName: towerSkill?.name || '',
                        hp: this.currentBattle.playerCurrentHp,
                        maxHp: this.currentBattle.playerMaxHp,
                    });
                }

                // 玩家寶可夢被擊敗 -> 逐步回覆生命值
                if (this.currentBattle.playerCurrentHp <= 0) {
                    this.currentBattle.playerCurrentHp = 0;
                    if (this._towerMode) {
                        if (this.onBattleEvent) {
                            this.onBattleEvent('playerFainted', {});
                        }
                        this.onTowerPlayerFainted();
                    } else {
                        if (this.onBattleEvent) {
                            this.onBattleEvent('playerFainted', {});
                        }
                        this.stopBattle();
                        // 開始逐步回覆生命值
                        this.startHealingAfterDefeat();
                    }
                    return;
                }
            }
        }

        // 更新HP條（UI）
        if (this.onBattleEvent) {
            this.onBattleEvent('tick', {
                playerHp: this.currentBattle.playerCurrentHp,
                playerMaxHp: this.currentBattle.playerMaxHp,
                enemyHp: this.currentBattle.wildCurrentHp,
                enemyMaxHp: this.currentBattle.wildMaxHp,
                playerAttackProgress: this.currentBattle.playerTimer / this.currentBattle.playerNextAttack,
                enemyAttackProgress: this.currentBattle.enemyTimer / this.currentBattle.enemyNextAttack,
            });
        }
    }

    onEnemyDefeated() {
        this.stopBattle();
        const battle = this.currentBattle;
        const wildPokemon = battle.wild;
        const activePokemonId = this.gameState.team[this.gameState.activePokemonIndex];

        // 記錄呼叫前的閃光狀態（公共方法內會設定shinyDex）
        const wasShinyRecorded = !!this.gameState.shinyDex[wildPokemon.id];

        // 呼叫公共勝利結算方法
        const rewards = this._processVictoryRewards(
            wildPokemon, activePokemonId,
            battle.playerMaxHp, battle.playerCurrentHp
        );
        this.currentBattle.playerCurrentHp = rewards.newPlayerHp;

        if (this.onBattleEvent) {
            this.onBattleEvent('enemyDefeated', {
                exp: rewards.expGained,
                pokemon: wildPokemon,
                healed: rewards.healAmount,
                gold: rewards.goldGained,
                playerHp: this.currentBattle.playerCurrentHp,
                playerMaxHp: battle.playerMaxHp,
                enemyMaxHp: battle.wildMaxHp,
            });
        }

        // 閃光寶可夢首次擊敗後通知UI
        if (wildPokemon.isShiny && !wasShinyRecorded && this.onBattleEvent) {
            this.onBattleEvent('shinyDefeated', {
                id: wildPokemon.id,
                name: wildPokemon.name,
            });
        }

        // 自動切換地圖通知UI
        if (rewards.autoSwitchResult && this.onBattleEvent) {
            this.onBattleEvent('autoRouteSwitch', rewards.autoSwitchResult);
        }

        // 清除當前敵方，下一場戰鬥將生成新的
        this.gameState.currentEnemy = null;
        this.save();

        // 計算下一場戰鬥的延遲：當攻擊速度<800ms時，延遲=攻擊速度
        const attackInterval = this.getAttackInterval(battle.playerStats.speed);
        const delay = (attackInterval < 800 ? attackInterval : 800);

        // 短暫延遲後開始下一場戰鬥（記錄計劃時間，頁面切回時可補償）
        this._nextBattleScheduledAt = Date.now() + delay;
        this._nextBattleTimeout = setTimeout(() => {
            this._nextBattleTimeout = null;
            this._nextBattleScheduledAt = null;
            this.startBattle();
        }, delay);
    }

    // 基礎經驗值（隨等級增長，100級後增速放緩）
    getBaseExpYield(pokemonId, level = 5) {
        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return 50;
        // 基於種族值總和和等級
        const totalBase = Object.values(baseData.baseStats).reduce((a, b) => a + b, 0);
        const baseExp = Math.floor(totalBase / 3);
        // 等級加成：100級以內每10級+10%；100級以後用對數增長（大幅放緩）
        let levelBonus;
        if (level <= 100) {
            levelBonus = 1 + Math.floor(level / 10) * 0.1;
        } else {
            // 100級以後固定為2.0，不再隨等級增長
            levelBonus = 2.0;
        }
        return Math.floor(baseExp * levelBonus);
    }

    getHighestTeamLevel() {
        return this.gameState.team.reduce((highest, id) => Math.max(highest, this.getStoredData(id)?.level || 1), 1);
    }

    // 相對最高等級落後越多，加成越高；最高額外 75%，只套用於隊伍。
    getTeamCatchupMultiplier(pokemonId, highestLevel = this.getHighestTeamLevel()) {
        const level = this.getStoredData(pokemonId)?.level || 1;
        return 1 + 0.75 * Math.max(0, highestLevel - level) / highestLevel;
    }

    getTeamCatchupExp(pokemonId, amount, highestLevel) {
        return Math.floor(amount * this.getTeamCatchupMultiplier(pokemonId, highestLevel));
    }

    // 給指定寶可夢增加經驗（每個形態獨立儲存）
    addExpToPokemon(pokemonId, amount) {
        const storedData = this.gameState.caughtPokemon[pokemonId];
        if (!storedData) return;

        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return;

        // 等級上限檢查
        if (storedData.level >= MAX_POKEMON_LEVEL) {
            return false;
        }

        storedData.exp += amount;

        // 檢查升級
        let leveledUp = false;
        const startLevel = storedData.level;
        while (storedData.level < MAX_POKEMON_LEVEL) {
            const nextLevelExp = getExpForLevel(baseData.expGroup, storedData.level + 1);
            if (storedData.exp >= nextLevelExp) {
                storedData.level++;
                leveledUp = true;

                // 檢查進化
                this.checkEvolution(pokemonId);
            } else {
                break;
            }
        }

        // 閃光雙向傳播：升級後，如果該寶可夢是閃光的，同步給整條進化鏈
        if (leveledUp && this.gameState.shinyDex[pokemonId]) {
            this._syncShinyInFamily(pokemonId);
        }

        // 升級通知合併為一條（顯示起始等級 → 最終等級）
        if (leveledUp && this.onLevelUp) {
            this.onLevelUp({ id: pokemonId, name: baseData.name, level: storedData.level, startLevel });
        }

        return leveledUp;
    }

    // 檢查進化目標所在地區是否已解鎖（跨代進化限制）
    _isEvolutionRegionUnlocked(evoId) {
        // 二代精靈（ID 152-251）需要城都地區解鎖
        if (evoId >= 152 && evoId <= 251) {
            return this.isRegionUnlocked('johto');
        }
        // 三代精靈（ID 252-386）需要豐緣地區解鎖
        if (evoId >= 252 && evoId <= 386) {
            return this.isRegionUnlocked('hoenn');
        }
        // 四代精靈（ID 387-493）需要神奧地區解鎖
        if (evoId >= 387 && evoId <= 493) {
            return this.isRegionUnlocked('sinnoh');
        }
        // 五代精靈（ID 494-649）需要合眾地區解鎖
        if (evoId >= 494 && evoId <= 649) {
            return this.isRegionUnlocked('unova');
        }
        // 六代精靈（ID 650-721）需要卡洛斯地區解鎖
        if (evoId >= 650 && evoId <= 721) {
            return this.isRegionUnlocked('kalos');
        }
        // 七代精靈（ID 722-809）需要阿羅拉地區解鎖
        if (evoId >= 722 && evoId <= 809) {
            return this.isRegionUnlocked('alola');
        }
        // 八代精靈（ID 810-905）需要伽勒爾地區解鎖（含洗翠地區 899-905）
        if (evoId >= 810 && evoId <= 905) {
            return this.isRegionUnlocked('galar');
        }
        // 九代精靈（ID 906-1025）需要帕底亞地區解鎖
        if (evoId >= 906 && evoId <= 1025) {
            return this.isRegionUnlocked('paldea');
        }
        // Mega進化精靈（ID 1026-1073）需要Mega地區解鎖
        if (evoId >= 1026 && evoId <= 1073) {
            return this.isRegionUnlocked('mega');
        }
        // 一代精靈預設解鎖
        return true;
    }

    checkEvolution(baseId, replaceTeam = true) {
        const storedData = this.gameState.caughtPokemon[baseId];
        if (!storedData) return;

        const baseData = POKEMON_DATA[baseId];
        if (!baseData || !baseData.evolvesTo) return;

        // 檢查基礎形態是否為閃光
        const isBaseShiny = !!this.gameState.shinyDex[baseId];

        // 統一處理進化目標列表
        const evolutions = Array.isArray(baseData.evolvesTo) ? baseData.evolvesTo : [baseData.evolvesTo];

        for (const evo of evolutions) {
            if (storedData.level >= evo.level) {
                // 跨代進化檢查：進化目標所在地區是否已解鎖
                if (!this._isEvolutionRegionUnlocked(evo.id)) {
                    continue;
                }

                const evolvedData = POKEMON_DATA[evo.id];
                if (!evolvedData) continue;

                // 閃光傳遞：如果基礎形態是閃光，進化型也應該是閃光
                if (isBaseShiny && !this.gameState.shinyDex[evo.id]) {
                    this.gameState.shinyDex[evo.id] = true;
                    // 雙向傳播閃光給整條進化鏈
                    this._syncShinyInFamily(evo.id);

                    // 如果進化型已存在，跳過後面的新捕獲邏輯
                    if (this.gameState.caughtPokemon[evo.id]) {
                        if (this.onBattleEvent) {
                            this.onBattleEvent('shinyEvolved', {
                                oldName: baseData.name,
                                newName: evolvedData.name,
                                oldId: baseId,
                                newId: evo.id,
                                pokemon: { id: evo.id, name: evolvedData.name, level: this.gameState.caughtPokemon[evo.id].level },
                            });
                        }
                        continue;
                    }
                }

                // 檢查是否已擁有該進化形態（非閃光傳遞情況）
                if (this.gameState.caughtPokemon[evo.id] || this.gameState.pokedex[evo.id] === 'caught') {
                    continue;
                }

                // 標記進化形態為已捕獲，獨立儲存
                this.gameState.pokedex[evo.id] = 'caught';
                this.gameState.caughtPokemon[evo.id] = {
                    ivs: { ...storedData.ivs },
                    level: 1,
                    exp: 0,
                    skillLevel: 0,
                };

                // 升級觸發的進化需要替換隊伍成員
                if (replaceTeam) {
                    const teamIndex = this.gameState.team.indexOf(baseId);
                    if (teamIndex !== -1) {
                        this.gameState.team[teamIndex] = evo.id;
                    }
                }

                if (this.onBattleEvent) {
                    this.onBattleEvent('evolved', {
                        oldName: baseData.name,
                        newName: evolvedData.name,
                        oldId: baseId,
                        newId: evo.id,
                        pokemon: { id: evo.id, name: evolvedData.name, level: 1 },
                    });
                }

                // 進化註冊新寶可夢後也檢查徽章解鎖（進化可能集齊某地區圖鑑）
                for (const regionId in BADGE_DATA) {
                    if (!this.hasBadge(regionId) && this.isRegionCompleted(regionId)) {
                        this.tryUnlockBadge(regionId);
                        if (this.onBattleEvent) {
                            this.onBattleEvent('badgeUnlocked', { regionId, badgeName: BADGE_DATA[regionId].name });
                        }
                    }
                }

                break; // 每次只進化一次
            }
        }
    }

    // 擊敗後處理：首次捕獲或更新個體值
    processDefeat(wildPokemon) {
        // 只檢查當前形態ID是否是首次捕獲（不追溯到基礎形態）
        const stored = this.gameState.caughtPokemon[wildPokemon.id];
        const isFirstCatch = !stored;

        if (isFirstCatch) {
            // 記錄捕獲前的地區解鎖狀態
            const wasJohtoUnlocked = this.isRegionUnlocked('johto');
            const wasHoennUnlocked = this.isRegionUnlocked('hoenn');
            const wasSinnohUnlocked = this.isRegionUnlocked('sinnoh');
            const wasUnovaUnlocked = this.isRegionUnlocked('unova');
            const wasKalosUnlocked = this.isRegionUnlocked('kalos');
            const wasAlolaUnlocked = this.isRegionUnlocked('alola');
            const wasGalarUnlocked = this.isRegionUnlocked('galar');
            const wasPaldeaUnlocked = this.isRegionUnlocked('paldea');
            const wasMegaUnlocked = this.isRegionUnlocked('mega');
            
            // 首次捕獲
            this.catchPokemonWithIvs(wildPokemon.id, 1, wildPokemon.ivs);
            
            // 檢查是否因此次捕獲解鎖了城都地區
            if (!wasJohtoUnlocked && this.isRegionUnlocked('johto')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'johto', regionName: '城都地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了豐緣地區
            if (!wasHoennUnlocked && this.isRegionUnlocked('hoenn')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'hoenn', regionName: '豐緣地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了神奧地區
            if (!wasSinnohUnlocked && this.isRegionUnlocked('sinnoh')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'sinnoh', regionName: '神奧地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了合眾地區
            if (!wasUnovaUnlocked && this.isRegionUnlocked('unova')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'unova', regionName: '合眾地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了卡洛斯地區
            if (!wasKalosUnlocked && this.isRegionUnlocked('kalos')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'kalos', regionName: '卡洛斯地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了阿羅拉地區
            if (!wasAlolaUnlocked && this.isRegionUnlocked('alola')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'alola', regionName: '阿羅拉地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了伽勒爾地區
            if (!wasGalarUnlocked && this.isRegionUnlocked('galar')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'galar', regionName: '伽勒爾地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了帕底亞地區
            if (!wasPaldeaUnlocked && this.isRegionUnlocked('paldea')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'paldea', regionName: '帕底亞地區' });
                }
            }

            // 檢查是否因此次捕獲解鎖了Mega進化地區
            if (!wasMegaUnlocked && this.isRegionUnlocked('mega')) {
                if (this.onBattleEvent) {
                    this.onBattleEvent('regionUnlocked', { regionId: 'mega', regionName: 'Mega進化地區' });
                }
            }

            // 檢查徽章解鎖
            for (const regionId in BADGE_DATA) {
                if (!this.hasBadge(regionId) && this.isRegionCompleted(regionId)) {
                    this.tryUnlockBadge(regionId);
                    if (this.onBattleEvent) {
                        this.onBattleEvent('badgeUnlocked', { regionId, badgeName: BADGE_DATA[regionId].name });
                    }
                }
            }
        } else {
            // 已捕獲過，只比較並更新個體值（取高的），不更新等級
            let updated = false;
            const updatedStats = [];
            
            for (const stat in wildPokemon.ivs) {
                if (wildPokemon.ivs[stat] > stored.ivs[stat]) {
                    const oldVal = stored.ivs[stat];
                    stored.ivs[stat] = wildPokemon.ivs[stat];
                    updated = true;
                    updatedStats.push({ stat, old: oldVal, new: wildPokemon.ivs[stat] });
                }
            }

            // 如果個體值有更新，同進化鏈按每項最大值同步（不會降檔）
            if (updated) {
                const baseId = this.getBasePokemonId(wildPokemon.id);
                this.syncBestIvsInFamily(baseId, stored.ivs);
            }


            if (updated && this.onCatch) {
                this.onCatch({ 
                    id: wildPokemon.id, 
                    name: POKEMON_DATA[wildPokemon.id].name, 
                    level: stored.level, 
                    updatedStats,
                    isFirstCatch: false
                });
            }
        }
    }

    // ===================== 野生寶可夢生成 =====================
    // 已完成寶可夢的權重依徽章效果降低，地圖與戰鬥共用。
    getRouteEncounterWeights(route, weightReduceValue = this.getBadgeEffectValue('completed_weight_reduce')) {
        return route.pokemon.map(p => {
            let w = p.weight;
            if (route.id !== 'free_hunting' && weightReduceValue !== null) {
                const caught = this.gameState.pokedex[p.id] === 'caught';
                if (caught) {
                    const storedData = this.getStoredData(p.id);
                    const is6V = storedData && storedData.ivs &&
                        storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                        storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                        storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
                    const hasShiny = !!this.gameState.shinyDex[p.id];
                    if (is6V && hasShiny) {
                        w *= (1 - weightReduceValue); // 權重減少
                    }
                }
            }
            return w;
        });
    }

    // 按照地圖設定的等級範圍生成野生寶可夢
    generateWildPokemon(route) {
        if (!route || !route.pokemon || route.pokemon.length === 0) return null;
        const weights = this.getRouteEncounterWeights(route);

        // 按權重隨機選擇
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let rand = Math.random() * totalWeight;

        let selected = route.pokemon[0];
        for (let i = 0; i < route.pokemon.length; i++) {
            rand -= weights[i];
            if (rand <= 0) {
                selected = route.pokemon[i];
                break;
            }
        }

        // 按照地圖/寶可夢配置的等級範圍生成等級
        const minLevel = selected.levelRange[0];
        const maxLevel = selected.levelRange[1];
        let level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;

        // 天賦：野生怪物等級提升（挑戰塔除外）
        if (!this._towerMode && route.id !== 'free_hunting') {
            level = this.getMonsterLevelBoost(level);
        }

        return this.createWildPokemon(selected.id, level);
    }

    // ===================== 隊伍管理 =====================
    // 未來模式僅在同步計算期間模擬等級，無論成功與否都恢復實際存檔。
    recommendTeamForEnemy(enemy, targetLevel = null) {
        if (targetLevel !== null && (!Number.isInteger(targetLevel) || targetLevel < 1 || targetLevel > MAX_POKEMON_LEVEL)) return null;
        if (targetLevel !== null) {
            const original = this.gameState;
            const owned = Object.keys(original.pokedex).filter(id => original.pokedex[id] === 'caught' && original.caughtPokemon[id] && POKEMON_DATA[id]).map(Number);
            try {
                this.gameState = structuredClone(original);
                const simulated = this.gameState;
                for (const id of owned) {
                    simulated.caughtPokemon[id].level = targetLevel;
                    simulated.caughtPokemon[id].skillLevel = MAX_SKILL_LEVEL;
                }
                const candidates = new Set(owned);
                this._recommendVirtualIds = new Set();
                for (const sourceId of owned) {
                    for (const id of this.getAllEvolutions(sourceId)) {
                        if (!POKEMON_DATA[id] || candidates.has(id)) continue;
                        candidates.add(id);
                        this._recommendVirtualIds.add(String(id));
                        simulated.caughtPokemon[id] = { ...simulated.caughtPokemon[sourceId], ivs: { ...simulated.caughtPokemon[sourceId].ivs }, level: targetLevel, skillLevel: MAX_SKILL_LEVEL };
                        if (simulated.shinyDex[sourceId]) simulated.shinyDex[id] = true;
                    }
                }
                const result = this._recommendTeamForEnemy(enemy, [...candidates], true);
                if (!result) return null;
                result.simulatedIds = result.team.filter(id => !owned.includes(id));
                const ownedSet = new Set(owned);
                const used = new Set();
                result.applyTeam = result.team.map(id => {
                    const descendants = [id, ...this.getAllEvolutions(id)].filter(candidate => ownedSet.has(candidate) && !used.has(candidate));
                    const depth = candidate => {
                        let n = 0;
                        while (candidate !== id && this._baseIdCache[candidate] !== undefined) { candidate = this._baseIdCache[candidate]; n++; }
                        return candidate === id ? n : -1;
                    };
                    descendants.sort((a, b) => depth(b) - depth(a));
                    if (descendants.length) { used.add(descendants[0]); return descendants[0]; }
                    let current = id;
                    while ((!ownedSet.has(current) || used.has(current)) && this._baseIdCache[current] !== undefined) current = this._baseIdCache[current];
                    if (!ownedSet.has(current) || used.has(current)) return null;
                    used.add(current);
                    return current;
                }).filter(id => id !== null);
                for (const id of [...original.team, ...owned]) {
                    if (result.applyTeam.length >= Math.min(6, owned.length)) break;
                    if (ownedSet.has(id) && !used.has(id)) { result.applyTeam.push(id); used.add(id); }
                }
                return result;
            } finally {
                delete this._recommendVirtualIds;
                this.gameState = original;
            }
        }
        const savedLevels = [];
        try {
            if (targetLevel !== null) {
                for (const id in this.gameState.caughtPokemon) {
                    const stored = this.gameState.caughtPokemon[id];
                    if (stored && this.gameState.pokedex[id] === 'caught') {
                        savedLevels.push([stored, stored.level]);
                        stored.level = targetLevel;
                    }
                }
            }
            return this._recommendTeamForEnemy(enemy);
        } finally {
            for (const [stored, level] of savedLevels) stored.level = level;
        }
    }

    // 依目前道路的敵人與出現權重，比較多種候選隊伍。
    _recommendTeamForEnemy(enemy, candidateIds = null, refine = false) {
        const route = this.getRoute(this.gameState?.currentRoute);
        if (!enemy || !POKEMON_DATA[enemy.id] || !route?.pokemon?.length || !this.gameState.team?.length) return null;
        const reduceWeight = this.getBadgeEffectValue('completed_weight_reduce');
        const profiles = [];
        for (const entry of route.pokemon) {
            if (!POKEMON_DATA[entry.id] || !entry.levelRange || !(entry.weight > 0)) continue;
            let weight = entry.weight;
            const stored = this.getStoredData(entry.id);
            if (reduceWeight !== null && this.gameState.pokedex[entry.id] === 'caught' && this.gameState.shinyDex[entry.id] && stored?.ivs && ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'].every(key => stored.ivs[key] === 31)) {
                weight *= Math.max(0, 1 - reduceWeight);
            }
            if (!(weight > 0)) continue;
            const [min, max] = entry.levelRange;
            const levels = [...new Set([min, Math.floor((min + max) / 2), max])];
            for (const level of levels) {
                const wild = { id: entry.id, level: this.getMonsterLevelBoost(level), ivs: { hp: 15, atk: 15, def: 15, spAtk: 15, spDef: 15, speed: 15 }, isShiny: false, isWild: true };
                profiles.push({ wild, stats: this.calculateStats(wild), types: POKEMON_DATA[entry.id].types || [], weight: weight / levels.length });
            }
        }
        if (!profiles.length) return null;
        const totalWeight = profiles.reduce((sum, profile) => sum + profile.weight, 0);
        const candidates = candidateIds || Object.keys(this.gameState.pokedex)
            .filter(id => this.gameState.pokedex[id] === 'caught' && POKEMON_DATA[id] && this.getStoredData(id))
            .map(Number);
        if (!candidates.length) return null;
        const estimate = (id, stats, profile) => {
            const pokemon = this.createPokemon(id, true);
            const skill = this._getBestSkillForEnemy(id, profile.types);
            const power = skill.power > 0 ? skill.power : 50;
            const damage = Math.floor(((2 * pokemon.level / 5 + 2) * power * stats.attack / profile.stats.defense) / 50) + 2;
            const effectiveness = getBestTypeEffectiveness(refine && skill.type ? [skill.type] : (POKEMON_DATA[id].types || []), profile.types).multiplier;
            const estimatedDamage = Math.floor(damage * effectiveness);
            const minDamage = Math.max(1, Math.floor(estimatedDamage * 0.85));
            const interval = this.getAttackInterval(stats.speed);
            const time = Math.ceil(profile.stats.hp / minDamage) * interval;
            const enemyEffect = getBestTypeEffectiveness(profile.types, POKEMON_DATA[id].types || []).multiplier;
            const incoming = Math.max(1, Math.floor((Math.floor(((2 * profile.wild.level / 5 + 2) * 50 * profile.stats.attack / Math.max(1, stats.defense)) / 50) + 2) * enemyEffect));
            const threatened = refine && Math.floor(time / this.getAttackInterval(profile.stats.speed)) * incoming >= stats.hp;
            return { time: time + (threatened ? 60000 : 0), interval, level: pokemon.level, canOneShot: minDamage >= profile.stats.hp, dps: estimatedDamage / interval };
        };
        const ranked = candidates.map(id => {
            const pokemon = this.createPokemon(id, true);
            const stats = this.calculateStats(pokemon);
            const power = this.calculatePower(id, true);
            const potential = this.calculatePotential(id);
            const times = profiles.map(profile => estimate(id, stats, profile).time);
            const average = times.reduce((sum, time, i) => sum + time * profiles[i].weight, 0) / totalWeight;
            return { id, power, potential, times, score: 1 / average };
        });
        const familyLimits = new Map();
        if (refine) for (const id of candidates) {
            if (this.gameState.pokedex[id] !== 'caught') continue;
            const base = this.getBasePokemonId(id);
            familyLimits.set(base, (familyLimits.get(base) || 0) + 1);
        }
        const canAdd = (team, id) => !refine || team.filter(other => this.getBasePokemonId(other) === this.getBasePokemonId(id)).length < (familyLimits.get(this.getBasePokemonId(id)) || 0);
        const select = score => {
            const team = [];
            for (const item of [...ranked].sort((a, b) => score(b) - score(a) || a.id - b.id)) {
                if (canAdd(team, item.id)) team.push(item.id);
                if (team.length === 6) break;
            }
            return team;
        };
        // 貪婪補齊不同敵人的剋制覆蓋，再以實際隊伍加成重新評估。
        const coverage = [];
        const coveredTimes = profiles.map(() => Infinity);
        while (coverage.length < Math.min(6, ranked.length)) {
            let chosen = null, bestTime = Infinity;
            for (const candidate of ranked) {
                if (coverage.includes(candidate.id) || !canAdd(coverage, candidate.id)) continue;
                const time = candidate.times.reduce((sum, value, i) => sum + Math.min(value, coveredTimes[i]) * profiles[i].weight, 0);
                if (time < bestTime) { bestTime = time; chosen = candidate; }
            }
            if (!chosen) break;
            coverage.push(chosen.id);
            chosen.times.forEach((time, i) => { coveredTimes[i] = Math.min(time, coveredTimes[i]); });
        }
        const originalTeam = this.gameState.team;
        const originalIndex = this.gameState.activePokemonIndex;
        const originalActive = originalTeam[originalIndex];
        const teams = [originalTeam.slice(), select(p => p.power), select(p => p.power * (1 + Math.min(100, Math.max(0, p.potential)) / 500)), select(p => p.score), coverage];
        const autoSwitch = !!this.gameState.settings?.autoSwitchBest;
        const strategy = this.gameState.settings?.oneShotStrategy || 'fastest';
        let best = null;
        try {
            const evaluate = team => {
                this.gameState.team = team;
                this.gameState.activePokemonIndex = Math.max(0, team.indexOf(originalActive));
                const teamStats = team.map((_, i) => this.calculateBattleStats(i));
                const estimates = team.map((id, i) => profiles.map(profile => estimate(id, teamStats[i], profile)));
                let activeIndex = this.gameState.activePokemonIndex;
                let averageTime;
                if (autoSwitch) {
                    averageTime = profiles.reduce((sum, profile, j) => {
                        const options = estimates.map((values, i) => ({ ...values[j], index: i }));
                        const current = options[activeIndex];
                        let chosen;
                        if (strategy === 'no_change' && current.canOneShot) chosen = current;
                        else chosen = options.sort((a, b) => {
                            if (a.canOneShot !== b.canOneShot) return a.canOneShot ? -1 : 1;
                            if (a.canOneShot) return strategy === 'lowest_level' ? a.level - b.level : a.interval - b.interval;
                            return b.dps - a.dps;
                        })[0];
                        return sum + chosen.time * profile.weight;
                    }, 0) / totalWeight;
                    const chosenIndex = this.getBestTeamMemberForEnemy(enemy);
                    if (chosenIndex >= 0) activeIndex = chosenIndex;
                } else {
                    const averages = estimates.map(values => values.reduce((sum, value, j) => sum + value.time * profiles[j].weight, 0) / totalWeight);
                    activeIndex = averages.indexOf(Math.min(...averages));
                    averageTime = averages[activeIndex];
                }
                return { team: team.slice(), activeIndex, averageTime, routeId: route.id };
            };
            for (const team of teams) {
                const result = evaluate(team);
                if (!best || result.averageTime < best.averageTime) best = result;
            }
            if (refine && best) {
                const shortlist = [...new Set([...select(p => p.power), ...select(p => p.score), ...coverage, ...ranked.sort((a, b) => b.score - a.score).slice(0, 18).map(p => p.id)])];
                for (let pass = 0; pass < 2; pass++) {
                    let improved = false;
                    for (let slot = 0; slot < best.team.length; slot++) {
                        for (const id of shortlist) {
                            if (best.team.includes(id)) continue;
                            const team = best.team.slice();
                            team[slot] = id;
                            if (!canAdd(team.filter((_, index) => index !== slot), id)) continue;
                            const result = evaluate(team);
                            if (result.averageTime < best.averageTime) { best = result; improved = true; }
                        }
                    }
                    if (!improved) break;
                }
            }
        } finally {
            this.gameState.team = originalTeam;
            this.gameState.activePokemonIndex = originalIndex;
        }
        return best;
    }

    setActivePokemon(index) {
        if (this._towerMode && this._towerFaintedIds?.has(this.gameState.team[index])) return false;
        if (index >= 0 && index < this.gameState.team.length) {
            const oldPokemonId = this.gameState.team[this.gameState.activePokemonIndex];
            if (this._towerMode && this.currentBattle && this._towerHpById) {
                if (this.currentBattle.wildCurrentHp <= 0) return false;
                this._towerHpById.set(oldPokemonId, Math.max(0, this.currentBattle.playerCurrentHp));
            }
            this.gameState.activePokemonIndex = index;

            if (this.currentBattle) {
                // 熱切換：保留敵方狀態，繼承血量百分比和攻擊進度
                const oldMaxHp = this.currentBattle.playerMaxHp;
                const oldCurrentHp = this.currentBattle.playerCurrentHp;
                const oldHpPercent = oldMaxHp > 0 ? oldCurrentHp / oldMaxHp : 1;

                // 儲存舊的攻擊進度百分比
                const oldAttackProgress = this.currentBattle.playerNextAttack > 0
                    ? this.currentBattle.playerTimer / this.currentBattle.playerNextAttack
                    : 0;

                const newPlayerStats = this.calculateBattleStats(index);
                if (newPlayerStats) {
                    this.currentBattle.playerStats = newPlayerStats;
                    this.currentBattle.playerMaxHp = newPlayerStats.hp;
                    // 繼承血量百分比：新寶可夢的當前HP = 新最大HP × 舊血量百分比
                    if (this._towerMode && this._towerHpById) {
                        const savedHp = this._towerHpById.get(this.gameState.team[index]);
                        this.currentBattle.playerCurrentHp = savedHp == null ? newPlayerStats.hp : Math.min(newPlayerStats.hp, savedHp);
                        this._towerHpById.set(this.gameState.team[index], this.currentBattle.playerCurrentHp);
                    } else {
                        this.currentBattle.playerCurrentHp = Math.max(1, Math.floor(newPlayerStats.hp * oldHpPercent));
                    }
                    this.currentBattle.playerNextAttack = this.getAttackInterval(newPlayerStats.speed);
                    // 繼承攻擊進度：按百分比對映到新的攻擊間隔上
                    this.currentBattle.playerTimer = Math.floor(this.currentBattle.playerNextAttack * oldAttackProgress);
                    // 保留 enemyTimer 不變

                    // 挑戰塔模式下同步更新 HP 百分比
                    if (this._towerMode) {
                        this._towerPlayerHpPercent = this.currentBattle.playerCurrentHp / this.currentBattle.playerMaxHp;
                    }

                    if (this.onBattleEvent) {
                        this.onBattleEvent('start', this.currentBattle);
                    }
                }
            } else {
                this.startBattle();
            }
        }
    }

    addToTeamFromPokedex(pokemonId) {
        if (this._towerMode) return false;
        if (this.gameState.team.length >= 6) {
            console.log('addToTeamFromPokedex: 隊伍已滿');
            return false;
        }
        if (this.gameState.pokedex[pokemonId] !== 'caught') {
            console.log('addToTeamFromPokedex: 該寶可夢未捕獲', pokemonId);
            return false;
        }
        // 檢查是否已在隊伍中
        if (this.gameState.team.includes(pokemonId)) {
            console.log('addToTeamFromPokedex: 該寶可夢已在隊伍中', pokemonId);
            return false;
        }

        this.gameState.team.push(pokemonId);
        console.log('addToTeamFromPokedex: 成功新增', pokemonId);
        return true;
    }

    removeFromTeamByPokemonId(pokemonId) {
        if (this._towerMode) return false;
        // 找到該寶可夢在隊伍中的索引（非出戰）
        const teamIndex = this.gameState.team.findIndex((id, idx) => 
            id === pokemonId && idx !== this.gameState.activePokemonIndex
        );
        if (teamIndex === -1) {
            console.log('removeFromTeamByPokemonId: 未找到可移除的寶可夢', pokemonId, 'activeIndex:', this.gameState.activePokemonIndex);
            return false;
        }
        if (this.gameState.team.length <= 1) {
            console.log('removeFromTeamByPokemonId: 隊伍至少需要保留一隻');
            return false;
        }

        console.log('removeFromTeamByPokemonId: 移除索引', teamIndex, 'pokemonId:', pokemonId);
        this.gameState.team.splice(teamIndex, 1);

        // 調整出戰索引
        if (this.gameState.activePokemonIndex > teamIndex) {
            this.gameState.activePokemonIndex--;
        }

        return true;
    }

    removeFromTeam(teamIndex) {
        if (this._towerMode) return false;
        if (this.gameState.team.length <= 1) return false; // 至少保留一隻
        if (teamIndex === this.gameState.activePokemonIndex) return false; // 不能移除出戰寶可夢

        this.gameState.team.splice(teamIndex, 1);

        // 調整出戰索引
        if (this.gameState.activePokemonIndex > teamIndex) {
            this.gameState.activePokemonIndex--;
        }

        return true;
    }

    // ===================== 地圖 =====================
    isHuntingUnlocked() {
        return !!this.gameState?.pokedex && Array.from({ length: 48 }, (_, i) => i + 1026)
            .every(id => this.gameState.pokedex[id] === 'caught');
    }

    // 傳說／幻之分類參考 PokeAPI pokemon_species；Mega 依原形態分類。
    getHuntingCategory(id) {
        const legendary = [144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024,1025,1039,1040,1064,1065,1066,1073];
        const pseudo = [147,148,149,246,247,248,371,372,373,374,375,376,443,444,445,633,634,635,704,705,706,782,783,784,885,886,887,996,997,998,1046,1062,1063,1068];
        if (legendary.includes(id)) return 'legendary';
        if (pseudo.includes(id) || (id >= 1026 && id <= 1073)) return 'pseudo';
        return 'other';
    }

    isValidHuntingSelection(pokemon) {
        if (!Array.isArray(pokemon) || pokemon.length !== 6 || new Set(pokemon).size !== 6 ||
            !pokemon.every(id => Number.isInteger(id) && POKEMON_DATA[id] && this.getBasePokemonId(id) === id)) return false;
        const count = { legendary: 0, pseudo: 0, other: 0 };
        pokemon.forEach(id => count[this.getHuntingCategory(id)]++);
        return count.legendary === 1 && count.pseudo === 2 && count.other === 3;
    }

    getHuntingWeights(pokemon) {
        return pokemon.map(id => {
            const category = this.getHuntingCategory(id);
            return category === 'legendary' ? 0.05 : category === 'pseudo' ? 0.10 : 0.75 / 3;
        });
    }

    getHuntingRoute() {
        const config = this.gameState?.huntingGround;
        if (!this.isHuntingUnlocked() || !config || !this.isValidHuntingSelection(config.pokemon)) return null;
        const level = this.getHuntingLevel();
        const weights = this.getHuntingWeights(config.pokemon);
        return { id: 'free_hunting', name: '自由狩獵場', description: '自選六隻寶可夢',
            levelRange: [level, level],
            pokemon: config.pokemon.map((id, i) => ({ id, weight: weights[i], levelRange: [level, level] })) };
    }

    getHuntingLevel() {
        return Math.min(MAX_POKEMON_LEVEL, Math.max(1, ...Object.values(this.gameState?.caughtPokemon || {}).map(p => Number.isFinite(p?.level) ? Math.floor(p.level) : 1)));
    }

    setHuntingGround(pokemon) {
        if (this._offlineSimState || this._towerMode || !this.isHuntingUnlocked() ||
            !this.isValidHuntingSelection(pokemon)) return false;
        this.gameState.huntingGround = { pokemon: [...pokemon] };
        return true;
    }

    repairHuntingLocation() {
        if (this.gameState?.currentRoute !== 'free_hunting' || this.getHuntingRoute()) return;
        this.gameState.currentRoute = 'kanto_route1';
        this.gameState.currentRegion = 'kanto';
        this.gameState.currentEnemy = null;
        delete this.gameState.battleHp;
    }

    getRoute(routeId) {
        if (routeId === 'free_hunting') return this.getHuntingRoute();
        for (const regionKey in REGIONS) {
            const region = REGIONS[regionKey];
            for (const route of region.routes) {
                if (route.id === routeId) return route;
            }
        }
        return null;
    }

    changeRoute(routeId) {
        if (this._offlineSimState || this._towerMode) return false;
        if (routeId === 'free_hunting') {
            if (!this.getHuntingRoute()) return false;
            this.stopBattle();
            this.gameState.currentRegion = 'hunting';
            this.gameState.currentRoute = routeId;
            this.gameState.currentEnemy = null;
            delete this.gameState.battleHp;
            this.currentBattle = null;
            this.resetRateTracker();
            this.startBattle();
            this.save();
            return true;
        }
        const regionKey = Object.keys(REGIONS).find(key => REGIONS[key].routes.some(route => route.id === routeId));
        if (!regionKey || !this.isRegionUnlocked(regionKey)) return false;
        if (this.gameState.currentRoute === routeId) return true;
        this.stopBattle();
        this.gameState.currentRoute = routeId;
        this.gameState.currentEnemy = null;
        delete this.gameState.battleHp;
        this.currentBattle = null;
        this.resetRateTracker(); // 切換地圖時重置速率統計
        this.startBattle();
        this.save();
        return true;
    }

    // 檢查某個道路的所有寶可夢是否全部6V且閃光
    isRouteComplete6VShiny(routeId) {
        const route = this.getRoute(routeId);
        if (!route || !route.pokemon || route.pokemon.length === 0) return false;

        for (const p of route.pokemon) {
            if (this.gameState.pokedex[p.id] !== 'caught') return false;
            const storedData = this.getStoredData(p.id);
            if (!storedData || !storedData.ivs) return false;
            const is6V = storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
            if (!is6V) return false;
            if (!this.gameState.shinyDex[p.id]) return false;
        }
        return true;
    }

    // 檢查某個道路的所有寶可夢是否全部6V（不要求閃光）
    isRouteComplete6V(routeId) {
        const route = this.getRoute(routeId);
        if (!route || !route.pokemon || route.pokemon.length === 0) return false;

        for (const p of route.pokemon) {
            if (this.gameState.pokedex[p.id] !== 'caught') return false;
            const storedData = this.getStoredData(p.id);
            if (!storedData || !storedData.ivs) return false;
            const is6V = storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
            if (!is6V) return false;
        }
        return true;
    }

    // 根據設定檢查道路是否完成（自動切換地圖用）
    _isRouteCompleteByCondition(routeId) {
        const condition = this.gameState.settings?.routeSwitchCondition || '6v_shiny';
        if (condition === '6v_only') return this.isRouteComplete6V(routeId);
        return this.isRouteComplete6VShiny(routeId);
    }

    // 查詢第一個未完成的已解鎖道路（依地圖順序）。
    findNextIncompleteRoute() {
        for (const regionKey in REGIONS) {
            if (!this.isRegionUnlocked(regionKey)) continue;
            const region = REGIONS[regionKey];
            for (const route of region.routes) {
                if (!this._isRouteCompleteByCondition(route.id)) {
                    return { routeId: route.id, regionKey, routeName: route.name, regionName: region.name };
                }
            }
        }
        return null;
    }

    // 重練最多前往第一個未完成地圖；全數完成時以原地圖為目標。
    _getSkillRecoveryGoal(originalRouteId) {
        const firstIncomplete = this.findNextIncompleteRoute();
        if (firstIncomplete) return firstIncomplete;
        for (const regionKey in REGIONS) {
            if (!this.isRegionUnlocked(regionKey)) continue;
            const region = REGIONS[regionKey];
            for (const route of region.routes) {
                if (route.id === originalRouteId) {
                    return { routeId: route.id, regionKey, routeName: route.name, regionName: region.name };
                }
            }
        }
        return null;
    }

    _isRouteAtOrBeforeRecoveryGoal(routeId, goalId) {
        for (const regionKey in REGIONS) {
            if (!this.isRegionUnlocked(regionKey)) continue;
            for (const route of REGIONS[regionKey].routes) {
                if (route.id === routeId) return true;
                if (route.id === goalId) return false;
            }
        }
        return false;
    }

    // 使用實際隊伍、圖鑑、寶石與天賦加成估算每種敵人的戰鬥表現。
    _getSkillRecoveryBattleContext() {
        const autoSwitch = !!this.gameState.settings?.autoSwitchBest;
        const activeIndex = this.gameState.activePokemonIndex;
        const team = this.gameState.team.map((id, index) => {
            if (!autoSwitch && index !== activeIndex) return null;
            const pokemon = this.createPokemon(id, true);
            const stats = this.calculateBattleStats(index);
            if (!pokemon || !stats) return null;
            return { id, index, pokemon, stats, types: POKEMON_DATA[id]?.types || [] };
        }).filter(Boolean);
        return { team, autoSwitch, activeIndex, strategy: this.gameState.settings?.oneShotStrategy || 'fastest' };
    }

    // 以每種敵人的最高等級、6V 與閃光估算，保守考慮傷害波動與敵方會心。
    _isSkillRecoveryRouteSuitable(route, context) {
        if (!context.team.length) return false;
        const ivs = { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 };
        for (const entry of route.pokemon) {
            if (!(entry.weight > 0) || !POKEMON_DATA[entry.id]) continue;
            const enemy = { id: entry.id, level: this.getMonsterLevelBoost(entry.levelRange[1]), ivs, isShiny: true, isWild: true };
            const enemyStats = this.calculateStats(enemy);
            const enemyTypes = POKEMON_DATA[entry.id].types || [];
            const candidates = context.team.map(member => {
                const skill = this._getBestSkillForEnemy(member.id, enemyTypes);
                const power = skill.power || 50;
                const base = Math.floor(((2 * member.pokemon.level / 5 + 2) * power * member.stats.attack / enemyStats.defense) / 50) + 2;
                const damage = Math.floor(base * getBestTypeEffectiveness(member.types, enemyTypes).multiplier);
                const minDamage = Math.max(1, Math.floor(damage * 0.85));
                const interval = this.getAttackInterval(member.stats.speed);
                return { ...member, damage, minDamage, interval, canOneShot: minDamage >= enemyStats.hp, dps: damage / interval };
            });
            let chosen = candidates[0];
            if (context.autoSwitch && candidates.length > 1) {
                const active = candidates.find(candidate => candidate.index === context.activeIndex);
                if (context.strategy === 'no_change' && active?.canOneShot) chosen = active;
                else chosen = candidates.sort((a, b) => {
                    if (a.canOneShot !== b.canOneShot) return a.canOneShot ? -1 : 1;
                    if (a.canOneShot) return context.strategy === 'lowest_level' ? a.pokemon.level - b.pokemon.level : a.interval - b.interval;
                    return b.dps - a.dps;
                })[0];
            }
            const enemyBase = Math.floor(((2 * enemy.level / 5 + 2) * 50 * enemyStats.attack / chosen.stats.defense) / 50) + 2;
            const enemyDamage = Math.max(1, Math.floor(Math.floor(enemyBase * getBestTypeEffectiveness(enemyTypes, chosen.types).multiplier) * 1.5));
            const playerHits = Math.ceil(enemyStats.hp / chosen.minDamage);
            const enemyHits = Math.max(0, Math.ceil(playerHits * chosen.interval / this.getAttackInterval(enemyStats.speed)) - 1);
            if (enemyHits * enemyDamage >= chosen.stats.hp) return false;
        }
        return true;
    }

    // 隊員技能重置後只檢查一次；挑戰或離線結算期間延後至主線重啟。
    _queueSkillRouteCheck() {
        this.gameState.pendingSkillRouteCheck = true;
        this.save();
        if (this.gameState.settings?.autoRouteSwitch && !this._towerMode && !this._offlineSimState) this._applyPendingSkillRouteCheck();
    }

    _applyPendingSkillRouteCheck() {
        if (this.gameState?.currentRoute === 'free_hunting') return false;
        if (!this.gameState?.pendingSkillRouteCheck || this._towerMode || this._offlineSimState) return false;
        if (!this.gameState.settings?.autoRouteSwitch) return false;
        delete this.gameState.pendingSkillRouteCheck;
        const current = this.getRoute(this.gameState.currentRoute);
        if (!current?.pokemon?.length) return false;
        const maxEnemyLevel = route => Math.max(...route.pokemon.map(p => this.getMonsterLevelBoost(p.levelRange[1])));
        let battleContext;
        const canFight = route => this._isSkillRecoveryRouteSuitable(route, battleContext ||= this._getSkillRecoveryBattleContext());
        const goal = this._getSkillRecoveryGoal(this.gameState.skillRecoveryRoute || this.gameState.currentRoute);
        if (!goal) return false;
        if (this._isRouteAtOrBeforeRecoveryGoal(current.id, goal.routeId) && canFight(current)) {
            this.gameState.skillRecoveryRoute = goal.routeId;
            this.save();
            return false;
        }
        let suitable = null, easiest = null;
        search: for (const regionKey in REGIONS) {
            if (!this.isRegionUnlocked(regionKey)) continue;
            const region = REGIONS[regionKey];
            for (const route of region.routes) {
                if (route.pokemon?.length) {
                    const maxLevel = maxEnemyLevel(route);
                    const candidate = { routeId: route.id, regionKey, routeName: route.name, regionName: region.name, maxLevel };
                    if (!easiest || maxLevel < easiest.maxLevel) easiest = candidate;
                    if ((!suitable || maxLevel > suitable.maxLevel) && canFight(route)) suitable = candidate;
                }
                if (route.id === goal.routeId) break search;
            }
        }
        const target = suitable || easiest;
        if (!target) return false;
        if (target.routeId === this.gameState.currentRoute) {
            this.gameState.skillRecoveryRoute = goal.routeId;
            this.save();
            return false;
        }
        const previousRegion = this.gameState.currentRegion;
        const previousRecoveryRoute = this.gameState.skillRecoveryRoute;
        this.gameState.skillRecoveryRoute = goal.routeId;
        this.changeRegion(target.regionKey);
        if (!this.changeRoute(target.routeId)) {
            this.changeRegion(previousRegion);
            if (previousRecoveryRoute) this.gameState.skillRecoveryRoute = previousRecoveryRoute;
            else delete this.gameState.skillRecoveryRoute;
            return false;
        }
        if (this.onBattleEvent) this.onBattleEvent('skillResetRouteSwitch', target);
        return true;
    }

    // 自動切換到下一個未完成的地圖（無需徽章，直接開放）
    tryAutoRouteSwitch() {
        if (this.gameState?.currentRoute === 'free_hunting') return null;
        if (!this.gameState.settings?.autoRouteSwitch) return null;
        if (!this.gameState.currentRoute) return null;

        let next;
        let recoveryRoute = this.gameState.skillRecoveryRoute;
        if (recoveryRoute) {
            if (!this.findNextIncompleteRoute()) {
                delete this.gameState.skillRecoveryRoute;
                this.save();
                return null;
            }
            const boundedGoal = this._getSkillRecoveryGoal(recoveryRoute);
            if (!boundedGoal) {
                delete this.gameState.skillRecoveryRoute;
                this.save();
                return null;
            }
            recoveryRoute = boundedGoal.routeId;
            this.gameState.skillRecoveryRoute = recoveryRoute;
            const current = this.getRoute(this.gameState.currentRoute);
            const goal = this.getRoute(recoveryRoute);
            if (!current?.pokemon?.length || !goal?.pokemon?.length) {
                delete this.gameState.skillRecoveryRoute;
                this.save();
                return null;
            }
            const maxEnemyLevel = route => Math.max(...route.pokemon.map(p => this.getMonsterLevelBoost(p.levelRange[1])));
            const currentMax = maxEnemyLevel(current);
            const goalMax = maxEnemyLevel(goal);
            const beyondProgress = !this._isRouteAtOrBeforeRecoveryGoal(current.id, recoveryRoute);
            let battleContext;
            const canFight = route => this._isSkillRecoveryRouteSuitable(route, battleContext ||= this._getSkillRecoveryBattleContext());
            if (this.gameState.currentRoute === recoveryRoute) {
                return null;
            }
            let easiest = null;
            recoverySearch: for (const regionKey in REGIONS) {
                if (!this.isRegionUnlocked(regionKey)) continue;
                const region = REGIONS[regionKey];
                for (const route of region.routes) {
                    if (!route.pokemon?.length) {
                        if (route.id === recoveryRoute) break recoverySearch;
                        continue;
                    }
                    const maxLevel = maxEnemyLevel(route);
                    if (beyondProgress && (!easiest || maxLevel < easiest.maxLevel)) {
                        easiest = { routeId: route.id, regionKey, routeName: route.name, regionName: region.name, maxLevel, skillRecovery: true };
                    }
                    if (route.id === recoveryRoute && canFight(route)) {
                        next = { routeId: route.id, regionKey, routeName: route.name, regionName: region.name, maxLevel, skillRecovery: true };
                        break recoverySearch;
                    }
                    if ((beyondProgress || maxLevel > currentMax) && maxLevel <= goalMax && (!next || maxLevel > next.maxLevel) && canFight(route)) {
                        next = { routeId: route.id, regionKey, routeName: route.name, regionName: region.name, maxLevel, skillRecovery: true };
                    }
                    if (route.id === recoveryRoute) break recoverySearch;
                }
            }
            if (!next && beyondProgress) next = easiest;
            if (!next) return null;
        } else {
            // 平常依完成條件與原有地圖順序切換。
            if (!this._isRouteCompleteByCondition(this.gameState.currentRoute)) return null;
            next = this.findNextIncompleteRoute();
        }
        if (!next) return null; // 全部完成，不切換

        // 切換到新地圖
        this.gameState.currentRoute = next.routeId;
        this.gameState.currentRegion = next.regionKey;
        this.gameState.currentEnemy = null; // 清除當前敵方
        this.resetRateTracker(); // 自動切換地圖時重置速率統計
        this.save();

        return next;
    }

    changeRegion(regionId) {
        this.gameState.currentRegion = regionId;
    }

    // 檢查地區是否已解鎖
    isRegionUnlocked(regionId) {
        const region = REGIONS[regionId];
        if (!region) return false;
        if (!region.unlockCondition) return true; // 無解鎖條件則預設解鎖

        const condition = region.unlockCondition;
        if (condition.type === 'pokedex_complete') {
            // 檢查是否集齊指定範圍的所有寶可夢
            const [start, end] = condition.range;
            for (let id = start; id <= end; id++) {
                if (this.gameState.pokedex[id] !== 'caught') {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    // 獲取地區解鎖進度
    getRegionUnlockProgress(regionId) {
        const region = REGIONS[regionId];
        if (!region || !region.unlockCondition) return { current: 0, total: 0, percent: 100 };

        const condition = region.unlockCondition;
        if (condition.type === 'pokedex_complete') {
            const [start, end] = condition.range;
            let caught = 0;
            const total = end - start + 1;
            for (let id = start; id <= end; id++) {
                if (this.gameState.pokedex[id] === 'caught') {
                    caught++;
                }
            }
            return { current: caught, total, percent: Math.floor(caught / total * 100) };
        }
        return { current: 0, total: 0, percent: 100 };
    }

    // ===================== 圖鑑 =====================
    getPokedexStats() {
        let seen = 0, caught = 0;
        for (const id in this.gameState.pokedex) {
            if (this.gameState.pokedex[id] === 'caught') {
                caught++;
                seen++;
            } else if (this.gameState.pokedex[id] === 'seen') {
                seen++;
            }
        }
        return { seen, caught, total: Object.keys(POKEMON_DATA).length };
    }

    // 按地區獲取圖鑑統計
    getPokedexStatsByRegion(regionId) {
        const regionRanges = {
            kanto: [1, 151],
            johto: [152, 251],
            hoenn: [252, 386],
            sinnoh: [387, 493],
            unova: [494, 649],
            kalos: [650, 721],
            alola: [722, 809],
            galar: [810, 905],
            paldea: [906, 1025],
            mega: [1026, 1073],
        };
        const range = regionRanges[regionId];
        if (!range) return this.getPokedexStats();

        let seen = 0, caught = 0;
        const [start, end] = range;
        for (let id = start; id <= end; id++) {
            if (this.gameState.pokedex[id] === 'caught') {
                caught++;
                seen++;
            } else if (this.gameState.pokedex[id] === 'seen') {
                seen++;
            }
        }
        return { seen, caught, total: end - start + 1 };
    }

    // 切換圖鑑中寶可夢的展示形態（閃光/原始）
    togglePokedexDisplay(pokemonId) {
        if (!this.gameState.shinyDex[pokemonId]) return false;
        
        if (this.gameState.pokedexDisplay[pokemonId] === 'shiny') {
            delete this.gameState.pokedexDisplay[pokemonId]; // 切回原始
        } else {
            this.gameState.pokedexDisplay[pokemonId] = 'shiny'; // 切為閃光
        }
        this.save();
        return true;
    }

    // 獲取寶可夢在圖鑑中應顯示的精靈圖URL
    getPokedexSpriteUrl(pokemonId) {
        if (this.gameState.pokedexDisplay[pokemonId] === 'shiny') {
            return getShinyPokemonSpriteUrl(pokemonId);
        }
        return getPokemonSpriteUrl(pokemonId);
    }

    // 獲取閃光圖鑑統計
    getShinyStats() {
        return Object.keys(this.gameState.shinyDex).length;
    }

    // ===================== 存檔 =====================
    save() {
        if (!this.gameState) return;
        this.gameState.lastSave = Date.now();

        // 儲存當前戰鬥狀態（重新整理頁面後恢復）
        if (this.currentBattle && this.currentBattle.playerCurrentHp > 0) {
            this.gameState.battleHp = {
                playerHp: this.currentBattle.playerCurrentHp,
                playerMaxHp: this.currentBattle.playerMaxHp,
                enemyHp: this.currentBattle.wildCurrentHp,
                playerTimer: this.currentBattle.playerTimer,
                enemyTimer: this.currentBattle.enemyTimer,
            };
        } else {
            delete this.gameState.battleHp;
        }

        try {
            const json = JSON.stringify(this.gameState);
            let dataToSave = json;
            // 使用 LZString 壓縮（相容老存檔：壓縮後以特定字首標記）
            if (typeof LZString !== 'undefined') {
                const compressed = LZString.compressToUTF16(json);
                if (compressed.length < json.length) {
                    dataToSave = 'LZ:' + compressed;
                    console.log(`[存檔] 壓縮 ${json.length} → ${dataToSave.length} 字元（${(1 - dataToSave.length/json.length * 100).toFixed(1)}%）`);
                } else {
                    console.log(`[存檔] 壓縮未獲益，保持原樣 (${json.length})`);
                }
            }
            localStorage.setItem('pokemon_idle_save', dataToSave);
        } catch (e) {
            console.error('儲存失敗:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem('pokemon_idle_save');
            if (!raw) return false;

            let data = raw;
            // 相容：新存檔以 "LZ:" 開頭表示已壓縮，老存檔直接是JSON
            if (raw.startsWith('LZ:')) {
                if (typeof LZString !== 'undefined') {
                    data = LZString.decompressFromUTF16(raw.slice(3));
                    if (!data) {
                        console.error('存檔解壓失敗，資料可能損壞');
                        return false;
                    }
                } else {
                    console.error('LZString 庫未載入，無法讀取壓縮存檔');
                    return false;
                }
            }

            const parsed = JSON.parse(data);
            // 驗證資料完整性
            if (!parsed || !parsed.team || !Array.isArray(parsed.team) || parsed.team.length === 0) {
                console.warn('存檔資料不完整，將重新開始');
                return false;
            }

            // 確保所有必要欄位存在
            if (typeof parsed.activePokemonIndex !== 'number') parsed.activePokemonIndex = 0;
            if (!parsed.pokedex) parsed.pokedex = {};
            if (!parsed.caughtPokemon) parsed.caughtPokemon = {};
            if (!parsed.currentRegion) parsed.currentRegion = 'kanto';
            if (!parsed.currentRoute) parsed.currentRoute = 'kanto_route1';
            if (!parsed.stats) parsed.stats = { totalBattles: 0, totalCatches: 0, totalExp: 0, totalGold: 0, playTime: 0 };
            if (!parsed.settings) parsed.settings = {};
            if (!parsed.shinyDex) parsed.shinyDex = {};
            if (!parsed.pokedexDisplay) parsed.pokedexDisplay = {};
            if (typeof parsed.gold !== 'number') parsed.gold = 0;
            if (!parsed.badges) parsed.badges = {};
            if (!Array.isArray(parsed.gems)) parsed.gems = [];
            if (!parsed.stats.totalGold) parsed.stats.totalGold = 0;
            // 樹果系統相容
            if (!Array.isArray(parsed.berryPlots)) parsed.berryPlots = [];
            if (!parsed.berryBag) parsed.berryBag = {};
            if (!parsed.berryFed) parsed.berryFed = {};
            // 技能系統相容：為舊存檔的寶可夢補充skillLevel欄位
            if (parsed.caughtPokemon) {
                for (const id in parsed.caughtPokemon) {
                    if (typeof parsed.caughtPokemon[id].skillLevel !== 'number') {
                        parsed.caughtPokemon[id].skillLevel = 0;
                    }
                }
            }
            // 天賦系統相容
            if (!parsed.talents) parsed.talents = {};
            // 挑戰塔系統相容
            if (!parsed.tower) parsed.tower = { currentFloor: 1, highestFloor: 0, enemies: null, currentEnemyIndex: 0, inBattle: false };
            if (parsed.tower.replayPrevious) {
                Object.assign(parsed.tower, parsed.tower.replayPrevious);
                delete parsed.tower.replayPrevious;
            }
            if (parsed.tower.inBattle) {
                // 重新整理頁面時如果正在挑戰中，重置為未挑戰狀態（不丟失層數進度）
                parsed.tower.inBattle = false;
                parsed.tower.currentEnemyIndex = 0;
            }
            // 確保activePokemonIndex在範圍內
            if (parsed.activePokemonIndex >= parsed.team.length) parsed.activePokemonIndex = 0;

            this.gameState = parsed;
            this.repairHuntingLocation();
            // 遷移修復：舊版 generateUID 批次購買時產生重複uid
            this._migrateFixGemUids();
            this._reconcileCompletedBadges();
            return true;
        } catch (e) {
            console.error('載入失敗:', e);
        }
        return false;
    }

    // GZIP 位元組以每字元 14 位元編碼，減少複製貼上的文字長度。
    _encodeSaveBytes(bytes) {
        let result = '';
        let buffer = 0;
        let bits = 0;
        for (const byte of bytes) {
            buffer = (buffer << 8) | byte;
            bits += 8;
            while (bits >= 14) {
                bits -= 14;
                result += String.fromCharCode(0x4e00 + ((buffer >>> bits) & 0x3fff));
                buffer &= (1 << bits) - 1;
            }
        }
        if (bits > 0) result += String.fromCharCode(0x4e00 + (buffer << (14 - bits)));
        return `GZ2:${bytes.length}:${result}`;
    }

    _decodeSaveBytes(input) {
        const match = /^GZ2:(\d+):([\u4e00-\u8dff]*)$/.exec(input);
        if (!match) throw new Error('存檔編碼無效');
        const length = Number(match[1]);
        if (!Number.isSafeInteger(length) || Math.ceil(length * 8 / 14) !== match[2].length) {
            throw new Error('存檔長度無效');
        }
        const bytes = new Uint8Array(length);
        let buffer = 0;
        let bits = 0;
        let index = 0;
        for (const char of match[2]) {
            buffer = (buffer << 14) | (char.charCodeAt(0) - 0x4e00);
            bits += 14;
            while (bits >= 8 && index < length) {
                bits -= 8;
                bytes[index++] = (buffer >>> bits) & 0xff;
                buffer &= (1 << bits) - 1;
            }
        }
        if (buffer !== 0) throw new Error('存檔填充無效');
        return bytes;
    }

    // 匯出使用 GZIP，舊瀏覽器則維持原有格式。
    async exportSave() {
        if (!this.gameState) return '';
        this.save();
        const json = JSON.stringify(this.gameState);
        if (typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined') {
            const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
            const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
            return this._encodeSaveBytes(bytes);
        }
        const payload = (typeof LZString !== 'undefined')
            ? 'LZ:' + LZString.compressToUTF16(json)
            : json;
        return btoa(unescape(encodeURIComponent(payload)));
    }

    async importSave(dataStr) {
        try {
            const input = dataStr.trim();
            let dataStr2;
            if (input.startsWith('GZ1:') || input.startsWith('GZ2:')) {
                if (typeof DecompressionStream === 'undefined') throw new Error('瀏覽器不支援 GZIP 存檔');
                let bytes;
                if (input.startsWith('GZ2:')) {
                    bytes = this._decodeSaveBytes(input);
                } else {
                    const raw = atob(input.slice(4));
                    bytes = Uint8Array.from(raw, char => char.charCodeAt(0));
                }
                const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
                dataStr2 = await new Response(stream).text();
            } else {
                const raw = atob(input);
                let decoded;
                try {
                    decoded = decodeURIComponent(escape(raw));
                } catch (_) {
                    decoded = raw;
                }
                // 相容舊版壓縮與未壓縮存檔
                dataStr2 = decoded;
                if (decoded.startsWith('LZ:')) {
                    if (typeof LZString === 'undefined') throw new Error('LZString 庫未載入');
                    dataStr2 = LZString.decompressFromUTF16(decoded.slice(3));
                    if (!dataStr2) throw new Error('存檔解壓失敗');
                }
            }
            const data = JSON.parse(dataStr2);

            // 基本驗證
            if (!data.team || !Array.isArray(data.team) || data.team.length === 0) {
                throw new Error('無效的存檔資料');
            }

            this.gameState = data;
            this._towerMode = false;
            this._towerFaintedIds = null;
            this._towerHpById = null;
            if (this.gameState.tower?.replayPrevious) this._restoreTowerReplay();
            if (this.gameState.tower?.inBattle) {
                this.gameState.tower.inBattle = false;
                this.gameState.tower.currentEnemyIndex = 0;
            }
            this.repairHuntingLocation();
            // 遷移修復：寶石重複uid（舊generateUID方案批次購買時碰撞）
            this._migrateFixGemUids();
            this._reconcileCompletedBadges();
            // 記錄匯入前的lastSave，用於離線結算
            this._importedLastSave = this.gameState.lastSave || null;
            this.save();
            return true;
        } catch (e) {
            console.error('匯入失敗:', e);
            return false;
        }
    }

    deleteSave() {
        localStorage.removeItem('pokemon_idle_save');
        this.gameState = null;
        this.currentBattle = null;
    }

    startAutoSave() {
        if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, 30000); // 每30秒自動儲存
    }

    // ===================== 經驗條資訊 =====================
    getExpProgress(pokemonId) {
        const storedData = this.getStoredData(pokemonId);
        if (!storedData) return { current: 0, needed: 1, percent: 0 };

        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return { current: 0, needed: 1, percent: 0 };

        const currentLevelExp = getExpForLevel(baseData.expGroup, storedData.level);
        const nextLevelExp = getExpForLevel(baseData.expGroup, storedData.level + 1);
        const expInLevel = storedData.exp - currentLevelExp;
        const expNeeded = nextLevelExp - currentLevelExp;
        const percent = Math.min(100, Math.floor(expInLevel / expNeeded * 100));

        return { current: expInLevel, needed: expNeeded, percent };
    }

    // ===================== 徽章系統 =====================
    // 補發已完成圖鑑但舊存檔未記錄的徽章，不覆蓋現有寶石。
    _reconcileCompletedBadges() {
        this.gameState.badges = this.gameState.badges || {};
        if (!this.gameState.pokedex) return;
        for (const regionId in BADGE_DATA) {
            if (this.isRegionCompleted(regionId) && !this.hasBadge(regionId)) {
                const badge = this.gameState.badges[regionId];
                this.gameState.badges[regionId] = badge ? { ...badge, unlocked: true } : { unlocked: true, gem: null };
            }
        }
    }

    // 檢查某地區是否通關（所有寶可夢已捕獲）
    isRegionCompleted(regionId) {
        const regionRanges = { kanto: [1, 151], johto: [152, 251], hoenn: [252, 386], sinnoh: [387, 493], unova: [494, 649], kalos: [650, 721], alola: [722, 809], galar: [810, 905], paldea: [906, 1025], mega: [1026, 1073] };
        const range = regionRanges[regionId];
        if (!range) return false;
        const [start, end] = range;
        for (let id = start; id <= end; id++) {
            if (this.gameState.pokedex[id] !== 'caught') return false;
        }
        return true;
    }

    // 獲取徽章狀態
    hasBadge(regionId) {
        return !!this.gameState.badges[regionId]?.unlocked;
    }

    // 透過 effectType 檢查是否擁有對應效果的徽章
    hasBadgeEffect(effectType) {
        for (const regionId in BADGE_DATA) {
            if (BADGE_DATA[regionId].effectType === effectType && this.hasBadge(regionId)) {
                return true;
            }
        }
        return false;
    }

    // 透過 effectType 獲取對應效果的 value（未擁有返回 null）
    getBadgeEffectValue(effectType) {
        for (const regionId in BADGE_DATA) {
            if (BADGE_DATA[regionId].effectType === effectType && this.hasBadge(regionId)) {
                return BADGE_DATA[regionId].value;
            }
        }
        return null;
    }

    // 嘗試解鎖徽章
    tryUnlockBadge(regionId) {
        if (this.hasBadge(regionId)) return false;
        if (!this.isRegionCompleted(regionId)) return false;
        this.gameState.badges[regionId] = { unlocked: true, gem: null };
        this.save();
        return true;
    }

    // 檢查金幣系統是否解鎖（擁有解鎖金幣效果的徽章）
    isGoldUnlocked() {
        return this.hasBadgeEffect('unlock_gold');
    }

    // 計算金幣掉落
    calculateGoldDrop(wildPokemon) {
        if (!this.isGoldUnlocked()) return 0;
        // 基礎金幣 = 等級開根號 * 2
        let gold = Math.floor(Math.sqrt(wildPokemon.level) * 2);
        // 金幣加成徽章
        const goldBonusValue = this.getBadgeEffectValue('gold_bonus');
        if (goldBonusValue !== null) {
            gold = Math.floor(gold * (1 + goldBonusValue));
        }
        // 天賦：金幣額外增加
        const talentGoldBonus = this.getTalentValue('gold_bonus');
        if (talentGoldBonus > 0) {
            gold = Math.floor(gold * (1 + talentGoldBonus / 100));
        }
        // 挑戰塔加成：通關層數%
        const towerGoldBonus = this.getTowerBonus();
        if (towerGoldBonus > 0) {
            gold = Math.floor(gold * (1 + towerGoldBonus / 100));
        }
        return Math.max(1, gold);
    }

    // 新增金幣
    addGold(amount) {
        this.gameState.gold += amount;
        this.gameState.stats.totalGold += amount;
    }

    // ===================== 寶石系統 =====================
    getGemQualityById(qualityId) {
        return GEM_QUALITIES.find(q => q.id === qualityId) || null;
    }

    getNextGemQualityId(qualityId) {
        const idx = GEM_QUALITIES.findIndex(q => q.id === qualityId);
        if (idx === -1 || idx >= GEM_QUALITIES.length - 1) return null;
        return GEM_QUALITIES[idx + 1].id;
    }

    // 按指定品質生成寶石
    generateGemByQuality(qualityId) {
        const quality = this.getGemQualityById(qualityId);
        if (!quality) return null;

        // 寶石屬性值偏向更高值（gem_value_bonus 效果）
        const gemValueBonusValue = this.getBadgeEffectValue('gem_value_bonus');
        const kalosBias = gemValueBonusValue !== null ? gemValueBonusValue : 0;

        // 天賦：寶石屬性出現機率偏好
        const talentGemAttrLevel = this.getTalentLevel('gem_attr_boost');
        const talentGemAttrChoice = this.getTalentGemAttrChoice();

        const attrs = [];
        for (let i = 0; i < quality.attrCount; i++) {
            let attrTemplate;
            // 天賦屬性偏好：增加選中屬性的出現機率
            if (talentGemAttrLevel > 0 && talentGemAttrChoice) {
                const baseWeight = 100; // 每個屬性基礎權重100
                const bonusWeight = talentGemAttrLevel; // 每級+1%的額外權重
                const totalWeight = GEM_ATTRIBUTES.length * baseWeight + bonusWeight;
                let roll = Math.random() * totalWeight;
                attrTemplate = null;
                for (const attr of GEM_ATTRIBUTES) {
                    const w = baseWeight + (attr.id === talentGemAttrChoice ? bonusWeight : 0);
                    roll -= w;
                    if (roll <= 0) { attrTemplate = attr; break; }
                }
                if (!attrTemplate) attrTemplate = GEM_ATTRIBUTES[GEM_ATTRIBUTES.length - 1];
            } else {
                attrTemplate = GEM_ATTRIBUTES[Math.floor(Math.random() * GEM_ATTRIBUTES.length)];
            }
            let value;
            if (kalosBias > 0) {
                // 生成兩次隨機值取較大值（biased random），機率偏向高值
                const roll1 = Math.random();
                const roll2 = Math.random();
                const biasedRoll = Math.max(roll1, roll2);
                value = Math.floor(biasedRoll * (attrTemplate.max - attrTemplate.min + 1)) + attrTemplate.min;
            } else {
                value = Math.floor(Math.random() * (attrTemplate.max - attrTemplate.min + 1)) + attrTemplate.min;
            }
            attrs.push({ id: attrTemplate.id, name: attrTemplate.name, value, unit: attrTemplate.unit, icon: attrTemplate.icon });
        }

        return {
            uid: this.generateUID(),
            quality: quality.id,
            qualityName: quality.name,
            qualityColor: quality.color,
            attrs,
            locked: false,
        };
    }

    // 生成隨機寶石
    generateGem() {
        // 按權重隨機品質（天賦：降低普通寶石機率）
        let qualities = GEM_QUALITIES.map(q => ({ ...q }));
        const talentGemReduce = this.getTalentValue('gem_common_reduce');
        if (talentGemReduce > 0) {
            const commonQ = qualities.find(q => q.id === 'common');
            if (commonQ) {
                commonQ.weight = Math.max(0, commonQ.weight * (1 - talentGemReduce / 100));
            }
        }
        const totalWeight = qualities.reduce((s, q) => s + q.weight, 0);
        let rand = Math.random() * totalWeight;
        let quality = qualities[0];
        for (const q of qualities) {
            rand -= q.weight;
            if (rand <= 0) { quality = q; break; }
        }
        return this.generateGemByQuality(quality.id);
    }


    // 購買寶石
    buyGem() {
        if (!this.isGoldUnlocked()) return { success: false, message: '尚未解鎖金幣系統' };
        if (this.gameState.gems.length >= GEM_BAG_MAX) return { success: false, message: `揹包已滿（最多${GEM_BAG_MAX}個）` };

        // 隨機品質價格（購買固定價格1000金幣，獲得隨機品質寶石）
        const price = 1000;
        if (this.gameState.gold < price) return { success: false, message: `金幣不足（需要 ${price}）` };

        this.gameState.gold -= price;
        const gem = this.generateGem();
        // 新購寶石標記：用於揹包內"NEW"提醒，檢視後由UI清除
        gem.isNew = true;
        this.gameState.gems.push(gem);
        this.save();
        return { success: true, gem, price };
    }

    // 批次購買寶石：直到金幣不足或揹包滿
    buyAllGems() {
        if (!this.isGoldUnlocked()) return { success: false, message: '尚未解鎖金幣系統' };
        if (this.gameState.gems.length >= GEM_BAG_MAX) return { success: false, message: `揹包已滿（最多${GEM_BAG_MAX}個）` };

        const price = 1000;
        const bagRemain = GEM_BAG_MAX - this.gameState.gems.length;
        const affordable = Math.floor(this.gameState.gold / price);
        const count = Math.min(bagRemain, affordable);

        if (count <= 0) {
            return { success: false, message: `金幣不足（需要 ${price}）` };
        }

        for (let i = 0; i < count; i++) {
            this.gameState.gold -= price;
            const gem = this.generateGem();
            gem.isNew = true;
            this.gameState.gems.push(gem);
        }

        this.save();
        return {
            success: true,
            count,
            spent: count * price,
            reason: this.gameState.gems.length >= GEM_BAG_MAX ? 'bag_full' : 'gold_empty',
        };
    }


    // 鑲嵌寶石到徽章
    equipGem(regionId, gemUid) {
        const badge = this.gameState.badges[regionId];
        if (!badge || !badge.unlocked) return { success: false, message: '徽章未解鎖' };

        const gemIndex = this.gameState.gems.findIndex(g => g.uid === gemUid);
        if (gemIndex === -1) return { success: false, message: '寶石不存在' };

        // 如果徽章已有寶石，放回揹包
        if (badge.gem) {
            if (this.gameState.gems.length >= GEM_BAG_MAX) {
                return { success: false, message: '揹包已滿，無法卸下當前寶石' };
            }
            this.gameState.gems.push(badge.gem);
        }

        // 從揹包移除並裝到徽章
        const gem = this.gameState.gems.splice(gemIndex, 1)[0];
        badge.gem = gem;
        this.save();
        return { success: true };
    }

    // 卸下徽章上的寶石
    unequipGem(regionId) {
        const badge = this.gameState.badges[regionId];
        if (!badge || !badge.unlocked || !badge.gem) return { success: false, message: '沒有可卸下的寶石' };
        if (this.gameState.gems.length >= GEM_BAG_MAX) return { success: false, message: '揹包已滿' };

        this.gameState.gems.push(badge.gem);
        badge.gem = null;
        this.save();
        return { success: true };
    }

    // 切換寶石鎖定狀態
    toggleGemLock(gemUid) {
        const gem = this.gameState.gems.find(g => g.uid === gemUid);
        if (!gem) return { success: false, message: '寶石不存在' };
        gem.locked = !gem.locked;
        this.save();
        return { success: true, locked: gem.locked, gem };
    }

    // 丟棄揹包中的寶石
    discardGem(gemUid) {
        const idx = this.gameState.gems.findIndex(g => g.uid === gemUid);
        if (idx === -1) return { success: false, message: '寶石不存在' };
        if (this.gameState.gems[idx].locked) return { success: false, message: '寶石已鎖定，無法丟棄' };
        this.gameState.gems.splice(idx, 1);
        this.save();
        return { success: true };
    }

    // 寶石合成：10個同品質寶石 => 1個高品質寶石（神話不可繼續）
    synthesizeGems(sourceQuality, gemUids) {
        const sourceInfo = this.getGemQualityById(sourceQuality);
        if (!sourceInfo) return { success: false, message: '寶石品質不存在' };

        const targetQuality = this.getNextGemQualityId(sourceQuality);
        if (!targetQuality) return { success: false, message: '神話寶石無法繼續合成' };

        if (!Array.isArray(gemUids)) return { success: false, message: '請選擇要合成的寶石' };

        const sourceCount = this.gameState.gems.filter(g => g.quality === sourceQuality && !g.locked).length;
        if (sourceCount < 10) {
            return { success: false, message: `缺少可合成的${sourceInfo.name}寶石：需要10個，當前${sourceCount}個（未鎖定）` };
        }

        const uniqueUids = [...new Set(gemUids)];
        if (uniqueUids.length !== 10) {
            return { success: false, message: `需要選擇10個${sourceInfo.name}寶石，當前選擇${uniqueUids.length}個` };
        }

        for (const uid of uniqueUids) {
            const gem = this.gameState.gems.find(g => g.uid === uid);
            if (!gem) return { success: false, message: '所選寶石不存在或已變化，請重試' };
            if (gem.quality !== sourceQuality) {
                return { success: false, message: `所選寶石中包含非${sourceInfo.name}品質` };
            }
            if (gem.locked) {
                return { success: false, message: '所選寶石包含已鎖定寶石，無法合成' };
            }
        }

        const removeSet = new Set(uniqueUids);
        this.gameState.gems = this.gameState.gems.filter(g => !removeSet.has(g.uid));

        const newGem = this.generateGemByQuality(targetQuality);
        if (!newGem) return { success: false, message: '生成目標品質寶石失敗' };

        // 合成產出的新寶石也標記為NEW
        newGem.isNew = true;
        this.gameState.gems.push(newGem);
        this.save();
        return { success: true, newGem, sourceQuality, targetQuality };
    }

    // 重鑄永恆寶石：2顆永恆寶石 => 1顆新的永恆寶石（重新隨機屬性）
    reforgeEternalGem(gemUids) {
        if (!Array.isArray(gemUids)) return { success: false, message: '請選擇要重鑄的寶石' };

        const uniqueUids = [...new Set(gemUids)];
        if (uniqueUids.length !== 2) {
            return { success: false, message: `需要選擇2個永恆寶石，當前選擇${uniqueUids.length}個` };
        }

        // 驗證每顆寶石
        for (const uid of uniqueUids) {
            const gem = this.gameState.gems.find(g => g.uid === uid);
            if (!gem) return { success: false, message: '所選寶石不存在或已變化，請重試' };
            if (gem.quality !== 'eternal') {
                return { success: false, message: '所選寶石包含非永恆品質' };
            }
            if (gem.locked) {
                return { success: false, message: '所選寶石包含已鎖定寶石，無法重鑄' };
            }
        }

        // 移除2顆舊寶石
        const removeSet = new Set(uniqueUids);
        this.gameState.gems = this.gameState.gems.filter(g => !removeSet.has(g.uid));

        // 生成1顆新的永恆寶石
        const newGem = this.generateGemByQuality('eternal');
        if (!newGem) return { success: false, message: '生成永恆寶石失敗' };

        newGem.isNew = true;
        this.gameState.gems.push(newGem);
        this.save();
        return { success: true, newGem };
    }

    // 一鍵合成：從低到高依次合成所有能合成的寶石
    // skipSave=true 時跳過每次合成的單獨存檔（用於自動合成永恆場景，由呼叫方統一存檔）
    synthesizeAllGems(skipSave = false) {
        const qualityOrder = ['common', 'magic', 'rare', 'epic', 'mythic', 'legendary'];
        let totalSynthesized = 0;
        const results = [];
        let lastError = null;

        if (skipSave) {
            // === 快速模式：內聯合成邏輯，跳過冗餘驗證和逐次save ===
            // 按品質預分組，避免反覆 filter
            const groups = {};
            for (const q of qualityOrder) groups[q] = [];
            for (const g of this.gameState.gems) {
                if (!g.locked && groups[g.quality]) groups[g.quality].push(g);
            }

            for (const sourceQuality of qualityOrder) {
                const targetQuality = this.getNextGemQualityId(sourceQuality);
                if (!targetQuality) continue;

                let candidates = groups[sourceQuality];
                while (candidates.length >= 10) {
                    // 取前10個的uid集合
                    const toRemove = new Set(candidates.slice(0, 10).map(g => g.uid));
                    // 從gems陣列中移除
                    this.gameState.gems = this.gameState.gems.filter(g => !toRemove.has(g.uid));
                    // 生成新寶石
                    const newGem = this.generateGemByQuality(targetQuality);
                    if (!newGem) { lastError = '生成目標品質寶石失敗'; break; }
                    newGem.isNew = true;
                    this.gameState.gems.push(newGem);
                    totalSynthesized++;
                    results.push({ sourceQuality, targetQuality, newGem });
                    // 更新分組：移除已消耗的10個，新寶石加入目標組
                    candidates = candidates.slice(10);
                    groups[sourceQuality] = candidates;
                    if (!newGem.locked && groups[targetQuality]) groups[targetQuality].push(newGem);
                }
            }
        } else {
            // === 普通模式：保持原有邏輯（UI手動合成用） ===
            for (const sourceQuality of qualityOrder) {
                const targetQuality = this.getNextGemQualityId(sourceQuality);
                if (!targetQuality) continue;

                while (true) {
                    const candidates = this.gameState.gems.filter(g => g.quality === sourceQuality && !g.locked);
                    if (candidates.length < 10) break;

                    const toMerge = candidates.slice(0, 10);
                    const uids = toMerge.map(g => g.uid);

                    try {
                        const result = this.synthesizeGems(sourceQuality, uids);
                        if (!result.success) { lastError = result.message; break; }
                        totalSynthesized++;
                        results.push({
                            sourceQuality: sourceQuality,
                            targetQuality: targetQuality,
                            newGem: result.newGem,
                        });
                    } catch (e) {
                        lastError = '異常: ' + e.message;
                        console.error('synthesizeAllGems error:', e);
                        break;
                    }
                }
            }
        }

        if (totalSynthesized === 0) {
            const qualityNames = { common: '普通', magic: '魔法', rare: '稀有', epic: '史詩', mythic: '神話', legendary: '傳說' };
            const diag = qualityOrder.map(q => {
                const total = this.gameState.gems.filter(g => g.quality === q).length;
                const unlocked = this.gameState.gems.filter(g => g.quality === q && !g.locked).length;
                return `${qualityNames[q]}:${unlocked}/${total}`;
            }).join(' | ');
            return { success: false, message: `沒有足夠的寶石可以合成（需要同品質10個未鎖定）。當前：${diag}${lastError ? ' | 錯誤:' + lastError : ''}` };
        }

        return { success: true, count: totalSynthesized, results };
    }

    // ==================== 一鍵購買併合成永恆寶石（分步非同步）====================

    // 一鍵合成永恆的執行狀態（用於UI進度回撥）
    _autoEternalState = null;

    // 初始化一鍵合成永恆的狀態
    startAutoEternal() {
        if (!this.isGoldUnlocked()) return { success: false, message: '尚未解鎖金幣系統' };
        const price = 1000;
        if (this.gameState.gold < price) return { success: false, message: '金幣不足' };

        const startEternalCount = this.gameState.gems.filter(g => g.quality === 'eternal').length;
        this._autoEternalState = {
            running: true,
            startEternalCount,
            totalBought: 0,
            totalSpent: 0,
            totalSynthesized: 0,
            rounds: 0,
            price,
        };
        return { success: true };
    }

    // 執行一輪：購買填滿揹包 + 合成一次。返回本輪結果和累計狀態
    autoBuySynthStep() {
        if (!this._autoEternalState || !this._autoEternalState.running) {
            return { done: true, reason: 'stopped', ...this._getAutoEternalResult('stopped') };
        }

        const s = this._autoEternalState;
        const price = s.price;
        s.rounds++;

        // 步驟1：購買填滿揹包
        const bagRemain = GEM_BAG_MAX - this.gameState.gems.length;
        const affordable = Math.floor(this.gameState.gold / price);
        const buyCount = Math.min(bagRemain, affordable);

        if (buyCount > 0) {
            for (let i = 0; i < buyCount; i++) {
                this.gameState.gold -= price;
                const gem = this.generateGem();
                gem.isNew = true;
                this.gameState.gems.push(gem);
            }
            s.totalBought += buyCount;
            s.totalSpent += buyCount * price;
        }

        // 步驟2：一鍵合成（快速模式：跳過冗餘驗證和逐次save）
        const synthResult = this.synthesizeAllGems(true);
        if (synthResult.success) {
            s.totalSynthesized += synthResult.count;
        }

        // 用 Map 一次遍歷統計品質計數（替代多次 filter）
        const qualityCounts = {};
        let currentEternalCount = 0;
        for (const g of this.gameState.gems) {
            if (g.quality === 'eternal') {
                currentEternalCount++;
            } else if (!g.locked) {
                qualityCounts[g.quality] = (qualityCounts[g.quality] || 0) + 1;
            }
        }

        // 檢查是否產生了新的永恆寶石
        if (currentEternalCount > s.startEternalCount) {
            const newEternalCount = currentEternalCount - s.startEternalCount;
            this.save();
            this._autoEternalState.running = false;
            return { done: true, reason: 'eternal_found', newEternals: newEternalCount, ...this._getAutoEternalResult('eternal_found', newEternalCount) };
        }

        // 檢查是否還能繼續（用 Map 計數判斷，O(n)→O(1)）
        const canBuyMore = this.gameState.gold >= price && this.gameState.gems.length < GEM_BAG_MAX;
        const canSynthMore = Object.values(qualityCounts).some(count => count >= 10);

        if (!canBuyMore && !canSynthMore) {
            this.save();
            this._autoEternalState.running = false;
            const endReason = this.gameState.gold < price ? 'gold_empty' : 'bag_full';
            return { done: true, reason: endReason, ...this._getAutoEternalResult(endReason) };
        }

        // 還在繼續中
        return { done: false, rounds: s.rounds, totalBought: s.totalBought, totalSpent: s.totalSpent, totalSynthesized: s.totalSynthesized };
    }

    // 停止一鍵合成永恆
    stopAutoEternal() {
        if (this._autoEternalState) {
            this._autoEternalState.running = false;
        }
    }

    // 獲取最終結果
    _getAutoEternalResult(reason, newEternals = 0) {
        const s = this._autoEternalState || {};
        return {
            success: reason !== 'stopped',
            bought: s.totalBought || 0,
            spent: s.totalSpent || 0,
            synthesized: s.totalSynthesized || 0,
            newEternals,
            rounds: s.rounds || 0,
            reason,
        };
    }
    getBattleGemBonuses() {
        const bonuses = this.getGemBonuses();
        if (!this._towerMode) return bonuses;
        const factor = this.getTowerBonusFactors().gem;
        return Object.fromEntries(Object.entries(bonuses).map(([id, value]) => [id, value * factor]));
    }

    getGemBonuses() {
        const bonuses = {};
        for (const attr of GEM_ATTRIBUTES) {
            bonuses[attr.id] = 0;
        }
        for (const regionId in this.gameState.badges) {
            const badge = this.gameState.badges[regionId];
            if (badge?.unlocked && badge.gem) {
                for (const attr of badge.gem.attrs) {
                    bonuses[attr.id] = (bonuses[attr.id] || 0) + attr.value;
                }
            }
        }
        return bonuses;
    }

    // ===================== 技能系統 =====================
    // 檢查技能系統是否解鎖（合眾地區通關）
    isSkillUnlocked() {
        return this.isRegionCompleted('unova');
    }

    // 自動更換最優寶可夢：計算隊伍中對指定敵人預估傷害最高的成員索引
    // 支援一擊必殺策略：fastest(速度最快) / lowest_level(等級最低) / no_change(不改變)
    getBestTeamMemberForEnemy(wildPokemon) {
        if (!this.gameState.team || this.gameState.team.length <= 1) return -1;

        const wildTypes = POKEMON_DATA[wildPokemon.id]?.types || [];
        const enemyStats = this.calculateStats(wildPokemon);
        const enemyHp = enemyStats.hp;
        const oneShotStrategy = this.gameState.settings?.oneShotStrategy || 'fastest';

        // 收集每隻隊友的預估資料
        const candidates = [];

        for (let i = 0; i < this.gameState.team.length; i++) {
            const pokemonId = this.gameState.team[i];
            if (this._towerMode && this._towerFaintedIds?.has(pokemonId)) continue;
            const pokemon = this.createPokemon(pokemonId, true);
            if (!pokemon) continue;

            const stats = this.calculateBattleStats(i);
            if (!stats) continue;

            const playerTypes = POKEMON_DATA[pokemonId]?.types || [];

            // 獲取最優技能威力（選對敵人剋制最強的技能）
            let skillPower = 0;
            const skillInfo = this.getSkillForPokemon(pokemonId);
            if (skillInfo && skillInfo.skills.length > 0) {
                let bestSkill = skillInfo.skills[0];
                if (skillInfo.skills.length > 1) {
                    let bestMult = 0;
                    for (const sk of skillInfo.skills) {
                        const eff = getBestTypeEffectiveness([sk.type], wildTypes);
                        if (eff.multiplier > bestMult || bestMult === 0) {
                            bestMult = eff.multiplier;
                            bestSkill = sk;
                        }
                    }
                }
                skillPower = bestSkill.power;
            }

            const power = skillPower > 0 ? skillPower : 50;

            // 使用與 calculateDamage 一致的公式預估單次傷害
            const baseDmg = Math.floor(((2 * pokemon.level / 5 + 2) * power * stats.attack / enemyStats.defense) / 50) + 2;
            const typeResult = getBestTypeEffectiveness(playerTypes, wildTypes);
            const typeMult = typeResult.multiplier;
            const estimatedDmg = Math.floor(baseDmg * typeMult);
            // 考慮傷害波動最低值(85%)來判定一擊必殺，避免因波動導致需要兩次攻擊
            const minDmg = Math.floor(estimatedDmg * 0.85);

            const atkInterval = this.getAttackInterval(stats.speed);
            const canOneShot = minDmg >= enemyHp;
            // DPS 分數 = 單次傷害 / 攻擊間隔
            const dps = estimatedDmg / atkInterval;

            candidates.push({ index: i, estimatedDmg, atkInterval, canOneShot, dps, level: pokemon.level });
        }

        if (candidates.length === 0) return -1;

        // 一擊必殺策略為"不改變"時：如果當前出戰寶可夢能一擊，則不切換
        if (oneShotStrategy === 'no_change') {
            const currentCandidate = candidates.find(c => c.index === this.gameState.activePokemonIndex);
            if (currentCandidate && currentCandidate.canOneShot) {
                return this.gameState.activePokemonIndex;
            }
        }

        // 排序策略
        candidates.sort((a, b) => {
            // 能一擊的排在前面
            if (a.canOneShot && !b.canOneShot) return -1;
            if (!a.canOneShot && b.canOneShot) return 1;
            // 都能一擊擊殺 → 根據策略選擇
            if (a.canOneShot && b.canOneShot) {
                if (oneShotStrategy === 'lowest_level') {
                    // 等級低的優先（練級）
                    return a.level - b.level;
                }
                // 預設 fastest：攻擊間隔短（攻速快）的優先
                return a.atkInterval - b.atkInterval;
            }
            // 都不能一擊擊殺 → DPS 高的優先
            return b.dps - a.dps;
        });

        return candidates[0].index;
    }

    // 獲取寶可夢當前技能資訊（根據屬性和技能等級）
    // 返回: { skills: [{ type, name, power }], skillLevel } 或 null
    getSkillForPokemon(pokemonId) {
        const storedData = this.gameState.caughtPokemon[pokemonId];
        if (!storedData || !storedData.skillLevel || storedData.skillLevel <= 0) return null;

        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return null;

        const skillLevel = storedData.skillLevel;
        const types = baseData.types || [];
        const skills = [];

        for (const type of types) {
            const typeSkills = SKILL_DATA[type];
            if (typeSkills) {
                const skill = typeSkills.find(s => s.level === skillLevel);
                if (skill) {
                    skills.push({ type, name: skill.name, power: skill.power });
                }
            }
        }

        return { skills, skillLevel };
    }

    // 每滿 1000 級增加 1 級技能；等級與經驗重置。
    upgradeSkill(pokemonId) {
        if (this._towerMode) return { success: false, message: '對戰塔挑戰期間無法升級技能' };
        if (!this.isSkillUnlocked()) return { success: false, message: '技能系統尚未解鎖' };

        const storedData = this.gameState.caughtPokemon[pokemonId];
        if (!storedData) return { success: false, message: '未捕獲該寶可夢' };

        const currentSkillLevel = storedData.skillLevel || 0;
        if (currentSkillLevel >= MAX_SKILL_LEVEL) return { success: false, message: '技能等級已達上限' };
        if (storedData.level < SKILL_LEVEL_REQUIREMENT) return { success: false, message: `等級需達到 ${SKILL_LEVEL_REQUIREMENT} 級` };

        const baseData = POKEMON_DATA[pokemonId];
        if (!baseData) return { success: false, message: '無效的寶可夢' };

        const oldLevel = storedData.level;
        const wasInTeam = this.gameState.team.includes(pokemonId);

        const skillGain = Math.min(MAX_SKILL_LEVEL - currentSkillLevel, Math.floor(oldLevel / SKILL_LEVEL_REQUIREMENT));
        storedData.level = 1;
        storedData.exp = 0;
        storedData.skillLevel = currentSkillLevel + skillGain;

        // 檢查進化（因為等級變化可能觸發）
        this.checkEvolution(pokemonId);

        // 如果在隊伍中，需要重新整理戰鬥狀態
        const teamIndex = this.gameState.team.indexOf(pokemonId);
        if (this.currentBattle) {
            // 重新計算戰鬥屬性
            const newPlayerStats = this.calculateBattleStats(this.gameState.activePokemonIndex);
            if (newPlayerStats) {
                const hpRatio = this.currentBattle.playerMaxHp > 0
                    ? this.currentBattle.playerCurrentHp / this.currentBattle.playerMaxHp : 1;
                this.currentBattle.playerStats = newPlayerStats;
                this.currentBattle.playerMaxHp = newPlayerStats.hp;
                this.currentBattle.playerCurrentHp = teamIndex === this.gameState.activePokemonIndex
                    ? newPlayerStats.hp : Math.min(newPlayerStats.hp, Math.ceil(newPlayerStats.hp * hpRatio));
                this.currentBattle.playerNextAttack = this.getAttackInterval(newPlayerStats.speed);
            }
        }

        this.save();
        if (wasInTeam) this._queueSkillRouteCheck();
        return {
            success: true,
            newSkillLevel: storedData.skillLevel,
            newLevel: storedData.level,
            oldLevel: oldLevel,
            skillGain,
        };
    }

    // 一鍵升級所有可升級技能的寶可夢
    upgradeAllSkills() {
        if (this._towerMode) return { success: false, message: '對戰塔挑戰期間無法升級技能' };
        if (!this.isSkillUnlocked()) return { success: false, message: '技能系統尚未解鎖' };

        const results = [];
        let resetTeamMember = false;
        let resetActiveMember = false;
        for (const pokemonId in this.gameState.caughtPokemon) {
            const storedData = this.gameState.caughtPokemon[pokemonId];
            if (!storedData) continue;

            const currentSkillLevel = storedData.skillLevel || 0;
            if (currentSkillLevel >= MAX_SKILL_LEVEL) continue;
            if (storedData.level < SKILL_LEVEL_REQUIREMENT) continue;

            const baseData = POKEMON_DATA[pokemonId];
            if (!baseData) continue;

            const oldLevel = storedData.level;
            if (this.gameState.team.some(id => String(id) === String(pokemonId))) resetTeamMember = true;
            if (String(this.gameState.team[this.gameState.activePokemonIndex]) === String(pokemonId)) resetActiveMember = true;

            const skillGain = Math.min(MAX_SKILL_LEVEL - currentSkillLevel, Math.floor(oldLevel / SKILL_LEVEL_REQUIREMENT));
            storedData.level = 1;
            storedData.exp = 0;
            storedData.skillLevel = currentSkillLevel + skillGain;

            // 檢查進化
            this.checkEvolution(pokemonId);

            results.push({
                id: pokemonId,
                name: baseData.name,
                newSkillLevel: storedData.skillLevel,
                newLevel: storedData.level,
                oldLevel: oldLevel,
                skillGain,
            });
        }

        if (results.length === 0) {
            return { success: false, message: '沒有可升級技能的寶可夢（需要等級≥1000且技能未滿級）' };
        }

        if (this.currentBattle) {
            const newPlayerStats = this.calculateBattleStats(this.gameState.activePokemonIndex);
            if (newPlayerStats) {
                const hpRatio = this.currentBattle.playerMaxHp > 0
                    ? this.currentBattle.playerCurrentHp / this.currentBattle.playerMaxHp : 1;
                this.currentBattle.playerStats = newPlayerStats;
                this.currentBattle.playerMaxHp = newPlayerStats.hp;
                this.currentBattle.playerCurrentHp = resetActiveMember
                    ? newPlayerStats.hp : Math.min(newPlayerStats.hp, Math.ceil(newPlayerStats.hp * hpRatio));
                this.currentBattle.playerNextAttack = this.getAttackInterval(newPlayerStats.speed);
            }
        }

        this.save();
        if (resetTeamMember) this._queueSkillRouteCheck();
        return { success: true, count: results.length, results };
    }

    // ===================== 天賦系統 =====================
    // 檢查天賦系統是否解鎖（阿羅拉地區通關）
    isTalentUnlocked() {
        return this.isRegionCompleted('alola');
    }

    // 獲取全部寶可夢等級之和
    getTotalPokemonLevel() {
        let totalLevel = 0;
        for (const id in this.gameState.caughtPokemon) {
            totalLevel += this.gameState.caughtPokemon[id].level || 0;
        }
        return totalLevel;
    }

    // 計算天賦點總數 = 全部寶可夢等級之和 / 10000
    getTotalTalentPoints() {
        return Math.floor(this.getTotalPokemonLevel() / 10000);
    }

    // 獲取已使用的天賦點數
    getUsedTalentPoints() {
        const talents = this.gameState.talents || {};
        let used = 0;
        for (const id in talents) {
            if (id !== 'gemAttrChoice') {
                used += (talents[id] || 0);
            }
        }
        return used;
    }

    // 獲取剩餘天賦點數
    getRemainingTalentPoints() {
        return this.getTotalTalentPoints() - this.getUsedTalentPoints();
    }

    // 獲取某個天賦的當前等級
    getTalentLevel(talentId) {
        return (this.gameState.talents || {})[talentId] || 0;
    }

    // 獲取某個天賦的效果值
    getTalentValue(talentId) {
        const talent = TALENT_DATA[talentId];
        if (!talent) return 0;
        const level = this.getTalentLevel(talentId);
        return level * talent.perLevel;
    }

    // 根據天賦計算怪物等級提升後的新等級
    // 公式: L' = L + (30000 - L) × (X / 100)
    // L=原始等級, X=天賦等級, 滿級時全圖怪物均為30000級
    // 注意: 原始等級 >= 30000 的怪物不受天賦影響（Mega地區等高等級區域）
    getMonsterLevelBoost(originalLevel) {
        const talentLevel = this.getTalentLevel('team_exp_bonus');
        if (talentLevel <= 0) return originalLevel;
        if (originalLevel >= 30000) return originalLevel; // 超過3W級不受天賦影響
        const boosted = originalLevel + (30000 - originalLevel) * (talentLevel / 100);
        return Math.round(boosted);
    }

    // 升級天賦（支援多級升級）
    upgradeTalent(talentId, levels = 1) {
        if (!this.isTalentUnlocked()) return { success: false, message: '天賦系統尚未解鎖' };
        const talent = TALENT_DATA[talentId];
        if (!talent) return { success: false, message: '無效的天賦' };

        if (!this.gameState.talents) this.gameState.talents = {};
        const currentLevel = this.gameState.talents[talentId] || 0;

        if (currentLevel >= talent.maxLevel) return { success: false, message: '已達最大等級' };

        const remaining = this.getRemainingTalentPoints();
        const maxUpgradeable = Math.min(levels, talent.maxLevel - currentLevel, remaining);

        if (maxUpgradeable <= 0) return { success: false, message: '天賦點不足' };

        this.gameState.talents[talentId] = currentLevel + maxUpgradeable;
        this.save();

        return {
            success: true,
            newLevel: this.gameState.talents[talentId],
            pointsUsed: maxUpgradeable,
        };
    }

    // 重置天賦（消耗100萬金幣）
    resetTalents() {
        if (!this.isTalentUnlocked()) return { success: false, message: '天賦系統尚未解鎖' };
        if (this.gameState.gold < TALENT_RESET_COST) {
            return { success: false, message: `金幣不足，重置需要 ${TALENT_RESET_COST.toLocaleString()} 金幣` };
        }

        this.gameState.gold -= TALENT_RESET_COST;
        // 保留 gemAttrChoice，重置天賦等級
        const gemChoice = this.gameState.talents?.gemAttrChoice;
        this.gameState.talents = {};
        if (gemChoice) this.gameState.talents.gemAttrChoice = gemChoice;
        this.save();

        return { success: true, cost: TALENT_RESET_COST };
    }

    // 設定寶石屬性偏好（第10個天賦：選擇一條寶石屬性）
    setTalentGemAttrChoice(attrId) {
        const valid = GEM_ATTRIBUTES.find(a => a.id === attrId);
        if (!valid) return { success: false, message: '無效的寶石屬性' };
        if (!this.gameState.talents) this.gameState.talents = {};
        this.gameState.talents.gemAttrChoice = attrId;
        this.save();
        return { success: true, attrId };
    }

    // 獲取當前寶石屬性偏好選擇
    getTalentGemAttrChoice() {
        return this.gameState.talents?.gemAttrChoice || null;
    }

    // 獲取技能等級總和（用於第9個天賦計算）
    getSkillLevelSum() {
        let sum = 0;
        for (const id in this.gameState.caughtPokemon) {
            if (this._recommendVirtualIds?.has(id)) continue;
            sum += (this.gameState.caughtPokemon[id].skillLevel || 0);
        }
        return sum;
    }

    // 獲取天賦系統對屬性的額外加成百分比（用於 calculateBattleStats）
    getTalentStatBonusPercent() {
        const talentLevel = this.getTalentLevel('skill_stat_bonus');
        if (talentLevel <= 0) return 0;
        const skillSum = this.getSkillLevelSum();
        return skillSum * talentLevel * 0.0002;
    }

    // ===================== 樹果系統 =====================
    // 檢查樹果系統是否解鎖（豐緣圖鑑全完成）
    isBerryUnlocked() {
        return this.isRegionCompleted('hoenn');
    }

    // 種植樹果（購買種子，花費金幣）
    plantBerry(berryId) {
        if (!this.isBerryUnlocked()) return { success: false, message: '樹果系統尚未解鎖' };
        if (!BERRY_DATA[berryId]) return { success: false, message: '無效的樹果型別' };
        if (this.gameState.berryPlots.length >= BERRY_PLOT_MAX) return { success: false, message: '沒有空地了' };
        // 花費金幣購買種子
        if (this.gameState.gold < BERRY_SEED_PRICE) {
            return { success: false, message: `金幣不足，購買種子需要 ${BERRY_SEED_PRICE.toLocaleString()} 金幣` };
        }
        this.gameState.gold -= BERRY_SEED_PRICE;
        this.gameState.berryPlots.push({ berryId, plantedAt: Date.now() });
        this.save();
        return { success: true };
    }

    // 種植樹果（不消耗揹包，首次解鎖時的免費種子直接種到地裡）
    plantBerryFree(berryId) {
        if (!this.isBerryUnlocked()) return { success: false, message: '樹果系統尚未解鎖' };
        if (!BERRY_DATA[berryId]) return { success: false, message: '無效的樹果型別' };
        if (this.gameState.berryPlots.length >= BERRY_PLOT_MAX) return { success: false, message: '沒有空地了' };
        this.gameState.berryPlots.push({ berryId, plantedAt: Date.now() });
        this.save();
        return { success: true };
    }

    // 獲取實際樹果成熟時間（考慮樹果時間徽章減半效果 + 天賦減少）
    getEffectiveBerryGrowTime() {
        let growTime = BERRY_GROW_TIME;
        const berryTimeValue = this.getBadgeEffectValue('berry_time_bonus');
        if (berryTimeValue !== null) {
            growTime = Math.floor(growTime * berryTimeValue); // ×0.5 = 減半
        }
        // 天賦：樹果成熟時間-x分鐘
        const talentBerryReduce = this.getTalentValue('berry_time_reduce');
        if (talentBerryReduce > 0) {
            growTime -= talentBerryReduce * 60 * 1000; // 每級減1分鐘
            growTime = Math.max(60 * 1000, growTime); // 最低1分鐘
        }
        return growTime;
    }

    // 檢查某個種植槽是否成熟
    isBerryRipe(plotIndex) {
        const plot = this.gameState.berryPlots[plotIndex];
        if (!plot) return false;
        return (Date.now() - plot.plantedAt) >= this.getEffectiveBerryGrowTime();
    }

    // 獲取種植槽剩餘時間（毫秒）
    getBerryTimeLeft(plotIndex) {
        const plot = this.gameState.berryPlots[plotIndex];
        if (!plot) return 0;
        const elapsed = Date.now() - plot.plantedAt;
        return Math.max(0, this.getEffectiveBerryGrowTime() - elapsed);
    }

    // 採摘樹果（收穫到揹包）
    harvestBerry(plotIndex) {
        if (!this.isBerryUnlocked()) return { success: false, message: '樹果系統尚未解鎖' };
        const plot = this.gameState.berryPlots[plotIndex];
        if (!plot) return { success: false, message: '該地塊沒有種植樹果' };
        if (!this.isBerryRipe(plotIndex)) return { success: false, message: '樹果還沒有成熟' };
        const berryId = plot.berryId;
        const berryInfo = BERRY_DATA[berryId];
        // 收穫：每次採摘獲得1~2個
        let yield_count = 1 + Math.floor(Math.random() * 2); // 1, 2
        // 樹果收穫翻倍（berry_yield_bonus 效果）
        const berryYieldValue = this.getBadgeEffectValue('berry_yield_bonus');
        if (berryYieldValue !== null) {
            yield_count *= berryYieldValue; // ×2
        }
        this.gameState.berryBag[berryId] = (this.gameState.berryBag[berryId] || 0) + yield_count;
        // 移除該種植槽
        this.gameState.berryPlots.splice(plotIndex, 1);
        this.save();
        return { success: true, berryId, berryName: berryInfo.name, count: yield_count };
    }

    // 採摘所有已成熟的樹果
    harvestAllBerries() {
        if (!this.isBerryUnlocked()) return { success: false, message: '樹果系統尚未解鎖' };
        const results = [];
        // 從後往前遍歷避免索引偏移
        for (let i = this.gameState.berryPlots.length - 1; i >= 0; i--) {
            if (this.isBerryRipe(i)) {
                const result = this.harvestBerry(i);
                if (result.success) results.push(result);
            }
        }
        if (results.length === 0) return { success: false, message: '沒有可採摘的樹果' };
        return { success: true, results };
    }

    // 餵食樹果給寶可夢
    feedBerry(pokemonId, berryId) {
        if (!this.isBerryUnlocked()) return { success: false, message: '樹果系統尚未解鎖' };
        if (!BERRY_DATA[berryId]) return { success: false, message: '無效的樹果' };
        if (this.gameState.pokedex[pokemonId] !== 'caught') return { success: false, message: '未捕獲該寶可夢' };
        // 檢查揹包
        if (!this.gameState.berryBag[berryId] || this.gameState.berryBag[berryId] <= 0) {
            return { success: false, message: `沒有${BERRY_DATA[berryId].name}了` };
        }
        // 檢查該寶可夢的該類樹果是否已達上限
        if (!this.gameState.berryFed[pokemonId]) this.gameState.berryFed[pokemonId] = {};
        const currentFed = this.gameState.berryFed[pokemonId][berryId] || 0;
        const maxForType = this.getBerryMaxForType(pokemonId, berryId);
        if (currentFed >= maxForType) {
            return { success: false, message: `該寶可夢${BERRY_DATA[berryId].name}已達上限（${currentFed}/${maxForType}）` };
        }
        // 扣除揹包
        this.gameState.berryBag[berryId]--;
        if (this.gameState.berryBag[berryId] <= 0) delete this.gameState.berryBag[berryId];
        // 記錄餵食
        this.gameState.berryFed[pokemonId][berryId] = currentFed + 1;
        this.save();
        return { success: true, fed: currentFed + 1, max: maxForType };
    }

    // 獲取某寶可夢某種樹果的最大餵食數量：向上取整，允許最後一個果子部分生效（實際加成仍封頂255）
    getBerryMaxForType(pokemonId, berryId) {
        const berry = BERRY_DATA[berryId];
        if (!berry) return 0;
        const baseStats = POKEMON_DATA[pokemonId]?.baseStats;
        if (!baseStats) return 0;
        const rawStat = baseStats[berry.stat] || 0;
        return Math.max(0, Math.ceil((BERRY_STAT_CAP - rawStat) / BERRY_STAT_BONUS));
    }

    // 獲取寶可夢的樹果加成 { stat: bonusValue }（每個樹果+5種族值）
    getBerryBonuses(pokemonId) {
        const bonuses = {};
        const fed = this.gameState.berryFed[pokemonId];
        if (!fed) return bonuses;
        for (const berryId in fed) {
            const berry = BERRY_DATA[berryId];
            if (berry && fed[berryId] > 0) {
                bonuses[berry.stat] = (bonuses[berry.stat] || 0) + fed[berryId] * BERRY_STAT_BONUS;
            }
        }
        return bonuses;
    }

    // 獲取寶可夢已餵食樹果總數
    getBerryFedTotal(pokemonId) {
        const fed = this.gameState.berryFed[pokemonId];
        if (!fed) return 0;
        let total = 0;
        for (const berryId in fed) total += fed[berryId];
        return total;
    }

    // 獲取揹包樹果總數
    getBerryBagTotal() {
        let total = 0;
        for (const berryId in this.gameState.berryBag) total += this.gameState.berryBag[berryId];
        return total;
    }

    // ===================== 挑戰塔系統 =====================
    getTowerBonusFactors(floor = this.gameState?.tower?.currentFloor || 1) {
        const current = Number.isFinite(floor) ? Math.max(1, Math.min(TOWER_MAX_FLOOR, floor)) : 1;
        const progress = (current - 1) / (TOWER_MAX_FLOOR - 1);
        return { pokedex: 0.30 + 0.70 * progress, talent: 0.25 + 0.75 * progress, gem: 0.25 + 0.75 * progress };
    }

    // 檢查挑戰塔是否解鎖（帕底亞地區通關）
    isTowerUnlocked() {
        return this.isRegionCompleted('paldea');
    }

    // 獲取挑戰塔某層的怪物等級
    getTowerFloorLevel(floor) {
        return TOWER_BASE_LEVEL + (floor - 1) * TOWER_LEVEL_INCREMENT;
    }

    // 獲取種族值>500的寶可夢ID候選池（快取）
    _getTowerCandidatePool(floor = 0) {
        // 201層及以上使用超高種族值池（>650），151-200層使用高種族值池（>580），普通層用>500
        let usePool, cacheKey, minTotal;
        if (floor >= 201) {
            usePool = 'ultra';
            cacheKey = '_towerCandidatePoolUltra';
            minTotal = 650;
        } else if (floor >= 151) {
            usePool = 'elite';
            cacheKey = '_towerCandidatePoolElite';
            minTotal = 580;
        } else {
            usePool = 'normal';
            cacheKey = '_towerCandidatePool';
            minTotal = TOWER_MIN_BASE_STAT_TOTAL;
        }
        if (this[cacheKey]) return this[cacheKey];
        const pool = [];
        for (const id in POKEMON_DATA) {
            const data = POKEMON_DATA[id];
            if (!data.baseStats) continue;
            const total = Object.values(data.baseStats).reduce((a, b) => a + b, 0);
            if (total > minTotal) {
                pool.push(parseInt(id));
            }
        }
        this[cacheKey] = pool;
        return pool;
    }

    // 生成挑戰塔某層的6只敵方寶可夢ID列表（只存id，不快取屬性）
    generateTowerFloorEnemies(floor) {
        const pool = this._getTowerCandidatePool(floor);
        const enemyIds = [];
        const usedIds = new Set();

        for (let i = 0; i < TOWER_ENEMIES_PER_FLOOR; i++) {
            let id;
            let attempts = 0;
            do {
                id = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (usedIds.has(id) && attempts < 100);
            usedIds.add(id);
            enemyIds.push(id);
        }
        return enemyIds;
    }

    // 根據挑戰塔敵人ID實時構建完整寶可夢物件（不快取，每次戰鬥實時計算）
    buildTowerEnemy(pokemonId, floor) {
        const level = this.getTowerFloorLevel(floor);
        const baseData = POKEMON_DATA[pokemonId];
        return {
            id: pokemonId,
            name: baseData.name,
            level: level,
            ivs: { hp: 31, atk: 31, def: 31, spAtk: 31, spDef: 31, speed: 31 },
            isShiny: false,
            isWild: true,
            isTowerEnemy: true, // 挑戰塔專屬的滿樹果加成，不使用玩家資料
            skillLevel: MAX_SKILL_LEVEL,
        };
    }

    // 進入挑戰塔（暫停主線戰鬥，初始化當前層）
    enterTower(replayHighest = false) {
        if (!this.isTowerUnlocked()) return { success: false, message: '極限對戰塔未解鎖' };

        const tower = this.gameState.tower;
        if (this._towerMode) return { success: false, message: '正在挑戰對戰塔' };
        if (replayHighest) {
            if (!tower.highestFloor) return { success: false, message: '尚未通關任何樓層' };
            tower.replayPrevious = { currentFloor: tower.currentFloor, enemies: tower.enemies, currentEnemyIndex: tower.currentEnemyIndex };
            tower.currentFloor = tower.highestFloor;
            tower.enemies = null;
            tower.currentEnemyIndex = 0;
        }

        // 如果當前層沒有敵人，生成新的（只存id列表）
        if (!tower.enemies) {
            tower.enemies = this.generateTowerFloorEnemies(tower.currentFloor);
            tower.currentEnemyIndex = 0;
        }
        // 相容舊存檔：如果 enemies 是物件陣列，遷移為純 id 陣列
        if (tower.enemies.length > 0 && typeof tower.enemies[0] === 'object') {
            tower.enemies = tower.enemies.map(e => e.id);
        }

        // 暫停主線戰鬥
        this.stopBattle();
        this._towerMode = true;
        this._towerFaintedIds = new Set();
        this._towerHpById = new Map(this.gameState.team.map(id => [id, null]));
        this._towerPlayerHpPercent = 1; // 進入新層時滿血
        tower.inBattle = true;

        this.save();
        return { success: true, tower: tower };
    }

    // 退出挑戰塔（恢復主線戰鬥）
    exitTower() {
        this._towerMode = false;
        this._towerFaintedIds = null;
        this._towerHpById = null;
        this._towerBattle = null;
        this.gameState.tower.inBattle = false;
        this.gameState.tower.currentEnemyIndex = 0;
        this._restoreTowerReplay();
        this.save();
        // 恢復主線戰鬥
        this.startBattle();
    }

    _restoreTowerReplay() {
        const tower = this.gameState.tower;
        if (!tower.replayPrevious) return false;
        Object.assign(tower, tower.replayPrevious);
        delete tower.replayPrevious;
        return true;
    }

    // 開始挑戰塔當前層的戰鬥（與當前敵人開始戰鬥）
    startTowerBattle() {
        if (!this._towerMode) return;

        const tower = this.gameState.tower;
        if (!tower.enemies || tower.currentEnemyIndex >= tower.enemies.length) return;

        // 從 id 實時構建敵方寶可夢（不快取屬性，確保實時計算）
        const enemyId = tower.enemies[tower.currentEnemyIndex];
        const enemy = this.buildTowerEnemy(enemyId, tower.currentFloor);
        const enemyStats = this.calculateStats(enemy);

        // 自動更換最優寶可夢出戰（與主線戰鬥一致）
        if (this.gameState.settings?.autoSwitchBest && this.gameState.team.length > 1) {
            const bestIndex = this.getBestTeamMemberForEnemy(enemy);
            if (bestIndex !== -1 && bestIndex !== this.gameState.activePokemonIndex) {
                this.gameState.activePokemonIndex = bestIndex;
                this.save();
                if (this.onBattleEvent) {
                    this.onBattleEvent('autoSwitched', { newIndex: bestIndex });
                }
            }
        }

        // 獲取玩家戰鬥屬性
        const playerStats = this.calculateBattleStats(this.gameState.activePokemonIndex);
        if (!playerStats) return;

        // 同一層內保留各隊員血量，首次出戰才滿血。
        const activeId = this.gameState.team[this.gameState.activePokemonIndex];
        const savedHp = this._towerHpById?.get(activeId);
        const playerHp = savedHp == null ? playerStats.hp : Math.min(playerStats.hp, savedHp);
        if (this._towerHpById) this._towerHpById.set(activeId, playerHp);

        this.currentBattle = {
            wild: enemy,
            wildMaxHp: enemyStats.hp,
            wildCurrentHp: enemyStats.hp,
            wildStats: enemyStats,
            playerMaxHp: playerStats.hp,
            playerCurrentHp: playerHp,
            playerStats: playerStats,
            playerNextAttack: this.getAttackInterval(playerStats.speed),
            enemyNextAttack: this.getAttackInterval(enemyStats.speed),
            playerTimer: 0,
            enemyTimer: 0,
            lastTick: Date.now(),
        };

        if (this.onBattleEvent) {
            this.onBattleEvent('start', this.currentBattle);
        }

        this.startBattleLoop();
    }

    // 挑戰塔內敵人被擊敗
    onTowerEnemyDefeated() {
        this.stopBattle();
        const battle = this.currentBattle;
        const tower = this.gameState.tower;
        this._towerHpById?.set(this.gameState.team[this.gameState.activePokemonIndex], Math.max(0, battle.playerCurrentHp));

        tower.currentEnemyIndex++;

        // 通知 UI 更新
        if (this.onBattleEvent) {
            this.onBattleEvent('towerEnemyDefeated', {
                floorIndex: tower.currentEnemyIndex,
                totalEnemies: TOWER_ENEMIES_PER_FLOOR,
                playerHp: battle.playerCurrentHp,
                playerMaxHp: battle.playerMaxHp,
            });
        }

        // 檢查是否通關本層
        if (tower.currentEnemyIndex >= TOWER_ENEMIES_PER_FLOOR) {
            // 通關本層
            if (tower.currentFloor > tower.highestFloor) {
                tower.highestFloor = tower.currentFloor;
            }

            if (this.onBattleEvent) {
                this.onBattleEvent('towerFloorCleared', {
                    floor: tower.currentFloor,
                    highestFloor: tower.highestFloor,
                    autoNext: !tower.replayPrevious && tower.currentFloor < TOWER_MAX_FLOOR && !!this.gameState.settings?.autoTower,
                });
            }

            // 推進到下一層
            if (!tower.replayPrevious && tower.currentFloor < TOWER_MAX_FLOOR) {
                tower.currentFloor++;
            }
            tower.enemies = null;
            tower.currentEnemyIndex = 0;
            this._restoreTowerReplay();
            tower.inBattle = false;
            this._towerMode = false;
            this._towerFaintedIds = null;
            this._towerHpById = null;
            this._towerPlayerHpPercent = 1; // 新層滿血

            this.save();
            return;
        }

        this.save();

        // 短暫延遲後開始下一隻
        setTimeout(() => {
            if (this._towerMode) {
                this.startTowerBattle();
            }
        }, 800);
    }

    // 挑戰塔內玩家失敗
    onTowerPlayerFainted() {
        this.stopBattle();

        this._towerFaintedIds ||= new Set();
        const faintedId = this.gameState.team[this.gameState.activePokemonIndex];
        this._towerFaintedIds.add(faintedId);
        this._towerHpById?.set(faintedId, 0);
        const available = this.gameState.team.findIndex(id => !this._towerFaintedIds.has(id));
        if (available !== -1) {
            const best = this.gameState.settings?.autoSwitchBest
                ? this.getBestTeamMemberForEnemy(this.currentBattle.wild) : -1;
            const nextIndex = best >= 0 ? best : available;
            this.setActivePokemon(nextIndex);
            if (this.onBattleEvent) this.onBattleEvent('towerPokemonSwitched', {
                faintedId, nextId: this.gameState.team[nextIndex], remaining: this.gameState.team.length - this._towerFaintedIds.size,
            });
            this.startBattleLoop();
            return;
        }

        if (this.onBattleEvent) {
            this.onBattleEvent('towerPlayerFainted', {
                floor: this.gameState.tower.currentFloor,
                enemyIndex: this.gameState.tower.currentEnemyIndex,
            });
        }

        // 失敗後重置進度，重新挑戰從第一隻怪開始
        if (this.gameState.settings) this.gameState.settings.autoTower = false;
        this._towerMode = false;
        this._towerFaintedIds = null;
        this._towerHpById = null;
        this._towerBattle = null;
        this._towerPlayerHpPercent = 1;
        this.gameState.tower.inBattle = false;
        this.gameState.tower.currentEnemyIndex = 0;

        this._restoreTowerReplay();

        this.save();
    }

    // 獲取挑戰塔通關加成百分比
    getTowerBonus() {
        return this.gameState.tower?.highestFloor || 0;
    }
}
