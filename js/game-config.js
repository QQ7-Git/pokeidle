// ============================================================
// 遊戲配置資料 - 徽章、寶石、樹果系統
// ============================================================

// ===================== 基礎常量 =====================
const MAX_POKEMON_LEVEL = 9999; // 寶可夢等級上限

// ===================== 徽章配置 =====================
const BADGE_DATA = {
    kanto: {
        name: '關都徽章',
        icon: '🏅',
        description: '通關關都地區獲得',
        effect: '解鎖金幣掉落：擊敗寶可夢後可以獲得金幣',
        effectType: 'unlock_gold',
    },
    johto: {
        name: '城都徽章',
        icon: '🎖️',
        description: '城都地區解鎖後，完成城都圖鑑獲得',
        effect: '獲取金幣提高 100%',
        effectType: 'gold_bonus',
        value: 1.0, // +100%
    },
    hoenn: {
        name: '豐緣徽章',
        icon: '🌟',
        description: '豐緣地區解鎖後，完成豐緣圖鑑獲得',
        effect: '經驗值獲取提高 50%',
        effectType: 'exp_bonus',
        value: 0.5, // +50%
    },
    sinnoh: {
        name: '神奧徽章',
        icon: '💎',
        description: '神奧地區解鎖後，完成神奧圖鑑獲得',
        effect: '閃光寶可夢出現機率提高 100%',
        effectType: 'shiny_bonus',
        value: 1.0, // +100% (閃光機率翻倍)
    },
    unova: {
        name: '合眾徽章',
        icon: '⚡',
        description: '合眾地區解鎖後，完成合眾圖鑑獲得',
        effect: '已達 6V 且閃光的寶可夢出現權重降低 90%；解鎖戰鬥速度 1.5 倍切換',
        effectType: 'completed_weight_reduce',
        value: 9 / 10, // 權重減少 9/10
        battleSpeedMultiplier: 1.5,
    },
    kalos: {
        name: '卡洛斯徽章',
        icon: '🌸',
        description: '卡洛斯地區解鎖後，完成卡洛斯圖鑑獲得',
        effect: '樹果成熟時間減半',
        effectType: 'berry_time_bonus',
        value: 0.5, // 成熟時間 ×0.5（減半）
    },
    alola: {
        name: '阿羅拉徽章',
        icon: '🌺',
        description: '阿羅拉地區解鎖後，完成阿羅拉圖鑑獲得',
        effect: '獲取寶石時屬性數值偏向更高值',
        effectType: 'gem_value_bonus',
        value: 0.5, // 屬性值在 min~max 範圍內偏向高值（加權50%）
    },
    galar: {
        name: '伽勒爾徽章',
        icon: '⚙️',
        description: '伽勒爾地區解鎖後，完成伽勒爾圖鑑獲得',
        effect: '收穫樹果數量翻倍',
        effectType: 'berry_yield_bonus',
        value: 2, // 收穫數量 ×2
    },
    paldea: {
        name: '帕底亞徽章',
        icon: '💎',
        description: '帕底亞地區解鎖後，完成帕底亞圖鑑獲得',
        effect: '最大離線時間增加到48小時',
        effectType: 'offline_time_bonus',
        value: 48 * 60 * 60 * 1000, // 48小時（毫秒）
    },
    mega: {
        name: 'Mega徽章',
        icon: '🔥',
        description: 'Mega進化地區解鎖後，完成Mega圖鑑獲得',
        effect: '圖鑑內寶可夢經驗增加50%',
        effectType: 'pokedex_exp_bonus',
        value: 0.5, // +50%
    },
};

// ===================== 寶石系統配置 =====================
const GEM_QUALITIES = [
    { id: 'common',    name: '普通', color: '#a0a0a0', attrCount: 1, weight: 10000, price: 100 },
    { id: 'magic',     name: '魔法', color: '#2ecc71', attrCount: 2, weight: 1000, price: 300 },
    { id: 'rare',      name: '稀有', color: '#3498db', attrCount: 3, weight: 100, price: 800 },
    { id: 'epic',      name: '史詩', color: '#9b59b6', attrCount: 4, weight: 10,  price: 2000 },
    { id: 'mythic',    name: '神話', color: '#f39c12', attrCount: 5, weight: 1,  price: 5000 },
    { id: 'legendary', name: '傳說', color: '#e74c3c', attrCount: 6, weight: 0.1, price: 10000 },
    { id: 'eternal',   name: '永恆', color: '#00d2ff', attrCount: 8, weight: 0.01, price: 25000 },
];

const GEM_ATTRIBUTES = [
    { id: 'crit_rate',       name: '會心一擊機率',         min: 1,  max: 5,  unit: '%',  icon: '💥' },
    { id: 'hp_bonus',        name: '生命值',               min: 1,  max: 5,  unit: '%',  icon: '❤️' },
    { id: 'atk_bonus',       name: '攻擊力',               min: 1,  max: 5,  unit: '%',  icon: '⚔️' },
    { id: 'def_bonus',       name: '防禦力',               min: 1,  max: 5,  unit: '%',  icon: '🛡️' },
    { id: 'speed_bonus',     name: '速度',                 min: 1,  max: 5,  unit: '%',  icon: '💨' },
    { id: 'dodge_rate',      name: '閃避機率',             min: 1,  max: 5,  unit: '%',  icon: '💫' },
];

const GEM_BAG_MAX = 100;

// ===================== 樹果系統配置 =====================
const BERRY_DATA = {
    hp_berry:    { id: 'hp_berry',    name: '體力樹果',  icon: '🍎', stat: 'hp',    color: '#e74c3c' },
    atk_berry:   { id: 'atk_berry',   name: '攻擊樹果',  icon: '🍊', stat: 'atk',   color: '#e67e22' },
    def_berry:   { id: 'def_berry',   name: '防禦樹果',  icon: '🍋', stat: 'def',   color: '#f1c40f' },
    spAtk_berry: { id: 'spAtk_berry', name: '特攻樹果',  icon: '🍇', stat: 'spAtk', color: '#9b59b6' },
    spDef_berry: { id: 'spDef_berry', name: '特防樹果',  icon: '🫐', stat: 'spDef', color: '#3498db' },
    speed_berry: { id: 'speed_berry', name: '速度樹果',  icon: '🍑', stat: 'speed', color: '#2ecc71' },
};
const BERRY_SEED_PRICE = 50000;      // 種子價格（金幣）
const BERRY_PLOT_MAX = 10;           // 最大種植空地
const BERRY_GROW_TIME = 5 * 60 * 60 * 1000; // 5小時成熟（毫秒）
const BERRY_MAX_PER_TYPE = 20;       // 每種樹果每隻寶可夢最多餵食數量
const BERRY_MAX_STAT_MULTIPLIER = 2; // 每種餵滿後對應種族值加倍
const BERRY_SYSTEM_VERSION = 2;      // 樹果計算規則版本
const LEGACY_BERRY_STAT_BONUS = 5;   // 舊規則每顆樹果增加的種族值（存檔遷移用）
const LEGACY_BERRY_STAT_CAP = 255;   // 舊規則玩家樹果上限（存檔遷移用）
const TOWER_ENEMY_STAT_CAP = 255;    // 挑戰塔敵人的種族值封頂
const POKEDEX_BONUS_PER_CAUGHT = 0.00075; // 每個已捕獲圖鑑項目提供0.075%自身能力加成
const POKEDEX_COMPLETE_BONUS = 0.05;      // 完成全部圖鑑額外加成
const POKEDEX_ALL_SIX_IV_BONUS = 0.05;    // 全圖鑑達6V額外加成
const POKEDEX_ALL_SHINY_BONUS = 0.05;     // 全圖鑑閃光額外加成
const POKEDEX_ALL_SIX_IV_SHINY_BONUS = 0.10; // 全圖鑑6V且閃光額外加成
const POKEDEX_STAT_MILESTONES = [100, 250, 500, 750, 1000];
const POKEDEX_STAT_MILESTONE_BONUS = 5;   // 每達成一個捕獲里程碑，六項基礎種族值各+5

// ===================== 技能系統配置 =====================
const SKILL_LEVEL_REQUIREMENT = 1000; // 升級技能所需最低等級
const SKILL_USE_LEVEL_REQUIREMENT = 500; // 未親自升級技能者使用共享技能所需等級
const MAX_SKILL_LEVEL = 8;            // 技能最大等級

// 每個屬性8個等級的技能，嚴格按傷害遞增排列（招式名和威力參考官方原版資料）
// 屬性共享技能達解鎖等級且符合使用門檻時，戰鬥可選用對應招式
const SKILL_DATA = {
    normal: [
        { level: 1,  name: '高速星星',   power: 60  },
        { level: 2,  name: '劈開',       power: 70  },
        { level: 3,  name: '怪力',       power: 80  },
        { level: 4,  name: '攀岩',       power: 90  },
        { level: 5,  name: '強力鑽',     power: 100 },
        { level: 6,  name: '捨身衝撞',   power: 120 },
        { level: 7,  name: '爆音波',     power: 140 },
        { level: 8,  name: '破壞光線',   power: 150 },
    ],
    fire: [
        { level: 1,  name: '火焰輪',     power: 60  },
        { level: 2,  name: '火焰拳',     power: 75  },
        { level: 3,  name: '火焰踢',     power: 85  },
        { level: 4,  name: '熱風',       power: 95  },
        { level: 5,  name: '大字爆炎',   power: 110 },
        { level: 6,  name: '閃焰衝鋒',   power: 120 },
        { level: 7,  name: '過熱',       power: 130 },
        { level: 8,  name: '爆炸烈焰',   power: 150 },
    ],
    water: [
        { level: 1,  name: '水之波動',   power: 60  },
        { level: 2,  name: '水波刀',     power: 70  },
        { level: 3,  name: '熱水',       power: 80  },
        { level: 4,  name: '衝浪',       power: 90  },
        { level: 5,  name: '蟹鉗錘',     power: 100 },
        { level: 6,  name: '加農水炮',   power: 110 },
        { level: 7,  name: '波動衝',     power: 120 },
        { level: 8,  name: '水炮',       power: 150 },
    ],
    electric: [
        { level: 1,  name: '電擊波',     power: 60  },
        { level: 2,  name: '雷電拳',     power: 75  },
        { level: 3,  name: '放電',       power: 80  },
        { level: 4,  name: '十萬伏特',   power: 90  },
        { level: 5,  name: '打雷',       power: 110 },
        { level: 6,  name: '電磁炮',     power: 120 },
        { level: 7,  name: '雷擊',       power: 130 },
        { level: 8,  name: '電光束',     power: 150 },
    ],
    grass: [
        { level: 1,  name: '魔法葉',     power: 60  },
        { level: 2,  name: '終極吸取',   power: 75  },
        { level: 3,  name: '種子炸彈',   power: 80  },
        { level: 4,  name: '能量球',     power: 90  },
        { level: 5,  name: '葉刃',       power: 90  },
        { level: 6,  name: '強力鞭打',   power: 120 },
        { level: 7,  name: '飛葉風暴',   power: 130 },
        { level: 8,  name: '瘋狂植物',   power: 150 },
    ],
    ice: [
        { level: 1,  name: '極光束',     power: 65  },
        { level: 2,  name: '冰凍拳',     power: 75  },
        { level: 3,  name: '冰柱墜擊',   power: 85  },
        { level: 4,  name: '冰凍光束',   power: 90  },
        { level: 5,  name: '冰錘',       power: 100 },
        { level: 6,  name: '冰錐',       power: 120 },
        { level: 7,  name: '冰封世界',   power: 140 },
        { level: 8,  name: '暴風雪',     power: 150 },
    ],
    fighting: [
        { level: 1,  name: '迴旋踢',     power: 60  },
        { level: 2,  name: '借力摔',     power: 70  },
        { level: 3,  name: '波導彈',     power: 80  },
        { level: 4,  name: '聖劍',       power: 90 },
        { level: 5,  name: '飛身重壓',   power: 100 },
        { level: 6,  name: '蠻力',       power: 120 },
        { level: 7,  name: '飛膝踢',     power: 130 },
        { level: 8,  name: '流星突擊',   power: 150 },
    ],
    poison: [
        { level: 1,  name: '毒液衝擊',   power: 65  },
        { level: 2,  name: '十字毒刃',   power: 70  },
        { level: 3,  name: '毒擊',       power: 80  },
        { level: 4,  name: '污泥炸彈',   power: 90  },
        { level: 5,  name: '污泥波',     power: 95  },
        { level: 6,  name: '劇毒暴衝',   power: 100  },
        { level: 7,  name: '打嗝',       power: 120 },
        { level: 8,  name: '垃圾射擊',   power: 150 },
    ],
    ground: [
        { level: 1,  name: '重踏',      power: 60  },
        { level: 2,  name: '泥巴炸彈',   power: 65  },
        { level: 3,  name: '跺腳',       power: 75  },
        { level: 4,  name: '挖洞',       power: 80  },
        { level: 5,  name: '大地之力',   power: 90  },
        { level: 6,  name: '地震',      power: 100  },
        { level: 7,  name: '突飛猛撲',   power: 120 },
        { level: 8,  name: '斷崖之劍',   power: 150 },
    ],
    flying: [
        { level: 1,  name: '翅膀攻擊',   power: 60  },
        { level: 2,  name: '空氣斬',     power: 75  },
        { level: 3,  name: '飛翔',       power: 90  },
        { level: 4,  name: '氣旋攻擊',   power: 100 },
        { level: 5,  name: '暴風',       power: 110 },
        { level: 6,  name: '勇鳥猛攻',   power: 120 },
        { level: 7,  name: '畫龍點睛',   power: 130 },
        { level: 8,  name: '神鳥猛擊',   power: 150 },
    ],
    psychic: [
        { level: 1,  name: '幻象光線',   power: 65  },
        { level: 2,  name: '精神利刃',   power: 70  },
        { level: 3,  name: '意念頭錘',   power: 80  },
        { level: 4,  name: '精神強念',   power: 90  },
        { level: 5,  name: '精神擊破',   power: 100 },
        { level: 6,  name: '預知未來',   power: 110 },
        { level: 7,  name: '同步干擾',   power: 130 },
        { level: 8,  name: '稜鏡鐳射',   power: 160 },
    ],
    bug: [
        { level: 1,  name: '蟲咬',       power: 60  },
        { level: 2,  name: '急速折返',   power: 70  },
        { level: 3,  name: '十字剪',     power: 80  },
        { level: 4,  name: '迎頭一擊',   power: 90  },
        { level: 5,  name: '蟲鳴',       power: 100  },
        { level: 6,  name: '攻擊指令',   power: 110  },
        { level: 7,  name: '花粉團',     power: 120  },
        { level: 8,  name: '超級角擊',   power: 150  },
    ],
    rock: [
        { level: 1,  name: '原始之力',   power: 60  },
        { level: 2,  name: '岩崩',       power: 75  },
        { level: 3,  name: '力量寶石',   power: 80  },
        { level: 4,  name: '強刃攻擊',   power: 95  },
        { level: 5,  name: '鑽石風暴',   power: 100 },
        { level: 6,  name: '流星光束',   power: 120 },
        { level: 7,  name: '雙刃頭錘',   power: 130 },
        { level: 8,  name: '岩石炮',     power: 150 },
    ],
    ghost: [
        { level: 1,  name: '暗影拳',     power: 60  },
        { level: 2,  name: '暗影爪',     power: 70  },
        { level: 3,  name: '暗影球',     power: 80  },
        { level: 4,  name: '暗影之骨',   power: 85  },
        { level: 5,  name: '潛靈奇襲',   power: 90  },
        { level: 6,  name: '禍不單行',   power: 100 },
        { level: 7,  name: '暗影潛襲',    power: 120 },
        { level: 8,  name: '靈騷',       power: 150 },
    ],
    dragon: [
        { level: 1,  name: '龍息',       power: 60  },
        { level: 2,  name: '龍爪',       power: 80  },
        { level: 3,  name: '龍錘',       power: 90  },
        { level: 4,  name: '龍之俯衝',   power: 100 },
        { level: 5,  name: '逆鱗',       power: 120 },
        { level: 6,  name: '流星群',     power: 130 },
        { level: 7,  name: '時光咆哮',   power: 150 },
        { level: 8,  name: '無極光束',   power: 160 },
    ],
    dark: [
        { level: 1,  name: '咬住',       power: 60  },
        { level: 2,  name: '暗襲要害',   power: 70  },
        { level: 3,  name: '咬碎',       power: 80  },
        { level: 4,  name: '惡之波動',   power: 90  },
        { level: 5,  name: '暗黑爆破',   power: 100  },
        { level: 6,  name: '怒火中燒',   power: 110  },
        { level: 7,  name: '拍落',       power: 120 },
        { level: 8,  name: '欺詐',       power: 150 },
    ],
    steel: [
        { level: 1,  name: '鋼拳雙擊',   power: 60  },
        { level: 2,  name: '鋼翼',      power: 70  },
        { level: 3,  name: '鐵頭',      power: 80  },
        { level: 4,  name: '彗星拳',    power: 90  },
        { level: 5,  name: '鐵尾',      power: 100  },
        { level: 6,  name: '淘金潮',     power: 120 },
        { level: 7,  name: '破滅之願',   power: 140 },
        { level: 8,  name: '巨力錘',     power: 160 },
    ],
    fairy: [
        { level: 1,  name: '妖精之風',   power: 60  },
        { level: 2,  name: '魅惑之聲',   power: 70  },
        { level: 3,  name: '吸取之吻',   power: 80  },
        { level: 4,  name: '魔法閃耀',   power: 90  },
        { level: 5,  name: '嬉鬧',       power: 100  },
        { level: 6,  name: '月亮之力',   power: 110  },
        { level: 7,  name: '花朵加農炮', power: 130 },
        { level: 8,  name: '破滅之光',   power: 150 },
    ],
};

// ===================== 天賦系統配置 =====================
const TALENT_RESET_COST = 1000000; // 重置天賦花費100萬金幣
const TALENT_MAX_LEVEL = 100;      // 天賦最大等級
const TALENT_DATA = {
    exp_bonus: {
        id: 'exp_bonus',
        name: '經驗值額外增加',
        icon: '📚',
        description: '擊敗寶可夢獲得的經驗值額外增加',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'growth',
    },
    gold_bonus: {
        id: 'gold_bonus',
        name: '金幣額外增加',
        icon: '🪙',
        description: '擊敗寶可夢獲得的金幣額外增加',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'growth',
    },
    shiny_bonus: {
        id: 'shiny_bonus',
        name: '閃光機率額外增加',
        icon: '✨',
        description: '遇到閃光寶可夢的機率額外增加',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'growth',
    },
    gem_common_reduce: {
        id: 'gem_common_reduce',
        name: '普通寶石機率降低',
        icon: '💎',
        description: '購買寶石時出現普通寶石的機率降低',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'resource',
    },
    berry_time_reduce: {
        id: 'berry_time_reduce',
        name: '樹果成熟時間縮短',
        icon: '🌱',
        description: '樹果成熟所需時間縮短',
        maxLevel: 100,
        perLevel: 1,
        unit: '分鐘',
        category: 'resource',
    },
    crit_damage_bonus: {
        id: 'crit_damage_bonus',
        name: '會心一擊傷害增加',
        icon: '💥',
        description: '會心一擊的傷害倍率增加（原本150%基礎上增加）',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'battle',
    },
    team_exp_bonus: {
        id: 'team_exp_bonus',
        name: '野生怪物等級提升',
        icon: '👥',
        description: '提高野外遇到的怪物等級，滿級時全圖怪物均為30000級（極限對戰塔除外，超過30000級的怪物不受影響）',
        maxLevel: 100,
        perLevel: 1,
        unit: '',
        category: 'growth',
    },
    pokedex_exp_bonus: {
        id: 'pokedex_exp_bonus',
        name: '圖鑑內寶可夢獲得經驗增加',
        icon: '📖',
        description: '不在隊伍中的已捕獲寶可夢獲得的經驗額外增加',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'growth',
    },
    skill_stat_bonus: {
        id: 'skill_stat_bonus',
        name: '寶可夢全屬性增加',
        icon: '⚡',
        description: '基於技能等級之和，增加寶可夢全屬性百分比',
        maxLevel: 100,
        perLevel: 0.0002,
        unit: '%',
        category: 'battle',
        special: '技能等級之和×每級0.0002%',
    },
    gem_attr_boost: {
        id: 'gem_attr_boost',
        name: '寶石屬性出現機率增加',
        icon: '🔮',
        description: '選擇一條寶石屬性，使其在生成寶石時出現機率增加',
        maxLevel: 100,
        perLevel: 1,
        unit: '%',
        category: 'resource',
        special: '需選擇目標屬性',
    },
};

// 天賦分類
const TALENT_CATEGORIES = {
    growth: { name: '成長', icon: '📈' },
    battle: { name: '戰鬥', icon: '⚔️' },
    resource: { name: '資源', icon: '💰' },
};

// ===================== 挑戰塔配置 =====================
const TOWER_MAX_FLOOR = 255;            // 最高層數
const TOWER_ENEMIES_PER_FLOOR = 6;      // 每層敵人數量
const TOWER_LEVEL_STEPS = [
    { floor: 1, level: 8000 },
    { floor: 100, level: 8500 },
    { floor: 150, level: 8600 },
    { floor: 200, level: 9200 },
    { floor: 240, level: 9300 },
    { floor: 241, level: 9400 },
    { floor: 255, level: 9500 },
];
const TOWER_BONUS_FACTOR_STEPS = [
    { floor: 1, pokedex: 1.00, talent: 1.00, gem: 1.00 },
    { floor: 100, pokedex: 0.95, talent: 0.90, gem: 0.90 },
    { floor: 150, pokedex: 0.92, talent: 0.87, gem: 0.87 },
    { floor: 200, pokedex: 0.89, talent: 0.84, gem: 0.84 },
    { floor: 240, pokedex: 0.86, talent: 0.81, gem: 0.81 },
    { floor: 255, pokedex: 0.86, talent: 0.81, gem: 0.81 },
];
const TOWER_NO_TYPE_ADVANTAGE_FLOOR = 241;
const TOWER_NO_ADVANTAGE_DAMAGE_FACTOR = 0.8;
const TOWER_MIN_BASE_STAT_TOTAL = 500;  // 候選怪物種族值總和下限

// ===================== 離線模擬配置 =====================
const MAX_OFFLINE_TIME = 24 * 60 * 60 * 1000;  // 離線模擬上限24小時（毫秒）
const OFFLINE_BATCH_SIZE = 200;                  // 每批模擬戰鬥數
