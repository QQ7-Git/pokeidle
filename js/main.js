// ============================================================
// 主入口 - 遊戲初始化
// PokéIdle
// ============================================================

let game;
let gameUI;

window.addEventListener('DOMContentLoaded', () => {
    // 清除舊版本機測試面板留下的覆寫設定。
    try {
        localStorage.removeItem('pokemon_idle_custom_speed');
        localStorage.removeItem('pokemon_idle_exp_multiplier');
        localStorage.removeItem('pokemon_idle_custom_rate_bonuses');
    } catch (e) {
        console.warn('無法清除舊版測試設定:', e);
    }

// 初始化遊戲核心
game = new GameCore();

    // 倍速隻影響線上戰鬥，單獨儲存以免改變遊戲存檔格式。
    let loaded = false;
    try {
        loaded = game.load();
    } catch (e) {
        console.warn('載入存檔異常:', e);
    }
    if (!loaded) {
        game.initNewGame();
    }

    // 初始化UI
    gameUI = new GameUI(game);

    // 初次渲染
    gameUI.renderTeam();

    // 離線結算：頁面載入時如果距離上次儲存超過2秒，自動執行離線戰鬥
    if (loaded && game.gameState && game.gameState.lastSave && game.getOfflineBattleRoute()) {
        const elapsed = Date.now() - game.gameState.lastSave;
        if (elapsed > 2000) {
            const offlineBonusValue = game.getBadgeEffectValue('offline_time_bonus');
            const maxOffline = offlineBonusValue !== null ? offlineBonusValue : (24 * 3600 * 1000);
            const cappedElapsed = Math.min(elapsed, maxOffline);
            console.log(`[離線] 距上次儲存 ${Math.floor(cappedElapsed / 60000)} 分鐘，開始結算...`);
            // 延遲到下一幀，確保UI已初始化
            requestAnimationFrame(() => { game._processOfflineBattles(cappedElapsed, elapsed, maxOffline); });
        }
    }

    // 首次顯示指引與聲明，之後每次進入顯示聲明。
    if (!localStorage.getItem('pokemon_idle_tutorial_done')) {
        gameUI.showTutorialDialog(() => {
            localStorage.setItem('pokemon_idle_tutorial_done', '1');
            gameUI.showAutoSettingsGuide();
        });
    } else {
        gameUI.showDisclaimerDialog(() => gameUI.showAutoSettingsGuide());
    }

    // 開始戰鬥
    game.startBattle();

    // 開始自動儲存
    game.startAutoSave();

    // 啟動樹果倒計時重新整理
    gameUI.startBerryTimer();

    console.log('🎮 寶可夢掛機放置遊戲已啟動！');
});

// 頁面關閉前儲存
window.addEventListener('beforeunload', () => {
    if (game) {
        game.save();
    }
});
