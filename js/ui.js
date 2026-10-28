// ============================================================
// UI 管理 - 介面渲染和互動
// ============================================================

class GameUI {
    constructor(game) {
        this.game = game;
        this.currentTab = 'tab-battle';
        this.pokedexFilter = 'all';
        this.pokedexRegionFilter = 'all'; // 地區篩選：all, kanto, johto, hoenn, sinnoh, unova, kalos, alola, galar, paldea
        this.pokedexTypeFilter = 'all';
        this._battleTickFrame = null;
        this._battleSpriteResizeObserver = new ResizeObserver(() => this._sizeBattleSprites());
        this._battleSpriteResizeObserver.observe(document.getElementById('battle-scene'));
        this._createOfflineOverlay();
        this._createRoutePokemonHoverCard();
        this.setupEventListeners();
        setInterval(() => {
            if (this.currentTab !== 'tab-stats' || !this.game.gameState?.stats) return;
            this.renderStats();
        }, 1000);
    }

    // 建立離線模擬進度遮罩層
    _createOfflineOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'offline-overlay';
        overlay.className = 'offline-overlay hidden';
        overlay.innerHTML = `
            <div class="offline-overlay-content">
                <div class="offline-overlay-icon">⚡</div>
                <div class="offline-overlay-title">離線結算中...</div>
                <div class="offline-overlay-time" id="offline-time-text"></div>
                <div class="offline-progress-bar-wrapper">
                    <div class="offline-progress-bar" id="offline-progress-bar"></div>
                </div>
                <div class="offline-overlay-info">
                    <span id="offline-percent-text">0%</span>
                    <span id="offline-battles-text">已完成 0 場戰鬥</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._offlineOverlay = overlay;
    }

    _createRoutePokemonHoverCard() {
        const card = document.createElement('aside');
        card.id = 'route-pokemon-hover-card';
        card.className = 'route-pokemon-hover-card';
        card.setAttribute('role', 'tooltip');
        card.hidden = true;
        card.innerHTML = '<div class="route-pokemon-hover-sprite"><img alt=""></div><div class="route-pokemon-hover-info"><span class="route-pokemon-hover-number"></span><strong class="route-pokemon-hover-name"></strong><div class="route-pokemon-hover-types"></div><small class="route-pokemon-hover-status"></small></div>';
        document.body.appendChild(card);
        this._routePokemonHoverCard = card;
        card.addEventListener('click', event => event.stopPropagation());

        const routeList = document.getElementById('route-list');
        let hideTimer = null;
        const show = target => {
            window.clearTimeout(hideTimer);
            const id = Number(target.dataset.pokemonId);
            const data = POKEMON_DATA[id];
            if (!data) return;
            const state = this.game.gameState;
            const hasBeenSeen = !!state.pokedex[id];
            const isCaught = state.pokedex[id] === 'caught';
            const hasShiny = !!state.shinyDex[id];
        const isShowingShiny = hasBeenSeen && isCaught && hasShiny;
            const image = card.querySelector('img');
            const spriteFrame = image.closest('.route-pokemon-hover-sprite');
            image.hidden = !hasBeenSeen;
            spriteFrame.classList.toggle('unknown', !hasBeenSeen);
            if (hasBeenSeen) {
                image.src = isShowingShiny ? getShinyPokemonSpriteUrl(id) : getPokemonSpriteUrl(id);
                image.alt = `${isShowingShiny ? '閃光' : '普通'}${data.name}`;
                image.onerror = () => fallbackPokemonSprite(image, id, isShowingShiny, '?');
            } else {
                image.removeAttribute('src');
                image.alt = '';
            }
            card.querySelector('.route-pokemon-hover-number').textContent = `#${String(id).padStart(3, '0')}`;
            card.querySelector('.route-pokemon-hover-name').textContent = hasBeenSeen ? `${data.name}${hasShiny ? ' ✨' : ''}` : '???';
            const types = card.querySelector('.route-pokemon-hover-types');
            types.replaceChildren(...(hasBeenSeen ? data.types || [] : []).map(type => {
                const badge = document.createElement('span');
                badge.className = `type-badge ${type}`;
                badge.textContent = TYPE_NAMES[type] || type;
                return badge;
            }));
            const status = card.querySelector('.route-pokemon-hover-status');
            status.textContent = !hasBeenSeen ? '尚未遇見' : isShowingShiny ? '圖鑑目前顯示：閃光' : '圖鑑目前顯示：普通';
            status.classList.toggle('shiny', isShowingShiny);

            card.hidden = false;
            const rect = target.getBoundingClientRect();
            const cardWidth = card.offsetWidth;
            const cardHeight = card.offsetHeight;
            const gap = 10;
            let left = rect.right + gap;
            if (left + cardWidth > window.innerWidth - 8) left = rect.left - cardWidth - gap;
            left = Math.max(8, Math.min(left, window.innerWidth - cardWidth - 8));
            const top = Math.max(8, Math.min(rect.top, window.innerHeight - cardHeight - 8));
            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
        };
        const scheduleHide = () => {
            hideTimer = window.setTimeout(() => { card.hidden = true; }, 180);
        };

        routeList.addEventListener('pointerover', event => {
            const target = event.target.closest('.route-pokemon-entry[data-pokemon-id]');
            if (target && !target.contains(event.relatedTarget)) show(target);
        });
        routeList.addEventListener('pointerout', event => {
            const target = event.target.closest('.route-pokemon-entry[data-pokemon-id]');
            if (target && !target.contains(event.relatedTarget)) scheduleHide();
        });
        routeList.addEventListener('focusin', event => {
            const target = event.target.closest('.route-pokemon-entry[data-pokemon-id]');
            if (target) show(target);
        });
        routeList.addEventListener('focusout', event => {
            if (event.target.closest('.route-pokemon-entry[data-pokemon-id]')) scheduleHide();
        });
        card.addEventListener('pointerenter', () => window.clearTimeout(hideTimer));
        card.addEventListener('pointerleave', scheduleHide);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') card.hidden = true;
        });
    }

    // ===================== 事件監聽 =====================
    setupEventListeners() {
        this._setupBerryEvents();
        document.getElementById('berry-ready-open').addEventListener('click', () => this.switchTab('tab-berry'));
        document.getElementById('berry-ready-dismiss').addEventListener('click', () => {
            const plots = this.game.gameState?.berryPlots || [];
            this._dismissedRipePlots = new Set(plots.filter((_, i) => this.game.isBerryRipe(i)));
            this.updateBerryReadyAlert();
        });
        document.getElementById('btn-region-rewards').addEventListener('click', () => this.showRegionRewards());
        const statDialog = document.getElementById('stat-sources-dialog');
        document.getElementById('team-list').addEventListener('click', event => {
            if (event.target.closest('#btn-stat-sources')) statDialog.showModal();
        });
        const teamDialog = document.getElementById('team-detail-dialog');
        document.querySelectorAll('.team-detail-tabs button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.team-detail-tabs button').forEach(tab => {
                    const selected = tab === button;
                    tab.classList.toggle('active', selected);
                    tab.setAttribute('aria-selected', String(selected));
                    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
                });
                teamDialog.scrollTop = 0;
                this._updateTeamPokemonDetails();
            });
        });
        teamDialog.addEventListener('close', () => {
            clearInterval(this._teamDetailTimer);
            this._teamDetailTimer = null;
            this._teamDetailPokemonId = null;
        });
        // Tab 切換
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // 圖鑑地區篩選（三級篩選）
        document.querySelectorAll('.region-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.pokedexRegionFilter = btn.dataset.region;
                document.querySelectorAll('.region-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPokedex();
            });
        });

        // 圖鑑主過濾
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.pokedexFilter = btn.dataset.filter;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPokedex();
            });
        });
        
        // 圖鑑屬性篩選，雙屬性寶可夢符合任一自身屬性。
        const typeFilter = document.getElementById('pokedex-type-filter');
        for (const [type, name] of Object.entries(TYPE_NAMES)) {
            typeFilter.add(new Option(name, type));
        }
        typeFilter.addEventListener('change', () => {
            this.pokedexTypeFilter = typeFilter.value;
            this.renderPokedex();
        });

        // 圖鑑搜尋框
        const searchInput = document.getElementById('pokedex-search-input');
        if (searchInput) {
            let searchTimer = null;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    this.pokedexSearchQuery = searchInput.value.trim();
                    this.renderPokedex();
                }, 200);
            });
        }

        // 設定按鈕
        document.getElementById('team-list').addEventListener('click', event => {
            if (!event.target.closest('#btn-recommend-team')) return;
            document.querySelector('input[name="recommend-mode"][value="current"]').checked = true;
            document.getElementById('team-recommend-options').showModal();
        });
        const recommendOptions = document.getElementById('team-recommend-options');
        const recommendForm = document.getElementById('team-recommend-options-form');
        document.getElementById('cancel-recommend-options').addEventListener('click', () => recommendOptions.close());
        recommendForm.addEventListener('submit', event => {
            event.preventDefault();
            const mode = recommendForm.elements['recommend-mode'].value;
            const highestLevel = Object.keys(this.game.gameState.pokedex).reduce((highest, id) =>
                this.game.gameState.pokedex[id] === 'caught' ? Math.max(highest, this.game.getStoredData(id)?.level || 1) : highest, 1);
            const targetLevel = mode === 'future' ? Math.min(MAX_POKEMON_LEVEL, highestLevel * 5) : null;
            recommendOptions.close();
            this.previewTeamRecommendation(targetLevel);
        });
        document.getElementById('btn-save').addEventListener('click', () => {
            this.game.save();
            this.showToast('💾 遊戲已儲存！');
        });

        document.getElementById('btn-export').addEventListener('click', async () => {
            let data;
            try { data = await this.game.exportSave(); }
            catch (e) { console.error('匯出失敗:', e); this.showToast('❌ 存檔匯出失敗！'); return; }
            document.getElementById('save-data-area').value = data;
            this.showToast('📋 存檔已匯出！請複製上方文字。');
        });

        document.getElementById('btn-import').addEventListener('click', async () => {
            const data = document.getElementById('save-data-area').value.trim();
            if (!data) {
                this.showToast('⚠️ 請先在文字框中貼上存檔資料！');
                return;
            }
            if (await this.game.importSave(data)) {
                this.showToast('✅ 存檔匯入成功！');
                this.refreshAll();
                this.game.stopBattle();
                // 匯入存檔後檢查是否需要離線結算
                this._checkOfflineAfterImport();
            } else {
                this.showToast('❌ 存檔資料無效！');
            }
        });

        document.getElementById('btn-delete').addEventListener('click', () => {
            this.showConfirmDialog('確定刪除存檔？', '此操作不可恢復，所有遊戲資料將被清除。', () => {
                this.game.stopBattle();
                this.game.deleteSave();
                this.game.initNewGame();
                this.refreshAll();
                this.game.startBattle();
                this.showToast('🗑️ 存檔已刪除，遊戲重新開始。');
            });
        });

        // 匯出存檔檔案
        document.getElementById('btn-export-file').addEventListener('click', async () => {
            let data;
            try { data = await this.game.exportSave(); }
            catch (e) { console.error('匯出失敗:', e); this.showToast('❌ 存檔匯出失敗！'); return; }
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            a.href = url;
            a.download = `pokeidle-${ts}-save.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('📁 存檔檔案已匯出！');
        });

        // 載入存檔檔案
        const importFileInput = document.getElementById('import-file-input');
        document.getElementById('btn-import-file').addEventListener('click', () => {
            importFileInput.value = '';
            importFileInput.click();
        });
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const data = evt.target.result.trim();
                if (!data) {
                    this.showToast('⚠️ 檔案內容為空！');
                    return;
                }
                if (await this.game.importSave(data)) {
                    this.showToast('📂 存檔檔案載入成功！');
                    this.refreshAll();
                    this.game.stopBattle();
                    this._checkOfflineAfterImport();
                } else {
                    this.showToast('❌ 存檔檔案資料無效！');
                }
            };
            reader.readAsText(file);
        });

        // 玩法說明彈窗
        const gameplayHelpBtn = document.getElementById('btn-gameplay-help');
        if (gameplayHelpBtn) {
            gameplayHelpBtn.addEventListener('click', () => {
                this.showGameplayHelpDialog();
            });
        }

        // 自動更換最優寶可夢設定
        const autoSwitchCheckbox = document.getElementById('setting-auto-switch');
        if (autoSwitchCheckbox) {
            // 恢復儲存的狀態
            autoSwitchCheckbox.checked = !!this.game.gameState.settings?.autoSwitchBest;
            autoSwitchCheckbox.addEventListener('change', () => {
                this.game.gameState.settings = this.game.gameState.settings || {};
                this.game.gameState.settings.autoSwitchBest = autoSwitchCheckbox.checked;
                this.game.save();
                this.showToast(autoSwitchCheckbox.checked ? '✅ 已開啟自動更換最優寶可夢' : '❌ 已關閉自動更換最優寶可夢');
                // 聯動顯示/隱藏一擊必殺策略
                this._syncOneShotStrategyVisibility();
            });
            // 初始化時同步顯示狀態
            this._syncOneShotStrategyVisibility();
        }

        // 一擊必殺策略單選框
        this._initOneShotStrategy();

        // 自動切換地圖設定（直接開放）
        this._initAutoRouteSetting();

        // 一鍵升級技能按鈕
        this._initUpgradeAllSkillsBtn();

        // 固定使用霓虹戰術介面
        this._initTheme();

        // 初始化徽章Tab可見性
        this.updateBadgeTabVisibility();
        // 初始化樹果Tab可見性
        this.updateBerryTabVisibility();
        // 初始化技能Tab可見性
        this.updateSkillTabVisibility();
        // 初始化天賦Tab可見性
        this.updateTalentTabVisibility();
        // 初始化挑戰塔Tab可見性
        this.updateTowerTabVisibility();

        // 遊戲事件回撥
        this.game.onBattleEvent = (event, data) => this.handleBattleEvent(event, data);
        this.game.onCatch = (pokemon) => {
            this.showCatchNotification(pokemon);
            if (this.currentTab === 'tab-map') this.renderMap({ preserveView: true });
        };
        this.game.onLevelUp = (pokemon) => this.showLevelUpNotification(pokemon);

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            // 在輸入框、文字域中不觸發快捷鍵
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
            // 僅在徽章頁面生效
            if (this.currentTab !== 'tab-badge') return;
            // 有彈窗時不觸發
            if (document.querySelector('.dialog-overlay')) return;

            const key = e.key.toLowerCase();
            if (key === 'b') {
                // 全部購買
                const buyAllBtn = document.getElementById('btn-buy-all-gems');
                if (buyAllBtn && buyAllBtn.offsetParent !== null) {
                    buyAllBtn.click();
                }
            } else if (key === 's') {
                // 一鍵合成
                e.preventDefault(); // 防止觸發瀏覽器搜尋
                const synthesizeAllBtn = document.getElementById('btn-synthesize-all');
                if (synthesizeAllBtn && synthesizeAllBtn.offsetParent !== null) {
                    synthesizeAllBtn.click();
                }
            }
        });
    }

    // ===================== Tab 切換 =====================
    switchTab(tabId) {
        // 攔截鎖定的徽章Tab
        if (tabId === 'tab-badge') {
            const badgeTabBtn = document.querySelector('.badge-tab-btn');
            if (badgeTabBtn && badgeTabBtn.classList.contains('locked')) {
                this.showToast('🔒 通關關都地區後解鎖徽章系統');
                return;
            }
        }
        // 攔截鎖定的樹果Tab
        if (tabId === 'tab-berry') {
            const berryTabBtn = document.querySelector('.berry-tab-btn');
            if (berryTabBtn && berryTabBtn.classList.contains('locked')) {
                this.showToast('🔒 完成豐緣圖鑑後解鎖樹果系統');
                return;
            }
        }
        // 攔截鎖定的技能Tab
        if (tabId === 'tab-skill') {
            const skillTabBtn = document.querySelector('.skill-tab-btn');
            if (skillTabBtn && skillTabBtn.classList.contains('locked')) {
                this.showToast('🔒 完成合眾地區圖鑑後解鎖技能系統');
                return;
            }
        }
        // 攔截鎖定的天賦Tab
        if (tabId === 'tab-talent') {
            const talentTabBtn = document.querySelector('.talent-tab-btn');
            if (talentTabBtn && talentTabBtn.classList.contains('locked')) {
                this.showToast('🔒 完成阿羅拉地區圖鑑後解鎖天賦系統');
                return;
            }
        }
        // 攔截鎖定的挑戰塔Tab
        if (tabId === 'tab-tower') {
            const towerTabBtn = document.querySelector('.tower-tab-btn');
            if (towerTabBtn && towerTabBtn.classList.contains('locked')) {
                this.showToast('🔒 完成帕底亞地區圖鑑後解鎖極限對戰塔');
                return;
            }
        }
        this.currentTab = tabId;
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // 切換時重新整理對應內容
        if (tabId === 'tab-map') this.renderMap();
        if (tabId === 'tab-badge') this.renderBadgePage();
        if (tabId === 'tab-berry') this.renderBerryPage();
        if (tabId === 'tab-skill') this.renderSkillPage();
        if (tabId === 'tab-talent') this.renderTalentPage();
        if (tabId === 'tab-tower') this.renderTowerPage();
        if (tabId === 'tab-pokedex') this.renderPokedex();
        if (tabId === 'tab-stats') this.renderStats();
        if (tabId === 'tab-settings') this.renderSettings();
        if (tabId === 'tab-battle') {
            this.renderTeam();
        }
    }

    // ===================== 戰鬥介面 =====================
    handleBattleEvent(event, data) {
        // 多次戰鬥 tick 合併為每一畫面更新，避免高速戰鬥反覆操作 DOM。
        if (event === 'tick') {
            this._pendingBattleTick = data;
            if (this._battleTickFrame === null) {
                this._battleTickFrame = requestAnimationFrame(() => {
                    this._battleTickFrame = null;
                    const latestTick = this._pendingBattleTick;
                    this._pendingBattleTick = null;
                    if (latestTick) this.updateBattleHP(latestTick);
                });
            }
            return;
        }
        // 場次切換與直接更新血量的事件不可被前一個 tick 覆蓋。
        if (['start', 'enemyDefeated', 'healing', 'playerFainted', 'towerEnemyDefeated', 'towerPlayerFainted'].includes(event) && this._battleTickFrame !== null) {
            cancelAnimationFrame(this._battleTickFrame);
            this._battleTickFrame = null;
            this._pendingBattleTick = null;
        }
        switch (event) {
            case 'start':
                this.renderBattleStart(data);
                break;
            case 'playerAttack':
                this.onPlayerAttack(data);
                break;
            case 'enemyAttack':
                this.onEnemyAttack(data);
                break;
            case 'enemyDefeated':
                this.onEnemyDefeated(data);
                break;
            case 'playerFainted':
                if (this.game._towerMode) {
                    this.addBattleLog('我方寶可夢倒下了！', 'defeat');
                } else {
                    this.addBattleLog('我方寶可夢倒下了... 正在回覆生命值', 'defeat');
                }
                break;
            case 'routeBattleFailure':
                this.updateRoadFailureStatus(data.failures);
                break;
            case 'routeBattleSuccess':
                this.updateRoadFailureStatus(0);
                break;
            case 'routeFailureRetreat':
                this.updateRoadRetreatStatus(`戰鬥失敗過多，已退回 ${data.regionName} · ${data.routeName}；自動切圖已關閉，需自行開啟`);
                const autoRouteCheckbox = document.getElementById('setting-auto-route');
                if (autoRouteCheckbox) autoRouteCheckbox.checked = false;
                this.addBattleLog(`⚠️ 道路連敗 ${data.failures} 次，從 ${data.fromRouteName} 退回 ${data.regionName} · ${data.routeName}`, 'defeat');
                this.showToast(`⚠️ 道路連敗 ${data.failures} 次，已退回 ${data.regionName} · ${data.routeName}`);
                if (this.currentTab === 'tab-map') this.renderMap({ preserveView: true });
                break;
            case 'routeFailureNoPrevious':
                this.updateRoadRetreatStatus('已在最初道路，無前路可退');
                this.addBattleLog(`⚠️ 道路連敗 ${data.failures} 次，但已在最初道路 ${data.routeName}，無法再往前退。`, 'defeat');
                this.showToast('⚠️ 已在最初道路，無前一道路可退回');
                break;
            case 'healing':
                this.updateBattleHP({
                    playerHp: data.hp,
                    playerMaxHp: data.maxHp,
                    enemyHp: 0,
                    enemyMaxHp: 1,
                });
                this.addBattleLog(`💚 生命值回覆中... ${Math.floor(data.hp / data.maxHp * 100)}%`, 'normal');
                break;
            case 'evolved':
                this.showEvolutionNotification(data);
                break;
            case 'shinyEvolved':
                this.addBattleLog(`✨ ${data.oldName} 的閃光形態傳遞給了 ${data.newName}！`, 'shiny');
                this.showToast(`✨ ${data.newName} 獲得了閃光形態！`);
                break;
            case 'shinySpread':
                this.addBattleLog(`✨ ${data.sourceName} 的閃光傳播給了 ${data.targetName}！`, 'shiny');
                break;
            case 'shinyDefeated':
                this.addBattleLog(`✨ 獲得了 ${data.name} 的閃光形態！可在圖鑑中切換展示`, 'shiny', 'capture');
                this.showToast(`✨ 恭喜！獲得了 ${data.name} 的閃光形態！`);
                break;
            case 'badgeUnlocked':
                this.addBattleLog(`🏅 恭喜！獲得了 ${data.badgeName}！`, 'evolution');
                this.showToast(`🏅 恭喜！獲得了 ${data.badgeName}！`);
                this.updateBadgeTabVisibility();
                // 豐緣徽章解鎖時同步解鎖樹果系統
                if (data.regionId === 'hoenn') {
                    this.updateBerryTabVisibility();
                    this._initBerrySystem();
                    setTimeout(() => {
                        this.showToast('🌱 樹果系統已解鎖！可以種植樹果增強寶可夢了');
                    }, 2000);
                }
                // 合眾徽章解鎖時同步解鎖技能系統
                if (data.regionId === 'unova') {
                    this.updateSkillTabVisibility();
                    setTimeout(() => {
                        this.showToast('⚡ 技能系統已解鎖！1000級以上寶可夢可升級技能');
                    }, 2000);
                }
                // 阿羅拉徽章解鎖時同步解鎖天賦系統
                if (data.regionId === 'alola') {
                    this.updateTalentTabVisibility();
                    setTimeout(() => {
                        this.showToast('🌟 天賦系統已解鎖！消耗天賦點強化各項能力');
                    }, 2000);
                }
                // 帕底亞徽章解鎖時顯示自動切換地圖設定 + 解鎖挑戰塔
                if (data.regionId === 'paldea') {
                    this.updateAutoRouteSettingVisibility();
                    this._initAutoRouteSetting();
                    this.updateTowerTabVisibility();
                    setTimeout(() => {
                        this.showToast('💎 自動切換地圖已解鎖！可在設定中開啟');
                    }, 2000);
                    setTimeout(() => {
                        this.showToast('🗼 極限對戰塔已解鎖！挑戰獲取全域性加成');
                    }, 4000);
                }
                break;
            case 'regionUnlocked':
                this.addBattleLog(`🎉 恭喜！${data.regionName}已解鎖！`, 'evolution');
                this.showToast(`🎉 ${data.regionName}已解鎖！可以在地圖中前往了`);
                break;
            case 'playerDodge':
                this.addBattleLog(`💫 閃避了敵方的攻擊！`, 'attack');
                break;
            case 'towerEnemyDefeated':
                // 將敵方HP條動畫歸零
                this.updateBattleHP({
                    playerHp: data.playerHp,
                    playerMaxHp: data.playerMaxHp,
                    enemyHp: 0,
                    enemyMaxHp: 1,
                });
                this.addBattleLog(`🗼 極限對戰塔：擊敗了第 ${data.floorIndex}/${data.totalEnemies} 只敵人！`, 'evolution');
                break;
            case 'towerFloorCleared':
                this.addBattleLog(`🎉 極限對戰塔：第 ${data.floor} 層通關！歷史最高：${data.highestFloor} 層`, 'shiny');
                this.showToast(`🗼 極限對戰塔第 ${data.floor} 層通關！`);
                // 通關後切回挑戰島頁面並恢復主線戰鬥
                setTimeout(() => {
                    if (data.autoNext && this.game.gameState.settings?.autoTower && !this.game._towerMode && this.game.gameState.tower.currentFloor === data.floor + 1) {
                        const result = this.game.enterTower();
                        if (result.success) {
                            this.showToast(`🗼 自動挑戰第 ${this.game.gameState.tower.currentFloor} 層！`);
                            this.addBattleLog(`🗼 自動挑戰第 ${this.game.gameState.tower.currentFloor} 層！`, 'evolution');
                            this.switchTab('tab-battle');
                            this.game.startTowerBattle();
                            return;
                        }
                    }
                    this.switchTab('tab-tower');
                    this.game.startBattle(); // 恢復主線
                }, 500);
                break;
            case 'towerPokemonSwitched':
                this.addBattleLog(`🗼 換上 ${POKEMON_DATA[data.nextId]?.name || '隊員'}，尚有 ${data.remaining} 隻可出戰。`, 'normal');
                this.renderTeam();
                break;
            case 'towerPlayerFainted':
                this.addBattleLog(`💀 極限對戰塔第 ${data.floor} 層挑戰失敗...`, 'defeat');
                this.showToast(`💀 挑戰失敗！可以重新挑戰第 ${data.floor} 層`);
                // 失敗後切回挑戰島頁面並恢復主線戰鬥
                setTimeout(() => {
                    this.switchTab('tab-tower');
                    this.game.startBattle(); // 恢復主線
                }, 1500);
                break;
            case 'offlineStart':
                this._showOfflineOverlay(data.totalMs);
                break;
            case 'offlineProgress':
                this._updateOfflineProgress(data.progress, data.battles, data.percent);
                break;
            case 'offlineEnd':
                this._hideOfflineOverlay(data.battles, data.totalMs, data.report);
                break;
            case 'autoSwitched': {
                const pokemonId = this.game.gameState.team[data.newIndex];
                const pokemonData = POKEMON_DATA[pokemonId];
                if (pokemonData) {
                    this.addBattleLog(`🔄 自動切換出戰：${pokemonData.name}`, 'normal');
                }
                this.renderTeam();
                break;
            }
            case 'autoRouteSwitch': {
                const condition = this.game.gameState.settings?.routeSwitchCondition || '6v_shiny';
                const doneText = condition === 'region_caught' ? '當前道路寶可夢已全數捕獲' : `當前地圖已${condition === '6v_only' ? '全部6V' : '全部6V+閃光'}`;
                this.addBattleLog(`💎 ${doneText}！自動前往 ${data.regionName} · ${data.routeName}`, 'evolution');
                this.showToast(`💎 自動切換到 ${data.routeName}`);
                if (this.currentTab === 'tab-map') this.renderMap({ preserveView: true });
                break;
            }
        }
    }

    renderBattleStart(battle) {
        const wild = battle.wild;
        const playerPokemonId = this.game.gameState.team[this.game.gameState.activePokemonIndex];
        const playerPokemon = this.game.createPokemon(playerPokemonId, true);

        // 獲取雙方屬性
        const wildData = POKEMON_DATA[wild.id];
        const playerData = POKEMON_DATA[playerPokemonId];
        const wildTypes = wildData?.types || [];
        const playerTypes = playerData?.types || [];

        document.getElementById('enemy-sprite').dataset.pokemonId = wild.id;
        document.getElementById('player-sprite').dataset.pokemonId = playerPokemonId;

        // 敵方資訊
        const shinyPrefix = wild.isShiny ? '✨ ' : '';
        document.getElementById('enemy-name').textContent = shinyPrefix + wild.name;
        document.getElementById('enemy-level').textContent = `Lv.${wild.level}`;
        const enemyHpPercent = Math.max(0, battle.wildCurrentHp / battle.wildMaxHp * 100);
        document.getElementById('enemy-hp-bar').style.width = `${enemyHpPercent}%`;
        document.getElementById('enemy-hp-bar').className = `hp-bar${enemyHpPercent <= 20 ? ' hp-danger' : enemyHpPercent <= 50 ? ' hp-warning' : ''}`;
        document.getElementById('enemy-hp-text').textContent = `${battle.wildCurrentHp}/${battle.wildMaxHp}`;

        // 計算雙向屬性相剋（支援雙屬性攻擊方取最優）
        const playerEffectiveness = getBestTypeEffectiveness(playerTypes, wildTypes).multiplier;
        const enemyEffectiveness = getBestTypeEffectiveness(wildTypes, playerTypes).multiplier;
        
        // 敵方屬性 + 對我方剋制圖示
        let enemyTypeIcon = '';
        if (enemyEffectiveness > 1) {
            enemyTypeIcon = `<span class="matchup-icon matchup-up" title="剋制我方">🔥</span>`;
        } else if (enemyEffectiveness < 1) {
            enemyTypeIcon = `<span class="matchup-icon matchup-down" title="被我方抵抗">🛡️</span>`;
        }
        const enemyTypesHtml = wildTypes.map(t =>
            `<span class="type-badge ${t}">${TYPE_NAMES[t]}</span>`
        ).join(' ') + enemyTypeIcon;
        document.getElementById('enemy-types').innerHTML = enemyTypesHtml;

        // 敵方精靈圖（閃光寶可夢使用閃光圖片）
        const enemySprite = document.getElementById('enemy-sprite');
        const enemySpriteUrl = wild.isShiny ? getShinyPokemonSpriteUrl(wild.id) : getPokemonSpriteUrl(wild.id);
        enemySprite.innerHTML = `<img src="${enemySpriteUrl}" alt="${wild.name}" onerror="fallbackPokemonSprite(this, ${wild.id}, ${!!wild.isShiny}, '👾')">${wild.isShiny ? this._shinyEntryEffectMarkup() : ''}`;
        if (wild.isShiny) {
            enemySprite.classList.add('shiny');
        } else {
            enemySprite.classList.remove('shiny');
        }

        // 玩家資訊（根據圖鑑展示偏好決定是否顯示閃光外觀）
        const playerShowShiny = this.game.gameState.pokedexDisplay[playerPokemonId] === 'shiny';
        const playerHasShiny = this.game.gameState.shinyDex[playerPokemonId];
        const playerShinyPrefix = playerHasShiny ? '✨ ' : '';
        document.getElementById('player-name').textContent = playerShinyPrefix + playerPokemon.name;
        document.getElementById('player-level').textContent = `Lv.${playerPokemon.level}`;
        const playerHpPercent = Math.max(0, battle.playerCurrentHp / battle.playerMaxHp * 100);
        document.getElementById('player-hp-bar').style.width = `${playerHpPercent}%`;
        document.getElementById('player-hp-bar').className = `hp-bar${playerHpPercent <= 20 ? ' hp-danger' : playerHpPercent <= 50 ? ' hp-warning' : ''}`;
        document.getElementById('player-hp-text').textContent = `${battle.playerCurrentHp}/${battle.playerMaxHp}`;

        // 玩家屬性 + 對敵方剋制圖示
        let playerTypeIcon = '';
        if (playerEffectiveness > 1) {
            playerTypeIcon = `<span class="matchup-icon matchup-up" title="剋制敵方">⚔️</span>`;
        } else if (playerEffectiveness < 1) {
            playerTypeIcon = `<span class="matchup-icon matchup-down" title="被敵方抵抗">🛡️</span>`;
        }
        const playerTypesHtml = playerTypes.map(t =>
            `<span class="type-badge ${t}">${TYPE_NAMES[t]}</span>`
        ).join(' ') + playerTypeIcon;
        document.getElementById('player-types').innerHTML = playerTypesHtml;
        this._updateBattleSkills(wildTypes);

        // 玩家精靈圖（根據圖鑑展示偏好決定是否使用閃光圖片）
        const playerSprite = document.getElementById('player-sprite');
        const playerSpriteUrl = Number(playerPokemonId) === 386
            ? getDeoxysSpriteUrl(playerPokemon.form, playerShowShiny)
            : playerShowShiny ? getShinyPokemonSpriteUrl(playerPokemonId) : getPokemonSpriteUrl(playerPokemonId);
        playerSprite.innerHTML = `<img src="${playerSpriteUrl}" alt="${playerPokemon.name}" onerror="fallbackPokemonSprite(this, ${playerPokemonId}, ${!!playerShowShiny}, '⚡')">${playerShowShiny && playerHasShiny ? this._shinyEntryEffectMarkup() : ''}`;
        if (playerShowShiny) {
            playerSprite.classList.add('shiny');
        } else {
            playerSprite.classList.remove('shiny');
        }

        // 清除原來的文字顯示
        document.getElementById('player-matchup').innerHTML = '';
        document.getElementById('enemy-matchup').innerHTML = '';
        document.getElementById('type-matchup').innerHTML = '';

        this.addBattleLog(`野生的 ${shinyPrefix}${wild.name} 出現了！${wild.isShiny ? '（閃光！）' : ''}`, wild.isShiny ? 'shiny' : 'normal');

        // 重置攻擊進度條
        document.getElementById('player-atk-bar').style.width = '0%';
        document.getElementById('enemy-atk-bar').style.width = '0%';
        for (const image of document.querySelectorAll('#battle-scene .pokemon-sprite img')) {
            image.addEventListener('load', () => this._sizeBattleSprites());
        }
        this._sizeBattleSprites();
    }

    _shinyEntryEffectMarkup() {
        return '<div class="shiny-entry-effect" aria-hidden="true">' +
            Array.from({ length: 9 }, () => '<span class="shiny-entry-star"></span>').join('') +
            '<span class="shiny-entry-orbit"></span></div>';
    }

    _updateBattleSkills(wildTypes = null) {
        const playerId = this.game.gameState.team[this.game.gameState.activePokemonIndex];
        const enemyId = this.game.currentBattle?.wild?.id;
        const types = wildTypes || POKEMON_DATA[enemyId]?.types || [];
        const selected = this.game._getBestSkillForEnemy(playerId, types);
        const skills = this.game.getSkillForPokemon(playerId)?.skills || [];
        this._setBattleSkills('player-battle-skill', skills, selected.type);
        const towerSkill = this.game._towerMode && this.game.currentBattle?.wild?.isTowerEnemy
            ? this.game._getTowerEnemySkill(enemyId, POKEMON_DATA[playerId]?.types || []) : null;
        const enemySkills = towerSkill ? (POKEMON_DATA[enemyId]?.types || []).flatMap(type => {
            const skill = SKILL_DATA[type]?.find(entry => entry.level === MAX_SKILL_LEVEL);
            return skill ? [{ ...skill, type }] : [];
        }) : [];
        this._setBattleSkills('enemy-battle-skill', enemySkills, towerSkill?.type || '');
    }

    _setBattleSkills(elementId, skills, selectedType) {
        const container = document.getElementById(elementId);
        const key = JSON.stringify([skills, selectedType]);
        if (container.dataset.skillsKey === key) return;
        container.dataset.skillsKey = key;
        container.replaceChildren();
        for (const skill of skills.length ? skills : [{ name: '普通攻擊', type: '' }]) {
            const label = document.createElement('span');
            label.textContent = skill.name;
            label.className = `type-badge ${TYPE_NAMES[skill.type] ? skill.type : 'battle-skill-basic'}`;
            if (skills.length > 1 && skill.type !== selectedType) {
                label.classList.add('battle-skill-unused');
                label.title = '目前未使用的技能';
            } else if (skill.type === selectedType && selectedType) {
                label.title = '目前使用的技能';
            }
            container.appendChild(label);
        }
    }

    updateRoadFailureStatus(failures) {
        const status = document.getElementById('road-failure-count');
        if (!status) return;
        if (!failures) {
            status.hidden = true;
            status.style.display = 'none';
            status.textContent = '';
            return;
        }
        status.hidden = false;
        status.style.display = 'block';
        status.textContent = `⚠️ 道路連敗 ${failures}/10`;
    }

    updateRoadRetreatStatus(message) {
        const status = document.getElementById('road-failure-status');
        if (!status) return;
        status.hidden = false;
        status.style.display = 'block';
        status.replaceChildren();
        const label = document.createElement('span');
        label.textContent = `⚠️ ${message}`;
        status.appendChild(label);
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'road-failure-dismiss';
        closeButton.setAttribute('aria-label', '關閉退路提示');
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            status.hidden = true;
            status.style.display = 'none';
            status.replaceChildren();
        }, { once: true });
        status.appendChild(closeButton);
    }

        // 使用整段 GIF 的可見範圍，並限制敵我視覺高度差，避免小型寶可夢過小。
        _sizeBattleSprites() {
            const sprites = [...document.querySelectorAll('#battle-scene .pokemon-sprite')].map(container => {
            const image = container.querySelector('img');
            if (!image) return null;
            const path = image.getAttribute('src')?.replace(/^sprites\//, '');
            const bounds = SPRITE_BOUNDS[path];
            const square = path?.startsWith('animated-square/') ? SPRITE_SQUARE_BOUNDS[path.slice('animated-square/'.length)] : null;
            const animation = square || SPRITE_ANIMATION_BOUNDS[path];
            const fraction = animation ? animation[3] / animation[1] : bounds ? (bounds[5] - bounds[3]) / bounds[1] : 1;
            const aspect = animation ? animation[0] / animation[1] : bounds ? bounds[0] / bounds[1] : (image.naturalWidth / image.naturalHeight || 1);
            const id = Number(container.dataset.pokemonId);
            const shape = POKEMON_SHAPES[id];
            const visibleWidth = animation ? animation[2] : bounds ? bounds[4] - bounds[2] : 1;
            const visibleHeight = animation ? animation[3] : bounds ? bounds[5] - bounds[3] : 1;
            // 蛇形身長包含彎曲身體；魚形以長邊與畫面高度混合估計。
            const silhouette = Math.min(1, visibleHeight / Math.max(visibleWidth, visibleHeight));
            const posture = shape === 2 ? 0.45 + 0.2 * silhouette : shape === 3 ? 0.6 + 0.4 * silhouette : 1;
            const size = Math.max(0.15, Math.min(1, (POKEMON_HEIGHTS[id] || 10) / 20 * posture));
                return { container, image, fraction, aspect, desired: container.clientHeight * size };
            }).filter(Boolean);
            if (!sprites.length) return;

            // 將較小一方提升至較大一方的 1/1.6；仍保留原有身高差異。
            if (sprites.length === 2) {
                const [smaller, larger] = [...sprites].sort((a, b) => a.desired - b.desired);
                smaller.desired = Math.max(smaller.desired, larger.desired / 1.6);
            }

            let scale = 1;
        for (const s of sprites) {
            if (s.desired > 0) {
                scale = Math.min(scale, s.container.clientHeight * s.fraction / s.desired,
                    s.container.clientWidth * s.fraction / (s.desired * s.aspect));
            }
        }
        for (const s of sprites) s.image.style.setProperty('--sprite-height', `${s.desired * scale / s.fraction}px`);
    }

    onPlayerAttack(data) {
        this._updateBattleSkills();
        const playerSprite = document.getElementById('player-sprite');
        const enemySprite = document.getElementById('enemy-sprite');
        playerSprite.classList.add('attacking');
        setTimeout(() => {
            playerSprite.classList.remove('attacking');
            enemySprite.classList.add('hit');
            setTimeout(() => enemySprite.classList.remove('hit'), 300);
        }, 150);
        // 顯示傷害資訊
        const critText = data.critical ? '💥會心一擊！' : '';
        const effectText = data.effectivenessText || '';
        const skillText = data.skillName ? `使用【${data.skillName}】` : '';
        this.addBattleLog(`${skillText}${critText}造成 ${data.damage} 點傷害 ${effectText}`, 'attack');
    }

    onEnemyAttack(data) {
        const enemySprite = document.getElementById('enemy-sprite');
        const playerSprite = document.getElementById('player-sprite');
        enemySprite.classList.add('attacking');
        setTimeout(() => {
            enemySprite.classList.remove('attacking');
            playerSprite.classList.add('hit');
            setTimeout(() => playerSprite.classList.remove('hit'), 300);
        }, 150);
        // 顯示傷害資訊
        const critText = data.critical ? '💥會心一擊！' : '';
        const effectText = data.effectivenessText || '';
        const skillText = data.skillName ? `敵方使用【${data.skillName}】` : '';
        this.addBattleLog(`${skillText}${critText}受到 ${data.damage} 點傷害 ${effectText}`, 'attack');
    }

    updateBattleHP(data) {
        // 敵方HP
        const enemyPercent = Math.max(0, data.enemyHp / data.enemyMaxHp * 100);
        const enemyBar = document.getElementById('enemy-hp-bar');
        enemyBar.style.width = enemyPercent + '%';
        enemyBar.className = 'hp-bar' + (enemyPercent <= 20 ? ' low' : enemyPercent <= 50 ? ' medium' : '');
        document.getElementById('enemy-hp-text').textContent = `${Math.max(0, data.enemyHp)}/${data.enemyMaxHp}`;

        // 玩家HP
        const playerPercent = Math.max(0, data.playerHp / data.playerMaxHp * 100);
        const playerBar = document.getElementById('player-hp-bar');
        playerBar.style.width = playerPercent + '%';
        playerBar.className = 'hp-bar' + (playerPercent <= 20 ? ' low' : playerPercent <= 50 ? ' medium' : '');
        document.getElementById('player-hp-text').textContent = `${Math.max(0, data.playerHp)}/${data.playerMaxHp}`;

        // 攻擊進度條
        if (data.playerAttackProgress !== undefined) {
            const playerAtkPercent = Math.min(100, Math.max(0, data.playerAttackProgress * 100));
            document.getElementById('player-atk-bar').style.width = playerAtkPercent + '%';
        }
        if (data.enemyAttackProgress !== undefined) {
            const enemyAtkPercent = Math.min(100, Math.max(0, data.enemyAttackProgress * 100));
            document.getElementById('enemy-atk-bar').style.width = enemyAtkPercent + '%';
        }
    }

    onEnemyDefeated(data) {
        // 更新血條：敵方為0，玩家回覆後血量
        this.updateBattleHP({
            playerHp: data.playerHp,
            playerMaxHp: data.playerMaxHp,
            enemyHp: 0,
            enemyMaxHp: data.enemyMaxHp,
        });

        let message = `擊敗了 ${data.pokemon.name}！獲得 ${data.exp} 經驗值`;
        if (data.gold && data.gold > 0) {
            message += ` 🪙 +${data.gold}`;
        }
        if (data.healed && data.healed > 0) {
            message += ` 💚 回覆 ${data.healed} HP`;
        }
        this.addBattleLog(message, 'defeat');
        if (this.currentTab === 'tab-battle') this.renderTeam();
        // 更新金幣顯示
        this.updateGoldDisplay();
    }

    // 戰鬥日誌陣列，最多儲存100條
    battleLogs = [];
    captureLogs = [];

    addBattleLog(msg, type = 'normal', category = type === 'catch' ? 'capture' : 'battle') {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        const logs = category === 'capture' ? this.captureLogs : this.battleLogs;
        logs.unshift({ time: timeStr, message: msg, type });
        
        // 只保留最近100條
        if (logs.length > 100) logs.pop();
        
        const container = document.getElementById(category === 'capture' ? 'capture-messages' : 'battle-messages');
        container.insertAdjacentHTML('afterbegin', this._renderBattleLogEntry(logs[0]));
        if (container.children.length > 100) {
            container.lastElementChild.remove();
        }
    }

    _renderBattleLogEntry(log) {
        let colorClass = '';
        if (log.type === 'catch') colorClass = 'log-catch';
        else if (log.type === 'levelup') colorClass = 'log-levelup';
        else if (log.type === 'attack') colorClass = 'log-attack';
        else if (log.type === 'defeat') colorClass = 'log-defeat';
        else if (log.type === 'evolution') colorClass = 'log-evolution';
        else if (log.type === 'shiny') colorClass = 'log-shiny';
        return `<div class="log-entry ${colorClass}"><span class="log-time">[${log.time}]</span> ${log.message}</div>`;
    }

    renderBattleLogs() {
        document.getElementById('battle-messages').innerHTML = this.battleLogs.map(log => this._renderBattleLogEntry(log)).join('');
        document.getElementById('capture-messages').innerHTML = this.captureLogs.map(log => this._renderBattleLogEntry(log)).join('');
    }

    // ===================== 隊伍面板（含屬性/個體值/經驗值） =====================
    // 格式化速率數字（大數字用 K/M 縮寫）
    _formatRate(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    renderTeam() {
        if (!this.game.gameState) return;

        const teamList = document.getElementById('team-list');
        // 獲取實際速率
        const rates = this.game.getRatesPerMinute();
        let rateHtml = '';
        if (rates) {
            const parts = [];
            if (rates.expPerMin > 0) {
                parts.push(`<span class="rate-exp">📊 ${this._formatRate(rates.expPerMin)} 經驗/分鐘</span>`);
            }
            if (rates.goldPerMin > 0) {
                parts.push(`<span class="rate-gold">🪙 ${this._formatRate(rates.goldPerMin)} 金幣/分鐘</span>`);
            }
            if (parts.length > 0) {
                rateHtml = `<span class="team-rate-info">${parts.join(' ')}</span>`;
            }
        }
        teamList.innerHTML = '<h3 class="team-list-heading"><span>⚔️ 我的隊伍 (' + this.game.gameState.team.length + '/6)</span><span class="team-heading-actions">' + rateHtml + '<button id="btn-recommend-team" class="team-stat-sources-btn" type="button">🧩 推薦隊伍</button><button id="btn-stat-sources" class="team-stat-sources-btn" type="button">📊 計算公式</button></span></h3>';
        const encounterRates = this.game.getWildEncounterRates();
        const formatChance = value => `${(value * 100).toFixed(6).replace(/\.?0+$/, '')}%`;

        // 出戰寶可夢排在最前面，其餘按等級從高到低排序
        const activeIdx = this.game.gameState.activePokemonIndex;
        const restIndices = this.game.gameState.team.map((_, i) => i).filter(i => i !== activeIdx);
        restIndices.sort((a, b) => {
            const levelA = this.game.getStoredData(this.game.gameState.team[a])?.level || 1;
            const levelB = this.game.getStoredData(this.game.gameState.team[b])?.level || 1;
            return levelB - levelA;
        });
        const renderOrder = [activeIdx, ...restIndices];

        renderOrder.forEach((index) => {
            const pokemonId = this.game.gameState.team[index];
            if (!pokemonId) return;
            const isActive = index === activeIdx;
            
            // 從 game.createPokemon 獲取寶可夢例項（使用儲存的等級）
            const pokemon = this.game.createPokemon(pokemonId, true);
            if (!pokemon) return;

            const battleStats = this.game.calculateBattleStats(index);
            const expProgress = this.game.getExpProgress(pokemonId);
            const catchupPercent = Math.round((this.game.getTeamCatchupMultiplier(pokemonId) - 1) * 1000) / 10;
            const baseData = POKEMON_DATA[pokemonId];

            const typeBadges = baseData.types.map(t =>
                `<span class="type-badge ${t}">${TYPE_NAMES[t]}</span>`
            ).join(' ');

            const towerFainted = !!(this.game._towerMode && this.game._towerFaintedIds?.has(pokemonId));
            const slot = document.createElement('div');
            slot.className = `team-slot${isActive ? ' active' : ''}${towerFainted ? ' tower-fainted' : ''}`;
            slot.tabIndex = 0;
            slot.setAttribute('role', 'button');
            slot.setAttribute('aria-label', `查看 ${pokemon.name} 的詳細數值`);
            slot.addEventListener('click', event => {
                if (!event.target.closest('button')) this.showTeamPokemonDetails(index);
            });
            slot.addEventListener('keydown', event => {
                if (event.target === slot && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    this.showTeamPokemonDetails(index);
                }
            });
            
            // 獲取寶可夢的儲存資料
            const storedData = this.game.getStoredData(pokemonId);
            
            // 計算戰力和潛力
            const power = this.game.calculatePower(pokemonId, true);
            const potential = this.game.calculatePotential(pokemonId);
            const potentialColor = potential >= 80 ? '#2ecc71' : potential >= 60 ? '#f39c12' : '#e74c3c';
            
            const showShiny = this.game.gameState.pokedexDisplay[pokemonId] === 'shiny';
        const slotSpriteUrl = Number(pokemonId) === 386
            ? getDeoxysSpriteUrl(pokemon.form, showShiny)
            : showShiny ? getShinyPokemonSpriteUrl(pokemonId) : getPokemonSpriteUrl(pokemonId);
            const hasShiny = this.game.gameState.shinyDex[pokemonId];
            const shinyNamePrefix = hasShiny ? '✨ ' : '';

            // 技能等級顯示（0不顯示）
            const skillLevel = storedData ? (storedData.skillLevel || 0) : 0;
            const skillBadgeHtml = skillLevel > 0 ? ` <span class="team-skill-badge">⚡${skillLevel >= MAX_SKILL_LEVEL ? 'Max' : 'Lv.' + skillLevel}</span>` : '';
            const canUpgradeSkill = this.game.isSkillUnlocked() && storedData && storedData.level >= SKILL_LEVEL_REQUIREMENT && skillLevel < MAX_SKILL_LEVEL;

            slot.innerHTML = `
                <div class="slot-main-row${Number(pokemonId) === 386 ? ' has-deoxys-actions' : ''}">
                    <div class="slot-sprite${showShiny ? ' shiny' : ''}"><img src="${slotSpriteUrl}" alt="${pokemon.name}" onerror="fallbackPokemonSprite(this, ${pokemonId}, ${!!showShiny}, '🔵')"></div>
                    <div class="slot-info">
                        <div class="slot-name">${pokemon.name}${shinyNamePrefix} ${isActive ? '⚔️' : ''} ${towerFainted ? '<span class="tower-fainted-label">已倒下</span>' : ''} <small style="color:var(--text-secondary);font-weight:normal">Lv.${pokemon.level}</small>${skillBadgeHtml}</div>
                        <div class="slot-type-nature">${typeBadges}</div>
                    </div>
                    <div class="team-slot-actions${Number(pokemonId) === 386 ? ' deoxys-team-actions' : ''}">
                        <div class="team-slot-primary-actions">
                        ${!isActive ? `<button onclick="gameUI.setActive(${index})" ${towerFainted ? 'disabled' : ''}>出戰</button>` : ''}
                        ${!isActive && !this.game._towerMode && this.game.gameState.team.length > 1 ? `<button class="remove-btn" onclick="gameUI.removeFromTeam(${index})">移除</button>` : ''}
                        </div>
                ${Number(pokemonId) === 386 && !this.game._towerMode ? '<button type="button" class="deoxys-form-team-btn">型態</button>' : ''}
                    </div>
                </div>
                <div class="team-stats-wrapper">
                    <div class="team-stats-compact">
                        <div class="team-stat-line">
                            <span class="stat-name">❤️ 生命值</span>
                            <span class="stat-value">${battleStats.hp}</span>
                            <span class="stat-iv">(IV:${pokemon.ivs.hp})</span>
                        </div>
                        <div class="team-stat-line">
                            <span class="stat-name">⚔️ 攻擊力</span>
                            <span class="stat-value">${battleStats.attack}</span>
                            <span class="stat-iv">(IV:${pokemon.ivs.atk}+${pokemon.ivs.spAtk})</span>
                        </div>
                        <div class="team-stat-line">
                            <span class="stat-name">🛡️ 防禦力</span>
                            <span class="stat-value">${battleStats.defense}</span>
                            <span class="stat-iv">(IV:${pokemon.ivs.def}+${pokemon.ivs.spDef})</span>
                        </div>
                        <div class="team-stat-line">
                            <span class="stat-name">💨 速度</span>
                            <span class="stat-value">${battleStats.speed}</span>
                            <span class="stat-iv">(IV:${pokemon.ivs.speed})</span>
                        </div>
                    </div>
                    <div class="team-stats-right">
                        <div class="right-stat power-stat" title="戰力">⚔️ ${power}</div>
                        <div class="right-stat potential-stat" title="潛力" style="color:${potentialColor}">💎 ${potential}%</div>
                    </div>
                </div>
                ${canUpgradeSkill ? `<button type="button" class="team-skill-upgrade">⚡ 升級技能</button>` : ''}
                <div class="slot-exp-section">
                    <div class="slot-exp-info">
                        <span>EXP ${expProgress.current}/${expProgress.needed}</span>
                        <span>${expProgress.percent}%</span>
                    </div>
                    <div class="slot-exp-bar">
                        <div class="slot-exp-fill" style="width:${expProgress.percent}%"></div>
                    </div>
                    ${catchupPercent > 0 ? `<div class="slot-exp-bonus">等級過低額外 +${catchupPercent}%</div>` : ''}
                </div>
            `;
            if (Number(pokemonId) === 386) {
                const formNames = { normal: '普通', attack: '攻擊', defense: '防禦', speed: '速度' };
                const formLabel = document.createElement('small');
                formLabel.className = 'deoxys-form-label';
            formLabel.textContent = `${formNames[pokemon.form] || '普通'}形態`;
                slot.querySelector('.slot-name')?.appendChild(formLabel);
            }
        slot.querySelector('.deoxys-form-team-btn')?.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            this.showDeoxysFormDialog(386, 'edit');
        });
        slot.querySelector('.team-skill-upgrade')?.addEventListener('click', event => {
                event.stopPropagation();
                this.confirmSkillUpgrade(pokemonId);
            });
            teamList.appendChild(slot);
        });
        document.getElementById('team-encounter-rates').innerHTML = `<span>野外遭遇（不含對戰塔）</span><span>✨ 閃光 ${formatChance(encounterRates.shiny)}</span><span>🎯 單項 V ${formatChance(encounterRates.iv31)}</span>`;
    }

    previewTeamRecommendation(targetLevel) {
        if (this.game._towerMode || this.game._offlineSimState || this.game.healTimer || this.game._nextBattleTimeout) {
            this.showToast('⚠️ 挑戰、離線結算或戰鬥間隔期間無法更換隊伍');
            return;
        }
        const enemy = this.game.currentBattle?.wild;
        if (!enemy || this.game.currentBattle.wildCurrentHp <= 0) {
            this.showToast('⚠️ 請等下一場戰鬥開始後再預覽');
            return;
        }
        const result = this.game.recommendTeamForEnemy(enemy, targetLevel);
        if (!result) {
            this.showToast('⚠️ 目前道路或等級無法產生推薦');
            return;
        }
        result.targetLevel = targetLevel;
        const applyTeam = result.applyTeam || result.team;
        const originalTeam = this.game.gameState.team.slice();
        const autoSwitch = !!this.game.gameState.settings?.autoSwitchBest;
        const strategy = this.game.gameState.settings?.oneShotStrategy || 'fastest';
        this.showTeamRecommendation(result, () => {
            if (this.game._towerMode || this.game._offlineSimState || this.game.healTimer || this.game._nextBattleTimeout || !this.game.currentBattle?.wild || this.game.currentBattle.wildCurrentHp <= 0 || this.game.gameState.currentRoute !== result.routeId || !!this.game.gameState.settings?.autoSwitchBest !== autoSwitch || (this.game.gameState.settings?.oneShotStrategy || 'fastest') !== strategy || this.game.gameState.team.length !== originalTeam.length || this.game.gameState.team.some((id, i) => id !== originalTeam[i]) || applyTeam.some(id => this.game.gameState.pokedex[id] !== 'caught')) {
                this.showToast('⚠️ 遊戲狀態已改變，請重新預覽');
                return;
            }
            const oldActiveId = this.game.gameState.team[this.game.gameState.activePokemonIndex];
            this.game.gameState.team = applyTeam.slice();
            applyTeam.filter(id => !originalTeam.includes(id)).forEach(id => this.setDefaultTeamSprite(id));
            let activeIndex = result.activeIndex;
            if (targetLevel !== null || (autoSwitch && this.game.currentBattle.wild !== enemy)) {
                this.game.gameState.activePokemonIndex = Math.max(0, applyTeam.indexOf(oldActiveId));
                const currentBest = this.game.getBestTeamMemberForEnemy(this.game.currentBattle.wild);
                if (currentBest >= 0) activeIndex = currentBest;
            }
            this.game.setActivePokemon(activeIndex);
            this.game.save();
            this.renderTeam();
            this.showToast('✅ 已套用推薦隊伍');
        });
    }

    getRecommendationEvolutionHint(pokemonId) {
        const locations = [];
        for (const region of Object.values(REGIONS)) {
            for (const route of region.routes || []) {
                if (route.pokemon?.some(entry => entry.id === pokemonId)) locations.push(`${region.name}・${route.name}`);
            }
        }

        const steps = [];
        let id = pokemonId;
        const visited = new Set();
        while (this.game.gameState.pokedex[id] !== 'caught' && !visited.has(id)) {
            visited.add(id);
            const parent = this.game._baseIdCache[id];
            if (parent === undefined || !POKEMON_DATA[parent]) break;
            const raw = POKEMON_DATA[parent].evolvesTo;
            const evolution = (Array.isArray(raw) ? raw : raw ? [raw] : []).find(entry => entry.id === id);
            if (!evolution) break;
            const regionId = this.game.getEvolutionRegionId(id);
            const region = regionId ? REGIONS[regionId] : null;
            const requirement = regionId ? `（需解鎖${region?.name || regionId}）` : '';
            steps.unshift(`${POKEMON_DATA[parent].name} Lv.${evolution.level} → ${POKEMON_DATA[id].name}${requirement}`);
            id = parent;
        }
        const direct = locations.length ? `野外可遇：${locations.join('、')}` : '沒有固定野外出現道路';
        return `${direct}${steps.length ? `；進化：${steps.join('；')}` : ''}`;
    }

    showTeamRecommendation(result, onConfirm) {
        const current = this.game.gameState.team;
        const proposed = result.team;
        const removed = current.filter(id => !proposed.includes(id));
        const added = proposed.filter(id => !current.includes(id));
        const unchanged = proposed.filter(id => current.includes(id));
        const sprite = (id, label, active = false) => {
            if (id == null) return `<div class="recommend-pokemon recommend-empty"><span>空位</span></div>`;
            const data = POKEMON_DATA[id];
            const stored = this.game.getStoredData(id);
            const shiny = this.game.gameState.pokedexDisplay[id] === 'shiny';
            const url = shiny ? getShinyPokemonSpriteUrl(id) : getPokemonSpriteUrl(id);
            const virtual = result.simulatedIds?.includes(id);
            return `<div class="recommend-pokemon"><img src="${url}" alt="${data.name}" onerror="fallbackPokemonSprite(this, ${id}, ${!!shiny}, '🔵')"><div><span class="recommend-label">${label}${active ? (result.targetLevel !== null ? ' · 模擬出戰' : ' · 建議出戰') : ''}</span><strong>${data.name}</strong><small>${virtual ? `尚未擁有・模擬進化<br>${this.getRecommendationEvolutionHint(id)}` : `實際 Lv.${stored?.level || 1}`}</small></div></div>`;
        };
        const pairs = [];
        for (let i = 0; i < Math.max(removed.length, added.length); i++) {
            pairs.push(`<div class="recommend-pair">${sprite(removed[i], '移出')}<span class="recommend-arrow" aria-hidden="true">→</span>${sprite(added[i], '加入', added[i] === proposed[result.activeIndex])}</div>`);
        }
        const retained = unchanged.map(id => sprite(id, '保留', id === proposed[result.activeIndex])).join('');
        document.getElementById('team-recommend-content').innerHTML = `
            <div class="recommend-summary">${result.targetLevel !== null ? `未來潛力 · 模擬 Lv.${result.targetLevel}（不代表目前戰力）` : '現在最強 · 實際等級'}<br>${pairs.length ? `隊伍變更 ${pairs.length} 組` : '目前隊伍已是本次比較的推薦結果'} · ${result.targetLevel !== null ? '綜合分數（秒，含倒下風險懲罰）' : '道路預估（秒／場）'} ${Math.round(result.averageTime / 100) / 10}</div>
            ${result.targetLevel !== null ? `<div class="recommend-summary">模擬技能滿級及未擁有的進化，不檢查地區解鎖；圖鑑加成僅計已擁有。套用隊伍：${result.applyTeam.map(id => POKEMON_DATA[id].name).join('、')}。實際戰力可能低於模擬。</div>` : ''}
            ${pairs.length ? `<div class="recommend-pairs">${pairs.join('')}</div>` : ''}
            ${retained ? `<h3 class="recommend-subtitle">保留的隊員</h3><div class="recommend-retained">${retained}</div>` : ''}`;
        const dialog = document.getElementById('team-recommend-dialog');
        document.getElementById('confirm-recommend-team').onclick = () => {
            dialog.close();
            onConfirm();
        };
        dialog.showModal();
    }

    showTeamPokemonDetails(index) {
        const id = this.game.gameState.team[index];
        if (!id) return;
        this._teamDetailPokemonId = id;
        this._teamDetailHtml = null;
        this._teamSourcesHtml = null;
        document.getElementById('team-detail-tab').click();
        const dialog = document.getElementById('team-detail-dialog');
        dialog.showModal();
        clearInterval(this._teamDetailTimer);
        this._teamDetailTimer = setInterval(() => this._updateTeamPokemonDetails(), 1000);
    }

    _updateTeamPokemonDetails() {
        const id = this._teamDetailPokemonId;
        const index = this.game.gameState.team.indexOf(id);
        if (!id || index < 0) {
            const dialog = document.getElementById('team-detail-dialog');
            if (dialog.open) dialog.close();
            return;
        }
        const pokemon = this.game.createPokemon(id, true);
        const data = POKEMON_DATA[id];
        const battle = this.game.calculateBattleStats(index);
        if (!pokemon || !data || !battle) return;

        const effective = this.game.getEffectiveBaseStats(id);
        const own = this.game.calculateBaseStats(pokemon);
        const rawBase = Number(id) === 386 ? DEOXYS_FORM_BASE_STATS[pokemon.form] || DEOXYS_FORM_BASE_STATS.normal : data.baseStats;
        const stats = [['hp', '生命'], ['atk', '物攻'], ['def', '物防'], ['spAtk', '特攻'], ['spDef', '特防'], ['speed', '速度']];
        const rows = stats.map(([key, name]) => `<div class="team-detail-row"><strong>${name}</strong><span>${rawBase[key]}</span><span>${effective[key]}</span><span>${pokemon.ivs[key]}</span><span>${own[key].toLocaleString()}</span></div>`).join('');
        const finalStats = [['生命值', battle.hp], ['攻擊力', battle.attack], ['防禦力', battle.defense], ['速度', battle.speed]];
        const maxStat = Math.max(1, ...finalStats.map(([, value]) => value));
        const showShiny = this.game.gameState.pokedexDisplay[id] === 'shiny';
        const spriteUrl = Number(id) === 386 ? getDeoxysSpriteUrl(pokemon.form, showShiny) : showShiny ? getShinyPokemonSpriteUrl(id) : getPokemonSpriteUrl(id);
        const formName = Number(id) === 386 ? `（${{ normal: '普通', attack: '攻擊', defense: '防禦', speed: '速度' }[pokemon.form] || '普通'}形態）` : '';
        document.getElementById('team-detail-title').textContent = `${pokemon.name}${formName} · Lv.${pokemon.level}`;
        const detailHtml = `
            <div class="team-detail-hero"><div class="team-detail-sprite"><img src="${spriteUrl}" alt="${pokemon.name}" onerror="fallbackPokemonSprite(this, ${id}, ${!!showShiny}, '🔵')"></div><div class="team-detail-hero-info"><div class="team-detail-badge">${index === this.game.gameState.activePokemonIndex ? '目前出戰' : '隊伍成員'}</div><p class="team-detail-intro">戰力 ${this.game.calculatePower(id, true).toLocaleString()}<br>潛力 ${this.game.calculatePotential(id)}%</p></div></div>
            <h3>戰鬥屬性</h3><p class="team-detail-note">圖條以這隻寶可夢的最高戰鬥屬性為 100%。</p><div class="team-detail-final">${finalStats.map(([name, value]) => `<div><span>${name}</span><strong>${value.toLocaleString()}</strong><div class="team-detail-meter" aria-hidden="true"><div style="width:${Math.max(0, Math.min(100, value / maxStat * 100))}%"></div></div></div>`).join('')}</div>
            <h3>詳細數值</h3><p class="team-detail-note">有效種族值包含樹果與閃光加成；自身數值不含隊友、圖鑑、寶石及天賦加成。</p>
            <div class="team-detail-table"><div class="team-detail-row team-detail-labels"><strong>屬性</strong><span>種族值</span><span>有效值</span><span>IV</span><span>自身</span></div>${rows}</div>`;
        const content = document.getElementById('team-detail-content');
        if (this._teamDetailHtml !== detailHtml) {
            content.innerHTML = detailHtml;
            this._teamDetailHtml = detailHtml;
        }
        const sources = document.getElementById('team-sources-content');
        if (!sources.hidden) {
            const sourceHtml = this._renderBattleStatSources(index);
            if (this._teamSourcesHtml !== sourceHtml) {
                sources.innerHTML = sourceHtml;
                this._teamSourcesHtml = sourceHtml;
            }
        }
    }

    setActive(index) {
        if (this.game.setActivePokemon(index) === false) {
            this.showToast('⚠️ 倒下的隊員或戰鬥間隔中無法出戰');
            return;
        }
        this.renderTeam();
    }

    removeFromTeam(index) {
        if (this.game.removeFromTeam(index)) {
            this.renderTeam();
            this.showToast('寶可夢已離開隊伍');
        }
    }

    addToTeamFromPokedex(pokemonId) {
        if (this.game._towerMode) { this.showToast('⚠️ 對戰塔挑戰期間無法更換隊伍'); return; }
        if (this.game.gameState.team.length >= 6) {
            this.showTeamReplacement(pokemonId);
            return;
        }
        if (Number(pokemonId) === 386) {
            const appearance = this.game.gameState.pokedexDisplay?.[386] === 'shiny' ? 'shiny' : 'normal';
            this._addToTeamWithAppearance(pokemonId, appearance);
            return;
        }
        if (this.game.gameState.shinyDex?.[pokemonId]) {
            const dialog = document.getElementById('team-appearance-dialog');
            document.getElementById('team-appearance-description').textContent = `選擇 ${POKEMON_DATA[pokemonId]?.name || ''} 加入隊伍後的外觀。`;
            const options = document.getElementById('team-appearance-options');
            options.querySelector('input[value="shiny"]').checked = true;
            this._setTeamAppearancePreviews(options, pokemonId);
            document.getElementById('team-appearance-confirm').onclick = () => {
                const appearance = options.querySelector('input:checked').value;
                dialog.close();
                this._addToTeamWithAppearance(pokemonId, appearance);
            };
            dialog.showModal();
            return;
        }
        this._addToTeamWithAppearance(pokemonId, 'normal');
    }

    confirmSkillUpgrade(pokemonId) {
        const pokemonName = POKEMON_DATA[pokemonId]?.name;
        const stored = this.game.getStoredData(pokemonId);
        if (!pokemonName || !stored) return;
        const skillLevel = stored.skillLevel || 0;
        const skillGain = Math.max(0, Math.min(MAX_SKILL_LEVEL - skillLevel, Math.floor(stored.level / SKILL_LEVEL_REQUIREMENT)));
        this.showConfirmDialog(
            '升級技能',
            `確定要升級 ${pokemonName} 的技能嗎？<br>技能等級：${skillLevel} → ${skillLevel + skillGain}（+${skillGain}）<br>⚠️ 寶可夢等級將重置為 1，經驗歸零且不返還；技能不超過 ${MAX_SKILL_LEVEL} 級。<br>等級重置後戰力會降低，可能無法打贏目前地圖的敵人。`,
            () => {
                const result = this.game.upgradeSkill(pokemonId);
                if (result.success) {
                    this.showToast(`⚡ ${pokemonName} 技能升至 Lv.${result.newSkillLevel}！等級重置後為 Lv.${result.newLevel}`);
                    this._updateBattleSkills();
                    if (this.currentTab === 'tab-pokedex') this.renderPokedex();
                    this.renderTeam();
                } else {
                    this.showToast('⚠️ ' + result.message);
                }
            }
        );
    }

    showDeoxysFormDialog(pokemonId, mode = 'edit') {
        if (Number(pokemonId) !== 386 || this.game._towerMode) return;
        if (mode === 'edit' && !this.game.gameState.team.includes(386)) return;
        if (mode === 'pokedex' && this.game.gameState.pokedex[386] !== 'caught') return;
        if (mode === 'add' && (this.game.gameState.team.length >= 6 || this.game.gameState.team.includes(386))) return;

        const dialog = document.getElementById('deoxys-form-dialog');
        const options = document.getElementById('deoxys-form-options');
        const savedForm = this.game.gameState.pokemonForms?.[386];
        const currentForm = ['normal', 'attack', 'defense', 'speed'].includes(savedForm) ? savedForm : 'normal';
        options.querySelector(`input[value="${currentForm}"]`).checked = true;
        const shinyToggle = document.getElementById('deoxys-shiny-toggle');
        shinyToggle.hidden = !this.game.gameState.shinyDex?.[386];
        let isShowingShiny = !shinyToggle.hidden && this.game.gameState.pokedexDisplay?.[386] === 'shiny';
        const updateDeoxysPreviews = () => options.querySelectorAll('[data-deoxys-preview]').forEach(image => {
            image.src = getDeoxysSpriteUrl(image.dataset.deoxysPreview, isShowingShiny);
        });
        options.onchange = updateDeoxysPreviews;
        shinyToggle.setAttribute('aria-pressed', String(isShowingShiny));
        shinyToggle.title = isShowingShiny ? '目前顯示閃光外觀；按下切回普通' : '按下預覽閃光外觀';
        shinyToggle.onclick = () => {
            if (shinyToggle.hidden) return;
            isShowingShiny = !isShowingShiny;
            shinyToggle.setAttribute('aria-pressed', String(isShowingShiny));
            shinyToggle.title = isShowingShiny ? '目前顯示閃光外觀；按下切回普通' : '按下預覽閃光外觀';
            updateDeoxysPreviews();
        };
        updateDeoxysPreviews();
        document.getElementById('deoxys-form-title').textContent = mode === 'add' ? '加入代歐奇希斯' : '設定代歐奇希斯';
        document.getElementById('deoxys-form-confirm').textContent = mode === 'add' ? '加入隊伍' : '套用設定';
        document.getElementById('deoxys-form-confirm').onclick = () => {
            const form = options.querySelector('input:checked')?.value || 'normal';
            this.game.gameState.pokemonForms = this.game.gameState.pokemonForms || {};
            this.game.gameState.pokemonForms[386] = form;
            if (!shinyToggle.hidden && isShowingShiny) this.game.gameState.pokedexDisplay[386] = 'shiny';
            else delete this.game.gameState.pokedexDisplay[386];
            dialog.close();
            if (mode === 'add') {
                this._addToTeamWithAppearance(386, isShowingShiny ? 'shiny' : 'normal');
            } else {
                this.game.save();
                this.renderTeam();
                this.renderPokedex();
                this.showToast('代歐奇希斯型態設定已更新');
            }
        };
        dialog.showModal();
    }

    _addToTeamWithAppearance(pokemonId, appearance) {
        const result = this.game.addToTeamFromPokedex(pokemonId);
        if (result) {
            this.setDefaultTeamSprite(pokemonId, appearance);
            this.game.save();
            this.renderTeam();
            this.renderPokedex();
            this.showToast('寶可夢已加入隊伍！');
        } else {
            this.showToast('⚠️ 加入隊伍失敗');
        }
    }

    // 新加入的隊員優先展示已獲得的閃光，不更動既有隊員的展示選擇。
    setDefaultTeamSprite(pokemonId, appearance = 'shiny') {
        const state = this.game.gameState;
        state.pokedexDisplay = state.pokedexDisplay || {};
        if (appearance === 'shiny' && state.shinyDex?.[pokemonId]) state.pokedexDisplay[pokemonId] = 'shiny';
        else delete state.pokedexDisplay[pokemonId];
    }

    _setTeamAppearancePreviews(container, pokemonId) {
        for (const image of container.querySelectorAll('[data-appearance-preview]')) {
            const shiny = image.dataset.appearancePreview === 'shiny';
            image.onerror = () => { image.onerror = null; image.src = getLocalPokemonSpriteUrl(pokemonId, shiny); };
            image.src = shiny ? getShinyPokemonSpriteUrl(pokemonId) : getPokemonSpriteUrl(pokemonId);
        }
    }

    showTeamReplacement(pokemonId) {
        if (this.game._towerMode) { this.showToast('⚠️ 對戰塔挑戰期間無法更換隊伍'); return; }
        const pokemon = POKEMON_DATA[pokemonId];
        if (!pokemon || this.game.gameState.pokedex[pokemonId] !== 'caught' || this.game.gameState.team.includes(pokemonId)) return;
        const originalTeam = this.game.gameState.team.slice();
        const list = document.getElementById('team-replace-list');
        const appearance = document.getElementById('team-replace-appearance');
        appearance.hidden = !this.game.gameState.shinyDex?.[pokemonId];
        appearance.querySelector('input[value="shiny"]').checked = true;
        if (!appearance.hidden) {
            this._setTeamAppearancePreviews(appearance, pokemonId);
        }
        document.getElementById('team-replace-description').textContent = `隊伍已滿。選擇要由 ${pokemon.name} 替換的隊員。`;
        list.innerHTML = '';
        originalTeam.forEach((id, index) => {
            const data = POKEMON_DATA[id];
            const stored = this.game.getStoredData(id);
            if (!data) return;
            const shiny = this.game.gameState.pokedexDisplay[id] === 'shiny';
            const url = shiny ? getShinyPokemonSpriteUrl(id) : getPokemonSpriteUrl(id);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'team-replace-choice';
            button.innerHTML = `<img src="${url}" alt="" onerror="fallbackPokemonSprite(this, ${id}, ${!!shiny}, '🔵')"><span><strong>${data.name}</strong><small>Lv.${stored?.level || 1}${index === this.game.gameState.activePokemonIndex ? ' · 目前出戰' : ''}</small></span><span class="team-replace-action">替換</span>`;
            button.addEventListener('click', () => {
                if (this.game._towerMode) { this.showToast('⚠️ 對戰塔挑戰期間無法更換隊伍'); return; }
                if (this.game._offlineSimState || this.game.healTimer || this.game._nextBattleTimeout || (this.game.currentBattle && (this.game.currentBattle.playerCurrentHp <= 0 || this.game.currentBattle.wildCurrentHp <= 0))) {
                    this.showToast('⚠️ 請等目前結算或戰鬥間隔結束後再替換');
                    return;
                }
                if (this.game.gameState.team.length !== originalTeam.length || this.game.gameState.team.some((teamId, i) => teamId !== originalTeam[i]) || this.game.gameState.pokedex[pokemonId] !== 'caught' || this.game.gameState.team.includes(pokemonId)) {
                    document.getElementById('team-replace-dialog').close();
                    this.showToast('⚠️ 隊伍已改變，請重新選擇');
                    return;
                }
                const activeIndex = this.game.gameState.activePokemonIndex;
                this.game.gameState.team[index] = pokemonId;
                const selectedAppearance = appearance.hidden ? 'normal' : appearance.querySelector('input:checked').value;
                this.setDefaultTeamSprite(pokemonId, selectedAppearance);
                this.game.setActivePokemon(activeIndex);
                this.game.save();
                document.getElementById('team-replace-dialog').close();
            this.renderTeam();
            this.renderPokedex();
            this.showToast(`✅ ${pokemon.name} 已替換 ${data.name}`);
            });
            list.appendChild(button);
        });
        document.getElementById('team-replace-dialog').showModal();
    }

    removeFromTeamByPokemonId(pokemonId) {
        if (this.game.gameState.team.length <= 1) {
            this.showToast('⚠️ 隊伍至少需要保留一隻寶可夢');
            return;
        }
        const result = this.game.removeFromTeamByPokemonId(pokemonId);
        if (result) {
            this.renderTeam();
            this.renderPokedex();
            this.showToast('寶可夢已離開隊伍');
        } else {
            this.showToast('⚠️ 無法移除出戰寶可夢');
        }
    }

    // 一擊必殺策略：初始化單選框
    _initOneShotStrategy() {
        const radios = document.querySelectorAll('input[name="oneshot-strategy"]');
        if (!radios.length) return;
        const saved = this.game.gameState.settings?.oneShotStrategy || 'fastest';
        radios.forEach(radio => {
            radio.checked = radio.value === saved;
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                this.game.gameState.settings = this.game.gameState.settings || {};
                this.game.gameState.settings.oneShotStrategy = radio.value;
                this.game.save();
                const labels = { fastest: '🏃 速度最快', lowest_level: '📈 等級最低', no_change: '🔒 不改變' };
                this.showToast(`⚡ 一擊必殺策略: ${labels[radio.value]}`);
            });
        });
    }

    // 一擊必殺策略：聯動顯示/隱藏
    _syncOneShotStrategyVisibility() {
        const group = document.getElementById('oneshot-strategy-group');
        if (!group) return;
        const autoSwitch = !!this.game.gameState.settings?.autoSwitchBest;
        group.style.display = autoSwitch ? '' : 'none';
    }

    // 初始化自動切換地圖設定（無需徽章，直接開放）
    _initAutoRouteSetting() {
        const wrapper = document.getElementById('setting-auto-route-wrapper');
        const desc = document.getElementById('setting-auto-route-desc');
        const checkbox = document.getElementById('setting-auto-route');
        if (!wrapper || !checkbox) return;

        // 直接顯示，無需徽章
        wrapper.style.display = '';
        if (desc) desc.style.display = '';
        checkbox.checked = !!this.game.gameState.settings?.autoRouteSwitch;
        checkbox.addEventListener('change', () => {
            this.game.gameState.settings = this.game.gameState.settings || {};
            this.game.gameState.settings.autoRouteSwitch = checkbox.checked;
            this.game.save();
            this.showToast(checkbox.checked ? '✅ 已開啟自動切換地圖' : '❌ 已關閉自動切換地圖');
            // 聯動顯示/隱藏條件選項
            this._syncRouteSwitchConditionVisibility();
        });
        // 初始化條件單選框
        this._initRouteSwitchCondition();
        this._syncRouteSwitchConditionVisibility();
    }

    // 初始化地圖切換條件單選框
    _initRouteSwitchCondition() {
        const radios = document.querySelectorAll('input[name="route-switch-condition"]');
        if (!radios.length) return;
        const saved = this.game.gameState.settings?.routeSwitchCondition || '6v_shiny';
        radios.forEach(radio => {
            radio.checked = radio.value === saved;
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                this.game.gameState.settings = this.game.gameState.settings || {};
                this.game.gameState.settings.routeSwitchCondition = radio.value;
                this.game.save();
            const labels = { '6v_shiny': '✨ 6V且閃光後切換', '6v_only': '🎯 6V後切換', region_caught: '📖 捕獲當前道路所有寶可夢後切換' };
                this.showToast(`📋 切換條件: ${labels[radio.value]}`);
            });
        });
    }

    // 聯動顯示/隱藏地圖切換條件
    _syncRouteSwitchConditionVisibility() {
        const group = document.getElementById('route-switch-condition-group');
        if (!group) return;
        const autoSwitch = !!this.game.gameState.settings?.autoRouteSwitch;
        group.style.display = autoSwitch ? '' : 'none';
    }

    // 一鍵升級技能按鈕初始化
    _initUpgradeAllSkillsBtn() {
        const btn = document.getElementById('btn-upgrade-all-skills');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const getCandidates = () => Object.entries(this.game.gameState.caughtPokemon)
                .filter(([id, stored]) => stored && POKEMON_DATA[id] && stored.level >= SKILL_LEVEL_REQUIREMENT && (stored.skillLevel || 0) < MAX_SKILL_LEVEL)
                .map(([id, stored]) => ({
                    id: Number(id), level: stored.level, skill: stored.skillLevel || 0,
                    gain: Math.min(MAX_SKILL_LEVEL - (stored.skillLevel || 0), Math.floor(stored.level / SKILL_LEVEL_REQUIREMENT)),
                }));
            const candidates = getCandidates();
            if (!this.game.isSkillUnlocked() || candidates.length === 0) {
                this.showToast('⚠️ 目前沒有可升級技能的寶可夢');
                return;
            }
            const list = candidates.map(p => {
                const shiny = this.game.gameState.pokedexDisplay?.[p.id] === 'shiny';
                const url = shiny ? getShinyPokemonSpriteUrl(p.id) : getPokemonSpriteUrl(p.id);
                return `<span class="skill-bulk-row"><span class="skill-bulk-sprite"><img src="${url}" alt="" loading="lazy" onerror="fallbackPokemonSprite(this, ${p.id}, ${!!shiny}, '🔵')"></span><strong>${POKEMON_DATA[p.id].name}</strong><span>等級 ${p.level} → 1</span><span>技能 ${p.skill} → ${p.skill + p.gain}（+${p.gain}）</span></span>`;
            }).join('');
            this.showConfirmDialog(
                '一鍵升級技能',
                `以下 ${candidates.length} 隻寶可夢將升級技能：<span class="skill-bulk-preview">${list}</span><br>⚠️ 上列寶可夢的等級將重置為 1，經驗歸零且不返還。<br>等級重置後隊伍戰力可能降低，無法打贏目前地圖的敵人。`,
                () => {
                    if (!this.game.isSkillUnlocked() || JSON.stringify(getCandidates()) !== JSON.stringify(candidates)) {
                        this.showToast('⚠️ 名單或等級已改變，請重新查看升級預覽');
                        return;
                    }
                    const result = this.game.upgradeAllSkills();
                    if (result.success) {
                        const names = result.results.slice(0, 5).map(r => `${r.name}→Lv.${r.newSkillLevel}`).join('、');
                        const more = result.count > 5 ? `…等${result.count}只` : '';
                        this.showToast(`⚡ 成功升級 ${result.count} 只寶可夢的技能！\n${names}${more}`);
                        this._updateBattleSkills();
                        this.renderPokedex();
                        this.renderTeam();
                    } else {
                        this.showToast('⚠️ ' + result.message);
                    }
                }
            );
        });
    }

    // 同步一鍵升級技能按鈕可見性
    _syncUpgradeAllSkillsBtnVisibility() {
        const btn = document.getElementById('btn-upgrade-all-skills');
        if (!btn) return;
        btn.style.display = this.game.isSkillUnlocked() ? '' : 'none';
    }

    // 顯示自動切換地圖設定（直接開放）
    updateAutoRouteSettingVisibility() {
        const wrapper = document.getElementById('setting-auto-route-wrapper');
        const desc = document.getElementById('setting-auto-route-desc');
        if (!wrapper) return;
        wrapper.style.display = '';
        if (desc) desc.style.display = '';
    }

    // ===================== 地圖介面 =====================
    showRegionRewards() {
        const summaries = {
            kanto: { unlock: '徽章／金幣系統', reward: '' },
            johto: { reward: '金幣 2 倍' },
            hoenn: { unlock: '樹果系統', reward: '經驗 +50%' },
            sinnoh: { reward: '閃耀護符：閃光機率 2 倍' },
            unova: { unlock: '技能系統', reward: '已完成寶可夢較少出現' },
            kalos: { reward: '樹果成熟時間減半' },
            alola: { unlock: '天賦系統', reward: '寶石數值偏高' },
            galar: { reward: '樹果收穫 2 倍' },
            paldea: { unlock: '極限對戰塔', reward: '離線上限 48 小時' },
            mega: { unlock: '自由狩獵場', reward: '未上陣圖鑑經驗 +50%' }
        };
        const list = document.getElementById('region-rewards-list');
        list.replaceChildren();
        for (const [key, region] of Object.entries(REGIONS)) {
            const item = summaries[key];
            if (!item) continue;
            const badgeMarker = '可獲得徽章';
            const marker = region.description.lastIndexOf(badgeMarker);
            const effect = marker < 0 ? BADGE_DATA[key]?.effect || '' : region.description.slice(marker + badgeMarker.length).replace(/^[，、\s]+/, '');
            const obtained = this.game.hasBadge(key);
            const card = document.createElement('section');
            card.className = `region-reward-card${obtained ? ' obtained' : ' not-obtained'}`;
            card.innerHTML = `<h3>${region.name}${obtained ? ' <span class="region-reward-obtained">✓ 已獲得</span>' : ' <span class="region-reward-pending">尚未獲得</span>'}</h3>
                ${item.unlock ? `<div class="region-reward-row"><span>解鎖</span><strong>${item.unlock}</strong></div>` : ''}
                ${item.reward ? `<div class="region-reward-row"><span>獎勵</span><strong>${item.reward}</strong></div>` : ''}
                <details><summary>查看詳情</summary><p>完成${region.name.replace('地區', '')}圖鑑後，${item.unlock ? `解鎖${item.unlock}；` : ''}${effect}</p></details>`;
            list.appendChild(card);
        }
        document.getElementById('region-rewards-dialog').showModal();
    }

    renderMap({ preserveView = false } = {}) {
        const previousPreviewRegion = this._mapPreviewRegion;
        const regionListScrollTop = preserveView ? document.getElementById('region-list').scrollTop : 0;
        const routePanel = document.getElementById('route-panel');
        const routePanelScrollTop = preserveView ? routePanel.scrollTop : 0;
        if (!preserveView) this._mapFollowingLocation = true;
        const regionList = document.getElementById('region-list');
        regionList.innerHTML = '';

        for (const key in REGIONS) {
            const region = REGIONS[key];
            const isUnlocked = this.game.isRegionUnlocked(key);
            const card = document.createElement('div');
            card.className = `region-card${this.game.gameState.currentRegion === key ? ' active' : ''}${!isUnlocked ? ' locked' : ''}`;
            card.dataset.regionId = key;
            const badgeMarker = '可獲得徽章';
            const badgeIndex = region.description.lastIndexOf(badgeMarker);
            const effectStart = badgeIndex < 0 ? -1 : region.description.lastIndexOf('完成', badgeIndex);
            const regionDescription = effectStart < 0 ? region.description : region.description.slice(0, effectStart);

            if (isUnlocked) {
                // 檢查該地區所有寶可夢是否全部6V / 全部閃光
                const allPokemon = region.routes.flatMap(r => r.pokemon);
                let regionAll6V = allPokemon.length > 0;
                let regionAllShiny = allPokemon.length > 0;
                for (const p of allPokemon) {
                    const caught = this.game.gameState.pokedex[p.id] === 'caught';
                    if (!caught) { regionAll6V = false; regionAllShiny = false; break; }
                    const storedData = this.game.getStoredData(p.id);
                    const is6V = storedData && storedData.ivs &&
                        storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                        storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                        storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
                    if (!is6V) regionAll6V = false;
                    if (!this.game.gameState.shinyDex[p.id]) regionAllShiny = false;
                }
                let regionBadges = '';
                if (regionAll6V) regionBadges += ' <span class="route-badge-6v">6V</span>';
                if (regionAllShiny) regionBadges += ' <span class="route-badge-shiny">✨</span>';

                card.innerHTML = `
                    <h3>${region.name}${regionBadges}</h3>
                    <p>${regionDescription}</p>
                    <p style="font-size:11px;color:var(--warning);margin-top:4px">${region.routes.length} 個地點</p>
                `;
                card.addEventListener('click', () => {
                    this._mapFollowingLocation = key === this.game.gameState.currentRegion;
                    this.showRoutes(key);
                });
            } else {
                const progress = this.game.getRegionUnlockProgress(key);
                card.innerHTML = `
                    <h3>🔒 ${region.name}</h3>
                    <p style="color:var(--text-secondary)">${regionDescription}</p>
                    <div class="unlock-progress">
                        <div class="unlock-progress-text">解鎖進度: ${progress.current}/${progress.total} (${progress.percent}%)</div>
                        <div class="unlock-progress-bar">
                            <div class="unlock-progress-fill" style="width:${progress.percent}%"></div>
                        </div>
                    </div>
                `;
            }
            regionList.appendChild(card);
        }

        const huntingCard = document.createElement('div');
        huntingCard.className = `region-card${this.game.gameState.currentRegion === 'hunting' ? ' active' : ''}${this.game.isHuntingUnlocked() ? '' : ' locked'}`;
        huntingCard.dataset.regionId = 'hunting';
        huntingCard.innerHTML = `<h3>${this.game.isHuntingUnlocked() ? '' : '🔒 '}自由狩獵場</h3><p>完成 Mega 圖鑑後開放，自選六隻寶可夢刷 6V 與閃光。單項 V 和閃光機率為一般野外的 70%。</p>`;
        if (this.game.isHuntingUnlocked()) huntingCard.addEventListener('click', () => this.showRoutes('hunting'));
        regionList.appendChild(huntingCard);

        // 捕獲刷新保留玩家正在預覽的地區與捲動位置；其他情境跟隨目前所在地。
        const previewRegion = preserveView && previousPreviewRegion ? previousPreviewRegion : this.game.gameState.currentRegion;
        if (preserveView && previewRegion === 'hunting') this.showHuntingGround();
        else this.showRoutes(previewRegion);
        const currentRoute = routePanel.querySelector('.route-card.active');
        if (preserveView) {
            regionList.scrollTop = regionListScrollTop;
            routePanel.scrollTop = routePanelScrollTop;
        } else if (currentRoute && routePanel.clientHeight > 0) {
            const headingHeight = document.getElementById('region-title').offsetHeight;
            routePanel.scrollTop += currentRoute.getBoundingClientRect().top - routePanel.getBoundingClientRect().top - headingHeight - 24;
        }
    }

    showRoutes(regionId) {
        if (regionId === 'hunting') {
            if (this.game.isHuntingUnlocked()) this.showHuntingGround();
            return;
        }
        const region = REGIONS[regionId];
        if (!region) return;
        this._mapPreviewRegion = regionId;

        // 高亮選中的地區
        document.querySelectorAll('.region-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.regionId === regionId) {
                card.classList.add('active');
            }
            const oldMarker = card.querySelector('.current-region-marker');
            if (oldMarker) oldMarker.remove();
            if (card.dataset.regionId === this.game.gameState.currentRegion) {
                const marker = document.createElement('span');
                marker.className = 'current-region-marker';
                marker.textContent = '📍 目前所在地';
                card.querySelector('h3').appendChild(marker);
            }
        });

        document.getElementById('region-title').textContent = `📍 ${region.name}`;

        const routeList = document.getElementById('route-list');
        routeList.innerHTML = '';

        region.routes.forEach(route => {
            const isActive = this.game.gameState.currentRoute === route.id;
            const card = document.createElement('div');
            card.className = `route-card${isActive ? ' active' : ''}`;

            const weights = this.game.getRouteEncounterWeights(route);
            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            const pokemonPreview = route.pokemon.map((p, index) => {
                const data = POKEMON_DATA[p.id];
                const caught = this.game.gameState.pokedex[p.id] === 'caught';
                const seen = this.game.gameState.pokedex[p.id];
                const name = data ? data.name : '???';
                const displayName = seen ? name : '???';
                
                // 識別符號：閃光✨ 和 6V標識
                let badges = '';
                if (caught) {
                    const hasShiny = this.game.gameState.shinyDex[p.id];
                    const storedData = this.game.getStoredData(p.id);
                    const is6V = storedData && storedData.ivs && 
                        storedData.ivs.hp === 31 && storedData.ivs.atk === 31 && 
                        storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 && 
                        storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
                    if (hasShiny) badges += '✨';
                    if (is6V) badges += '<span class="badge-6v">6V</span>';
                }
                
                const probability = totalWeight > 0 ? weights[index] / totalWeight * 100 : (index === 0 ? 100 : 0);
                const chance = probability > 0 && probability < 0.01 ? '&lt;0.01' : Number(probability.toFixed(2));
                return `<span class="route-pokemon-entry" data-pokemon-id="${p.id}" tabindex="0" aria-haspopup="true" aria-label="查看圖鑑：${displayName}"><span class="route-pokemon-name" style="${caught ? 'color:#2ecc71' : seen ? 'color:#f39c12' : 'color:#a0adb0'}">${displayName}${badges}</span><span class="route-pokemon-chance">${chance}%</span></span>`;
            }).join('');

            // 檢查該道路所有精靈是否全部6V / 全部閃光
            let allCaught = route.pokemon.length > 0;
            let all6V = route.pokemon.length > 0;
            let allShiny = route.pokemon.length > 0;
            for (const p of route.pokemon) {
                const caught = this.game.gameState.pokedex[p.id] === 'caught';
                if (!caught) { allCaught = false; all6V = false; allShiny = false; break; }
                const storedData = this.game.getStoredData(p.id);
                const is6V = storedData && storedData.ivs &&
                    storedData.ivs.hp === 31 && storedData.ivs.atk === 31 &&
                    storedData.ivs.def === 31 && storedData.ivs.spAtk === 31 &&
                    storedData.ivs.spDef === 31 && storedData.ivs.speed === 31;
                if (!is6V) all6V = false;
                if (!this.game.gameState.shinyDex[p.id]) allShiny = false;
            }
            let routeBadges = '';
            if (all6V) routeBadges += ' <span class="route-badge-6v">6V</span>';
            if (allShiny) routeBadges += ' <span class="route-badge-shiny">✨</span>';

            card.innerHTML = `
                <h3>${route.name}${routeBadges}${isActive ? ' <span class="current-region-marker">📍 目前所在地</span>' : ''}</h3>
                <p>${route.description}</p>
                <div class="route-level-range">Lv.${route.levelRange[0]} ~ Lv.${route.levelRange[1]}</div>
                <div class="route-pokemon-heading"><span>出現寶可夢</span><span>機率</span></div>
                <div class="route-pokemon-preview">${pokemonPreview}</div>
            `;

            card.addEventListener('click', event => {
                if (event.target.closest('.route-pokemon-entry')) return;
                if (!this.game.isRegionUnlocked(regionId) || this.game.gameState.currentRoute === route.id) return;
                const moveToRoute = () => {
                    if (!this.game.isRegionUnlocked(regionId)) return;
                    if (this.game._offlineSimState || this.game._towerMode) {
                        this.showToast('⚠️ 挑戰或離線結算期間無法切換地圖');
                        return;
                    }
                    const settings = this.game.gameState.settings;
                    const previousAutoSwitch = settings?.autoRouteSwitch;
                    if (settings) settings.autoRouteSwitch = false;
                    const previousRegion = this.game.gameState.currentRegion;
                    this.game.changeRegion(regionId);
                    if (!this.game.changeRoute(route.id)) {
                        this.game.changeRegion(previousRegion);
                        if (settings) settings.autoRouteSwitch = previousAutoSwitch;
                        return;
                    }
                    const checkbox = document.getElementById('setting-auto-route');
                    if (checkbox) checkbox.checked = false;
                    this._syncRouteSwitchConditionVisibility();
                    this._mapFollowingLocation = true;
                    this.showRoutes(regionId);
                    this.showToast(`📍 移動到了 ${route.name}`);
                };
                if (this.game.gameState.settings?.autoRouteSwitch) {
                    this.showConfirmDialog('手動切換地圖', '目前已開啟自動切換地圖。確認後將關閉自動切換、取消目前戰鬥，並在新地圖開始戰鬥。', moveToRoute);
                } else {
                    moveToRoute();
                }
            });

            routeList.appendChild(card);
        });
    }

    showHuntingGround() {
        this._mapPreviewRegion = 'hunting';
        document.querySelectorAll('.region-card').forEach(card => card.classList.toggle('active', card.dataset.regionId === 'hunting'));
        document.getElementById('region-title').textContent = '📍 自由狩獵場';
        const list = document.getElementById('route-list');
        list.replaceChildren();
        const form = document.createElement('form');
        form.className = 'route-card hunting-form';
        const config = this.game.gameState.huntingGround || {};
        const level = this.game.getHuntingLevel();
        form.innerHTML = `<div class="hunting-heading"><div><span class="hunting-eyebrow">CUSTOM HUNT</span><h3>🎯 自由狩獵場</h3><p>依類別選擇六隻不同的寶可夢，點擊欄位開啟選擇視窗。</p></div><span class="hunting-level">敵人 Lv.${level}</span></div><div class="hunting-notice"><span>✨ 單項 V 與閃光為一般野外 70%</span><span>⏸ 關閉網頁不產生狩獵收益</span></div><p class="hunting-help">一般進化鏈僅限最基礎形態；Mega 算準神，傳說／幻之 Mega 除外。固定出現率：傳說／幻之 5%、準神各 10%、其他各 25%；不套用完成寶可夢的徽章權重調整。</p><div class="hunting-inputs"></div><p class="hunting-count"></p><div class="hunting-preview"></div><p class="hunting-error" role="alert"></p><button class="hunting-submit" type="submit">開始狩獵</button><dialog class="hunting-picker" aria-labelledby="hunting-picker-title"><div class="hunting-picker-heading"><h3 id="hunting-picker-title"></h3><button type="button" class="hunting-picker-close" aria-label="關閉選擇視窗">✕</button></div><input type="search" class="hunting-picker-search" placeholder="搜尋名稱或編號" aria-label="搜尋寶可夢"><p class="hunting-picker-count"></p><div class="hunting-picker-grid"></div></dialog>`;
        const inputs = form.querySelector('.hunting-inputs');
        const backgroundNotice = document.createElement('span');
        const offlineRoute = this.game.getRoute(this.game.gameState.highestVisitedRoute);
        const offlineRegion = offlineRoute && Object.values(REGIONS).find(region => region.routes?.some(route => route.id === offlineRoute.id));
        backgroundNotice.textContent = offlineRoute
            ? `🌙 背景持續狩獵；關閉網頁後於「${offlineRegion?.name || ''} ${offlineRoute.name}」離線結算`
            : '🌙 背景持續狩獵；請先到一般道路建立離線地圖紀錄';
        form.querySelector('.hunting-notice').appendChild(backgroundNotice);
        const categories = ['legendary', 'pseudo', 'pseudo', 'other', 'other', 'other'];
        const labels = ['傳說／幻之', '準神 1', '準神 2', '其他 1', '其他 2', '其他 3'];
        const buckets = { legendary: [], pseudo: [], other: [] };
        for (const id of config.pokemon || []) {
            if (POKEMON_DATA[id]) buckets[this.game.getHuntingCategory(id)].push(id);
        }
        const renderSlotSelection = (button, id) => {
            button.replaceChildren();
            if (!POKEMON_DATA[id]) {
                button.textContent = '＋ 選擇寶可夢';
                return;
            }
            const sprite = document.createElement('span');
            sprite.className = 'hunting-slot-sprite';
            const image = document.createElement('img');
            image.src = getPokemonSpriteUrl(id);
            image.alt = '';
            image.onerror = () => fallbackPokemonSprite(image, id, false, '🔵');
            sprite.appendChild(image);
            const name = document.createElement('span');
            name.textContent = `${id} ${POKEMON_DATA[id].name}`;
            button.append(sprite, name);
        };
        for (let i = 0; i < 6; i++) {
            const label = document.createElement('div');
            label.className = `hunting-slot hunting-slot-${categories[i]}`;
            const title = document.createElement('span');
            title.textContent = `${String(i + 1).padStart(2, '0')}　${labels[i]}`;
            const input = document.createElement('input');
            input.type = 'hidden';
            const id = buckets[categories[i]].shift();
            if (POKEMON_DATA[id]) input.value = `${id} ${POKEMON_DATA[id].name}`;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'hunting-slot-select';
            renderSlotSelection(button, id);
            button.addEventListener('click', () => openPicker(i));
            label.append(title, input, button);
            inputs.appendChild(label);
        }
        const selectedIds = () => [...inputs.querySelectorAll('input')].map(input => {
                const value = input.value.trim();
                const numeric = /^(\d+)(?:\s|$)/.exec(value);
                if (numeric) return Number(numeric[1]);
                return Number(Object.keys(POKEMON_DATA).find(id => POKEMON_DATA[id].name === value));
            });
        const updatePreview = () => {
            const ids = selectedIds();
            const counts = { legendary: 0, pseudo: 0, other: 0 };
            for (const id of ids) if (POKEMON_DATA[id]) counts[this.game.getHuntingCategory(id)]++;
            form.querySelector('.hunting-count').textContent = `傳說／幻之 ${counts.legendary}/1 · 準神 ${counts.pseudo}/2 · 其他 ${counts.other}/3`;
            const preview = form.querySelector('.hunting-preview');
            preview.replaceChildren();
            if (!this.game.isValidHuntingSelection(ids) || ids.some((id, i) => this.game.getHuntingCategory(id) !== categories[i])) return;
            const weights = this.game.getHuntingWeights(ids);
            const actual = this.game.getRouteEncounterWeights({ id: 'free_hunting', pokemon: ids.map((id, i) => ({ id, weight: weights[i] })) });
            const total = actual.reduce((sum, value) => sum + value, 0);
            for (let i = 0; i < ids.length; i++) {
                const row = document.createElement('div');
                const stored = this.game.getStoredData(ids[i]);
                const is6V = stored?.ivs && Object.values(stored.ivs).length === 6 && Object.values(stored.ivs).every(value => value === 31);
                row.className = 'hunting-preview-row';
                const name = document.createElement('span');
                name.textContent = `${POKEMON_DATA[ids[i]].name}${is6V ? ' · 6V' : ''}${this.game.gameState.shinyDex[ids[i]] ? ' ✨' : ''}`;
                const chance = document.createElement('strong');
                chance.textContent = `${(100 * actual[i] / total).toFixed(2)}%`;
                row.append(name, chance);
                preview.appendChild(row);
            }
        };
        const dialog = form.querySelector('.hunting-picker');
        const search = dialog.querySelector('.hunting-picker-search');
        const grid = dialog.querySelector('.hunting-picker-grid');
        let pickerIndex = 0;
        const renderPicker = () => {
            const query = search.value.trim().toLowerCase();
            const ids = selectedIds();
            const taken = new Set(ids.filter((id, i) => i !== pickerIndex && POKEMON_DATA[id]));
            grid.replaceChildren();
            for (const [key, data] of Object.entries(POKEMON_DATA)) {
                const id = Number(key);
                if (this.game.getBasePokemonId(id) !== id || this.game.getHuntingCategory(id) !== categories[pickerIndex] || taken.has(id)) continue;
                if (query && !key.includes(query) && !data.name.toLowerCase().includes(query)) continue;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `hunting-picker-option${ids[pickerIndex] === id ? ' selected' : ''}`;
                button.dataset.pokemonId = id;
                const image = document.createElement('img');
                image.loading = 'lazy';
                image.src = getPokemonSpriteUrl(id);
                image.alt = '';
                image.onerror = () => fallbackPokemonSprite(image, id, false, '🔵');
                const sprite = document.createElement('span');
                sprite.className = 'hunting-picker-sprite';
                sprite.appendChild(image);
                const name = document.createElement('span');
                name.textContent = data.name;
                const markers = document.createElement('span');
                markers.className = 'hunting-picker-markers';
                const ivs = this.game.getStoredData(id)?.ivs;
                if (ivs && ['hp', 'atk', 'def', 'spAtk', 'spDef', 'speed'].every(stat => ivs[stat] === 31)) {
                    const perfect = document.createElement('span');
                    perfect.className = 'hunting-picker-6v route-badge-6v';
                    perfect.textContent = '6V';
                    perfect.setAttribute('aria-label', '已達成六項 V');
                    markers.appendChild(perfect);
                }
                if (this.game.gameState.shinyDex?.[id]) {
                    const shiny = document.createElement('span');
                    shiny.className = 'hunting-picker-shiny';
                    shiny.textContent = '✨';
                    shiny.setAttribute('aria-label', '已擁有閃光');
                    markers.appendChild(shiny);
                }
                const number = document.createElement('small');
                number.textContent = `#${id}`;
                button.append(sprite, name, markers, number);
                button.addEventListener('click', () => {
                    const slot = inputs.children[pickerIndex];
                    slot.querySelector('input').value = `${id} ${data.name}`;
                    renderSlotSelection(slot.querySelector('.hunting-slot-select'), id);
                    updatePreview();
                    dialog.close();
                });
                grid.appendChild(button);
            }
            dialog.querySelector('.hunting-picker-count').textContent = `可選擇 ${grid.children.length} 隻`;
        };
        const openPicker = index => {
            pickerIndex = index;
            dialog.querySelector('#hunting-picker-title').textContent = `選擇${labels[index]}`;
            search.value = '';
            renderPicker();
            dialog.showModal();
            search.focus();
        };
        search.addEventListener('input', renderPicker);
        dialog.querySelector('.hunting-picker-close').addEventListener('click', () => dialog.close());
        inputs.addEventListener('input', updatePreview);
        updatePreview();
        form.addEventListener('submit', event => {
            event.preventDefault();
            const ids = selectedIds();
            if (ids.some((id, i) => this.game.getHuntingCategory(id) !== categories[i]) || !this.game.setHuntingGround(ids)) {
                form.querySelector('.hunting-error').textContent = '請選擇不同的傳說／幻之 1 隻、準神 2 隻及其他 3 隻，進化鏈僅限基礎形態；挑戰或離線結算期間無法設定。';
                return;
            }
            if (this.game.gameState.settings) this.game.gameState.settings.autoRouteSwitch = false;
            if (!this.game.changeRoute('free_hunting')) return;
            const checkbox = document.getElementById('setting-auto-route');
            if (checkbox) checkbox.checked = false;
            this._syncRouteSwitchConditionVisibility();
            this.renderMap();
            this.renderTeam();
            this.showToast('📍 已進入自由狩獵場');
        });
        list.appendChild(form);
    }

    // ===================== 圖鑑介面 =====================
    renderPokedex() {
        const stats = this.game.getPokedexStats();
        const shinyCount = this.game.getShinyStats();
        
        // 根據地區篩選更新統計資料顯示
        const caughtEl = document.getElementById('pokedex-caught');
        if (this.pokedexRegionFilter === 'all') {
            caughtEl.textContent = `已捕獲: ${stats.caught}/${stats.total}`;
        } else {
            const regionStats = this.game.getPokedexStatsByRegion(this.pokedexRegionFilter);
            const regionNames = { kanto: '關都', johto: '城都', hoenn: '豐緣', sinnoh: '神奧', unova: '合眾', kalos: '卡洛斯', alola: '阿羅拉', galar: '伽勒爾', paldea: '帕底亞', mega: 'Mega' };
            const regionName = regionNames[this.pokedexRegionFilter] || this.pokedexRegionFilter;
            caughtEl.textContent = `${regionName}地區已捕獲: ${regionStats.caught}/${regionStats.total}`;
        }
        
        // 更新閃光按鈕顯示數量
        const shinyFilterBtn = document.querySelector('.filter-btn.shiny-filter');
        if (shinyFilterBtn) {
            shinyFilterBtn.textContent = `✨ 閃光${shinyCount > 0 ? ' (' + shinyCount + ')' : ''}`;
        }

        // 更新未閃光按鈕顯示數量
        const notShinyCount = stats.caught - shinyCount;
        const notShinyFilterBtn = document.querySelector('.filter-btn.not-shiny-filter');
        if (notShinyFilterBtn) {
            notShinyFilterBtn.textContent = `未閃光${notShinyCount > 0 ? ' (' + notShinyCount + ')' : ''}`;
        }

        const grid = document.getElementById('pokedex-grid');
        grid.innerHTML = '';

        let allIds = Object.keys(POKEMON_DATA).map(Number);

        // 地區篩選
        if (this.pokedexRegionFilter === 'kanto') {
            allIds = allIds.filter(id => id >= 1 && id <= 151);
        } else if (this.pokedexRegionFilter === 'johto') {
            allIds = allIds.filter(id => id >= 152 && id <= 251);
        } else if (this.pokedexRegionFilter === 'hoenn') {
            allIds = allIds.filter(id => id >= 252 && id <= 386);
        } else if (this.pokedexRegionFilter === 'sinnoh') {
            allIds = allIds.filter(id => id >= 387 && id <= 493);
        } else if (this.pokedexRegionFilter === 'unova') {
            allIds = allIds.filter(id => id >= 494 && id <= 649);
        } else if (this.pokedexRegionFilter === 'kalos') {
            allIds = allIds.filter(id => id >= 650 && id <= 721);
        } else if (this.pokedexRegionFilter === 'alola') {
            allIds = allIds.filter(id => id >= 722 && id <= 809);
        } else if (this.pokedexRegionFilter === 'galar') {
            allIds = allIds.filter(id => id >= 810 && id <= 905);
        } else if (this.pokedexRegionFilter === 'paldea') {
            allIds = allIds.filter(id => id >= 906 && id <= 1025);
        } else if (this.pokedexRegionFilter === 'mega') {
            allIds = allIds.filter(id => id >= 1026 && id <= 1073);
        }

        // 搜尋過濾
        if (this.pokedexTypeFilter !== 'all') {
            allIds = allIds.filter(id => POKEMON_DATA[id]?.types?.includes(this.pokedexTypeFilter));
        }

        if (this.pokedexSearchQuery) {
            const query = this.pokedexSearchQuery.toLowerCase();
            allIds = allIds.filter(id => {
                const data = POKEMON_DATA[id];
                if (!data) return false;
                // 匹配名稱或編號
                if (data.name && data.name.toLowerCase().includes(query)) return true;
                if (String(id).includes(query)) return true;
                return false;
            });
        }

        // 過濾
        if (this.pokedexFilter === 'caught') {
            allIds = allIds.filter(id => this.game.gameState.pokedex[id] === 'caught');
        } else if (this.pokedexFilter === 'uncaught') {
            allIds = allIds.filter(id => !this.game.gameState.pokedex[id] || this.game.gameState.pokedex[id] !== 'caught');
        } else if (this.pokedexFilter === 'shiny') {
            allIds = allIds.filter(id => this.game.gameState.shinyDex[id]);
        } else if (this.pokedexFilter === 'not_shiny') {
            allIds = allIds.filter(id => this.game.gameState.pokedex[id] === 'caught' && !this.game.gameState.shinyDex[id]);
        } else if (this.pokedexFilter === 'skill_ready') {
            const skillUnlocked = this.game.isSkillUnlocked();
            allIds = allIds.filter(id => {
                const stored = this.game.getStoredData(id);
                return skillUnlocked && this.game.gameState.pokedex[id] === 'caught' && stored &&
                    stored.level >= SKILL_LEVEL_REQUIREMENT && (stored.skillLevel || 0) < MAX_SKILL_LEVEL;
            });
        }

        // 圖鑑依編號顯示。
        this._pokedexCache = {};
        allIds.sort((a, b) => a - b);

        // 分頁渲染
        this._pokedexAllIds = allIds;
        this._pokedexRendered = 0;
        const PAGE_SIZE = 200;
        this._pokedexPageSize = PAGE_SIZE;
        this._renderPokedexBatch(grid, PAGE_SIZE);
    }

    /**
     * 分批渲染圖鑑條目
     */
    _renderPokedexBatch(grid, count) {
        const allIds = this._pokedexAllIds;
        const start = this._pokedexRendered;
        const end = Math.min(start + count, allIds.length);

        // 移除舊的「載入更多」按鈕
        const oldLoadMore = grid.querySelector('.pokedex-load-more');
        if (oldLoadMore) oldLoadMore.remove();

        const skillUnlockedGlobal = this.game.isSkillUnlocked();
        const berryUnlockedGlobal = this.game.isBerryUnlocked();
        const teamArr = this.game.gameState.team;
        const teamSet = new Set(teamArr);

        const fragment = document.createDocumentFragment();

        for (let i = start; i < end; i++) {
            const id = allIds[i];
            const data = POKEMON_DATA[id];
            const status = this.game.gameState.pokedex[id] || 'unseen';

            const entry = document.createElement('div');
            entry.className = `pokedex-entry ${status}`;
            entry.dataset.pokemonId = id;

            if (status === 'unseen') {
                entry.innerHTML = `
                    <div class="dex-header">
                        <div class="dex-sprite">?</div>
                        <div class="dex-header-info">
                            <div class="dex-number">#${String(id).padStart(3, '0')}</div>
                            <div class="dex-name">???</div>
                        </div>
                    </div>
                `;
            } else if (status === 'seen') {
                const typeBadges = (data.types || []).map(t =>
                    `<span class="type-badge ${t}">${TYPE_NAMES[t] || t}</span>`
                ).join(' ');

                entry.innerHTML = `
                    <div class="dex-header">
                        <div class="dex-sprite"><img loading="lazy" src="${getPokemonSpriteUrl(id)}" alt="${data.name}" onerror="fallbackPokemonSprite(this, ${id}, false, '?')"></div>
                        <div class="dex-header-info">
                            <div class="dex-number">#${String(id).padStart(3, '0')}</div>
                            <div class="dex-name">${data.name}</div>
                            ${typeBadges ? `<div class="dex-types">${typeBadges}</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                // caught - 顯示完整詳情
            const inTeam = teamSet.has(id);
            const hasShiny = this.game.gameState.shinyDex[id];
            const isShowingShiny = this.game.gameState.pokedexDisplay[id] === 'shiny';
            const deoxysForm = this.game.gameState.pokemonForms?.[386] || 'normal';
            const deoxysFormNames = { normal: '普通', attack: '攻擊', defense: '防禦', speed: '速度' };

                const typeBadges = (data.types || []).map(t =>
                    `<span class="type-badge ${t}">${TYPE_NAMES[t] || t}</span>`
                ).join(' ');

                // 獲取該寶可夢的儲存資料
                const storedData = this.game.getStoredData(id);
                
                // 使用圖鑑展示偏好的精靈圖
            const spriteUrl = Number(id) === 386
                ? getDeoxysSpriteUrl(deoxysForm, isShowingShiny)
                : this.game.getPokedexSpriteUrl(id);
                
                // 使用快取的戰力和潛力（若有），否則現算
                const cached = this._pokedexCache[id];
                const power = cached ? cached.power : this.game.calculatePower(id, true);
                const potential = cached ? cached.potential : this.game.calculatePotential(id);
                const potentialColor = potential >= 80 ? '#2ecc71' : potential >= 60 ? '#f39c12' : '#e74c3c';

                // 樹果餵食資訊（僅在樹果系統解鎖後顯示）
                const berryHtml = (berryUnlockedGlobal && storedData) ? this._buildBerrySectionHtml(id) : '';

                // 技能等級（提前計算，在 detailHtml 模板中使用）
                const currentSkillLevel = storedData ? (storedData.skillLevel || 0) : 0;

                const detailHtml = storedData ? `
                    <div class="dex-detail">
                        <div class="dex-detail-header">
                            <span class="dex-level-badge">等級 ${storedData.level}</span>
                            ${currentSkillLevel > 0 ? `<span class="dex-skill-badge">⚡ 技能 ${currentSkillLevel >= MAX_SKILL_LEVEL ? 'Max' : 'Lv.' + currentSkillLevel}</span>` : ''}
                            ${inTeam ? `<span class="dex-in-team">在隊伍中</span>` : '<span style="color:var(--text-secondary);font-size:12px">已捕獲 · 不在隊伍中</span>'}
                        </div>
                        <div class="dex-power-potential">
                            <div class="dex-power">
                                <span class="power-label">⚔️ 戰力</span>
                                <span class="power-value">${power}</span>
                            </div>
                            <div class="dex-potential" title="基於個體值、種族值、成長效率計算">
                                <span class="potential-label">💎 潛力</span>
                                <span class="potential-value" style="color:${potentialColor}">${potential}%</span>
                            </div>
                        </div>
                        <div class="dex-stats-section">
                            ${(() => { const ebs = this.game.getEffectiveBaseStats(id); const ebsTotal = ebs.hp + ebs.atk + ebs.def + ebs.spAtk + ebs.spDef + ebs.speed; return `
                            <div class="dex-stats-title">種族值（總和：${ebsTotal}）</div>
                            <div class="dex-stats-grid">
                                <div class="dex-stat-item iv"><span>體力</span><span>${ebs.hp} <small style="opacity:0.6">(IV:${storedData.ivs.hp})</small></span></div>
                                <div class="dex-stat-item iv"><span>攻擊</span><span>${ebs.atk} <small style="opacity:0.6">(IV:${storedData.ivs.atk})</small></span></div>
                                <div class="dex-stat-item iv"><span>防禦</span><span>${ebs.def} <small style="opacity:0.6">(IV:${storedData.ivs.def})</small></span></div>
                                <div class="dex-stat-item iv"><span>特攻</span><span>${ebs.spAtk} <small style="opacity:0.6">(IV:${storedData.ivs.spAtk})</small></span></div>
                                <div class="dex-stat-item iv"><span>特防</span><span>${ebs.spDef} <small style="opacity:0.6">(IV:${storedData.ivs.spDef})</small></span></div>
                                <div class="dex-stat-item iv"><span>速度</span><span>${ebs.speed} <small style="opacity:0.6">(IV:${storedData.ivs.speed})</small></span></div>
                            </div>`; })()}
                        </div>
                        ${berryHtml}
                    </div>
                ` : '';

                // 按鈕邏輯：在隊伍中顯示"離開隊伍"，不在隊伍中顯示"加入隊伍"
                let buttonHtml = '';
                if (inTeam) {
                    buttonHtml = `<button class="dex-remove-btn" data-pokemon-id="${id}">- 離開隊伍</button>`;
                } else {
                    buttonHtml = `<button class="dex-add-btn" data-pokemon-id="${id}">+ 加入隊伍</button>`;
                }

                // 升級技能按鈕（需要技能系統已解鎖、等級>=1000、技能等級<8）
                let skillBtnHtml = '';
                if (skillUnlockedGlobal && storedData && storedData.level >= SKILL_LEVEL_REQUIREMENT && currentSkillLevel < MAX_SKILL_LEVEL) {
                    skillBtnHtml = `<button class="dex-skill-btn" data-pokemon-id="${id}" title="每滿1000級提升1級技能；等級與經驗重置">⚡ 升級技能</button>`;
                }

                entry.innerHTML = `
                    <div class="dex-header">
                        <div class="dex-sprite${isShowingShiny ? ' shiny' : ''}"><img loading="lazy" src="${spriteUrl}" alt="${data.name}" onerror="fallbackPokemonSprite(this, ${id}, ${!!isShowingShiny}, '?')"></div>
                        <div class="dex-header-info">
                            <div class="dex-number">#${String(id).padStart(3, '0')}</div>
                            <div class="dex-name">${data.name}${Number(id) === 386 ? `（${deoxysFormNames[deoxysForm] || '普通'}形態）` : ''}${hasShiny ? ' ✨' : ''}</div>
                            <div class="dex-types">${typeBadges}</div>
                        </div>
                        <div class="dex-header-actions">
                            ${hasShiny ? `<button class="shiny-toggle-btn${isShowingShiny ? ' active' : ''}" data-pokemon-id="${id}" title="${isShowingShiny ? '切換為原始' : '切換為閃光'}">✨</button>` : ''}
                            <div class="dex-team-action-stack">
                                ${buttonHtml}
                                ${Number(id) === 386 ? `<button class="dex-deoxys-form-btn" data-pokemon-id="${id}" title="選擇目前型態">型態</button>` : ''}
                            </div>
                            ${skillBtnHtml}
                        </div>
                    </div>
                    ${detailHtml}
                `;

                // 繫結按鈕事件
                if (inTeam) {
                    const btn = entry.querySelector('.dex-remove-btn');
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeFromTeamByPokemonId(id);
                    });
                } else {
                    const btn = entry.querySelector('.dex-add-btn');
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.addToTeamFromPokedex(id);
                    });
                }

                // 繫結閃光切換按鈕事件
                if (hasShiny) {
                    const shinyBtn = entry.querySelector('.shiny-toggle-btn');
                    if (shinyBtn) {
                        shinyBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.game.togglePokedexDisplay(id);
                            this.renderPokedex();
                        });
                    }
                }

                const deoxysFormBtn = entry.querySelector('.dex-deoxys-form-btn');
                if (deoxysFormBtn) {
                    deoxysFormBtn.addEventListener('click', event => {
                        event.stopPropagation();
                        this.showDeoxysFormDialog(386, 'pokedex');
                    });
                }

                // 繫結升級技能按鈕事件
                const skillBtn = entry.querySelector('.dex-skill-btn');
                if (skillBtn) {
                    skillBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.confirmSkillUpgrade(id);
                    });
                }

                // 繫結樹果餵食按鈕事件
                const berryFeedBtn = entry.querySelector('.berry-feed-btn');
                if (berryFeedBtn) {
                    berryFeedBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const select = entry.querySelector('.berry-feed-select');
                        const berryId = select?.value;
                        if (!berryId) {
                            this.showToast('⚠️ 請選擇要餵食的樹果');
                            return;
                        }
                        const result = this.game.feedBerry(id, berryId);
                        if (result.success) {
                            this.showToast(`${BERRY_DATA[berryId].icon} 餵食成功！(${result.fed}/${result.max})`);
                            // 區域性更新樹果區域，保留下拉選擇
                            this._refreshBerrySectionForEntry(entry, id, berryId);
                            // 重新整理戰力和潛力值顯示
                            this._refreshPowerPotentialForEntry(entry, id);
                            // 重新整理其他寶可夢條目的樹果下拉框（庫存已變化）
                            this._refreshOtherBerrySelects(id);
                        } else {
                            this.showToast('⚠️ ' + result.message);
                        }
                    });
                }
            }

            fragment.appendChild(entry);
        }

        this._pokedexRendered = end;

        // 批次追加到 DOM（減少迴流）
        grid.appendChild(fragment);

        // 如果還有更多條目，顯示「載入更多」按鈕
        if (end < allIds.length) {
            const loadMoreDiv = document.createElement('div');
            loadMoreDiv.className = 'pokedex-load-more';
            loadMoreDiv.innerHTML = `<button class="load-more-btn">載入更多（還剩 ${allIds.length - end} 條）</button>`;
            loadMoreDiv.querySelector('button').addEventListener('click', () => {
                this._renderPokedexBatch(grid, this._pokedexPageSize);
            });
            grid.appendChild(loadMoreDiv);
        }
    }

    /**
     * 生成某寶可夢的樹果區域HTML
     */
    _buildBerrySectionHtml(pokemonId) {
        const berryFed = this.game.gameState.berryFed[pokemonId] || {};
        const berryTotal = this.game.getBerryFedTotal(pokemonId);
        const bag = this.game.gameState.berryBag;
        const hasBerryInBag = Object.values(bag).some(c => c > 0);

        let berryItemsHtml = '';
        for (const berryId in BERRY_DATA) {
            const berry = BERRY_DATA[berryId];
            const fed = berryFed[berryId] || 0;
            const maxForType = this.game.getBerryMaxForType(pokemonId, berryId);
            berryItemsHtml += `<div class="berry-fed-item"><span>${berry.icon} ${this._getStatName(berry.stat)}</span><span class="berry-fed-count" style="color:${fed >= maxForType ? '#2ecc71' : 'var(--text-secondary)'}">${fed}/${maxForType}</span></div>`;
        }

        // 餵食下拉選單（僅當揹包有樹果時顯示）
        let feedHtml = '';
        if (hasBerryInBag) {
            let optionsHtml = '';
            for (const berryId in BERRY_DATA) {
                const berry = BERRY_DATA[berryId];
                const count = bag[berryId] || 0;
                const fed = berryFed[berryId] || 0;
                const maxForType = this.game.getBerryMaxForType(pokemonId, berryId);
                if (count > 0 && fed < maxForType) {
                    optionsHtml += `<option value="${berryId}">${berry.icon} ${berry.name} (庫存:${count})</option>`;
                }
            }
            if (optionsHtml) {
                feedHtml = `
                    <div class="berry-feed-action">
                        <select class="berry-feed-select" data-pokemon-id="${pokemonId}">
                            <option value="">選擇樹果餵食...</option>
                            ${optionsHtml}
                        </select>
                        <button class="berry-feed-btn" data-pokemon-id="${pokemonId}">🍎 餵食</button>
                    </div>`;
            }
        }

        return `
            <div class="dex-berry-section">
                <div class="dex-stats-title">🌱 樹果加成 (已喂${berryTotal}個)</div>
                <div class="dex-stats-grid berry-grid">${berryItemsHtml}</div>
                ${feedHtml}
            </div>`;
    }

    /**
     * 區域性更新某個圖鑑條目的樹果區域，保留下拉選中值
     */
    _refreshBerrySectionForEntry(entry, pokemonId, selectedBerryId) {
        const oldSection = entry.querySelector('.dex-berry-section');
        if (!oldSection) return;

        // 生成新的樹果區域HTML
        const newHtml = this._buildBerrySectionHtml(pokemonId);
        const temp = document.createElement('div');
        temp.innerHTML = newHtml;
        const newSection = temp.firstElementChild;

        // 替換舊的樹果區域
        oldSection.replaceWith(newSection);

        // 恢復下拉框選中值（如果該選項仍存在）
        const newSelect = newSection.querySelector('.berry-feed-select');
        if (newSelect && selectedBerryId) {
            const option = newSelect.querySelector(`option[value="${selectedBerryId}"]`);
            if (option) {
                newSelect.value = selectedBerryId;
            }
        }

        // 重新繫結餵食按鈕事件
        const newFeedBtn = newSection.querySelector('.berry-feed-btn');
        if (newFeedBtn) {
            newFeedBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const select = newSection.querySelector('.berry-feed-select');
                const berryId = select?.value;
                if (!berryId) {
                    this.showToast('⚠️ 請選擇要餵食的樹果');
                    return;
                }
                const result = this.game.feedBerry(pokemonId, berryId);
                if (result.success) {
                    this.showToast(`${BERRY_DATA[berryId].icon} 餵食成功！(${result.fed}/${result.max})`);
                    // 遞迴區域性更新，繼續保留選擇
                    this._refreshBerrySectionForEntry(entry, pokemonId, berryId);
                    // 重新整理戰力和潛力值顯示
                    this._refreshPowerPotentialForEntry(entry, pokemonId);
                    // 重新整理其他寶可夢條目的樹果下拉框（庫存已變化）
                    this._refreshOtherBerrySelects(pokemonId);
                } else {
                    this.showToast('⚠️ ' + result.message);
                }
            });
        }
    }

    /**
     * 餵食後重新整理其他寶可夢條目的樹果下拉框（因為庫存數量變了）
     */
    _refreshOtherBerrySelects(excludePokemonId) {
        const allEntries = document.querySelectorAll('.pokedex-entry');
        for (const otherEntry of allEntries) {
            const otherId = otherEntry.dataset.pokemonId;
            if (otherId === excludePokemonId) continue;
            const otherBerrySection = otherEntry.querySelector('.dex-berry-section');
            if (!otherBerrySection) continue;
            // 記住當前選中的樹果
            const otherSelect = otherBerrySection.querySelector('.berry-feed-select');
            const otherSelectedBerry = otherSelect?.value || null;
            // 重新整理該條目的樹果區域
            this._refreshBerrySectionForEntry(otherEntry, otherId, otherSelectedBerry);
        }
    }

    /**
     * 區域性更新某個圖鑑條目的戰力和潛力值顯示
     */
    _refreshPowerPotentialForEntry(entry, pokemonId) {
        const power = this.game.calculatePower(pokemonId, true);
        const potential = this.game.calculatePotential(pokemonId);
        const potentialColor = potential >= 80 ? '#2ecc71' : potential >= 60 ? '#f39c12' : '#e74c3c';

        const powerEl = entry.querySelector('.power-value');
        if (powerEl) powerEl.textContent = power;

        const potentialEl = entry.querySelector('.potential-value');
        if (potentialEl) {
            potentialEl.textContent = `${potential}%`;
            potentialEl.style.color = potentialColor;
        }
    }

    // ===================== 樹果介面 =====================
    renderBerryPage() {
        if (!this.game.isBerryUnlocked()) return;
        this.updateGoldDisplay();
        this._renderBerryBagSummary();
        this._renderBerryPlots();
        this._renderBerryBag();
        this._renderBerryPlantOptions();
    }

    _renderBerryBagSummary() {
        const el = document.getElementById('berry-bag-summary');
        if (!el) return;
        const total = this.game.getBerryBagTotal();
        el.textContent = `🎒 揹包樹果: ${total}`;
    }

    _renderBerryPlots() {
        const grid = document.getElementById('berry-plots-grid');
        const countEl = document.getElementById('berry-plot-count');
        if (!grid) return;
        grid.innerHTML = '';
        const plots = this.game.gameState.berryPlots;
        if (countEl) countEl.textContent = `${plots.length}/${BERRY_PLOT_MAX}`;

        for (let i = 0; i < BERRY_PLOT_MAX; i++) {
            const plot = plots[i];
            const cell = document.createElement('div');
            cell.className = 'berry-plot';

            if (plot) {
                const berry = BERRY_DATA[plot.berryId];
                const ripe = this.game.isBerryRipe(i);
                const timeLeft = this.game.getBerryTimeLeft(i);
                cell.classList.add(ripe ? 'ripe' : 'growing');
                cell.dataset.plotIndex = i;

                if (ripe) {
                    cell.innerHTML = `
                        <div class="berry-plot-icon ripe">${berry.icon}</div>
                        <div class="berry-plot-name">${berry.name}</div>
                        <div class="berry-plot-status ready">✅ 可採摘</div>
                        <button class="berry-harvest-btn" data-plot-index="${i}">採摘</button>
                    `;
                } else {
                    const h = Math.floor(timeLeft / 3600000);
                    const m = Math.floor((timeLeft % 3600000) / 60000);
                    const s = Math.floor((timeLeft % 60000) / 1000);
                    cell.innerHTML = `
                        <div class="berry-plot-icon growing">${berry.icon}</div>
                        <div class="berry-plot-name">${berry.name}</div>
                        <div class="berry-plot-status growing">🌱 生長中</div>
                        <div class="berry-plot-timer">${h}時${m}分${s}秒</div>
                    `;
                }
            } else {
                cell.classList.add('empty');
                cell.innerHTML = `
                    <div class="berry-plot-icon empty">🟫</div>
                    <div class="berry-plot-name">空地</div>
                `;
            }
            grid.appendChild(cell);
        }
    }

    _renderBerryBag() {
        const grid = document.getElementById('berry-bag-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const bag = this.game.gameState.berryBag;
        let hasAny = false;
        for (const berryId in BERRY_DATA) {
            const berry = BERRY_DATA[berryId];
            const count = bag[berryId] || 0;
            if (count > 0) hasAny = true;
            const item = document.createElement('div');
            item.className = `berry-bag-item${count > 0 ? '' : ' empty'}`;
            item.innerHTML = `
                <span class="berry-bag-icon">${berry.icon}</span>
                <span class="berry-bag-name">${berry.name}</span>
                <span class="berry-bag-count">${count}</span>
            `;
            grid.appendChild(item);
        }
        if (!hasAny) {
            grid.innerHTML = '<div class="berry-bag-empty">揹包為空，種植樹果後採摘獲得</div>';
        }
    }

    _renderBerryPlantOptions() {
        const grid = document.getElementById('berry-plant-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const plotsFull = this.game.gameState.berryPlots.length >= BERRY_PLOT_MAX;
        const gold = this.game.gameState.gold;
        const canAfford = gold >= BERRY_SEED_PRICE;

        for (const berryId in BERRY_DATA) {
            const berry = BERRY_DATA[berryId];
            const canPlant = canAfford && !plotsFull;
            const card = document.createElement('div');
            card.className = `berry-plant-card${canPlant ? '' : ' disabled'}`;
            card.innerHTML = `
                <div class="berry-plant-icon" style="background:${berry.color}20;border-color:${berry.color}">${berry.icon}</div>
                <div class="berry-plant-info">
                    <div class="berry-plant-name">${berry.name}種子</div>
                    <div class="berry-plant-effect">提升${this._getStatName(berry.stat)} +${BERRY_STAT_BONUS}/個 (上限${BERRY_STAT_CAP})</div>
                    <div class="berry-plant-stock">💰 ${BERRY_SEED_PRICE.toLocaleString()} 金幣</div>
                </div>
                ${canPlant ? `<button class="berry-plant-btn" data-berry-id="${berryId}">購買種植</button>` : `<span class="berry-plant-disabled">${plotsFull ? '空地已滿' : '金幣不足'}</span>`}
            `;
            grid.appendChild(card);
        }
    }

    _getStatName(stat) {
        const names = { hp: '體力', atk: '攻擊', def: '防禦', spAtk: '特攻', spDef: '特防', speed: '速度' };
        return names[stat] || stat;
    }

    // 樹果頁以事件委派處理動態按鈕，重新渲染時不必重複繫結。
    _setupBerryEvents() {
        document.getElementById('berry-container').addEventListener('click', event => {
            const button = event.target.closest('.berry-harvest-btn, .berry-plant-btn, #btn-harvest-all');
            if (!button) return;
            let result, message;
            if (button.matches('.berry-harvest-btn')) {
                event.stopPropagation();
                result = this.game.harvestBerry(parseInt(button.dataset.plotIndex));
                if (result.success) message = `🧺 採摘了 ${result.count} 個${result.berryName}！`;
            } else if (button.matches('.berry-plant-btn')) {
                event.stopPropagation();
                const berryId = button.dataset.berryId;
                result = this.game.plantBerry(berryId);
                if (result.success) message = `🌱 已種植${BERRY_DATA[berryId].name}！`;
            } else {
                result = this.game.harvestAllBerries();
                if (result.success) message = `🧺 一鍵採摘了 ${result.results.reduce((s, r) => s + r.count, 0)} 個樹果！`;
            }
            if (result.success) {
                this.showToast(message);
                this.renderBerryPage();
            } else {
                this.showToast('⚠️ ' + result.message);
            }
        });
    }

    updateBerryReadyAlert() {
        const alert = document.getElementById('berry-ready-alert');
        const count = document.getElementById('berry-ready-count');
        if (!alert || !count) return;
        const plots = this.game.gameState?.berryPlots || [];
        const ripe = plots.filter((_, i) => this.game.isBerryRipe(i));
        const dismissed = this._dismissedRipePlots || new Set();
        this._dismissedRipePlots = new Set(ripe.filter(plot => dismissed.has(plot)));
        alert.hidden = !this.game.isBerryUnlocked() || !ripe.some(plot => !dismissed.has(plot));
        const text = `有 ${ripe.length} 塊種植地可以採收`;
        if (count.textContent !== text) count.textContent = text;
    }

    // 樹果定時器重新整理（每秒更新倒計時）
    startBerryTimer() {
        if (this._berryTimer) clearInterval(this._berryTimer);
        this.updateBerryReadyAlert();
        this._berryTimer = setInterval(() => {
            this.updateBerryReadyAlert();
            if (this.currentTab === 'tab-berry' && this.game.isBerryUnlocked()) {
                this._renderBerryPlots();
            }
        }, 1000);
    }

    // 首次解鎖樹果系統時免費種植每種樹果各1個
    _initBerrySystem() {
        const bag = this.game.gameState.berryBag;
        const hasAny = Object.values(bag).some(c => c > 0);
        const hasPlots = this.game.gameState.berryPlots.length > 0;
        const hasFed = Object.keys(this.game.gameState.berryFed).length > 0;
        if (hasAny || hasPlots || hasFed) return; // 已經用過樹果系統，不再贈送
        // 免費種植每種樹果各1個
        for (const berryId in BERRY_DATA) {
            this.game.plantBerryFree(berryId);
        }
        this.game.save();
    }

    // ===================== 遊戲統計 =====================
    renderStats() {
        this.game._updatePlayTime();
        const stats = this.game.gameState.stats;
        const dexStats = this.game.getPokedexStats();
        const card = (label, value, id = '') => `<div class="stats-card"><span>${label}</span><strong${id ? ` id="${id}"` : ''}>${value}</strong></div>`;
        document.getElementById('stats-overview').innerHTML =
            card('總戰鬥次數', (stats.totalBattles || 0).toLocaleString()) +
            card('總獲得經驗', (stats.totalExp || 0).toLocaleString()) +
            card('總掛機時長', this._formatOfflineTime(stats.playTime || 0), 'stats-play-time') +
            card('離線掛機時長', this._formatOfflineTime(stats.offlinePlayTime || 0)) +
            (this.game.isGoldUnlocked() ? card('累計金幣', (stats.totalGold || 0).toLocaleString()) : '');
        document.getElementById('stats-dex-summary').innerHTML = card('圖鑑完成度', `${dexStats.caught} / ${dexStats.total}`) + card('閃光圖鑑', this.game.getShinyStats());
        const regions = [['kanto', '關都'], ['johto', '城都'], ['hoenn', '豐緣'], ['sinnoh', '神奧'], ['unova', '合眾'], ['kalos', '卡洛斯'], ['alola', '阿羅拉'], ['galar', '伽勒爾'], ['paldea', '帕底亞'], ['mega', 'Mega']];
        document.getElementById('stats-regions').innerHTML = regions.map(([id, name]) => {
            const region = this.game.getPokedexStatsByRegion(id);
            const progress = region.total ? Math.min(100, Math.max(0, region.caught / region.total * 100)) : 0;
            return `<div class="stats-region"><div class="stats-region-label"><span>${name} ${this.game.isRegionUnlocked(id) ? '' : '🔒'}</span><span>${region.caught} / ${region.total}</span></div><div class="stats-progress"><div style="width:${progress}%"></div></div></div>`;
        }).join('');
    }

    // ===================== 設定介面 =====================
    renderSettings() {
        // 同步自動更換最優寶可夢設定的核取方塊狀態
        const autoSwitchCheckbox = document.getElementById('setting-auto-switch');
        if (autoSwitchCheckbox) {
            autoSwitchCheckbox.checked = !!this.game.gameState.settings?.autoSwitchBest;
        }
        // 同步一擊必殺策略
        this._syncOneShotStrategyVisibility();
        const savedStrategy = this.game.gameState.settings?.oneShotStrategy || 'fastest';
        const radios = document.querySelectorAll('input[name="oneshot-strategy"]');
        radios.forEach(r => { r.checked = r.value === savedStrategy; });

        // 同步地圖切換條件
        this._syncRouteSwitchConditionVisibility();
        const savedCondition = this.game.gameState.settings?.routeSwitchCondition || '6v_shiny';
        const condRadios = document.querySelectorAll('input[name="route-switch-condition"]');
        condRadios.forEach(r => { r.checked = r.value === savedCondition; });

        // 同步一鍵升級技能按鈕可見性
        this._syncUpgradeAllSkillsBtnVisibility();
    }

    // 渲染出戰寶可夢屬性來源分析（呼叫獨立的 getStatSources，不影響高頻戰鬥計算）
    _renderBattleStatSources(index) {
        const data = this.game.getStatSources(index);
        if (!data) return '';

        const { pokemonName, level, battleStats, self: selfStat, team, pokedex, gem, talent } = data;
        const src = { self: selfStat, team, pokedex, gem, talent };

        const stats = ['hp', 'attack', 'defense', 'speed'];
        const statNames = { hp: '❤️ 生命值', attack: '⚔️ 攻擊力', defense: '🛡️ 防禦力', speed: '💨 速度' };
        const sourceNames = { self: '自身屬性', team: '隊友加成', pokedex: '圖鑑加成', gem: '寶石加成', talent: '天賦加成' };
        const sourceIcons = { self: '🐾', team: '👥', pokedex: '📖', gem: '💎', talent: '🌟' };
        const sourceColors = { self: '#e94560', team: '#2ecc71', pokedex: '#3498db', gem: '#f39c12', talent: '#9b59b6' };

        let html = `<div class="stat-sources-section">
            <div class="stat-sources-title">📊 ${pokemonName} Lv.${level} 的屬性來源</div>`;

        for (const stat of stats) {
            const total = battleStats[stat];
            if (total <= 0) continue;

            const sources = [
                { key: 'self', value: src.self[stat] },
                { key: 'team', value: src.team[stat] },
                { key: 'pokedex', value: src.pokedex[stat] },
                { key: 'gem', value: src.gem[stat] },
                { key: 'talent', value: src.talent[stat] },
            ].filter(s => s.value > 0);

            html += `<div class="stat-source-row">
                <div class="stat-source-label">${statNames[stat]} <span class="stat-source-total">${total.toLocaleString()}</span></div>
                <div class="stat-source-bar-container">`;

            for (const s of sources) {
                const pct = (s.value / total * 100).toFixed(1);
                html += `<div class="stat-source-bar-segment" style="width:${pct}%;background:${sourceColors[s.key]}" title="${sourceNames[s.key]}: ${s.value.toLocaleString()} (${pct}%)"></div>`;
            }

            html += `</div><div class="stat-source-details">`;

            for (const s of sources) {
                const pct = (s.value / total * 100).toFixed(1);
                html += `<span class="stat-source-detail-item">
                    <span class="stat-source-dot" style="background:${sourceColors[s.key]}"></span>
                    ${sourceIcons[s.key]} ${sourceNames[s.key]}: ${s.value.toLocaleString()} (${pct}%)
                </span>`;
            }

            html += `</div></div>`;
        }

        // 總屬性彙總
        const totalAll = battleStats.hp + battleStats.attack + battleStats.defense + battleStats.speed;
        const summaryItems = [
            { key: 'self', value: src.self.hp + src.self.attack + src.self.defense + src.self.speed },
            { key: 'team', value: src.team.hp + src.team.attack + src.team.defense + src.team.speed },
            { key: 'pokedex', value: src.pokedex.hp + src.pokedex.attack + src.pokedex.defense + src.pokedex.speed },
            { key: 'gem', value: src.gem.hp + src.gem.attack + src.gem.defense + src.gem.speed },
            { key: 'talent', value: src.talent.hp + src.talent.attack + src.talent.defense + src.talent.speed },
        ].filter(s => s.value > 0);

        html += `<div class="stat-source-row stat-source-summary">
            <div class="stat-source-label">📋 屬性總計 <span class="stat-source-total">${totalAll.toLocaleString()}</span></div>
            <div class="stat-source-bar-container">`;

        for (const s of summaryItems) {
            const pct = (s.value / totalAll * 100).toFixed(1);
            html += `<div class="stat-source-bar-segment" style="width:${pct}%;background:${sourceColors[s.key]}" title="${sourceNames[s.key]}: ${s.value.toLocaleString()} (${pct}%)"></div>`;
        }

        html += `</div><div class="stat-source-details">`;

        for (const s of summaryItems) {
            const pct = (s.value / totalAll * 100).toFixed(1);
            html += `<span class="stat-source-detail-item">
                <span class="stat-source-dot" style="background:${sourceColors[s.key]}"></span>
                ${sourceIcons[s.key]} ${sourceNames[s.key]}: ${s.value.toLocaleString()} (${pct}%)
            </span>`;
        }

        html += `</div></div></div>`;
        return html;
    }

    // 舊存檔使用任何主題時，也固定套用霓虹戰術介面
    _initTheme() {
        document.documentElement.setAttribute('data-theme', 'neon');
    }

    // ===================== 離線模擬進度 =====================
    _formatOfflineTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) return `${hours}小時${minutes}分${seconds}秒`;
        if (minutes > 0) return `${minutes}分${seconds}秒`;
        return `${seconds}秒`;
    }

    _showOfflineOverlay(totalMs) {
        const overlay = this._offlineOverlay;
        if (!overlay) return;
        // 顯示離線時間
        const timeText = document.getElementById('offline-time-text');
        if (timeText) timeText.textContent = `離線時間：${this._formatOfflineTime(totalMs)}`;
        // 重置進度
        const bar = document.getElementById('offline-progress-bar');
        if (bar) bar.style.width = '0%';
        const percentText = document.getElementById('offline-percent-text');
        if (percentText) percentText.textContent = '0%';
        const battlesText = document.getElementById('offline-battles-text');
        if (battlesText) battlesText.textContent = '已完成 0 場戰鬥';
        // 顯示遮罩
        overlay.classList.remove('hidden');
    }

    _updateOfflineProgress(_progress, battles, percent) {
        const bar = document.getElementById('offline-progress-bar');
        if (bar) bar.style.width = `${percent}%`;
        const percentText = document.getElementById('offline-percent-text');
        if (percentText) percentText.textContent = `${percent}%`;
        const battlesText = document.getElementById('offline-battles-text');
        if (battlesText) battlesText.textContent = `已完成 ${battles.toLocaleString()} 場戰鬥`;
    }

    _hideOfflineOverlay(battles, totalMs, report) {
        const overlay = this._offlineOverlay;
        if (!overlay) return;
        // 先把進度填滿
        const bar = document.getElementById('offline-progress-bar');
        if (bar) bar.style.width = '100%';
        const percentText = document.getElementById('offline-percent-text');
        if (percentText) percentText.textContent = '100%';
        const battlesText = document.getElementById('offline-battles-text');
        if (battlesText) battlesText.textContent = `完成 ${battles.toLocaleString()} 場戰鬥`;

        // 延遲一下再隱藏，讓使用者看到100%
        setTimeout(() => {
            overlay.classList.add('hidden');
            // 顯示結算通知
            if (battles > 0) {
                this.addBattleLog(`⚡ 離線 ${this._formatOfflineTime(totalMs)} 完成了 ${battles.toLocaleString()} 場戰鬥！`, 'evolution');
                this.showToast(`⚡ 離線結算: 完成了 ${battles.toLocaleString()} 場戰鬥！`);
            }
            this.renderTeam();
            if (report) {
                this._showOfflineReport(report);
                if (this._autoSettingsGuidePending) {
                    document.getElementById('offline-report-dialog')?.addEventListener('close', () => this.showAutoSettingsGuide(), { once: true });
                }
            } else if (this._autoSettingsGuidePending) {
                this.showAutoSettingsGuide();
            }
        }, 600);
    }

    _showOfflineReport(report) {
        let dialog = document.getElementById('offline-report-dialog');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'offline-report-dialog';
            document.body.appendChild(dialog);
        }
        dialog.replaceChildren();
        const heading = document.createElement('h2');
        heading.textContent = '🌙 離線進度報告';
        dialog.appendChild(heading);
        const grid = document.createElement('div');
        grid.className = 'offline-report-grid';
        dialog.appendChild(grid);
        const number = n => (n || 0).toLocaleString();
        const name = id => POKEMON_DATA[id]?.name || `#${id}`;
        const addSection = (title, rows) => {
            const section = document.createElement('section');
            const h = document.createElement('h3'); h.textContent = title; section.appendChild(h);
            for (const [label, value] of rows) {
                const row = document.createElement('div'); row.className = 'offline-report-row';
                const left = document.createElement('span'); left.textContent = label;
                const right = document.createElement('strong'); right.textContent = value;
                row.append(left, right); section.appendChild(row);
            }
            grid.appendChild(section);
        };
        const events = type => report.events.filter(e => type.includes(e.event));
        const badgeNames = events(['badgeUnlocked']).map(e => e.data.badgeName);
        const regionNames = events(['regionUnlocked']).map(e => e.data.regionName);
        const evolutions = events(['evolved']).map(e => `${e.data.oldName} → ${e.data.newName}`);
        addSection('① 離線時間', [
            ['離線 / 已計入', `${this._formatOfflineTime(report.elapsedMs)} / ${this._formatOfflineTime(report.creditedMs)}`],
            ['上限 / 未計入', `${this._formatOfflineTime(report.maxOfflineMs)} / ${this._formatOfflineTime(Math.max(0, report.elapsedMs - report.creditedMs))}`],
            ['結算地圖', `${report.startRoute} → ${report.endRoute}`]
        ]);
        addSection('② 戰鬥與收穫', [
            ['完成 / 勝利 / 失敗', `${number(report.wins + report.defeats)} / ${number(report.wins)} / ${number(report.defeats)} 場`],
            ['獲得經驗 / 金幣', `+${number(report.exp)} / +${number(report.gold)}`],
            ['新獲得形態 / 個體值提升', `${number(report.newCaught)} / ${number(report.ivUpdated)} 隻`],
            ['新閃光形態 / 新 6V', `${number(report.newShiny.length)} / ${number(report.new6v)} 隻`]
        ]);
        addSection('③ 隊伍成長', [
            ...report.team.map(p => [name(p.id), `Lv. ${number(p.before)} → ${p.after === null ? '已離隊' : number(p.after)}　技能 Lv. ${p.skill ?? '—'}`]),
            ['原隊伍以外（已有）', `${number(report.reserveCount)} 隻升級，合計 +${number(report.reserveLevels)} 級`]
        ]);
        addSection('④ 重要事件', [
            ['新閃光形態', report.newShiny.map(name).join('、') || '無'],
            ['進化', evolutions.join('、') || '無'],
            ['徽章 / 地區', `${badgeNames.join('、') || '無'} / ${regionNames.join('、') || '無'}`],
            ['自動切換地圖', `${number(report.routeSwitches)} 次，最後 ${report.endRoute}`]
        ]);
        addSection('⑤ 當前狀態', [
            ['目前隊伍 / 道路', `${number(report.currentTeam)} 隻 / ${report.endRoute}`],
            ['戰鬥狀態', '結算完成，恢復主線戰鬥'],
            ['成熟樹果', `${number(report.ripeBerries)} 塊地`]
        ]);
        const close = document.createElement('button'); close.type = 'button';
        close.className = 'offline-report-close'; close.textContent = '確認';
        close.addEventListener('click', () => dialog.close());
        const footer = document.createElement('div');
        footer.className = 'offline-report-footer';
        footer.appendChild(close);
        dialog.appendChild(footer);
        if (!dialog.open) dialog.showModal();
    }

    // ===================== 通知 =====================
    // 匯入存檔後檢查離線結算
    _checkOfflineAfterImport() {
        const importedLastSave = this.game._importedLastSave;
        this.game._importedLastSave = null;
        // 匯入後不能使用匯入前的戰鬥快取來結算新存檔。
        this.game.currentBattle = null;
        if (importedLastSave && this.game.getOfflineBattleRoute()) {
            const elapsed = Date.now() - importedLastSave;
            if (elapsed > 2000) {
                const offlineBonusValue = this.game.getBadgeEffectValue('offline_time_bonus');
                const maxOffline = offlineBonusValue !== null ? offlineBonusValue : (24 * 3600 * 1000);
                const cappedElapsed = Math.min(elapsed, maxOffline);
                console.log(`[離線-匯入] 距上次儲存 ${Math.floor(cappedElapsed / 60000)} 分鐘，開始結算...`);
                this.game.startBattle();
                requestAnimationFrame(() => { this.game._processOfflineBattles(cappedElapsed, elapsed, maxOffline); });
                return; // _processOfflineBattles 完成後會自動 startBattle
            }
        }
        this.game.startBattle();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2200);
    }

    showCatchNotification(pokemon) {
        // 構建捕獲資訊
        let message = `捕獲了 ${pokemon.name}`;
        
        if (pokemon.isFirstCatch) {
            message += ` (首次捕獲！)`;
        } else if (pokemon.updatedStats && pokemon.updatedStats.length > 0) {
            const statNames = {
                hp: '體力', atk: '攻擊', def: '防禦',
                spAtk: '特攻', spDef: '特防', speed: '速度'
            };
            const updates = pokemon.updatedStats.map(s => `${statNames[s.stat]} ${s.old}→${s.new}`).join(', ');
            message += ` (個體值更新: ${updates})`;
        } else if (pokemon.levelUp) {
            message += ` (等級提升至 Lv.${pokemon.level})`;
        }
        
        this.addBattleLog(message, 'catch');

        // 重新整理隊伍
        this.renderTeam();
    }

    showLevelUpNotification(pokemon) {
        // 改為顯示在戰鬥日誌中，連續升級合併為一條
        if (pokemon.startLevel && pokemon.level - pokemon.startLevel > 1) {
            this.addBattleLog(`${pokemon.name} Lv.${pokemon.startLevel} → Lv.${pokemon.level}！`, 'levelup');
        } else {
            this.addBattleLog(`${pokemon.name} 升到了 Lv.${pokemon.level}！`, 'levelup');
        }
    }

    showEvolutionNotification(data) {
        // 改為顯示在戰鬥日誌中
        this.addBattleLog(`🌟 ${data.oldName} 進化成了 ${data.newName}！等級重置為 Lv.1`, 'evolution');
    }

    _dismissModalOverlay(overlay, onClose, delay = 0) {
        const finish = () => {
            overlay.remove();
            if (onClose) onClose();
        };
        if (delay > 0) {
            overlay.classList.add('tutorial-closing');
            setTimeout(finish, delay);
        } else {
            finish();
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-buttons">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">確認</button>
                </div>
            </div>
        `;

        overlay.querySelector('.cancel-btn').addEventListener('click', () => this._dismissModalOverlay(overlay));
        overlay.querySelector('.confirm-btn').addEventListener('click', () => this._dismissModalOverlay(overlay, onConfirm));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this._dismissModalOverlay(overlay);
        });

        document.body.appendChild(overlay);
    }

    showAutoSettingsGuide() {
        const settings = this.game.gameState?.settings || {};
        if (settings.hideAutoSettingsGuide || (settings.autoSwitchBest && settings.autoRouteSwitch)) {
            this._autoSettingsGuidePending = false;
            return;
        }
        const report = document.getElementById('offline-report-dialog');
        if (!this._offlineOverlay?.classList.contains('hidden') || report?.open) {
            this._autoSettingsGuidePending = true;
            if (report?.open) report.addEventListener('close', () => this.showAutoSettingsGuide(), { once: true });
            return;
        }
        this._autoSettingsGuidePending = false;
        if (document.getElementById('auto-settings-guide')) return;
        const dialog = document.createElement('dialog');
        dialog.id = 'auto-settings-guide';
        dialog.setAttribute('aria-labelledby', 'auto-settings-guide-title');
        dialog.innerHTML = `
            <div class="auto-guide-content">
                <section class="auto-guide-hero"><span class="auto-guide-eyebrow">WELCOME TO POKÉIDLE</span><h2 id="auto-settings-guide-title">設定自動戰鬥</h2><p>只要自動更換寶可夢或自動切換地圖有任一項未開啟，就會顯示這個提醒。</p></section>
                <section class="auto-guide-card"><h3>🧭 設定方式</h3>
                    <div class="auto-guide-step"><b>1</b><div><strong>開啟左側「⚙️ 設定」</strong><p>找到「🎮 遊戲選項」。</p></div></div>
                    <div class="auto-guide-step"><b>2</b><div><strong>開啟兩個自動選項</strong><p>自動更換隊員與自動切換地圖。</p></div></div>
                    <div class="auto-guide-step"><b>3</b><div><strong>選擇切圖條件</strong><p>依照你想完成的圖鑑目標選擇。</p></div></div>
                    <p class="auto-guide-note">設定可隨時在「⚙️ 設定」中更改。此指引不會替你自動開啟選項；兩項都開啟後就不再提醒。</p>
                </section>
                <div class="auto-guide-actions"><button type="button" data-action="settings">前往設定 →</button><button type="button" data-action="later">稍後再說</button><button type="button" data-action="never">以後不提示</button></div>
            </div>`;
        dialog.addEventListener('cancel', event => event.preventDefault());
        dialog.addEventListener('click', event => {
            const action = event.target.closest('button[data-action]')?.dataset.action;
            if (!action) return;
            if (action === 'never') {
                this.game.gameState.settings ||= {};
                this.game.gameState.settings.hideAutoSettingsGuide = true;
                this.game.save();
            }
            dialog.close();
            dialog.remove();
            if (action === 'settings') this.switchTab('tab-settings');
        });
        document.body.appendChild(dialog);
        dialog.showModal();
    }

    showDisclaimerDialog(onClose) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay tutorial-overlay disclaimer-overlay';
        overlay.innerHTML = `
            <div class="modal tutorial-modal">
                <div class="tutorial-icon">📌</div>
                <h3>免責聲明</h3>
                <div class="tutorial-body">
                    <div class="tutorial-item"><span>本遊戲為非官方同人作品，與寶可夢相關權利人無關；寶可夢名稱、角色與相關素材的權利屬於各自權利人。</span></div>
                    <div class="tutorial-item"><span><strong>原始專案與授權：</strong>本遊戲修改自 <a href="https://github.com/Jinwind1/pokemon-idle" target="_blank" rel="noopener noreferrer">jinwind 的原始專案</a>，依 <a href="https://github.com/QQ7-Git/pokeidle/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">AGPL-3.0</a> 授權發布。<a href="https://github.com/QQ7-Git/pokeidle" target="_blank" rel="noopener noreferrer">查看修改版原始碼</a>。</span></div>
                </div>
                <div class="modal-buttons"><button type="button" class="confirm-btn tutorial-start-btn">確認</button></div>
            </div>`;
        overlay.querySelector('.tutorial-start-btn').addEventListener('click', () => this._dismissModalOverlay(overlay, onClose));
        document.body.appendChild(overlay);
    }

    showTutorialDialog(onClose) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay tutorial-overlay';
        overlay.innerHTML = `
            <div class="modal tutorial-modal">
                <div class="tutorial-icon">🎉</div>
                <h3>歡迎來到 PokéIdle</h3>
                <div class="tutorial-body">
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">📌</span>
                        <span><strong>免責聲明：</strong>本遊戲為非官方同人作品，與寶可夢相關權利人無關；寶可夢名稱、角色與相關素材的權利屬於各自權利人。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">📄</span>
                        <span><strong>原始專案與授權：</strong>本遊戲修改自 <a href="https://github.com/Jinwind1/pokemon-idle" target="_blank" rel="noopener noreferrer">jinwind 的原始專案</a>，依 <a href="https://github.com/QQ7-Git/pokeidle/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">AGPL-3.0</a> 授權發布。<a href="https://github.com/QQ7-Git/pokeidle" target="_blank" rel="noopener noreferrer">查看修改版原始碼</a>。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">🗺️</span>
                        <span>先到<strong>地圖</strong>選擇道路，隊伍會自動戰鬥並收集寶可夢。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">⚔️</span>
                        <span>擊敗野生寶可夢後會<strong>自動捕獲</strong>，無需手動操作。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">📖</span>
                        <span>在<strong>圖鑑</strong>將已捕獲的寶可夢編入隊伍，最多六隻。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">💪</span>
                        <span>完成圖鑑可解鎖地區與功能；未上陣的寶可夢也能提供<strong>屬性加成</strong>。</span>
                    </div>
                    <div class="tutorial-item">
                        <span class="tutorial-emoji">💾</span>
                        <span>進度儲存在目前瀏覽器，清除資料或更換裝置前，請到<strong>設定</strong>匯出備份；匯入會取代目前進度。</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="confirm-btn tutorial-start-btn">開始冒險！</button>
                </div>
            </div>
        `;

        overlay.querySelector('.tutorial-start-btn').addEventListener('click', () => this._dismissModalOverlay(overlay, onClose, 300));

        document.body.appendChild(overlay);
    }

    showGameplayHelpDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal gameplay-modal">
                <h3>📘 遊戲玩法說明</h3>
                <div class="gameplay-modal-body">
                    <p>核心目標：不斷捕獲、培養並集齊圖鑑，解鎖更多地區與系統。</p>

                    <div class="help-group">
                        <h4>📖 名詞解釋</h4>
                        <ul>
                            <li><strong>戰力</strong>：當前屬性綜合強度，按（生命+攻擊×技能威力系數+防禦+速度）/10 計算。技能等級越高，攻擊力在戰力中的權重越大。</li>
                            <li><strong>潛力</strong>：養成上限評估分，綜合經驗組與成長屬性評分。</li>
                            <li><strong>個體值（IV）</strong>：每隻寶可夢的隱藏屬性（0~31），影響最終屬性。</li>
                            <li><strong>圖鑑</strong>：記錄見過/捕獲狀態；地區解鎖與徽章獲取都依賴圖鑑進度。</li>
                            <li><strong>徽章與寶石</strong>：地區徽章提供功能與加成，寶石可進一步強化戰鬥詞條。</li>
                        </ul>
                    </div>

                    <div class="help-group">
                        <h4>⚔️ 戰鬥屬性來源</h4>
                        <ul>
                            <li><strong>基礎面板</strong>：由種族值、等級、個體值共同決定。</li>
                            <li><strong>隊伍加成</strong>：隊伍其他成員按比例提供屬性支援。</li>
                            <li><strong>圖鑑加成</strong>：已捕獲且不在隊伍中的寶可夢也會提供小比例加成。</li>
                            <li><strong>寶石/徽章詞條</strong>：會心、閃避、傷害修正、勝利回覆等額外效果。</li>
                            <li><strong>屬性剋制</strong>：攻擊與防禦屬性關係會改變最終傷害。</li>
                        </ul>
                    </div>

                    <div class="help-group">
                        <h4>📈 經驗分配規則</h4>
                        <ul>
                            <li><strong>出戰寶可夢</strong>：獲得100%經驗。</li>
                            <li><strong>同隊其他寶可夢</strong>：每隻獲得50%經驗。</li>
                            <li><strong>圖鑑中已捕獲且不在隊伍的寶可夢</strong>：每隻獲得1%經驗（向上取整）。</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button class="cancel-btn gameplay-close-btn">我知道了</button>
                </div>
            </div>
        `;

        const close = () => overlay.remove();
        overlay.querySelector('.gameplay-close-btn').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        document.body.appendChild(overlay);
    }


    // ===================== 徽章頁面 =====================
    updateBadgeTabVisibility() {
        const badgeTabBtn = document.querySelector('.badge-tab-btn');
        if (badgeTabBtn) {
            const unlocked = this.game.isRegionCompleted('kanto') || this.game.hasBadge('kanto');
            // 移除舊鎖圖示
            const oldLock = badgeTabBtn.querySelector('.lock-icon');
            if (oldLock) oldLock.remove();
            if (unlocked) {
                badgeTabBtn.classList.remove('locked');
            } else {
                badgeTabBtn.classList.add('locked');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.textContent = '🔒';
                badgeTabBtn.appendChild(lockSpan);
            }
        }
    }

    updateBerryTabVisibility() {
        const berryTabBtn = document.querySelector('.berry-tab-btn');
        if (berryTabBtn) {
            const unlocked = this.game.isBerryUnlocked();
            const oldLock = berryTabBtn.querySelector('.lock-icon');
            if (oldLock) oldLock.remove();
            if (unlocked) {
                berryTabBtn.classList.remove('locked');
            } else {
                berryTabBtn.classList.add('locked');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.textContent = '🔒';
                berryTabBtn.appendChild(lockSpan);
            }
        }
    }

    updateSkillTabVisibility() {
        this._syncUpgradeAllSkillsBtnVisibility();
        const skillTabBtn = document.querySelector('.skill-tab-btn');
        if (skillTabBtn) {
            const unlocked = this.game.isSkillUnlocked();
            const oldLock = skillTabBtn.querySelector('.lock-icon');
            if (oldLock) oldLock.remove();
            if (unlocked) {
                skillTabBtn.classList.remove('locked');
            } else {
                skillTabBtn.classList.add('locked');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.textContent = '🔒';
                skillTabBtn.appendChild(lockSpan);
            }
        }
    }

    // ===================== 技能頁面 =====================
    renderSkillPage() {
        if (!this.game.isSkillUnlocked()) return;
        this._syncUpgradeAllSkillsBtnVisibility();

        // 渲染規則說明
        const rulesEl = document.getElementById('skill-rules-content');
        if (rulesEl) {
            rulesEl.innerHTML = `
                <div class="skill-rules-list">
                    <div class="skill-rule-item">📌 每隻寶可夢有獨立的<strong>技能等級</strong>（0~${MAX_SKILL_LEVEL}級），預設0級。</div>
                    <div class="skill-rule-item">📌 當寶可夢等級 ≥ <strong>${SKILL_LEVEL_REQUIREMENT}</strong> 級時，可在圖鑑中點選「升級技能」按鈕。</div>
                    <div class="skill-rule-item">📌 每滿 ${SKILL_LEVEL_REQUIREMENT} 級，技能等級增加 1（不超過上限）；升級後等級<strong>重置為1</strong>，經驗歸零且不返還。</div>
                    <div class="skill-rule-item">📌 技能等級 > 0 時，戰鬥攻擊將使用該寶可夢對應屬性的<strong>技能威力</strong>（替代預設50威力）。</div>
                    <div class="skill-rule-item">📌 雙屬性寶可夢會自動選擇對敵方<strong>剋制效果更好</strong>的屬性技能進行攻擊。</div>
                    <div class="skill-rule-item">💡 前往<strong>圖鑑</strong>頁面，對≥${SKILL_LEVEL_REQUIREMENT}級的寶可夢使用「升級技能」按鈕提升實力！</div>
                </div>
            `;
        }

        // 渲染技能表格
        const tableEl = document.getElementById('skill-table-content');
        if (tableEl) {
            let html = '';
            for (const type in SKILL_DATA) {
                const typeName = TYPE_NAMES[type] || type;
                const skills = SKILL_DATA[type];
                html += `
                    <div class="skill-type-group">
                        <div class="skill-type-header">
                            <span class="type-badge ${type}">${typeName}</span>
                        </div>
                        <div class="skill-type-table">
                            ${skills.map(s => `
                                <div class="skill-row">
                                    <span class="skill-level-tag">Lv.${s.level}</span>
                                    <span class="skill-name">${s.name}</span>
                                    <span class="skill-power">威力 ${s.power}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            tableEl.innerHTML = html;
        }
    }

    // ===================== 天賦頁面 =====================
    updateTalentTabVisibility() {
        const talentTabBtn = document.querySelector('.talent-tab-btn');
        if (talentTabBtn) {
            const unlocked = this.game.isTalentUnlocked();
            const oldLock = talentTabBtn.querySelector('.lock-icon');
            if (oldLock) oldLock.remove();
            if (unlocked) {
                talentTabBtn.classList.remove('locked');
            } else {
                talentTabBtn.classList.add('locked');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.textContent = '🔒';
                talentTabBtn.appendChild(lockSpan);
            }
        }
    }

    renderTalentPage() {
        if (!this.game.isTalentUnlocked()) return;

        const totalPoints = this.game.getTotalTalentPoints();
        const usedPoints = this.game.getUsedTalentPoints();
        const remainingPoints = totalPoints - usedPoints;
        const totalLevel = this.game.getTotalPokemonLevel();
        const nextPointLevel = (totalPoints + 1) * 10000; // 下一個天賦點所需總等級

        // 渲染天賦點數顯示
        const pointsDisplay = document.getElementById('talent-points-display');
        if (pointsDisplay) {
            pointsDisplay.innerHTML = `
                <span>🌟 天賦點：</span>
                <span class="talent-points-remaining">${remainingPoints}</span>
                <span class="talent-points-total">/ ${totalPoints} (已用 ${usedPoints})</span>
                <span class="talent-level-info">｜📊 總等級 ${totalLevel.toLocaleString()} / ${nextPointLevel.toLocaleString()} (下一點)</span>
            `;
        }

        // 渲染天賦規則
        const rulesEl = document.getElementById('talent-rules-content');
        if (rulesEl) {
            rulesEl.innerHTML = `
                <div class="talent-rules-list">
                    <div class="talent-rule-item">📌 天賦點總數 = 全部寶可夢等級之和 ÷ <strong>10000</strong>（向下取整）</div>
                    <div class="talent-rule-item">📌 每次升級天賦消耗 <strong>1</strong> 個天賦點</div>
                    <div class="talent-rule-item">📌 按住 <strong>Shift</strong> 點選升級可一次升 <strong>10</strong> 級</div>
                    <div class="talent-rule-item">📌 按住 <strong>Ctrl</strong> 點選升級可一次升滿</div>
                    <div class="talent-rule-item">📌 重置天賦需要花費 <strong>100萬</strong> 金幣，歸還所有已用天賦點</div>
                    <div class="talent-rule-item">💡 寶可夢等級越高，可用天賦點越多！持續戰鬥提升等級來獲取更多天賦點</div>
                </div>
            `;
        }

        // 重置按鈕事件
        const resetBtn = document.getElementById('btn-reset-talents');
        if (resetBtn) {
            // 移除舊的事件監聽
            const newResetBtn = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
            newResetBtn.addEventListener('click', () => {
                if (usedPoints === 0) {
                    this.showToast('當前沒有已分配的天賦點');
                    return;
                }
                if (confirm(`確定要重置所有天賦嗎？\n將花費 1,000,000 金幣\n當前金幣: ${this.game.gameState.gold.toLocaleString()}`)) {
                    const result = this.game.resetTalents();
                    if (result.success) {
                        this.showToast('🔄 天賦已重置！');
                        this.renderTalentPage();
                    } else {
                        this.showToast(result.message);
                    }
                }
            });
        }

        // 渲染天賦列表
        const listEl = document.getElementById('talent-list');
        if (listEl) {
            let html = '';
            for (const talentId in TALENT_DATA) {
                const talent = TALENT_DATA[talentId];
                const level = this.game.getTalentLevel(talentId);
                const effectValue = this.game.getTalentValue(talentId);
                const isMaxed = level >= talent.maxLevel;
                const category = TALENT_CATEGORIES[talent.category] || { name: '其他', icon: '📋' };
                const progressPercent = (level / talent.maxLevel * 100).toFixed(1);

                // 特殊效果文字
                let effectText = '';
                if (talentId === 'skill_stat_bonus') {
                    const skillSum = this.game.getSkillLevelSum();
                    const actualBonus = this.game.getTalentStatBonusPercent();
                    effectText = `技能等級之和(${skillSum}) × ${effectValue.toFixed(2)}% = <span class="effect-value">+${actualBonus.toFixed(2)}%</span> 全屬性`;
                } else if (talentId === 'gem_attr_boost') {
                    const choice = this.game.getTalentGemAttrChoice();
                    const choiceName = choice ? (GEM_ATTRIBUTES.find(a => a.id === choice)?.name || '未選擇') : '未選擇';
                    effectText = `當前選擇: <span class="effect-value">${choiceName}</span>，機率 <span class="effect-value">+${effectValue}%</span>`;
                } else if (talentId === 'team_exp_bonus') {
                    const tLevel = this.game.getTalentLevel('team_exp_bonus');
                    // 展示幾個代表等級的提升示例
                    const exampleLow = this.game.getMonsterLevelBoost(1);
                    const exampleMid = this.game.getMonsterLevelBoost(5000);
                    const exampleHigh = this.game.getMonsterLevelBoost(17000);
                    effectText = `Lv.${tLevel}: Lv.1→<span class="effect-value">${exampleLow}</span>，Lv.5000→<span class="effect-value">${exampleMid}</span>，Lv.17000→<span class="effect-value">${exampleHigh}</span>`;
                } else {
                    effectText = `當前效果: <span class="effect-value">${talentId === 'berry_time_reduce' ? '-' : '+'}${effectValue}${talent.unit}</span>`;
                }

                html += `
                    <div class="talent-card" data-talent-id="${talentId}">
                        <div class="talent-card-header">
                            <div class="talent-card-title">
                                <span class="talent-card-icon">${talent.icon}</span>
                                <span class="talent-card-name">${talent.name}</span>
                                <span class="talent-category-tag ${talent.category}">${category.icon} ${category.name}</span>
                            </div>
                            <span class="talent-card-level">${level} / ${talent.maxLevel}</span>
                        </div>
                        <div class="talent-card-body">
                            <div class="talent-card-info">
                                <div class="talent-card-desc">${talent.description}</div>
                                <div class="talent-card-effect">${effectText}</div>
                                <div class="talent-progress-bar">
                                    <div class="talent-progress-fill" style="width: ${progressPercent}%"></div>
                                </div>
                            </div>
                            <div class="talent-card-actions">
                                <button class="talent-upgrade-btn ${isMaxed ? 'maxed' : ''}" 
                                        data-talent="${talentId}"
                                        ${isMaxed ? 'disabled' : ''}>
                                    ${isMaxed ? '已滿級' : '⬆ 升級'}
                                </button>
                                <div class="talent-upgrade-hint">${isMaxed ? '' : '每級+' + talent.perLevel + talent.unit}</div>
                            </div>
                        </div>
                        ${talentId === 'gem_attr_boost' ? this._renderGemAttrSelector() : ''}
                    </div>
                `;
            }
            listEl.innerHTML = html;

            // 繫結升級按鈕事件（支援Shift和Ctrl）
            listEl.querySelectorAll('.talent-upgrade-btn:not(.maxed)').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tid = btn.dataset.talent;
                    const talent = TALENT_DATA[tid];
                    if (!talent) return;
                    const currentLv = this.game.getTalentLevel(tid);
                    let levels = 1;
                    if (e.ctrlKey) {
                        // Ctrl: 升滿
                        levels = Math.min(talent.maxLevel - currentLv, remainingPoints);
                    } else if (e.shiftKey) {
                        // Shift: 升10級
                        levels = Math.min(10, talent.maxLevel - currentLv, remainingPoints);
                    }
                    if (levels <= 0) {
                        this.showToast('天賦點不足');
                        return;
                    }
                    const result = this.game.upgradeTalent(tid, levels);
                    if (result.success) {
                        this.showToast(`🌟 ${talent.name} 升至 Lv.${result.newLevel}（消耗${result.pointsUsed}點）`);
                        this.renderTalentPage();
                    } else {
                        this.showToast(result.message);
                    }
                });
            });

            // 繫結寶石屬性選擇器事件
            listEl.querySelectorAll('.gem-attr-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const attrId = opt.dataset.attr;
                    const result = this.game.setTalentGemAttrChoice(attrId);
                    if (result.success) {
                        const attrName = GEM_ATTRIBUTES.find(a => a.id === attrId)?.name || attrId;
                        this.showToast(`🔮 寶石屬性偏好已設為: ${attrName}`);
                        this.renderTalentPage();
                    }
                });
            });
        }
    }

    // 渲染寶石屬性選擇器
    _renderGemAttrSelector() {
        const currentChoice = this.game.getTalentGemAttrChoice();
        let html = '<div class="talent-gem-attr-selector">';
        for (const attr of GEM_ATTRIBUTES) {
            const selected = currentChoice === attr.id ? 'selected' : '';
            html += `<button class="gem-attr-option ${selected}" data-attr="${attr.id}">${attr.icon} ${attr.name}</button>`;
        }
        html += '</div>';
        return html;
    }


    updateGoldDisplay() {
        const goldStr = (this.game.gameState.gold || 0).toLocaleString();
        const el = document.getElementById('gold-amount');
        if (el) el.textContent = goldStr;
        const berryEl = document.getElementById('berry-gold-amount');
        if (berryEl) berryEl.textContent = goldStr;
    }

    renderBadgePage() {
        this.updateGoldDisplay();
        this.renderBadgeList();
        this.renderShop();
        this.renderGemBag();
        this.renderGemBonuses();
    }

    renderBadgeList() {
        const container = document.getElementById('badge-list');
        if (!container) return;
        container.innerHTML = '';

        for (const regionId in BADGE_DATA) {
            const badgeInfo = BADGE_DATA[regionId];
            const badge = this.game.gameState.badges[regionId];
            const unlocked = badge?.unlocked;
            const completed = this.game.isRegionCompleted(regionId);

            const card = document.createElement('div');
            card.className = `badge-card${unlocked ? ' unlocked' : ' locked'}`;

            if (unlocked) {
                const gem = badge.gem;
                const gemAttrSum = gem ? gem.attrs.reduce((sum, a) => sum + a.value, 0) : 0;
                const gemHtml = gem ? `
                    <div class="badge-gem-slot filled" style="border-color:${gem.qualityColor}">
                        <div class="badge-gem-overview"><div><div class="gem-quality" style="color:${gem.qualityColor}">💎 ${gem.qualityName}</div><span class="gem-attr-sum" style="color:${gem.qualityColor}">屬性總和 +${gemAttrSum}%</span></div><button class="gem-unequip-btn" data-region="${regionId}">卸下</button></div>
                        <details class="badge-gem-details"><summary>查看 ${gem.attrs.length} 項屬性</summary><div class="gem-attrs-mini">${gem.attrs.map(a => `<span>${a.icon} ${a.name}+${a.value}${a.unit}</span>`).join('')}</div></details>
                    </div>
                ` : `
                    <div class="badge-gem-slot empty">
                        <span class="gem-slot-empty-text">🔲 空插槽 - 從揹包鑲嵌寶石</span>
                    </div>
                `;

                card.innerHTML = `
                    <div class="badge-card-header">
                        <span class="badge-icon">${badgeInfo.icon}</span>
                        <div class="badge-info">
                            <div class="badge-name">${badgeInfo.name}</div>
                            <div class="badge-effect">${badgeInfo.effect}</div>
                        </div>
                    </div>
                    <div class="badge-gem-area">
                        <div class="badge-gem-label">寶石插槽</div>
                        ${gemHtml}
                    </div>
                `;

                // 繫結卸下按鈕事件
                if (gem) {
                    const btn = card.querySelector('.gem-unequip-btn');
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const result = this.game.unequipGem(regionId);
                        if (result.success) {
                            this.showToast('💎 寶石已卸下');
                            this.renderBadgePage();
                        } else {
                            this.showToast('⚠️ ' + result.message);
                        }
                    });
                }
            } else {
                // 未解鎖徽章：根據地區解鎖狀態分兩階段展示
                const unlockProgress = this.game.getRegionUnlockProgress(regionId);
                const badgeProgress = this.game.getPokedexStatsByRegion(regionId);
                const regionData = REGIONS[regionId];
                const regionName = regionData?.name || regionId;
                const regionUnlocked = this.game.isRegionUnlocked(regionId);
                // 獲取前置地區名稱（用於"集齊XX圖鑑"提示）
                const prevRegionName = regionData?.unlockCondition?.region
                    ? (REGIONS[regionData.unlockCondition.region]?.name || '') : '';

                let lockedDesc = badgeInfo.description;
                let progressText = '';

                if (regionId === 'kanto') {
                    // 關都：起始地區，無需解鎖地區，只需集齊圖鑑
                    progressText = `關都徽章進度: ${badgeProgress.caught}/${badgeProgress.total}`;
                } else if (!regionUnlocked) {
                    // 地區未解鎖
                    lockedDesc = `需先解鎖${regionName}（集齊${prevRegionName}圖鑑）`;
                    // 僅城都顯示解鎖進度（第一個需要解鎖的地區，玩家最關心）
                    if (regionId === 'johto') {
                        progressText = `${regionName}解鎖進度: ${unlockProgress.current}/${unlockProgress.total} (${unlockProgress.percent}%)`;
                    }
                } else {
                    // 地區已解鎖，但徽章未獲得
                    lockedDesc = `${regionName}已解鎖，捕獲全部${regionName}寶可夢後獲得`;
                    progressText = `${badgeInfo.name}進度: ${badgeProgress.caught}/${badgeProgress.total}`;
                }

                card.innerHTML = `
                    <div class="badge-card-header">
                        <span class="badge-icon locked-icon">🔒</span>
                        <div class="badge-info">
                            <div class="badge-name">${badgeInfo.name}</div>
                            <div class="badge-effect" style="color:var(--text-secondary)">${lockedDesc}</div>
                        </div>
                    </div>
                    ${!completed && progressText ? `<div class="badge-progress">${progressText}</div>` : ''}
                `;
            }

            container.appendChild(card);
        }
    }

    renderShop() {
        const shopSection = document.getElementById('shop-section');
        if (!shopSection) return;

        // 商店通關關都後解鎖
        if (!this.game.isGoldUnlocked()) {
            shopSection.style.display = 'none';
            return;
        }
        shopSection.style.display = '';

        const gemCount = this.game.gameState.gems.length;
        document.getElementById('gem-bag-count').textContent = `揹包: ${gemCount}/${GEM_BAG_MAX}`;

        const buyBtn = document.getElementById('btn-buy-gem');
        if (buyBtn) {
            // 移除舊監聽器（透過克隆節點）
            const newBtn = buyBtn.cloneNode(true);
            buyBtn.parentNode.replaceChild(newBtn, buyBtn);
            newBtn.addEventListener('click', () => {
                const result = this.game.buyGem();
                if (result.success) {
                    this.showToast(`💎 獲得 ${result.gem.qualityName} 寶石！`);
                    this.updateGoldDisplay();
                    this.renderGemBag();
                    this.renderShop();
                    this.renderGemBonuses();
                } else {
                    this.showToast('⚠️ ' + result.message);
                }
            });
        }

        const buyAllBtn = document.getElementById('btn-buy-all-gems');
        if (buyAllBtn) {
            const newAllBtn = buyAllBtn.cloneNode(true);
            buyAllBtn.parentNode.replaceChild(newAllBtn, buyAllBtn);
            newAllBtn.addEventListener('click', () => {
                const result = this.game.buyAllGems();
                if (result.success) {
                    const stopText = result.reason === 'bag_full' ? '揹包已滿' : '金幣已不足';
                    this.showToast(`🛒 批次購買完成：獲得 ${result.count} 顆寶石，花費 ${result.spent} 金幣（${stopText}）`);
                    this.updateGoldDisplay();
                    this.renderGemBag();
                    this.renderShop();
                    this.renderGemBonuses();
                } else {
                    this.showToast('⚠️ ' + result.message);
                }
            });
        }


        const sourceByTarget = {
            magic: 'common',
            rare: 'magic',
            epic: 'rare',
            mythic: 'epic',
            legendary: 'mythic',
            eternal: 'legendary',
        };

        // 合成按鈕事件
        shopSection.querySelectorAll('.gem-synthesis-btn:not(#btn-synthesize-all):not(#btn-reforge-eternal)').forEach(btn => {
            const cloned = btn.cloneNode(true);
            btn.parentNode.replaceChild(cloned, btn);
            cloned.addEventListener('click', () => {
                const targetQuality = cloned.dataset.targetQuality;
                const sourceQuality = sourceByTarget[targetQuality];
                const sourceInfo = GEM_QUALITIES.find(q => q.id === sourceQuality);
                const targetInfo = GEM_QUALITIES.find(q => q.id === targetQuality);
                const candidates = this.game.gameState.gems.filter(g => g.quality === sourceQuality && !g.locked);

                if (!sourceInfo || !targetInfo) {
                    this.showToast('⚠️ 合成配置異常');
                    return;
                }

                if (candidates.length < 10) {
                    this.showToast(`⚠️ 缺少可合成的${sourceInfo.name}寶石：需要10個，當前${candidates.length}個（未鎖定）`);
                    return;
                }

                this.showGemSynthesisDialog(sourceQuality, targetQuality);
            });
        });

        // 一鍵合成按鈕事件
        const synthesizeAllBtn = document.getElementById('btn-synthesize-all');
        if (synthesizeAllBtn) {
            const newBtn = synthesizeAllBtn.cloneNode(true);
            synthesizeAllBtn.parentNode.replaceChild(newBtn, synthesizeAllBtn);
            newBtn.addEventListener('click', () => {
                const result = this.game.synthesizeAllGems();
                if (result.success) {
                    // 彙總合成結果
                    const qualityNames = { common: '普通', magic: '魔法', rare: '稀有', epic: '史詩', mythic: '神話', legendary: '傳說', eternal: '永恆' };
                    const summary = {};
                    for (const r of result.results) {
                        const name = qualityNames[r.targetQuality] || r.targetQuality;
                        summary[name] = (summary[name] || 0) + 1;
                    }
                    const summaryText = Object.entries(summary).map(([name, count]) => `${name}×${count}`).join('、');
                    this.showToast(`🔄 一鍵合成完成！共合成 ${result.count} 次，獲得：${summaryText}`);
                    this.renderBadgePage();
                } else {
                    this.showToast('⚠️ ' + result.message);
                }
            });
        }

        // 重鑄永恆寶石按鈕事件
        const reforgeBtn = document.getElementById('btn-reforge-eternal');
        if (reforgeBtn) {
            const newReforgeBtn = reforgeBtn.cloneNode(true);
            reforgeBtn.parentNode.replaceChild(newReforgeBtn, reforgeBtn);
            newReforgeBtn.addEventListener('click', () => {
                const eternalGems = this.game.gameState.gems.filter(g => g.quality === 'eternal' && !g.locked);
                if (eternalGems.length < 2) {
                    this.showToast(`⚠️ 需要至少2個未鎖定的永恆寶石，當前${eternalGems.length}個`);
                    return;
                }
                this.showReforgeDialog();
            });
        }

        // 一鍵購買合成到永恆寶石按鈕（帕底亞徽章解鎖後顯示）
        const autoEternalBtn = document.getElementById('btn-auto-eternal');
        if (autoEternalBtn) {
            const paldeaUnlocked = this.game.hasBadge('paldea');
            autoEternalBtn.style.display = paldeaUnlocked ? '' : 'none';
            if (paldeaUnlocked) {
                const newAutoBtn = autoEternalBtn.cloneNode(true);
                autoEternalBtn.parentNode.replaceChild(newAutoBtn, autoEternalBtn);
                newAutoBtn.addEventListener('click', () => {
                    if (this.game.gameState.gold < 1000) {
                        this.showToast('⚠️ 金幣不足');
                        return;
                    }
                    // 如果正在執行中，忽略重複點選
                    if (this._autoEternalRunning) {
                        this.showToast('⏳ 正在執行中...');
                        return;
                    }
                    this.showConfirmDialog(
                        '一鍵購買併合成永恆寶石',
                        '將自動迴圈購買寶石併合成，直到產生新的永恆寶石或金幣耗盡。<br>⚠️ 可能消耗大量金幣，確定繼續嗎？',
                        () => {
                            this._startAutoEternalProcess();
                        }
                    );
                });
            }
        }
    }

    showGemSynthesisDialog(sourceQuality, targetQuality) {
        const sourceInfo = GEM_QUALITIES.find(q => q.id === sourceQuality);
        const targetInfo = GEM_QUALITIES.find(q => q.id === targetQuality);
        if (!sourceInfo || !targetInfo) {
            this.showToast('⚠️ 合成配置異常');
            return;
        }

        const candidates = this.game.gameState.gems.filter(g => g.quality === sourceQuality && !g.locked);
        if (candidates.length < 10) {
            this.showToast(`⚠️ 缺少可合成的${sourceInfo.name}寶石：需要10個，當前${candidates.length}個（未鎖定）`);
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const listHtml = candidates.map((g, idx) => {
            const attrsText = g.attrs.map(a => `${a.icon}${a.name}+${a.value}${a.unit}`).join('、');
            return `
                <label class="synthesis-item">
                    <input type="checkbox" class="synthesis-check" value="${g.uid}" ${idx < 10 ? 'checked' : ''}>
                    <span class="synthesis-item-name">💎 ${g.qualityName}寶石</span>
                    <span class="synthesis-item-attrs">${attrsText}</span>
                </label>
            `;
        }).join('');

        overlay.innerHTML = `
            <div class="modal synthesis-modal">
                <h3>✨ 合成${targetInfo.name}寶石</h3>
                <p>請選擇 10 個${sourceInfo.name}寶石進行合成</p>
                <div class="synthesis-count">已選擇 <span id="synthesis-selected-count">10</span>/10</div>
                <div class="synthesis-list">${listHtml}</div>
                <div class="modal-buttons">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">確認合成</button>
                </div>
            </div>
        `;

        const countEl = overlay.querySelector('#synthesis-selected-count');
        const checks = Array.from(overlay.querySelectorAll('.synthesis-check'));
        const confirmBtn = overlay.querySelector('.confirm-btn');

        const updateSelectedState = () => {
            const selectedCount = checks.filter(c => c.checked).length;
            countEl.textContent = String(selectedCount);
            confirmBtn.disabled = selectedCount !== 10;
        };

        checks.forEach(c => {
            c.addEventListener('change', () => {
                const selectedCount = checks.filter(x => x.checked).length;
                if (selectedCount > 10) {
                    c.checked = false;
                    this.showToast('⚠️ 最多隻能選擇10個寶石');
                }
                updateSelectedState();
            });
        });

        overlay.querySelector('.cancel-btn').addEventListener('click', () => overlay.remove());
        confirmBtn.addEventListener('click', () => {
            const selectedUids = checks.filter(c => c.checked).map(c => c.value);
            const result = this.game.synthesizeGems(sourceQuality, selectedUids);
            if (!result.success) {
                this.showToast('⚠️ ' + result.message);
                return;
            }
            overlay.remove();
            this.showToast(`✨ 合成成功！獲得 ${result.newGem.qualityName} 寶石`);
            this.renderBadgePage();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        updateSelectedState();
        document.body.appendChild(overlay);
    }

    // 一鍵購買併合成永恆寶石 - 非同步分批處理
    _autoEternalRunning = false;

    _startAutoEternalProcess() {
        const initResult = this.game.startAutoEternal();
        if (!initResult.success) {
            this.showToast('⚠️ ' + initResult.message);
            return;
        }
        this._autoEternalRunning = true;

        // 建立進度條覆蓋層（複用 modal 樣式）
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" style="max-width:420px;text-align:center">
                <h3>💎 一鍵購買合成永恆</h3>
                <div id="eternal-progress-info" style="margin:12px 0;color:var(--text-secondary);font-size:13px;min-height:40px;">
                    正在準備...
                </div>
                <div style="background:rgba(255,255,255,0.1);border-radius:8px;height:20px;overflow:hidden;margin-bottom:8px;">
                    <div id="eternal-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#9b59b6,#e74c3c);border-radius:8px;transition:width 0.15s;"></div>
                </div>
                <button id="btn-stop-auto-eternal" class="gem-synthesis-btn eternal" style="padding:10px 30px;font-size:15px;">⏹️ 停止</button>
            </div>`;
        document.body.appendChild(overlay);

        const infoEl = document.getElementById('eternal-progress-info');
        const barEl = document.getElementById('eternal-progress-bar');
        const stopBtn = document.getElementById('btn-stop-auto-eternal');

        stopBtn.addEventListener('click', () => {
            this.game.stopAutoEternal();
            stopBtn.disabled = true;
            stopBtn.textContent = '停止中...';
        });

        const BATCH_SIZE = 50; // 每批處理輪數
        let batchCount = 0;
        let stepResult = null;

        const runBatch = () => {
            for (let i = 0; i < BATCH_SIZE; i++) {
                if (!this._autoEternalRunning) { stepResult = { reason: 'stopped' }; break; }
                batchCount++;
                stepResult = this.game.autoBuySynthStep();

                if (stepResult.done) {
                    this._autoEternalRunning = false;
                    this._finishAutoEternal(stepResult, infoEl, barEl, stopBtn, overlay);
                    return;
                }
            }

            // 停止或更新進度
            if (!this._autoEternalRunning) {
                this._finishAutoEternal({ reason: 'stopped', bought: stepResult?.totalBought || 0, spent: stepResult?.totalSpent || 0, synthesized: stepResult?.totalSynthesized || 0, rounds: batchCount }, infoEl, barEl, stopBtn, overlay);
            } else {
                infoEl.innerHTML = `第 ${batchCount} 輪...<br>已購買 ${stepResult.totalBought} 顆 | 花費 ${stepResult.totalSpent.toLocaleString()} 金幣 | 合成 ${stepResult.totalSynthesized} 次`;
                barEl.style.width = Math.min(100, (batchCount % 500) / 500 * 100) + '%';
                setTimeout(runBatch, 0); // 讓出主執行緒
            }
        };

        setTimeout(runBatch, 0);
    }

    _finishAutoEternal(result, infoEl, barEl, stopBtn, overlay) {
        this._autoEternalRunning = false;
        const reasonText = result.reason === 'eternal_found'
            ? `<span style="color:#e74c3c">✨ 成功獲得 ${result.newEternals} 顆永恆寶石！</span>`
            : result.reason === 'stopped'
                ? '<span style="color:#f39c12">⏹️ 已手動停止</span>'
                : result.reason === 'gold_empty'
                    ? '💰 金幣已耗盡'
                    : '🎒 揹包已滿且無法繼續合成';
        infoEl.innerHTML = `${reasonText}<br><small>共購買 ${result.bought} 顆，花費 ${result.spent.toLocaleString()} 金幣，合成 ${result.synthesized} 次（${result.rounds} 輪）</small>`;
        barEl.style.width = '100%';
        // 克隆替換按鈕，清除所有舊的 eventListener
        const doneBtn = stopBtn.cloneNode(true);
        doneBtn.textContent = '完成';
        doneBtn.disabled = false;
        doneBtn.addEventListener('click', () => { overlay.remove(); this.renderBadgePage(); });
        stopBtn.parentNode.replaceChild(doneBtn, stopBtn);
    }

    showReforgeDialog() {
        const eternalGems = this.game.gameState.gems.filter(g => g.quality === 'eternal' && !g.locked);
        if (eternalGems.length < 2) {
            this.showToast(`⚠️ 需要至少2個未鎖定的永恆寶石，當前${eternalGems.length}個`);
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const listHtml = eternalGems.map((g, idx) => {
            const attrsText = g.attrs.map(a => `${a.icon}${a.name}+${a.value}${a.unit}`).join('、');
            return `
                <label class="synthesis-item">
                    <input type="checkbox" class="reforge-check" value="${g.uid}" ${idx < 2 ? 'checked' : ''}>
                    <span class="synthesis-item-name">💎 ${g.qualityName}寶石</span>
                    <span class="synthesis-item-attrs">${attrsText}</span>
                </label>
            `;
        }).join('');

        overlay.innerHTML = `
            <div class="modal synthesis-modal">
                <h3>🔨 重鑄永恆寶石</h3>
                <p>選擇 2 個永恆寶石，重鑄為 1 個新的永恆寶石（重新隨機屬性）</p>
                <div class="synthesis-count">已選擇 <span id="reforge-selected-count">2</span>/2</div>
                <div class="synthesis-list">${listHtml}</div>
                <div class="modal-buttons">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">確認重鑄</button>
                </div>
            </div>
        `;

        const countEl = overlay.querySelector('#reforge-selected-count');
        const checks = Array.from(overlay.querySelectorAll('.reforge-check'));
        const confirmBtn = overlay.querySelector('.confirm-btn');

        const updateSelectedState = () => {
            const selectedCount = checks.filter(c => c.checked).length;
            countEl.textContent = String(selectedCount);
            confirmBtn.disabled = selectedCount !== 2;
        };

        checks.forEach(c => {
            c.addEventListener('change', () => {
                const selectedCount = checks.filter(x => x.checked).length;
                if (selectedCount > 2) {
                    c.checked = false;
                    this.showToast('⚠️ 最多隻能選擇2個寶石');
                }
                updateSelectedState();
            });
        });

        overlay.querySelector('.cancel-btn').addEventListener('click', () => overlay.remove());
        confirmBtn.addEventListener('click', () => {
            const selectedUids = checks.filter(c => c.checked).map(c => c.value);
            const result = this.game.reforgeEternalGem(selectedUids);
            if (!result.success) {
                this.showToast('⚠️ ' + result.message);
                return;
            }
            overlay.remove();
            this.showToast(`🔨 重鑄成功！獲得新的永恆寶石`);
            this.renderBadgePage();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        updateSelectedState();
        document.body.appendChild(overlay);
    }

    renderGemBag() {
        const container = document.getElementById('gem-bag-list');
        const section = document.getElementById('gem-bag-section');
        if (!container || !section) return;

        if (!this.game.isGoldUnlocked()) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';

        const gems = this.game.gameState.gems;
        if (gems.length === 0) {
            container.innerHTML = '<div class="gem-bag-empty">揹包空空如也，去商店購買寶石吧！</div>';
            return;
        }

        container.innerHTML = '';
        // 按鎖定狀態排序（鎖定在前），再按品質排序（高品質在前：永恆→傳說→神話→史詩→稀有→魔法→普通）
        const qualityOrder = { 'eternal': 0, 'legendary': 1, 'mythic': 2, 'epic': 3, 'rare': 4, 'magic': 5, 'common': 6 };
        const sorted = [...gems].sort((a, b) => {
            // 鎖定的寶石排在前面
            const lockA = a.locked ? 0 : 1;
            const lockB = b.locked ? 0 : 1;
            if (lockA !== lockB) return lockA - lockB;
            // 品質高的排前面（mythic=0 最小排最前）
            const qA = (a.quality in qualityOrder) ? qualityOrder[a.quality] : 99;
            const qB = (b.quality in qualityOrder) ? qualityOrder[b.quality] : 99;
            return qA - qB;
        });

        for (const gem of sorted) {
            const card = document.createElement('div');
            card.className = `gem-card gem-${gem.quality}`;
            card.style.borderColor = gem.qualityColor;

            const attrsHtml = gem.attrs.map(a =>
                `<div class="gem-attr-line">${a.icon} ${a.name} <span class="gem-attr-value">+${a.value}${a.unit}</span></div>`
            ).join('');

            // 獲取可鑲嵌的徽章列表（僅顯示空槽徽章）
            const badgeOptions = [];
            for (const regionId in this.game.gameState.badges) {
                const b = this.game.gameState.badges[regionId];
                if (b?.unlocked && !b.gem) {
                    badgeOptions.push({ regionId, name: BADGE_DATA[regionId].name });
                }
            }

            const equipBtnsHtml = badgeOptions.map(b =>
                `<button class="gem-equip-btn" data-gem-uid="${gem.uid}" data-region="${b.regionId}">鑲嵌到${b.name}</button>`
            ).join('');

            const newBadgeHtml = gem.isNew ? '<span class="gem-new-badge" title="新購買">NEW</span>' : '';

            const gemAttrTotal = gem.attrs.reduce((sum, a) => sum + a.value, 0);
            card.innerHTML = `
                ${newBadgeHtml}
                <div class="gem-name">${gem.locked ? '🔒 ' : ''}💎 ${gem.qualityName}寶石</div>
                <div class="gem-hover-panel">
                    <div class="gem-attrs">${attrsHtml}</div>
                    <div class="gem-attr-sum-row" style="color:${gem.qualityColor}">屬性總和：${gemAttrTotal}%</div>
                    <div class="gem-equip-actions">${equipBtnsHtml}</div>
                    <div class="gem-action-row">
                        <button class="gem-lock-btn${gem.locked ? ' locked' : ''}" data-gem-uid="${gem.uid}">${gem.locked ? '🔓 解鎖' : '🔒 鎖定'}</button>
                        <button class="gem-discard-btn" data-gem-uid="${gem.uid}">🗑️ 丟棄</button>
                    </div>
                </div>
            `;

            const markGemViewed = () => {
                if (!gem.isNew) return;
                gem.isNew = false;
                const badge = card.querySelector('.gem-new-badge');
                if (badge) badge.remove();
                this.game.save();
            };

            // 根據位置自動調整懸浮面板方向（靠右時左對齊，避免被裁切）
            const adjustPanelPosition = () => {
                const panel = card.querySelector('.gem-hover-panel');
                if (panel) {
                    card.classList.remove('align-right');
                    const cardRect = card.getBoundingClientRect();
                    const panelWidth = Math.min(280, window.innerWidth * 0.8);
                    const column = card.closest('.badge-gem-column');
                    const isColumnScrollable = column && getComputedStyle(column).overflowY !== 'visible';
                    const rightEdge = isColumnScrollable ? column.getBoundingClientRect().right : window.innerWidth;
                    const overflowRight = cardRect.left + cardRect.width * 0.7 + panelWidth > rightEdge - 8;
                    if (overflowRight) {
                        card.classList.add('align-right');
                    }
                }
            };

            card.addEventListener('mouseenter', () => {
                adjustPanelPosition();
                markGemViewed();
            });

            // 點選卡片：僅觸控裝置使用 toggle active（手機相容）
            // PC 端有 hover 能力，不需要點選 toggle，避免 hover 和 click 衝突
            const hasHover = window.matchMedia('(hover: hover)').matches;
            card.addEventListener('click', (e) => {
                if (hasHover) {
                    // PC 端：點選只標記已檢視，不做 toggle
                    markGemViewed();
                    return;
                }
                // 觸控裝置：toggle active
                const isActive = card.classList.contains('active');
                document.querySelectorAll('.gem-card.active').forEach(c => c.classList.remove('active'));
                if (!isActive) {
                    adjustPanelPosition();
                    card.classList.add('active');
                    container.classList.add('has-active-gem');
                } else {
                    container.classList.remove('has-active-gem');
                }
                markGemViewed();
            });

            // 繫結鑲嵌按鈕
            card.querySelectorAll('.gem-equip-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const regionId = btn.dataset.region;
                    const gemUid = btn.dataset.gemUid;
                    const result = this.game.equipGem(regionId, gemUid);
                    if (result.success) {
                        this.showToast(`💎 寶石已鑲嵌到 ${BADGE_DATA[regionId].name}`);
                        this.renderBadgePage();
                    } else {
                        this.showToast('⚠️ ' + result.message);
                    }
                });
            });

            // 繫結鎖定按鈕
            const lockBtn = card.querySelector('.gem-lock-btn');
            if (lockBtn) {
                lockBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const result = this.game.toggleGemLock(gem.uid);
                    if (result.success) {
                        this.showToast(result.locked ? '🔒 寶石已鎖定' : '🔓 寶石已解鎖');
                        this.renderGemBag();
                        this.renderShop();
                    } else {
                        this.showToast('⚠️ ' + result.message);
                    }
                });
            }

            // 繫結丟棄按鈕
            const discardBtn = card.querySelector('.gem-discard-btn');
            if (discardBtn) {
                discardBtn.addEventListener('click', (e) => {
                    markGemViewed();
                    e.stopPropagation();
                    this.showConfirmDialog('丟棄寶石', '確定要丟棄這顆寶石嗎？此操作不可恢復。', () => {
                        const result = this.game.discardGem(gem.uid);
                        if (result.success) {
                            this.showToast('🗑️ 寶石已丟棄');
                            this.renderBadgePage();
                        } else {
                            this.showToast('⚠️ ' + result.message);
                        }
                    });
                });
            }

            container.appendChild(card);
        }

        // 點選空白處關閉所有寶石面板（手機相容）
        if (!this._gemBagClickOutsideBound) {
            this._gemBagClickOutsideBound = true;
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.gem-card')) {
                    document.querySelectorAll('.gem-card.active').forEach(c => c.classList.remove('active'));
                    const gemList = document.getElementById('gem-bag-list');
                    if (gemList) gemList.classList.remove('has-active-gem');
                }
            });
        }

    }

    renderGemBonuses() {
        const container = document.getElementById('gem-bonus-list');
        const section = document.getElementById('gem-bonus-section');
        if (!container || !section) return;

        if (!this.game.isGoldUnlocked()) {
            section.style.display = 'none';
            return;
        }
        section.style.display = '';

        const bonuses = this.game.getGemBonuses();
        const hasAnyBonus = Object.values(bonuses).some(v => v > 0);

        if (!hasAnyBonus) {
            container.innerHTML = '<div class="gem-bonus-empty">暫無寶石加成，鑲嵌寶石到徽章中即可獲得加成</div>';
            return;
        }

        container.innerHTML = '';
        for (const attr of GEM_ATTRIBUTES) {
            if (bonuses[attr.id] > 0) {
                const line = document.createElement('div');
                line.className = 'gem-bonus-line';
                let valueText = `+${bonuses[attr.id]}${attr.unit}`;
                if (attr.id === 'dodge_rate' && bonuses[attr.id] > 75) {
                    valueText += `（上限：75%）`;
                }
                line.innerHTML = `<span>${attr.icon} ${attr.name}</span><span class="gem-bonus-value">${valueText}</span>`;
                container.appendChild(line);
            }
        }
    }

    // ===================== 全域性重新整理 =====================
    refreshAll() {
        this.renderTeam();
        this.updateBadgeTabVisibility();
        this.updateBerryTabVisibility();
        this.updateSkillTabVisibility();
        this.updateTalentTabVisibility();
        this.updateTowerTabVisibility();
        if (this.currentTab === 'tab-map') this.renderMap({ preserveView: true });
        if (this.currentTab === 'tab-badge') this.renderBadgePage();
        if (this.currentTab === 'tab-berry') this.renderBerryPage();
        if (this.currentTab === 'tab-skill') this.renderSkillPage();
        if (this.currentTab === 'tab-talent') this.renderTalentPage();
        if (this.currentTab === 'tab-tower') this.renderTowerPage();
        if (this.currentTab === 'tab-pokedex') this.renderPokedex();
        if (this.currentTab === 'tab-settings') this.renderSettings();
        if (this.currentTab === 'tab-stats') this.renderStats();
    }

    // ===================== 挑戰塔頁面 =====================
    updateTowerTabVisibility() {
        const towerTabBtn = document.querySelector('.tower-tab-btn');
        if (towerTabBtn) {
            const unlocked = this.game.isTowerUnlocked();
            const oldLock = towerTabBtn.querySelector('.lock-icon');
            if (oldLock) oldLock.remove();
            if (unlocked) {
                towerTabBtn.classList.remove('locked');
            } else {
                towerTabBtn.classList.add('locked');
                const lockSpan = document.createElement('span');
                lockSpan.className = 'lock-icon';
                lockSpan.textContent = '🔒';
                towerTabBtn.appendChild(lockSpan);
            }
        }
    }

    renderTowerPage() {
        if (!this.game.isTowerUnlocked()) return;

        const tower = this.game.gameState.tower;
        const bonus = this.game.getTowerBonus();

        // 頂部進度
        const floorDisplay = document.getElementById('tower-floor-display');
        if (floorDisplay) {
            floorDisplay.innerHTML = `
                <span class="tower-progress">進度：<strong>${tower.currentFloor}</strong> / ${TOWER_MAX_FLOOR} 層</span>
                <span class="tower-highest">最高：<strong>${tower.highestFloor}</strong> 層</span>
            `;
        }

        // 加成資訊
        const bonusInfo = document.getElementById('tower-bonus-info');
        if (bonusInfo) {
            bonusInfo.innerHTML = `
                <div class="tower-bonus-grid">
                    <div class="tower-bonus-item">
                        <span class="bonus-icon">📈</span>
                        <span class="bonus-label">經驗值</span>
                        <span class="bonus-value">+${bonus}%</span>
                    </div>
                    <div class="tower-bonus-item">
                        <span class="bonus-icon">🪙</span>
                        <span class="bonus-label">金幣</span>
                        <span class="bonus-value">+${bonus}%</span>
                    </div>
                    <div class="tower-bonus-item">
                        <span class="bonus-icon">✨</span>
                        <span class="bonus-label">閃光機率</span>
                        <span class="bonus-value">+${bonus}%</span>
                    </div>
                </div>
            `;
        }

        // 規則說明
        const rulesContent = document.getElementById('tower-rules-content');
        if (rulesContent) {
            rulesContent.innerHTML = `
                <div class="tower-rules-list">
                    <div class="tower-rule-item">🗼 極限對戰塔共 <strong>${TOWER_MAX_FLOOR} 層</strong>，每層 <strong>${TOWER_ENEMIES_PER_FLOOR} 隻</strong>高種族值寶可夢；敵人為 6V、技能滿級且樹果吃滿</div>
                    <div class="tower-rule-item">⚖️ 我方圖鑑、天賦與寶石加成隨樓層逐步恢復：第 1 層分別為 30%、25%、25%，第 ${TOWER_MAX_FLOOR} 層為 100%</div>
                    <div class="tower-rule-item">📖 本層生效比例：圖鑑 ${(this.game.getTowerBonusFactors().pokedex * 100).toFixed(1)}%・天賦 ${(this.game.getTowerBonusFactors().talent * 100).toFixed(1)}%・寶石 ${(this.game.getTowerBonusFactors().gem * 100).toFixed(1)}%</div>
                    <div class="tower-rule-item">⚔️ 需要連續擊敗 6 隻才能通關；隊員各自保留 HP，換人與跨敵人不回復，全隊倒下才失敗</div>
                    <div class="tower-rule-item">🔄 每次重新挑戰時隊伍 HP 回滿；失敗、撤退或重新整理後從該層第一隻敵人開始</div>
                    <div class="tower-rule-item">🔒 挑戰期間可切換未倒下的隊員，但不能更換隊伍或升級技能</div>
                    <div class="tower-rule-item">📈 通關加成：<strong>歷史最高層數%</strong> 額外增加經驗/金幣/閃光機率</div>
                    <div class="tower-rule-item">⚠️ 怪物等級範圍：<strong>${this.game.getTowerFloorLevel(1).toLocaleString()}</strong> ~ <strong>${this.game.getTowerFloorLevel(TOWER_MAX_FLOOR).toLocaleString()}</strong></div>
                </div>
            `;
        }

        // 當前層標題
        const floorTitle = document.getElementById('tower-floor-title');
        if (floorTitle) {
            const level = this.game.getTowerFloorLevel(tower.currentFloor);
            floorTitle.textContent = `第 ${tower.currentFloor} 層 — 怪物等級 ${level.toLocaleString()}`;
        }

        // 敵人網格
        const enemiesGrid = document.getElementById('tower-enemies-grid');
        if (enemiesGrid) {
            if (!tower.enemies) {
                // 未生成敵人（還沒進入過）
                let html = '';
                for (let i = 0; i < TOWER_ENEMIES_PER_FLOOR; i++) {
                    html += `
                        <div class="tower-enemy-card unknown">
                            <div class="tower-enemy-sprite">❓</div>
                            <div class="tower-enemy-name">???</div>
                        </div>
                    `;
                }
                enemiesGrid.innerHTML = html;
            } else {
                let html = '';
                for (let i = 0; i < tower.enemies.length; i++) {
                    const enemyId = tower.enemies[i];
                    // 相容舊存檔（物件）和新格式（純id）
                    const id = typeof enemyId === 'object' ? enemyId.id : enemyId;
                    const baseData = POKEMON_DATA[id];
                    const name = baseData ? baseData.name : `#${id}`;
                    const level = this.game.getTowerFloorLevel(tower.currentFloor);
                    const spriteUrl = getPokemonSpriteUrl(id);
                    html += `
                        <div class="tower-enemy-card">
                            <div class="tower-enemy-sprite">
                                <img src="${spriteUrl}" alt="${name}" onerror="fallbackPokemonSprite(this, ${id}, false, '?')">
                            </div>
                            <div class="tower-enemy-name">${name}</div>
                            <div class="tower-enemy-level">Lv.${level.toLocaleString()}</div>
                        </div>
                    `;
                }
                enemiesGrid.innerHTML = html;
            }
        }

        // 操作按鈕狀態
        const startBtn = document.getElementById('btn-tower-start');
        const fleeBtn = document.getElementById('btn-tower-flee');
        const replayBtn = document.getElementById('btn-tower-replay');
        const autoNext = document.getElementById('tower-auto-next');
        if (autoNext) autoNext.checked = !!this.game.gameState.settings?.autoTower;
        if (replayBtn) {
            replayBtn.style.display = !this.game._towerMode && tower.highestFloor > 0 ? 'inline-block' : 'none';
            replayBtn.textContent = `🔄 重複挑戰第 ${tower.highestFloor} 層（重新抽取敵人）`;
        }
        if (startBtn) {
            if (this.game._towerMode) {
                startBtn.style.display = 'none';
                if (fleeBtn) fleeBtn.style.display = 'inline-block';
            } else {
                startBtn.style.display = 'inline-block';
                if (fleeBtn) fleeBtn.style.display = 'none';

                // 全部通關 100 層
                if (tower.currentFloor >= TOWER_MAX_FLOOR && tower.highestFloor >= TOWER_MAX_FLOOR) {
                    startBtn.textContent = `🏆 已通關全部 ${tower.currentFloor} 層！`;
                    startBtn.disabled = true;
                    startBtn.classList.add('maxed');
                } else {
                    startBtn.textContent = `⚔️ 挑戰第 ${tower.currentFloor} 層`;
                    startBtn.disabled = false;
                    startBtn.classList.remove('maxed');
                }
            }
        }

        // 繫結事件（只繫結一次）
        if (!this._towerEventsSetup) {
            this._setupTowerEvents();
            this._towerEventsSetup = true;
        }
    }

    _setupTowerEvents() {
        const startBtn = document.getElementById('btn-tower-start');
        const fleeBtn = document.getElementById('btn-tower-flee');
        const replayBtn = document.getElementById('btn-tower-replay');
        const autoNext = document.getElementById('tower-auto-next');
        if (autoNext) autoNext.addEventListener('change', () => {
            this.game.gameState.settings ||= {};
            this.game.gameState.settings.autoTower = autoNext.checked;
            this.game.save();
        });

        if (replayBtn) replayBtn.addEventListener('click', () => {
            const result = this.game.enterTower(true);
            if (!result.success) { this.showToast(result.message); return; }
            this.renderTowerPage();
            this.switchTab('tab-battle');
            this.addBattleLog(`🗼 重複挑戰極限對戰塔第 ${this.game.gameState.tower.currentFloor} 層！`, 'evolution');
            this.game.startTowerBattle();
        });

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.game._towerMode) return;

                const result = this.game.enterTower();
                if (!result.success) {
                    this.showToast(result.message);
                    return;
                }

                // 渲染當前層敵人
                this.renderTowerPage();

                // 切換到戰鬥頁面
                this.switchTab('tab-battle');
                this.addBattleLog(`🗼 進入極限對戰塔第 ${this.game.gameState.tower.currentFloor} 層！`, 'evolution');

                // 開始戰鬥
                this.game.startTowerBattle();
            });
        }

        if (fleeBtn) {
            fleeBtn.addEventListener('click', () => {
                if (!this.game._towerMode) return;
                if (this.game.gameState.settings) this.game.gameState.settings.autoTower = false;
                this.game.exitTower();
                this.addBattleLog(`🏃 撤退了極限對戰塔`, 'info');
                this.showToast('🏃 已撤退，返回主線戰鬥');
                this.renderTowerPage();
            });
        }
    }
}
