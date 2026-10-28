// ============================================================
// 地區與道路資料 - 等級逐步提升，無重疊
// ============================================================
//
// 【道路等級規則】（新增地區時請參考）
//
//  地區序號 | 地區名稱 | 道路數 | 每條道路等級跨度 | 等級範圍
//  ---------|----------|--------|------------------|----------
//     1     | 關都     |  27條  |     5級          | 1 - 135
//     2     | 城都     |  24條  |  5~10級          | 136 - 300
//     3     | 豐緣     |  24條  |    15級          | 301 - 660
//     4     | 神奧     |  24條  |    20級          | 661 - 1140
//     5     | 合眾     |  23條  |    25級          | 1141 - 1715
//     6     | 卡洛斯   |  23條  |    30級          | 1716 - 2410
//     7     | 阿羅拉   |  14條  |  60~100級        | 2411 - 3600
//     8     | 伽勒爾   |  15條  |   200級          | 3601 - 6600
//     9     | 帕底亞   |  14條  | 500~1000級       | 6601 - 17000
//    10     | Mega進化 |  10條  |   1500級         | 17001 - 32000
//
// 規則說明：
//   - 新地區的起始等級 = 上一個地區最後一條道路的最高等級 + 1。
//   - 每條道路的等級範圍 = [上一條道路最高等級+1, 上一條道路最高等級+跨度]。
//   - 傳說/幻之寶可夢的等級範圍應設定在對應道路等級範圍的末尾附近。
//
// ============================================================

const REGIONS = {
    kanto: {
        id: 'kanto',
        name: '關都地區',
        nameEn: 'Kanto',
        description: '初代寶可夢的故鄉，擁有豐富的地形和多樣的寶可夢。完成關都圖鑑可獲得徽章，解鎖戰鬥金幣掉落。',
        routes: [
            {
                id: 'kanto_route1',
                name: '1號道路',
                description: '真新鎮到常磐市之間的道路',
                levelRange: [1, 5],
                pokemon: [
                    { id: 19, weight: 55, levelRange: [1, 4] },  // 小拉達
                    { id: 16, weight: 45, levelRange: [1, 5] },  // 波波
                ]
            },
            {
                id: 'kanto_route2',
                name: '2號道路',
                description: '常磐市到常磐森林之間的道路',
                levelRange: [6, 10],
                pokemon: [
                    { id: 16, weight: 30, levelRange: [6, 10] },  // 波波
                    { id: 19, weight: 30, levelRange: [6, 10] },  // 小拉達
                    { id: 10, weight: 20, levelRange: [6, 10] },  // 綠毛蟲
                    { id: 13, weight: 20, levelRange: [6, 10] },  // 獨角蟲
                ]
            },
            {
                id: 'kanto_viridian_forest',
                name: '常磐森林',
                description: '一片茂密的森林，蟲系寶可夢的天堂',
                levelRange: [11, 15],
                pokemon: [
                    { id: 10, weight: 25, levelRange: [11, 15] },  // 綠毛蟲
                    { id: 13, weight: 25, levelRange: [11, 15] },  // 獨角蟲
                    { id: 46, weight: 25, levelRange: [11, 15] },  // 派拉斯
                    { id: 11, weight: 10, levelRange: [11, 15] },  // 鐵甲蛹
                    { id: 14, weight: 10, levelRange: [11, 15] },  // 鐵殼蛹
                    { id: 25, weight: 5, levelRange: [11, 15] },   // 皮卡丘（稀有）
                ]
            },
            {
                id: 'kanto_route3',
                name: '3號道路',
                description: '尼比市到月見山之間的道路',
                levelRange: [16, 20],
                pokemon: [
                    { id: 21, weight: 30, levelRange: [16, 20] }, // 烈雀
                    { id: 27, weight: 20, levelRange: [16, 20] }, // 穿山鼠
                    { id: 32, weight: 20, levelRange: [16, 20] }, // 尼多朗
                    { id: 29, weight: 20, levelRange: [16, 20] }, // 尼多蘭
                    { id: 39, weight: 10, levelRange: [16, 20] },  // 胖丁
                ]
            },
            {
                id: 'kanto_mt_moon',
                name: '月見山',
                description: '連線尼比市和華藍市的山洞',
                levelRange: [21, 25],
                pokemon: [
                    { id: 41, weight: 35, levelRange: [21, 25] }, // 超音蝠
                    { id: 74, weight: 25, levelRange: [21, 25] }, // 小拳石
                    { id: 46, weight: 15, levelRange: [21, 25] }, // 派拉斯
                    { id: 27, weight: 15, levelRange: [21, 25] }, // 穿山鼠
                    { id: 35, weight: 10, levelRange: [21, 25] }, // 皮皮（稀有）
                ]
            },
            {
                id: 'kanto_route4',
                name: '4號道路',
                description: '月見山到華藍市之間的道路',
                levelRange: [26, 30],
                pokemon: [
                    { id: 21, weight: 25, levelRange: [26, 30] },  // 烈雀
                    { id: 23, weight: 20, levelRange: [26, 30] },  // 阿柏蛇
                    { id: 27, weight: 20, levelRange: [26, 30] },  // 穿山鼠
                    { id: 56, weight: 20, levelRange: [26, 30] },  // 猴怪
                    { id: 48, weight: 15, levelRange: [26, 30] },  // 毛球
                ]
            },
            {
                id: 'kanto_route24',
                name: '24號道路 (黃金橋)',
                description: '華藍市北方的著名橋樑',
                levelRange: [31, 35],
                pokemon: [
                    { id: 43, weight: 25, levelRange: [31, 35] }, // 走路草
                    { id: 69, weight: 25, levelRange: [31, 35] }, // 喇叭芽
                    { id: 16, weight: 20, levelRange: [31, 35] }, // 波波
                    { id: 10, weight: 15, levelRange: [31, 35] }, // 綠毛蟲
                    { id: 63, weight: 15, levelRange: [31, 35] }, // 凱西
                ]
            },
            {
                id: 'kanto_route5',
                name: '5號道路',
                description: '華藍市到金黃市之間的道路',
                levelRange: [36, 40],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [36, 40] }, // 喵喵
                    { id: 43, weight: 25, levelRange: [36, 40] }, // 走路草
                    { id: 16, weight: 20, levelRange: [36, 40] }, // 波波
                    { id: 56, weight: 12, levelRange: [36, 40] }, // 猴怪
                    { id: 63, weight: 12, levelRange: [36, 40] }, // 凱西
                    { id: 1, weight: 6, levelRange: [36, 40] },   // 妙蛙種子（稀有）
                ]
            },
            {
                id: 'kanto_route6',
                name: '6號道路',
                description: '金黃市到枯葉市之間的道路',
                levelRange: [41, 45],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [41, 45] }, // 喵喵
                    { id: 69, weight: 25, levelRange: [41, 45] }, // 喇叭芽
                    { id: 16, weight: 18, levelRange: [41, 45] }, // 波波
                    { id: 56, weight: 13, levelRange: [41, 45] }, // 猴怪
                    { id: 63, weight: 13, levelRange: [41, 45] }, // 凱西
                    { id: 7, weight: 6, levelRange: [41, 45] },   // 傑尼龜（稀有）
                ]
            },
            {
                id: 'kanto_route9',
                name: '9號道路',
                description: '華藍市到巖山隧道的崎嶇山路',
                levelRange: [46, 50],
                pokemon: [
                    { id: 21, weight: 25, levelRange: [46, 50] }, // 烈雀
                    { id: 19, weight: 20, levelRange: [46, 50] }, // 小拉達
                    { id: 23, weight: 20, levelRange: [46, 50] }, // 阿柏蛇
                    { id: 48, weight: 20, levelRange: [46, 50] }, // 毛球
                    { id: 100, weight: 15, levelRange: [46, 50] }, // 霹靂電球
                ]
            },
            {
                id: 'kanto_rock_tunnel',
                name: '巖山隧道',
                description: '漆黑的岩石隧道，連線華藍市和紫苑鎮',
                levelRange: [51, 55],
                pokemon: [
                    { id: 41, weight: 25, levelRange: [51, 55] }, // 超音蝠
                    { id: 74, weight: 25, levelRange: [51, 55] }, // 小拳石
                    { id: 66, weight: 20, levelRange: [51, 55] }, // 腕力
                    { id: 104, weight: 20, levelRange: [51, 55] }, // 卡拉卡拉
                    { id: 95, weight: 10, levelRange: [51, 55] }, // 大巖蛇
                ]
            },
            {
                id: 'kanto_route7',
                name: '7號道路',
                description: '金黃市到彩虹市之間的短道路',
                levelRange: [56, 60],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [56, 60] }, // 喵喵
                    { id: 37, weight: 20, levelRange: [56, 60] }, // 六尾
                    { id: 58, weight: 20, levelRange: [56, 60] }, // 卡蒂狗
                    { id: 43, weight: 17, levelRange: [56, 60] }, // 走路草
                    { id: 17, weight: 12, levelRange: [56, 60] }, // 比比鳥
                    { id: 4, weight: 6, levelRange: [56, 60] },   // 小火龍（稀有）
                ]
            },
            {
                id: 'kanto_route8',
                name: '8號道路',
                description: '金黃市到紫苑鎮之間的道路',
                levelRange: [61, 65],
                pokemon: [
                    { id: 96, weight: 25, levelRange: [61, 65] }, // 催眠貘
                    { id: 37, weight: 20, levelRange: [61, 65] }, // 六尾
                    { id: 58, weight: 20, levelRange: [61, 65] }, // 卡蒂狗
                    { id: 69, weight: 15, levelRange: [61, 65] }, // 喇叭芽
                    { id: 25, weight: 15, levelRange: [61, 65] }, // 皮卡丘
                    { id: 122, weight: 5, levelRange: [61, 65] }, // 魔牆人偶（稀有）
                ]
            },
            {
                id: 'kanto_pokemon_tower',
                name: '寶可夢塔',
                description: '紫苑鎮的靈魂安息之所',
                levelRange: [66, 70],
                pokemon: [
                    { id: 92, weight: 35, levelRange: [66, 70] }, // 鬼斯
                    { id: 104, weight: 25, levelRange: [66, 70] }, // 卡拉卡拉
                    { id: 41, weight: 25, levelRange: [66, 70] }, // 超音蝠
                    { id: 93, weight: 15, levelRange: [66, 70] }, // 鬼斯通
                ]
            },
            {
                id: 'kanto_route10',
                name: '10號道路',
                description: '巖山隧道入口和無人發電廠附近',
                levelRange: [71, 75],
                pokemon: [
                    { id: 100, weight: 30, levelRange: [71, 75] }, // 霹靂電球
                    { id: 81, weight: 28, levelRange: [71, 75] },  // 小磁怪
                    { id: 21, weight: 20, levelRange: [71, 75] },  // 烈雀
                    { id: 23, weight: 15, levelRange: [71, 75] },  // 阿柏蛇
                    { id: 125, weight: 6, levelRange: [71, 75] },  // 電擊獸（稀有）
                    { id: 145, weight: 3, levelRange: [75, 75] },  // 閃電鳥（傳說）
                ]
            },
            {
                id: 'kanto_route11',
                name: '11號道路',
                description: '枯葉市東方的道路',
                levelRange: [76, 80],
                pokemon: [
                    { id: 23, weight: 25, levelRange: [76, 80] }, // 阿柏蛇
                    { id: 84, weight: 20, levelRange: [76, 80] }, // 嘟嘟
                    { id: 50, weight: 20, levelRange: [76, 80] }, // 地鼠
                    { id: 96, weight: 15, levelRange: [76, 80] }, // 催眠貘
                    { id: 19, weight: 15, levelRange: [76, 80] }, // 小拉達
                    { id: 138, weight: 5, levelRange: [76, 80] },  // 菊石獸（稀有）
                ]
            },
            {
                id: 'kanto_route12',
                name: '12號道路',
                description: '枯葉市到紫苑鎮的海邊道路',
                levelRange: [81, 85],
                pokemon: [
                    { id: 79, weight: 30, levelRange: [81, 85] }, // 呆呆獸
                    { id: 129, weight: 25, levelRange: [81, 85] }, // 鯉魚王
                    { id: 48, weight: 20, levelRange: [81, 85] }, // 毛球
                    { id: 72, weight: 15, levelRange: [81, 85] }, // 瑪瑙水母
                    { id: 83, weight: 7, levelRange: [81, 85] },  // 大蔥鴨（稀有）
                    { id: 143, weight: 3, levelRange: [85, 85] }, // 卡比獸（稀有）
                ]
            },
            {
                id: 'kanto_route13',
                name: '13號道路',
                description: '連線紫苑鎮和淺紅市的道路',
                levelRange: [86, 90],
                pokemon: [
                    { id: 43, weight: 20, levelRange: [86, 90] }, // 走路草
                    { id: 69, weight: 20, levelRange: [86, 90] }, // 喇叭芽
                    { id: 54, weight: 20, levelRange: [86, 90] }, // 可達鴨
                    { id: 17, weight: 20, levelRange: [86, 90] }, // 比比鳥
                    { id: 84, weight: 15, levelRange: [86, 90] }, // 嘟嘟
                    { id: 133, weight: 5, levelRange: [86, 90] },  // 伊布（稀有）
                ]
            },
            {
                id: 'kanto_safari_zone',
                name: '狩獵區',
                description: '淺紅市的大型自然保護區',
                levelRange: [91, 95],
                pokemon: [
                    { id: 114, weight: 13, levelRange: [91, 95] }, // 蔓藤怪
                    { id: 29, weight: 12, levelRange: [91, 95] },  // 尼多蘭
                    { id: 32, weight: 12, levelRange: [91, 95] },  // 尼多朗
                    { id: 102, weight: 12, levelRange: [91, 95] }, // 蛋蛋
                    { id: 111, weight: 10, levelRange: [91, 95] }, // 獨角犀牛
                    { id: 123, weight: 10, levelRange: [91, 95] }, // 飛天螳螂
                    { id: 127, weight: 10, levelRange: [91, 95] }, // 凱羅斯
                    { id: 115, weight: 8, levelRange: [91, 95] },  // 袋獸
                    { id: 128, weight: 8, levelRange: [91, 95] },  // 肯泰羅
                    { id: 113, weight: 5, levelRange: [91, 95] },  // 吉利蛋
                ]
            },
            {
                id: 'kanto_route17',
                name: '17號道路 (腳踏車道)',
                description: '從金黃市到淺紅市的下坡道路',
                levelRange: [96, 100],
                pokemon: [
                    { id: 84, weight: 20, levelRange: [96, 100] }, // 嘟嘟
                    { id: 50, weight: 20, levelRange: [96, 100] }, // 地鼠
                    { id: 20, weight: 20, levelRange: [96, 100] }, // 拉達
                    { id: 88, weight: 20, levelRange: [96, 100] }, // 臭泥
                    { id: 109, weight: 15, levelRange: [96, 100] }, // 瓦斯彈
                    { id: 140, weight: 5, levelRange: [96, 100] }, // 化石盔（稀有）
                ]
            },
            {
                id: 'kanto_route19',
                name: '19號水道',
                description: '淺紅市到雙子島的海上道路',
                levelRange: [101, 105],
                pokemon: [
                    { id: 72, weight: 30, levelRange: [101, 105] }, // 瑪瑙水母
                    { id: 116, weight: 20, levelRange: [101, 105] }, // 墨海馬
                    { id: 60, weight: 20, levelRange: [101, 105] }, // 蚊香蝌蚪
                    { id: 120, weight: 15, levelRange: [101, 105] }, // 海星星
                    { id: 86, weight: 15, levelRange: [101, 105] }, // 小海獅
                ]
            },
            {
                id: 'kanto_seafoam_islands',
                name: '雙子島',
                description: '傳說中急凍鳥棲息的冰冷洞窟',
                levelRange: [106, 110],
                pokemon: [
                    { id: 86, weight: 25, levelRange: [106, 110] }, // 小海獅
                    { id: 90, weight: 25, levelRange: [106, 110] }, // 大舌貝
                    { id: 98, weight: 20, levelRange: [106, 110] }, // 大鉗蟹
                    { id: 87, weight: 15, levelRange: [106, 110] }, // 白海獅
                    { id: 131, weight: 8, levelRange: [106, 110] }, // 拉普拉斯（稀有）
                    { id: 124, weight: 6, levelRange: [106, 110] }, // 迷唇姐（稀有）
                    { id: 144, weight: 3, levelRange: [110, 110] }, // 急凍鳥（傳說）
                ]
            },
            {
                id: 'kanto_pokemon_mansion',
                name: '寶可夢屋',
                description: '紅蓮島上的廢棄大宅，曾經的研究所',
                levelRange: [111, 115],
                pokemon: [
                    { id: 77, weight: 25, levelRange: [111, 115] }, // 小火馬
                    { id: 58, weight: 20, levelRange: [111, 115] }, // 卡蒂狗
                    { id: 109, weight: 20, levelRange: [111, 115] }, // 瓦斯彈
                    { id: 132, weight: 20, levelRange: [111, 115] }, // 百變怪
                    { id: 108, weight: 8, levelRange: [111, 115] }, // 大舌頭（稀有）
                    { id: 126, weight: 7, levelRange: [111, 115] }, // 鴨嘴火獸（稀有）
                ]
            },
            {
                id: 'kanto_route21',
                name: '21號水道',
                description: '紅蓮島到真新鎮之間的海上道路',
                levelRange: [116, 120],
                pokemon: [
                    { id: 72, weight: 25, levelRange: [116, 120] }, // 瑪瑙水母
                    { id: 129, weight: 20, levelRange: [116, 120] }, // 鯉魚王
                    { id: 116, weight: 15, levelRange: [116, 120] }, // 墨海馬
                    { id: 118, weight: 15, levelRange: [116, 120] }, // 角金魚
                    { id: 90, weight: 15, levelRange: [116, 120] }, // 大舌貝
                    { id: 73, weight: 10, levelRange: [116, 120] }, // 毒刺水母
                ]
            },
            {
                id: 'kanto_route22',
                name: '22號道路',
                description: '常磐市到冠軍之路入口',
                levelRange: [121, 125],
                pokemon: [
                    { id: 21, weight: 20, levelRange: [121, 125] }, // 烈雀
                    { id: 56, weight: 20, levelRange: [121, 125] }, // 猴怪
                    { id: 19, weight: 15, levelRange: [121, 125] }, // 小拉達
                    { id: 29, weight: 15, levelRange: [121, 125] }, // 尼多蘭
                    { id: 32, weight: 15, levelRange: [121, 125] }, // 尼多朗
                    { id: 50, weight: 15, levelRange: [121, 125] }, // 地鼠
                ]
            },
            {
                id: 'kanto_victory_road',
                name: '冠軍之路',
                description: '通往石英高原的最後試煉',
                levelRange: [126, 130],
                pokemon: [
                    { id: 67, weight: 27, levelRange: [126, 130] }, // 豪力
                    { id: 75, weight: 27, levelRange: [126, 130] }, // 隆隆石
                    { id: 95, weight: 23, levelRange: [126, 130] }, // 大巖蛇
                    { id: 106, weight: 8, levelRange: [126, 130] }, // 飛腿郎（稀有）
                    { id: 107, weight: 8, levelRange: [126, 130] }, // 快拳郎（稀有）
                    { id: 142, weight: 6, levelRange: [126, 130] }, // 化石翼龍（稀有）
                    { id: 146, weight: 3, levelRange: [130, 130] }, // 火焰鳥（傳說）
                ]
            },
            {
                id: 'kanto_cerulean_cave',
                name: '華藍洞窟',
                description: '傳說中最強寶可夢棲息的神秘洞窟',
                levelRange: [131, 135],
                pokemon: [
                    { id: 64, weight: 28, levelRange: [131, 135] },  // 勇基拉
                    { id: 147, weight: 25, levelRange: [131, 135] }, // 迷你龍
                    { id: 82, weight: 22, levelRange: [131, 135] },  // 三合一磁怪
                    { id: 137, weight: 14, levelRange: [131, 135] }, // 多邊獸（稀有）
                    { id: 149, weight: 8, levelRange: [131, 135] },  // 快龍（稀有）
                    { id: 150, weight: 2, levelRange: [135, 135] },  // 超夢（傳說）
                    { id: 151, weight: 1, levelRange: [135, 135] },  // 夢幻（幻之寶可夢）
                ]
            },
        ]
    },
    johto: {
        id: 'johto',
        name: '城都地區',
        nameEn: 'Johto',
        description: '第二世代寶可夢的家園，充滿了傳說與神秘。需要集齊關都地區所有寶可夢才能前往。完成城都圖鑑可獲得徽章，讓獲得的金幣變為 2 倍。',
        unlockCondition: { type: 'pokedex_complete', region: 'kanto', range: [1, 151] },
        routes: [
            {
                id: 'johto_route29',
                name: '29號道路',
                description: '若葉鎮到吉花市之間的道路',
                levelRange: [136, 140],
                pokemon: [
                    { id: 161, weight: 35, levelRange: [136, 140] },  // 尾立
                    { id: 163, weight: 30, levelRange: [136, 140] },  // 咕咕
                    { id: 187, weight: 20, levelRange: [136, 140] },  // 毽子草
                    { id: 172, weight: 15, levelRange: [136, 140] },  // 皮丘
                ]
            },
            {
                id: 'johto_route30',
                name: '30號道路',
                description: '吉花市到桔梗市之間的道路',
                levelRange: [141, 145],
                pokemon: [
                    { id: 165, weight: 25, levelRange: [141, 145] },  // 芭瓢蟲
                    { id: 167, weight: 25, levelRange: [141, 145] },  // 圓絲蛛
                    { id: 161, weight: 20, levelRange: [141, 145] },  // 尾立
                    { id: 175, weight: 10, levelRange: [141, 145] },  // 波克比
                    { id: 173, weight: 10, levelRange: [141, 145] },  // 皮寶寶
                    { id: 174, weight: 10, levelRange: [141, 145] },  // 寶寶丁
                ]
            },
            {
                id: 'johto_sprout_tower',
                name: '喇叭芽之塔',
                description: '桔梗市中供奉喇叭芽的古塔',
                levelRange: [146, 150],
                pokemon: [
                    { id: 92, weight: 25, levelRange: [146, 150] },   // 鬼斯
                    { id: 69, weight: 20, levelRange: [146, 150] },   // 喇叭芽
                    { id: 177, weight: 20, levelRange: [146, 150] },  // 天然雀
                    { id: 163, weight: 15, levelRange: [146, 150] },  // 咕咕
                    { id: 201, weight: 10, levelRange: [146, 150] },  // 未知圖騰
                    { id: 200, weight: 10, levelRange: [146, 150] },  // 夢妖
                ]
            },
            {
                id: 'johto_route32',
                name: '32號道路',
                description: '桔梗市到聯合洞穴的長道路',
                levelRange: [151, 155],
                pokemon: [
                    { id: 179, weight: 28, levelRange: [151, 155] },  // 咩利羊
                    { id: 194, weight: 22, levelRange: [151, 155] },  // 烏波
                    { id: 187, weight: 20, levelRange: [151, 155] },  // 毽子草
                    { id: 190, weight: 15, levelRange: [151, 155] },  // 長尾怪手
                    { id: 206, weight: 10, levelRange: [151, 155] },  // 土龍弟弟
                    { id: 152, weight: 5, levelRange: [151, 155] },   // 菊草葉（稀有）
                ]
            },
            {
                id: 'johto_union_cave',
                name: '聯合洞穴',
                description: '連線桔梗市和滿金市的自然洞穴',
                levelRange: [156, 160],
                pokemon: [
                    { id: 74, weight: 25, levelRange: [156, 160] },   // 小拳石
                    { id: 194, weight: 18, levelRange: [156, 160] },  // 烏波
                    { id: 204, weight: 18, levelRange: [156, 160] },  // 榛果球
                    { id: 231, weight: 15, levelRange: [156, 160] },  // 小小象
                    { id: 95, weight: 12, levelRange: [156, 160] },   // 大巖蛇
                    { id: 236, weight: 12, levelRange: [156, 160] },  // 無畏小子
                ]
            },
            {
                id: 'johto_route34',
                name: '34號道路',
                description: '滿金市南方的道路',
                levelRange: [161, 165],
                pokemon: [
                    { id: 183, weight: 22, levelRange: [161, 165] },  // 瑪力露
                    { id: 209, weight: 22, levelRange: [161, 165] },  // 布魯
                    { id: 191, weight: 18, levelRange: [161, 165] },  // 向日種子
                    { id: 203, weight: 18, levelRange: [161, 165] },  // 麒麟奇
                    { id: 185, weight: 15, levelRange: [161, 165] },  // 胡說樹
                    { id: 155, weight: 5, levelRange: [161, 165] },   // 火球鼠（稀有）
                ]
            },
            {
                id: 'johto_national_park',
                name: '自然公園',
                description: '滿金市北方的蟲系寶可夢樂園',
                levelRange: [166, 170],
                pokemon: [
                    { id: 165, weight: 25, levelRange: [166, 170] },  // 芭瓢蟲
                    { id: 193, weight: 20, levelRange: [166, 170] },  // 蜻蜻蜓
                    { id: 123, weight: 15, levelRange: [166, 170] },  // 飛天螳螂
                    { id: 127, weight: 15, levelRange: [166, 170] },  // 凱羅斯
                    { id: 214, weight: 15, levelRange: [166, 170] },  // 赫拉克羅斯
                    { id: 213, weight: 10, levelRange: [166, 170] },  // 壺壺（稀有）
                ]
            },
            {
                id: 'johto_route35',
                name: '35號道路',
                description: '滿金市到圓朱市的道路',
                levelRange: [171, 175],
                pokemon: [
                    { id: 190, weight: 20, levelRange: [171, 175] },  // 長尾怪手
                    { id: 216, weight: 20, levelRange: [171, 175] },  // 熊寶寶
                    { id: 198, weight: 20, levelRange: [171, 175] },  // 黑暗鴉
                    { id: 234, weight: 15, levelRange: [171, 175] },  // 驚角鹿
                    { id: 202, weight: 15, levelRange: [171, 175] },  // 果然翁
                    { id: 235, weight: 10, levelRange: [171, 175] },  // 圖圖犬（稀有）
                ]
            },
            {
                id: 'johto_burned_tower',
                name: '焚燒塔',
                description: '圓朱市中被燒燬的古塔，傳說中三聖獸在此誕生',
                levelRange: [176, 180],
                pokemon: [
                    { id: 92, weight: 25, levelRange: [176, 180] },   // 鬼斯
                    { id: 200, weight: 20, levelRange: [176, 180] },  // 夢妖
                    { id: 93, weight: 18, levelRange: [176, 180] },   // 鬼斯通
                    { id: 228, weight: 17, levelRange: [176, 180] },  // 戴魯比
                    { id: 218, weight: 15, levelRange: [176, 180] },  // 熔岩蟲
                    { id: 158, weight: 5, levelRange: [176, 180] },   // 小鋸鱷（稀有）
                ]
            },
            {
                id: 'johto_route38',
                name: '38號道路',
                description: '圓朱市到淺黃市的道路',
                levelRange: [181, 185],
                pokemon: [
                    { id: 58, weight: 20, levelRange: [181, 185] },   // 卡蒂狗
                    { id: 52, weight: 20, levelRange: [181, 185] },   // 喵喵
                    { id: 128, weight: 15, levelRange: [181, 185] },  // 肯泰羅
                    { id: 241, weight: 15, levelRange: [181, 185] },  // 大奶罐
                    { id: 164, weight: 15, levelRange: [181, 185] },  // 貓頭夜鷹
                    { id: 162, weight: 15, levelRange: [181, 185] },  // 大尾立
                ]
            },
            {
                id: 'johto_route40',
                name: '40號水道',
                description: '淺黃市到漩渦列島的海上道路',
                levelRange: [186, 190],
                pokemon: [
                    { id: 72, weight: 25, levelRange: [186, 190] },   // 瑪瑙水母
                    { id: 222, weight: 20, levelRange: [186, 190] },  // 太陽珊瑚
                    { id: 223, weight: 20, levelRange: [186, 190] },  // 鐵炮魚
                    { id: 170, weight: 20, levelRange: [186, 190] },  // 燈籠魚
                    { id: 211, weight: 10, levelRange: [186, 190] },  // 千針魚
                    { id: 226, weight: 5, levelRange: [186, 190] },   // 巨翅飛魚（稀有）
                ]
            },
            {
                id: 'johto_route42',
                name: '42號道路',
                description: '滿金市到阿馹山區的道路',
                levelRange: [191, 195],
                pokemon: [
                    { id: 207, weight: 22, levelRange: [191, 195] },  // 天蠍
                    { id: 215, weight: 20, levelRange: [191, 195] },  // 狃拉
                    { id: 227, weight: 15, levelRange: [191, 195] },  // 盔甲鳥
                    { id: 238, weight: 15, levelRange: [191, 195] },  // 迷唇娃
                    { id: 240, weight: 15, levelRange: [191, 195] },  // 小鴨嘴龍
                    { id: 239, weight: 13, levelRange: [191, 195] },  // 電擊怪
                ]
            },
            {
                id: 'johto_route43',
                name: '43號道路',
                description: '通往憤怒之湖的道路',
                levelRange: [196, 200],
                pokemon: [
                    { id: 23, weight: 18, levelRange: [196, 200] },   // 阿柏蛇
                    { id: 96, weight: 18, levelRange: [196, 200] },   // 催眠貘
                    { id: 129, weight: 18, levelRange: [196, 200] },  // 鯉魚王
                    { id: 234, weight: 16, levelRange: [196, 200] },  // 驚角鹿
                    { id: 164, weight: 15, levelRange: [196, 200] },  // 貓頭夜鷹
                    { id: 198, weight: 15, levelRange: [196, 200] },  // 黑暗鴉
                ]
            },
            {
                id: 'johto_lake_of_rage',
                name: '憤怒之湖',
                description: '傳說中紅色暴鯉龍出沒的湖泊',
                levelRange: [201, 210],
                pokemon: [
                    { id: 129, weight: 28, levelRange: [201, 210] },  // 鯉魚王
                    { id: 118, weight: 18, levelRange: [201, 210] },  // 角金魚
                    { id: 183, weight: 15, levelRange: [201, 210] },  // 瑪力露
                    { id: 195, weight: 15, levelRange: [201, 210] },  // 沼王
                    { id: 130, weight: 12, levelRange: [201, 210] },  // 暴鯉龍
                    { id: 119, weight: 12, levelRange: [201, 210] },  // 金魚王
                ]
            },
            {
                id: 'johto_route44',
                name: '44號道路',
                description: '通往冰之通道的寒冷道路',
                levelRange: [211, 220],
                pokemon: [
                    { id: 220, weight: 25, levelRange: [211, 220] },  // 小山豬
                    { id: 216, weight: 20, levelRange: [211, 220] },  // 熊寶寶
                    { id: 215, weight: 18, levelRange: [211, 220] },  // 狃拉
                    { id: 207, weight: 17, levelRange: [211, 220] },  // 天蠍
                    { id: 178, weight: 12, levelRange: [211, 220] },  // 天然鳥
                    { id: 176, weight: 8, levelRange: [211, 220] },   // 波克基古（稀有）
                ]
            },
            {
                id: 'johto_ice_path',
                name: '冰之通道',
                description: '連線滿金和淺黃的冰冷洞穴',
                levelRange: [221, 230],
                pokemon: [
                    { id: 220, weight: 25, levelRange: [221, 230] },  // 小山豬
                    { id: 86, weight: 20, levelRange: [221, 230] },   // 小海獅
                    { id: 221, weight: 15, levelRange: [221, 230] },  // 長毛豬
                    { id: 225, weight: 15, levelRange: [221, 230] },  // 信使鳥
                    { id: 124, weight: 13, levelRange: [221, 230] },  // 迷唇姐
                    { id: 87, weight: 12, levelRange: [221, 230] },   // 白海獅
                ]
            },
            {
                id: 'johto_route45',
                name: '45號道路',
                description: '黑暗市南方的陡峭山路',
                levelRange: [231, 240],
                pokemon: [
                    { id: 74, weight: 22, levelRange: [231, 240] },   // 小拳石
                    { id: 207, weight: 22, levelRange: [231, 240] },  // 天蠍
                    { id: 111, weight: 22, levelRange: [231, 240] },  // 獨角犀牛
                    { id: 231, weight: 17, levelRange: [231, 240] },  // 小小象
                    { id: 246, weight: 10, levelRange: [231, 240] },  // 幼基拉斯
                    { id: 227, weight: 7, levelRange: [231, 240] },   // 盔甲鳥（稀有）
                ]
            },
            {
                id: 'johto_dark_cave',
                name: '漆黑洞穴',
                description: '城都地區的幽暗洞窟',
                levelRange: [241, 250],
                pokemon: [
                    { id: 74, weight: 20, levelRange: [241, 250] },   // 小拳石
                    { id: 200, weight: 20, levelRange: [241, 250] },  // 夢妖
                    { id: 228, weight: 20, levelRange: [241, 250] },  // 戴魯比
                    { id: 204, weight: 15, levelRange: [241, 250] },  // 榛果球
                    { id: 206, weight: 15, levelRange: [241, 250] },  // 土龍弟弟
                    { id: 202, weight: 10, levelRange: [241, 250] },  // 果然翁
                ]
            },
            {
                id: 'johto_route27',
                name: '27號道路',
                description: '通往關都地區的長道路',
                levelRange: [251, 260],
                pokemon: [
                    { id: 189, weight: 18, levelRange: [251, 260] },  // 毽子棉
                    { id: 229, weight: 18, levelRange: [251, 260] },  // 黑魯加
                    { id: 217, weight: 18, levelRange: [251, 260] },  // 圈圈熊
                    { id: 232, weight: 18, levelRange: [251, 260] },  // 頓甲
                    { id: 205, weight: 18, levelRange: [251, 260] },  // 佛烈託斯
                    { id: 224, weight: 10, levelRange: [251, 260] },  // 章魚桶
                ]
            },
            {
                id: 'johto_victory_road',
                name: '城都冠軍之路',
                description: '通往石英聯盟的最終試煉',
                levelRange: [261, 270],
                pokemon: [
                    { id: 221, weight: 25, levelRange: [261, 270] },  // 長毛豬
                    { id: 67, weight: 18, levelRange: [261, 270] },   // 豪力
                    { id: 75, weight: 18, levelRange: [261, 270] },   // 隆隆石
                    { id: 219, weight: 15, levelRange: [261, 270] },  // 熔岩蝸牛
                    { id: 246, weight: 12, levelRange: [261, 270] },  // 幼基拉斯
                    { id: 247, weight: 12, levelRange: [261, 270] },  // 沙基拉斯
                ]
            },
            {
                id: 'johto_whirl_islands',
                name: '漩渦列島',
                description: '傳說中洛奇亞棲息的海底洞窟',
                levelRange: [271, 280],
                pokemon: [
                    { id: 116, weight: 25, levelRange: [271, 280] },  // 墨海馬
                    { id: 171, weight: 22, levelRange: [271, 280] },  // 電燈怪
                    { id: 117, weight: 20, levelRange: [271, 280] },  // 海刺龍
                    { id: 226, weight: 18, levelRange: [271, 280] },  // 巨翅飛魚
                    { id: 131, weight: 12, levelRange: [271, 280] },  // 拉普拉斯
                    { id: 245, weight: 3, levelRange: [280, 280] },   // 水君（傳說）
                    { id: 249, weight: 2, levelRange: [280, 280] },   // 洛奇亞（傳說）
                ]
            },
            {
                id: 'johto_tin_tower',
                name: '鐘塔',
                description: '圓朱市中供奉鳳王的神聖塔樓',
                levelRange: [281, 290],
                pokemon: [
                    { id: 92, weight: 20, levelRange: [281, 290] },   // 鬼斯
                    { id: 177, weight: 20, levelRange: [281, 290] },  // 天然雀
                    { id: 178, weight: 19, levelRange: [281, 290] },  // 天然鳥
                    { id: 93, weight: 18, levelRange: [281, 290] },   // 鬼斯通
                    { id: 200, weight: 18, levelRange: [281, 290] },  // 夢妖
                    { id: 243, weight: 4, levelRange: [290, 290] },   // 雷公（傳說）
                    { id: 244, weight: 4, levelRange: [290, 290] },   // 炎帝（傳說）
                    { id: 250, weight: 2, levelRange: [290, 290] },   // 鳳王（傳說）
                ]
            },
            {
                id: 'johto_mt_silver',
                name: '白銀山',
                description: '城都地區最高峰，最強訓練師的修煉聖地',
                levelRange: [291, 300],
                pokemon: [
                    { id: 221, weight: 18, levelRange: [291, 300] },   // 長毛豬
                    { id: 217, weight: 18, levelRange: [291, 300] },   // 圈圈熊
                    { id: 215, weight: 18, levelRange: [291, 300] },   // 狃拉
                    { id: 42, weight: 15, levelRange: [291, 300] },    // 大嘴蝠
                    { id: 246, weight: 15, levelRange: [291, 300] },   // 幼基拉斯
                    { id: 247, weight: 15, levelRange: [291, 300] },   // 沙基拉斯
                    { id: 251, weight: 1, levelRange: [300, 300] },    // 時拉比（幻之寶可夢）
                ]
            },
        ]
    },
    hoenn: {
        id: 'hoenn',
        name: '豐緣地區',
        nameEn: 'Hoenn',
        description: '第三世代寶可夢的故鄉，擁有廣闊的海洋和豐富的自然環境。需要集齊城都地區所有寶可夢才能前往。完成豐緣圖鑑可獲得徽章，讓獲得的經驗值提高 50%。',
        unlockCondition: { type: 'pokedex_complete', region: 'johto', range: [152, 251] },
        routes: [
            {
                id: 'hoenn_route101',
                name: '101號道路',
                description: '未白鎮到古辰鎮之間的道路',
                levelRange: [301, 315],
                pokemon: [
                    { id: 263, weight: 35, levelRange: [301, 315] },  // 蛇紋熊
                    { id: 261, weight: 30, levelRange: [301, 315] },  // 土狼犬
                    { id: 265, weight: 20, levelRange: [301, 315] },  // 刺尾蟲
                    { id: 276, weight: 15, levelRange: [301, 315] },  // 傲骨燕
                ]
            },
            {
                id: 'hoenn_route102',
                name: '102號道路',
                description: '古辰鎮到橙華市之間的道路',
                levelRange: [316, 330],
                pokemon: [
                    { id: 270, weight: 25, levelRange: [316, 330] },  // 蓮葉童子
                    { id: 273, weight: 25, levelRange: [316, 330] },  // 橡實果
                    { id: 280, weight: 20, levelRange: [316, 330] },  // 拉魯拉絲
                    { id: 283, weight: 15, levelRange: [316, 330] },  // 溜溜糖球
                    { id: 298, weight: 15, levelRange: [316, 330] },  // 露力麗
                ]
            },
            {
                id: 'hoenn_petalburg_woods',
                name: '橙華森林',
                description: '橙華市附近的茂密森林',
                levelRange: [331, 345],
                pokemon: [
                    { id: 265, weight: 25, levelRange: [331, 345] },  // 刺尾蟲
                    { id: 285, weight: 20, levelRange: [331, 345] },  // 蘑蘑菇
                    { id: 287, weight: 15, levelRange: [331, 345] },  // 懶人獺
                    { id: 266, weight: 15, levelRange: [331, 345] },  // 甲殼繭
                    { id: 268, weight: 15, levelRange: [331, 345] },  // 盾甲繭
                    { id: 252, weight: 10, levelRange: [331, 345] },  // 木守宮（稀有）
                ]
            },
            {
                id: 'hoenn_route104',
                name: '104號道路',
                description: '橙華市到卡那茲市之間的海岸道路',
                levelRange: [346, 360],
                pokemon: [
                    { id: 278, weight: 25, levelRange: [346, 360] },  // 長翅鷗
                    { id: 276, weight: 20, levelRange: [346, 360] },  // 傲骨燕
                    { id: 263, weight: 20, levelRange: [346, 360] },  // 蛇紋熊
                    { id: 300, weight: 15, levelRange: [346, 360] },  // 向尾喵
                    { id: 183, weight: 10, levelRange: [346, 360] },  // 瑪力露
                    { id: 255, weight: 10, levelRange: [346, 360] },  // 火稚雞（稀有）
                ]
            },
            {
                id: 'hoenn_rustboro_tunnel',
                name: '石之洞窟',
                description: '卡那茲市附近的岩石洞窟',
                levelRange: [361, 375],
                pokemon: [
                    { id: 304, weight: 25, levelRange: [361, 375] },  // 可可多拉
                    { id: 296, weight: 20, levelRange: [361, 375] },  // 幕下力士
                    { id: 74, weight: 20, levelRange: [361, 375] },   // 小拳石
                    { id: 299, weight: 15, levelRange: [361, 375] },  // 朝北鼻
                    { id: 290, weight: 10, levelRange: [361, 375] },  // 土居忍士
                    { id: 303, weight: 10, levelRange: [361, 375] },  // 大嘴娃（稀有）
                ]
            },
            {
                id: 'hoenn_route110',
                name: '110號道路',
                description: '紫堇市到凱那市之間的長道路',
                levelRange: [376, 390],
                pokemon: [
                    { id: 309, weight: 25, levelRange: [376, 390] },  // 落雷獸
                    { id: 311, weight: 15, levelRange: [376, 390] },  // 正電拍拍
                    { id: 312, weight: 15, levelRange: [376, 390] },  // 負電拍拍
                    { id: 293, weight: 15, levelRange: [376, 390] },  // 咕妞妞
                    { id: 316, weight: 15, levelRange: [376, 390] },  // 溶食獸
                    { id: 258, weight: 15, levelRange: [376, 390] },  // 水躍魚（稀有）
                ]
            },
            {
                id: 'hoenn_route111',
                name: '111號道路 (沙漠地帶)',
                description: '紫堇市北方的炎熱沙漠',
                levelRange: [391, 405],
                pokemon: [
                    { id: 328, weight: 25, levelRange: [391, 405] },  // 大顎蟻
                    { id: 322, weight: 20, levelRange: [391, 405] },  // 呆火駝
                    { id: 331, weight: 20, levelRange: [391, 405] },  // 刺球仙人掌
                    { id: 343, weight: 15, levelRange: [391, 405] },  // 天秤偶
                    { id: 327, weight: 10, levelRange: [391, 405] },  // 晃晃斑
                    { id: 345, weight: 10, levelRange: [391, 405] },  // 觸手百合（稀有）
                ]
            },
            {
                id: 'hoenn_route112',
                name: '112號道路 (煙突山)',
                description: '通往釜炎鎮的火山道路',
                levelRange: [406, 420],
                pokemon: [
                    { id: 322, weight: 25, levelRange: [406, 420] },  // 呆火駝
                    { id: 324, weight: 15, levelRange: [406, 420] },  // 煤炭龜
                    { id: 307, weight: 15, levelRange: [406, 420] },  // 瑪沙那
                    { id: 325, weight: 15, levelRange: [406, 420] },  // 跳跳豬
                    { id: 261, weight: 15, levelRange: [406, 420] },  // 土狼犬
                    { id: 347, weight: 15, levelRange: [406, 420] },  // 太古羽蟲（稀有）
                ]
            },
            {
                id: 'hoenn_route113',
                name: '113號道路',
                description: '釜炎鎮到飛翠市之間被火山灰覆蓋的道路',
                levelRange: [421, 435],
                pokemon: [
                    { id: 327, weight: 20, levelRange: [421, 435] },  // 晃晃斑
                    { id: 315, weight: 20, levelRange: [421, 435] },  // 毒薔薇
                    { id: 313, weight: 15, levelRange: [421, 435] },  // 電螢蟲
                    { id: 314, weight: 15, levelRange: [421, 435] },  // 甜甜螢
                    { id: 336, weight: 15, levelRange: [421, 435] },  // 飯匙蛇
                    { id: 335, weight: 15, levelRange: [421, 435] },  // 貓鼬斬
                ]
            },
            {
                id: 'hoenn_route114',
                name: '114號道路',
                description: '流星瀑布附近的道路',
                levelRange: [436, 450],
                pokemon: [
                    { id: 333, weight: 25, levelRange: [436, 450] },  // 青綿鳥
                    { id: 339, weight: 20, levelRange: [436, 450] },  // 泥泥鰍
                    { id: 337, weight: 15, levelRange: [436, 450] },  // 月石
                    { id: 338, weight: 15, levelRange: [436, 450] },  // 太陽巖
                    { id: 302, weight: 15, levelRange: [436, 450] },  // 勾魂眼
                    { id: 351, weight: 10, levelRange: [436, 450] },  // 飄浮泡泡（稀有）
                ]
            },
            {
                id: 'hoenn_meteor_falls',
                name: '流星瀑布',
                description: '傳說中龍系寶可夢棲息的神秘洞窟',
                levelRange: [451, 465],
                pokemon: [
                    { id: 371, weight: 25, levelRange: [451, 465] },  // 寶貝龍
                    { id: 304, weight: 20, levelRange: [451, 465] },  // 可可多拉
                    { id: 41, weight: 15, levelRange: [451, 465] },   // 超音蝠
                    { id: 337, weight: 15, levelRange: [451, 465] },  // 月石
                    { id: 338, weight: 15, levelRange: [451, 465] },  // 太陽巖
                    { id: 374, weight: 10, levelRange: [451, 465] },  // 鐵啞鈴（稀有）
                ]
            },
            {
                id: 'hoenn_route118',
                name: '118號道路',
                description: '凱那市東方的海岸道路',
                levelRange: [466, 480],
                pokemon: [
                    { id: 309, weight: 20, levelRange: [466, 480] },  // 落雷獸
                    { id: 278, weight: 20, levelRange: [466, 480] },  // 長翅鷗
                    { id: 341, weight: 20, levelRange: [466, 480] },  // 龍蝦小兵
                    { id: 318, weight: 15, levelRange: [466, 480] },  // 利牙魚
                    { id: 352, weight: 15, levelRange: [466, 480] },  // 變隱龍
                    { id: 359, weight: 10, levelRange: [466, 480] },  // 阿勃梭魯（稀有）
                ]
            },
            {
                id: 'hoenn_route119',
                name: '119號道路',
                description: '天氣研究所附近的熱帶雨林',
                levelRange: [481, 495],
                pokemon: [
                    { id: 357, weight: 20, levelRange: [481, 495] },  // 熱帶龍
                    { id: 352, weight: 20, levelRange: [481, 495] },  // 變隱龍
                    { id: 283, weight: 15, levelRange: [481, 495] },  // 溜溜糖球
                    { id: 261, weight: 15, levelRange: [481, 495] },  // 土狼犬
                    { id: 315, weight: 15, levelRange: [481, 495] },  // 毒薔薇
                    { id: 349, weight: 15, levelRange: [481, 495] },  // 醜醜魚（稀有）
                ]
            },
            {
                id: 'hoenn_route120',
                name: '120號道路',
                description: '茵鬱市附近的神秘道路',
                levelRange: [496, 510],
                pokemon: [
                    { id: 359, weight: 18, levelRange: [496, 510] },  // 阿勃梭魯
                    { id: 353, weight: 18, levelRange: [496, 510] },  // 怨影娃娃
                    { id: 355, weight: 18, levelRange: [496, 510] },  // 夜巡靈
                    { id: 302, weight: 16, levelRange: [496, 510] },  // 勾魂眼
                    { id: 358, weight: 15, levelRange: [496, 510] },  // 風鈴鈴
                    { id: 327, weight: 15, levelRange: [496, 510] },  // 晃晃斑
                ]
            },
            {
                id: 'hoenn_route121',
                name: '121號道路',
                description: '綠嶺市到凱那市的道路',
                levelRange: [511, 525],
                pokemon: [
                    { id: 353, weight: 18, levelRange: [511, 525] },  // 怨影娃娃
                    { id: 355, weight: 18, levelRange: [511, 525] },  // 夜巡靈
                    { id: 320, weight: 17, levelRange: [511, 525] },  // 吼吼鯨
                    { id: 370, weight: 17, levelRange: [511, 525] },  // 愛心魚
                    { id: 261, weight: 15, levelRange: [511, 525] },  // 土狼犬
                    { id: 278, weight: 15, levelRange: [511, 525] },  // 長翅鷗
                ]
            },
            {
                id: 'hoenn_mt_pyre',
                name: '送火山',
                description: '寶可夢靈魂安息的聖山',
                levelRange: [526, 540],
                pokemon: [
                    { id: 353, weight: 20, levelRange: [526, 540] },  // 怨影娃娃
                    { id: 355, weight: 20, levelRange: [526, 540] },  // 夜巡靈
                    { id: 92, weight: 17, levelRange: [526, 540] },   // 鬼斯
                    { id: 93, weight: 14, levelRange: [526, 540] },   // 鬼斯通
                    { id: 307, weight: 12, levelRange: [526, 540] },  // 瑪沙那
                    { id: 358, weight: 10, levelRange: [526, 540] },  // 風鈴鈴
                    { id: 383, weight: 4, levelRange: [539, 540] },   // 固拉多（傳說）
                ]
            },
            {
                id: 'hoenn_route124',
                name: '124號水道',
                description: '通往潛水區域的深海水道',
                levelRange: [541, 555],
                pokemon: [
                    { id: 320, weight: 22, levelRange: [541, 555] },  // 吼吼鯨
                    { id: 318, weight: 18, levelRange: [541, 555] },  // 利牙魚
                    { id: 366, weight: 18, levelRange: [541, 555] },  // 珍珠貝
                    { id: 370, weight: 15, levelRange: [541, 555] },  // 愛心魚
                    { id: 363, weight: 15, levelRange: [541, 555] },  // 海豹球
                    { id: 369, weight: 12, levelRange: [541, 555] },  // 古空棘魚
                ]
            },
            {
                id: 'hoenn_shoal_cave',
                name: '淺灘洞穴',
                description: '琉璃市附近受潮汐影響的洞穴',
                levelRange: [556, 570],
                pokemon: [
                    { id: 363, weight: 25, levelRange: [556, 570] },  // 海豹球
                    { id: 361, weight: 22, levelRange: [556, 570] },  // 雪童子
                    { id: 41, weight: 15, levelRange: [556, 570] },   // 超音蝠
                    { id: 339, weight: 15, levelRange: [556, 570] },  // 泥泥鰍
                    { id: 360, weight: 13, levelRange: [556, 570] },  // 小果然
                    { id: 362, weight: 10, levelRange: [556, 570] },  // 冰鬼護（稀有）
                ]
            },
            {
                id: 'hoenn_route126',
                name: '126號水道',
                description: '通往海底洞窟的深海區域',
                levelRange: [571, 585],
                pokemon: [
                    { id: 341, weight: 20, levelRange: [571, 585] },  // 龍蝦小兵
                    { id: 318, weight: 17, levelRange: [571, 585] },  // 利牙魚
                    { id: 320, weight: 17, levelRange: [571, 585] },  // 吼吼鯨
                    { id: 72, weight: 15, levelRange: [571, 585] },   // 瑪瑙水母
                    { id: 170, weight: 14, levelRange: [571, 585] },  // 燈籠魚
                    { id: 369, weight: 10, levelRange: [571, 585] },  // 古空棘魚
                    { id: 382, weight: 4, levelRange: [584, 585] },   // 蓋歐卡（傳說）
                ]
            },
            {
                id: 'hoenn_route128',
                name: '128號水道',
                description: '通往彩幽市的危險海域',
                levelRange: [586, 600],
                pokemon: [
                    { id: 319, weight: 20, levelRange: [586, 600] },  // 巨牙鯊
                    { id: 321, weight: 20, levelRange: [586, 600] },  // 吼鯨王
                    { id: 342, weight: 16, levelRange: [586, 600] },  // 鐵螯龍蝦
                    { id: 340, weight: 14, levelRange: [586, 600] },  // 鯰魚王
                    { id: 226, weight: 12, levelRange: [586, 600] },  // 巨翅飛魚
                    { id: 350, weight: 12, levelRange: [586, 600] },  // 美納斯（稀有）
                    { id: 380, weight: 3, levelRange: [599, 600] },   // 拉帝亞斯（傳說）
                ]
            },
            {
                id: 'hoenn_victory_road',
                name: '豐緣冠軍之路',
                description: '通往聯盟的最終試煉',
                levelRange: [601, 615],
                pokemon: [
                    { id: 305, weight: 17, levelRange: [601, 615] },  // 可多拉
                    { id: 329, weight: 16, levelRange: [601, 615] },  // 超音波幼蟲
                    { id: 308, weight: 16, levelRange: [601, 615] },  // 恰雷姆
                    { id: 344, weight: 14, levelRange: [601, 615] },  // 念力土偶
                    { id: 356, weight: 12, levelRange: [601, 615] },  // 彷徨夜靈
                    { id: 372, weight: 12, levelRange: [601, 615] },  // 甲殼龍
                    { id: 375, weight: 11, levelRange: [601, 615] },  // 金屬怪（稀有）
                    { id: 381, weight: 3, levelRange: [613, 615] },   // 拉帝歐斯（傳說）
                ]
            },
            {
                id: 'hoenn_sealed_chamber',
                name: '封印遺蹟',
                description: '隱藏在豐緣各處的古代遺蹟',
                levelRange: [616, 630],
                pokemon: [
                    { id: 344, weight: 24, levelRange: [616, 630] },  // 念力土偶
                    { id: 346, weight: 20, levelRange: [616, 630] },  // 搖籃百合
                    { id: 348, weight: 19, levelRange: [616, 630] },  // 太古盔甲
                    { id: 330, weight: 12, levelRange: [616, 630] },  // 沙漠蜻蜓
                    { id: 334, weight: 12, levelRange: [616, 630] },  // 七夕青鳥
                    { id: 377, weight: 6, levelRange: [625, 630] },  // 雷吉洛克（傳說）
                    { id: 378, weight: 6, levelRange: [625, 630] },  // 雷吉艾斯（傳說）
                    { id: 379, weight: 3, levelRange: [630, 630] },   // 雷吉斯奇魯（傳說）
                ]
            },
            {
                id: 'hoenn_sky_pillar',
                name: '天空之柱',
                description: '傳說中烈空坐棲息的高塔',
                levelRange: [631, 645],
                pokemon: [
                    { id: 373, weight: 20, levelRange: [631, 645] },  // 暴飛龍
                    { id: 376, weight: 18, levelRange: [631, 645] },  // 巨金怪
                    { id: 354, weight: 16, levelRange: [631, 645] },  // 詛咒娃娃
                    { id: 356, weight: 15, levelRange: [631, 645] },  // 彷徨夜靈
                    { id: 332, weight: 14, levelRange: [631, 645] },  // 夢歌仙人掌
                    { id: 334, weight: 12, levelRange: [631, 645] },  // 七夕青鳥
                    { id: 384, weight: 4, levelRange: [645, 645] },   // 烈空坐（傳說）
                ]
            },
            {
                id: 'hoenn_birth_island',
                name: '誕生之島',
                description: '傳說中代歐奇希斯降臨的神秘小島',
                levelRange: [646, 660],
                pokemon: [
                    { id: 373, weight: 20, levelRange: [646, 660] },  // 暴飛龍
                    { id: 376, weight: 20, levelRange: [646, 660] },  // 巨金怪
                    { id: 289, weight: 15, levelRange: [646, 660] },  // 請假王
                    { id: 297, weight: 15, levelRange: [646, 660] },  // 鐵掌力士
                    { id: 330, weight: 14, levelRange: [646, 660] },  // 沙漠蜻蜓
                    { id: 365, weight: 10, levelRange: [646, 660] },  // 帝牙海獅
                    { id: 350, weight: 4, levelRange: [646, 660] },   // 美納斯
                    { id: 385, weight: 2, levelRange: [659, 660] },   // 基拉祈（幻之寶可夢）
                    { id: 386, weight: 1, levelRange: [660, 660] },   // 代歐奇希斯（幻之寶可夢）
                ]
            },
        ]
    },
    sinnoh: {
        id: 'sinnoh',
        name: '神奧地區',
        nameEn: 'Sinnoh',
        description: '第四世代寶可夢的家園，擁有雄偉的天冠山和神秘的時空傳說。需要集齊豐緣地區所有寶可夢才能前往。完成神奧圖鑑可獲得徽章，讓閃光出現機率變為 2 倍。',
        unlockCondition: { type: 'pokedex_complete', region: 'hoenn', range: [252, 386] },
        routes: [
            {
                id: 'sinnoh_route201',
                name: '201號道路',
                description: '雙葉鎮到真砂鎮之間的道路',
                levelRange: [661, 680],
                pokemon: [
                    { id: 396, weight: 35, levelRange: [661, 680] },  // 姆克兒
                    { id: 399, weight: 30, levelRange: [661, 680] },  // 大牙狸
                    { id: 401, weight: 20, levelRange: [661, 680] },  // 圓法師
                    { id: 403, weight: 15, levelRange: [661, 680] },  // 小貓怪
                ]
            },
            {
                id: 'sinnoh_route202',
                name: '202號道路',
                description: '真砂鎮到祝慶市之間的道路',
                levelRange: [681, 700],
                pokemon: [
                    { id: 396, weight: 25, levelRange: [681, 700] },  // 姆克兒
                    { id: 403, weight: 20, levelRange: [681, 700] },  // 小貓怪
                    { id: 406, weight: 20, levelRange: [681, 700] },  // 含羞苞
                    { id: 399, weight: 20, levelRange: [681, 700] },  // 大牙狸
                    { id: 387, weight: 15, levelRange: [681, 700] },  // 草苗龜（稀有）
                ]
            },
            {
                id: 'sinnoh_route204',
                name: '204號道路',
                description: '祝慶市到苑之鎮之間的道路',
                levelRange: [701, 720],
                pokemon: [
                    { id: 406, weight: 22, levelRange: [701, 720] },  // 含羞苞
                    { id: 401, weight: 20, levelRange: [701, 720] },  // 圓法師
                    { id: 418, weight: 20, levelRange: [701, 720] },  // 泳圈鼬
                    { id: 396, weight: 18, levelRange: [701, 720] },  // 姆克兒
                    { id: 412, weight: 10, levelRange: [701, 720] },  // 結草兒
                    { id: 390, weight: 10, levelRange: [701, 720] },  // 小火焰猴（稀有）
                ]
            },
            {
                id: 'sinnoh_ravaged_path',
                name: '荒蕪小道',
                description: '連線204號道路兩段的洞穴',
                levelRange: [721, 740],
                pokemon: [
                    { id: 41, weight: 25, levelRange: [721, 740] },   // 超音蝠
                    { id: 74, weight: 20, levelRange: [721, 740] },   // 小拳石
                    { id: 408, weight: 20, levelRange: [721, 740] },  // 頭蓋龍
                    { id: 410, weight: 15, levelRange: [721, 740] },  // 盾甲龍
                    { id: 393, weight: 10, levelRange: [721, 740] },  // 波加曼（稀有）
                    { id: 436, weight: 10, levelRange: [721, 740] },  // 銅鏡怪
                ]
            },
            {
                id: 'sinnoh_route205',
                name: '205號道路',
                description: '苑之鎮到百代森林之間的道路',
                levelRange: [741, 760],
                pokemon: [
                    { id: 418, weight: 22, levelRange: [741, 760] },  // 泳圈鼬
                    { id: 422, weight: 22, levelRange: [741, 760] },  // 無殼海兔
                    { id: 420, weight: 18, levelRange: [741, 760] },  // 櫻花寶
                    { id: 397, weight: 18, levelRange: [741, 760] },  // 姆克鳥
                    { id: 415, weight: 10, levelRange: [741, 760] },  // 三蜜蜂
                    { id: 414, weight: 10, levelRange: [741, 760] },  // 紳士蛾
                    { id: 458, weight: 8, levelRange: [741, 760] },   // 小球飛魚
                ]
            },
            {
                id: 'sinnoh_eterna_forest',
                name: '百代森林',
                description: '百代市附近的古老森林',
                levelRange: [761, 780],
                pokemon: [
                    { id: 406, weight: 20, levelRange: [761, 780] },  // 含羞苞
                    { id: 412, weight: 15, levelRange: [761, 780] },  // 結草兒
                    { id: 414, weight: 15, levelRange: [761, 780] },  // 紳士蛾
                    { id: 415, weight: 15, levelRange: [761, 780] },  // 三蜜蜂
                    { id: 425, weight: 15, levelRange: [761, 780] },  // 飄飄球
                    { id: 442, weight: 10, levelRange: [761, 780] },  // 花巖怪（稀有）
                    { id: 440, weight: 10, levelRange: [761, 780] },  // 小福蛋
                    { id: 417, weight: 8, levelRange: [761, 780] },  // 帕奇利茲
                ]
            },
            {
                id: 'sinnoh_route206',
                name: '206號道路（腳踏車道）',
                description: '百代市到隨意遺蹟之間的下坡道路',
                levelRange: [781, 800],
                pokemon: [
                    { id: 434, weight: 22, levelRange: [781, 800] },  // 臭鼬噗
                    { id: 403, weight: 20, levelRange: [781, 800] },  // 小貓怪
                    { id: 397, weight: 18, levelRange: [781, 800] },  // 姆克鳥
                    { id: 432, weight: 15, levelRange: [781, 800] },  // 東施喵
                    { id: 431, weight: 15, levelRange: [781, 800] },  // 魅力喵
                    { id: 433, weight: 10, levelRange: [781, 800] },  // 鈴鐺響
                ]
            },
            {
                id: 'sinnoh_wayward_cave',
                name: '迷幻洞窟',
                description: '206號道路下方隱藏的洞穴',
                levelRange: [801, 820],
                pokemon: [
                    { id: 74, weight: 20, levelRange: [801, 820] },   // 小拳石
                    { id: 41, weight: 18, levelRange: [801, 820] },   // 超音蝠
                    { id: 436, weight: 18, levelRange: [801, 820] },  // 銅鏡怪
                    { id: 438, weight: 17, levelRange: [801, 820] },  // 盆才怪
                    { id: 439, weight: 15, levelRange: [801, 820] },  // 魔尼尼
                    { id: 443, weight: 12, levelRange: [801, 820] },  // 圓陸鯊（稀有）
                ]
            },
            {
                id: 'sinnoh_route209',
                name: '209號道路',
                description: '隨意鎮到迷路市之間的道路',
                levelRange: [821, 840],
                pokemon: [
                    { id: 431, weight: 20, levelRange: [821, 840] },  // 魅力喵
                    { id: 397, weight: 18, levelRange: [821, 840] },  // 姆克鳥
                    { id: 425, weight: 18, levelRange: [821, 840] },  // 飄飄球
                    { id: 427, weight: 18, levelRange: [821, 840] },  // 卷卷耳
                    { id: 440, weight: 12, levelRange: [821, 840] },  // 小福蛋
                    { id: 442, weight: 8, levelRange: [821, 840] },   // 花巖怪（稀有）
                    { id: 429, weight: 6, levelRange: [840, 840] },   // 夢妖魔（稀有）
                ]
            },
            {
                id: 'sinnoh_lost_tower',
                name: '失落之塔',
                description: '迷路市附近的寶可夢靈魂安息之所',
                levelRange: [841, 860],
                pokemon: [
                    { id: 92, weight: 22, levelRange: [841, 860] },   // 鬼斯
                    { id: 93, weight: 18, levelRange: [841, 860] },   // 鬼斯通
                    { id: 355, weight: 18, levelRange: [841, 860] },  // 夜巡靈
                    { id: 425, weight: 17, levelRange: [841, 860] },  // 飄飄球
                    { id: 200, weight: 15, levelRange: [841, 860] },  // 夢妖
                    { id: 442, weight: 10, levelRange: [841, 860] },  // 花巖怪（稀有）
                ]
            },
            {
                id: 'sinnoh_route210',
                name: '210號道路',
                description: '通往神和鎮的濃霧道路',
                levelRange: [861, 880],
                pokemon: [
                    { id: 397, weight: 18, levelRange: [861, 880] },  // 姆克鳥
                    { id: 423, weight: 18, levelRange: [861, 880] },  // 海兔獸
                    { id: 434, weight: 18, levelRange: [861, 880] },  // 臭鼬噗
                    { id: 419, weight: 16, levelRange: [861, 880] },  // 浮潛鼬
                    { id: 433, weight: 15, levelRange: [861, 880] },  // 鈴鐺響
                    { id: 441, weight: 15, levelRange: [861, 880] },  // 聒噪鳥
                ]
            },
            {
                id: 'sinnoh_route212',
                name: '212號道路',
                description: '帷幕市到水脈市之間的沼澤道路',
                levelRange: [881, 900],
                pokemon: [
                    { id: 453, weight: 22, levelRange: [881, 900] },  // 不良蛙
                    { id: 422, weight: 20, levelRange: [881, 900] },  // 無殼海兔
                    { id: 397, weight: 15, levelRange: [881, 900] },  // 姆克鳥
                    { id: 449, weight: 15, levelRange: [881, 900] },  // 沙河馬
                    { id: 455, weight: 15, levelRange: [881, 900] },  // 尖牙籠（稀有）
                    { id: 415, weight: 13, levelRange: [881, 900] },  // 三蜜蜂
                ]
            },
            {
                id: 'sinnoh_great_marsh',
                name: '大溼地',
                description: '水脈市的廣闊溼地保護區',
                levelRange: [901, 920],
                pokemon: [
                    { id: 453, weight: 18, levelRange: [901, 920] },  // 不良蛙
                    { id: 451, weight: 18, levelRange: [901, 920] },  // 鉗尾蠍
                    { id: 455, weight: 15, levelRange: [901, 920] },  // 尖牙籠
                    { id: 449, weight: 15, levelRange: [901, 920] },  // 沙河馬
                    { id: 400, weight: 12, levelRange: [901, 920] },  // 大尾狸
                    { id: 416, weight: 12, levelRange: [901, 920] },  // 蜂女王（稀有）
                    { id: 454, weight: 10, levelRange: [901, 920] },  // 毒骷蛙（稀有）
                ]
            },
            {
                id: 'sinnoh_route214',
                name: '214號道路',
                description: '帷幕市到水脈市東面的道路',
                levelRange: [921, 940],
                pokemon: [
                    { id: 449, weight: 20, levelRange: [921, 940] },  // 沙河馬
                    { id: 434, weight: 18, levelRange: [921, 940] },  // 臭鼬噗
                    { id: 453, weight: 18, levelRange: [921, 940] },  // 不良蛙
                    { id: 404, weight: 15, levelRange: [921, 940] },  // 勒克貓
                    { id: 435, weight: 12, levelRange: [921, 940] },  // 坦克臭鼬
                    { id: 450, weight: 10, levelRange: [921, 940] },  // 河馬獸（稀有）
                    { id: 446, weight: 7, levelRange: [921, 940] },   // 小卡比獸（稀有）
                ]
            },
            {
                id: 'sinnoh_route215',
                name: '215號道路',
                description: '帷幕市北方的雨天道路',
                levelRange: [941, 960],
                pokemon: [
                    { id: 404, weight: 22, levelRange: [941, 960] },  // 勒克貓
                    { id: 397, weight: 18, levelRange: [941, 960] },  // 姆克鳥
                    { id: 427, weight: 18, levelRange: [941, 960] },  // 卷卷耳
                    { id: 434, weight: 18, levelRange: [941, 960] },  // 臭鼬噗
                    { id: 428, weight: 12, levelRange: [941, 960] },  // 長耳兔（稀有）
                    { id: 448, weight: 12, levelRange: [941, 960] },  // 路卡利歐（稀有）
                ]
            },
            {
                id: 'sinnoh_mt_coronet_south',
                name: '天冠山（南部）',
                description: '神奧地區中央的雄偉山脈',
                levelRange: [961, 980],
                pokemon: [
                    { id: 436, weight: 20, levelRange: [961, 980] },  // 銅鏡怪
                    { id: 74, weight: 18, levelRange: [961, 980] },   // 小拳石
                    { id: 437, weight: 15, levelRange: [961, 980] },  // 青銅鐘
                    { id: 447, weight: 15, levelRange: [961, 980] },  // 利歐路
                    { id: 443, weight: 12, levelRange: [961, 980] },  // 圓陸鯊
                    { id: 408, weight: 10, levelRange: [961, 980] },  // 頭蓋龍
                    { id: 410, weight: 10, levelRange: [961, 980] },  // 盾甲龍
                    { id: 482, weight: 3, levelRange: [980, 980] },   // 亞克諾姆（傳說）
                ]
            },
            {
                id: 'sinnoh_route216',
                name: '216號道路',
                description: '通往切鋒市的雪地道路',
                levelRange: [981, 1000],
                pokemon: [
                    { id: 459, weight: 25, levelRange: [981, 1000] },  // 雪笠怪
                    { id: 215, weight: 20, levelRange: [981, 1000] },  // 狃拉
                    { id: 220, weight: 18, levelRange: [981, 1000] },  // 小山豬
                    { id: 397, weight: 17, levelRange: [981, 1000] },  // 姆克鳥
                    { id: 461, weight: 10, levelRange: [981, 1000] },  // 瑪狃拉（稀有）
                    { id: 460, weight: 10, levelRange: [981, 1000] },  // 暴雪王（稀有）
                ]
            },
            {
                id: 'sinnoh_lake_acuity',
                name: '睿智湖',
                description: '切鋒市附近的神聖湖泊',
                levelRange: [1001, 1020],
                pokemon: [
                    { id: 459, weight: 22, levelRange: [1001, 1020] },  // 雪笠怪
                    { id: 215, weight: 20, levelRange: [1001, 1020] },  // 狃拉
                    { id: 461, weight: 16, levelRange: [1001, 1020] },  // 瑪狃拉
                    { id: 460, weight: 15, levelRange: [1001, 1020] },  // 暴雪王
                    { id: 437, weight: 15, levelRange: [1001, 1020] },  // 青銅鐘
                    { id: 478, weight: 9, levelRange: [1001, 1020] },   // 雪妖女（稀有）
                    { id: 480, weight: 3, levelRange: [1020, 1020] },   // 由克希（傳說）
                    { id: 481, weight: 3, levelRange: [1020, 1020] },   // 艾姆利多（傳說）
                ]
            },
            {
                id: 'sinnoh_route222',
                name: '222號道路',
                description: '通往水脈市的海岸道路',
                levelRange: [1021, 1040],
                pokemon: [
                    { id: 423, weight: 20, levelRange: [1021, 1040] },  // 海兔獸
                    { id: 419, weight: 18, levelRange: [1021, 1040] },  // 浮潛鼬
                    { id: 405, weight: 15, levelRange: [1021, 1040] },  // 倫琴貓
                    { id: 398, weight: 15, levelRange: [1021, 1040] },  // 姆克鷹
                    { id: 457, weight: 15, levelRange: [1021, 1040] },  // 霓虹魚
                    { id: 456, weight: 10, levelRange: [1021, 1040] },  // 熒光魚
                    { id: 479, weight: 7, levelRange: [1040, 1040] },   // 洛託姆（稀有）
                    { id: 489, weight: 1, levelRange: [1040, 1040] },   // 霏歐納（傳說）
                ]
            },
            {
                id: 'sinnoh_mt_coronet_summit',
                name: '天冠山（槍之柱）',
                description: '天冠山頂峰，傳說中時空扭曲之地',
                levelRange: [1041, 1060],
                pokemon: [
                    { id: 444, weight: 20, levelRange: [1041, 1060] },  // 尖牙陸鯊
                    { id: 437, weight: 20, levelRange: [1041, 1060] },  // 青銅鐘
                    { id: 448, weight: 14, levelRange: [1041, 1060] },  // 路卡利歐
                    { id: 460, weight: 12, levelRange: [1041, 1060] },  // 暴雪王
                    { id: 476, weight: 12, levelRange: [1041, 1060] },  // 大朝北鼻
                    { id: 485, weight: 7, levelRange: [1059, 1060] },   // 席多藍恩（傳說）
                    { id: 483, weight: 2, levelRange: [1060, 1060] },   // 帝牙盧卡（傳說）
                    { id: 484, weight: 2, levelRange: [1060, 1060] },   // 帕路奇亞（傳說）
                ]
            },
            {
                id: 'sinnoh_victory_road',
                name: '神奧冠軍之路',
                description: '通往神奧聯盟的最終試煉',
                levelRange: [1061, 1080],
                pokemon: [
                    { id: 445, weight: 16, levelRange: [1061, 1080] },  // 烈咬陸鯊
                    { id: 398, weight: 16, levelRange: [1061, 1080] },  // 姆克鷹
                    { id: 448, weight: 14, levelRange: [1061, 1080] },  // 路卡利歐
                    { id: 405, weight: 14, levelRange: [1061, 1080] },  // 倫琴貓
                    { id: 452, weight: 12, levelRange: [1061, 1080] },  // 龍王蠍
                    { id: 444, weight: 12, levelRange: [1061, 1080] },  // 尖牙陸鯊
                    { id: 475, weight: 10, levelRange: [1061, 1080] },  // 艾路雷朵（稀有）
                    { id: 473, weight: 6, levelRange: [1061, 1080] },   // 象牙豬（稀有）
                    { id: 486, weight: 2, levelRange: [1080, 1080] },   // 雷吉奇卡斯（傳說）
                ]
            },
            {
                id: 'sinnoh_sendoff_spring',
                name: '歸途洞窟',
                description: '通往反轉世界入口的神秘洞窟',
                levelRange: [1081, 1100],
                pokemon: [
                    { id: 445, weight: 18, levelRange: [1081, 1100] },  // 烈咬陸鯊
                    { id: 452, weight: 16, levelRange: [1081, 1100] },  // 龍王蠍
                    { id: 429, weight: 14, levelRange: [1081, 1100] },  // 夢妖魔
                    { id: 477, weight: 14, levelRange: [1081, 1100] },  // 黑夜魔靈
                    { id: 472, weight: 12, levelRange: [1081, 1100] },  // 天蠍王
                    { id: 442, weight: 10, levelRange: [1081, 1100] },  // 花巖怪
                    { id: 487, weight: 2, levelRange: [1100, 1100] },   // 騎拉帝納（傳說）
                ]
            },
            {
                id: 'sinnoh_fullmoon_island',
                name: '滿月島 & 新月島',
                description: '傳說中蕾冠王與達克萊伊棲息的神秘島嶼',
                levelRange: [1101, 1120],
                pokemon: [
                    { id: 445, weight: 18, levelRange: [1101, 1120] },  // 烈咬陸鯊
                    { id: 448, weight: 16, levelRange: [1101, 1120] },  // 路卡利歐
                    { id: 405, weight: 14, levelRange: [1101, 1120] },  // 倫琴貓
                    { id: 475, weight: 13, levelRange: [1101, 1120] },  // 艾路雷朵
                    { id: 428, weight: 12, levelRange: [1101, 1120] },  // 長耳兔
                    { id: 488, weight: 3, levelRange: [1120, 1120] },   // 克雷色利亞（傳說）
                    { id: 491, weight: 3, levelRange: [1120, 1120] },   // 達克萊伊（傳說）
                    { id: 490, weight: 3, levelRange: [1120, 1120] },   // 瑪納霏（傳說）
                ]
            },
            {
                id: 'sinnoh_hall_of_origin',
                name: '創始之間',
                description: '傳說中阿爾宙斯降臨的至高聖域',
                levelRange: [1121, 1140],
                pokemon: [
                    { id: 445, weight: 16, levelRange: [1121, 1140] },  // 烈咬陸鯊
                    { id: 448, weight: 14, levelRange: [1121, 1140] },  // 路卡利歐
                    { id: 475, weight: 14, levelRange: [1121, 1140] },  // 艾路雷朵
                    { id: 473, weight: 12, levelRange: [1121, 1140] },  // 象牙豬
                    { id: 477, weight: 12, levelRange: [1121, 1140] },  // 黑夜魔靈
                    { id: 476, weight: 10, levelRange: [1121, 1140] },  // 大朝北鼻
                    { id: 474, weight: 8, levelRange: [1121, 1140] },   // 多邊獸Z（稀有）
                    { id: 492, weight: 2, levelRange: [1140, 1140] },   // 謝米（幻之寶可夢）
                    { id: 493, weight: 1, levelRange: [1140, 1140] },   // 阿爾宙斯（幻之寶可夢）
                ]
            },
        ]
    },
    unova: {
        id: 'unova',
        name: '合眾地區',
        nameEn: 'Unova',
        description: '第五世代寶可夢的故鄉，擁有繁華的都市與廣袤的自然。需要集齊神奧地區所有寶可夢才能前往。完成合眾圖鑑可獲得徽章，讓已達 6V 且閃光的寶可夢出現權重降低 90%。',
        unlockCondition: { type: 'pokedex_complete', region: 'sinnoh', range: [387, 493] },
        routes: [
            {
                id: 'unova_route1',
                name: '1號道路',
                description: '鹿子鎮到唐草鎮之間的道路',
                levelRange: [1141, 1165],
                pokemon: [
                    { id: 504, weight: 35, levelRange: [1141, 1165] },  // 探探鼠
                    { id: 519, weight: 30, levelRange: [1141, 1165] },  // 豆豆鴿
                    { id: 506, weight: 20, levelRange: [1141, 1165] },  // 小約克
                    { id: 509, weight: 15, levelRange: [1141, 1165] },  // 扒手貓
                ]
            },
            {
                id: 'unova_route2',
                name: '2號道路',
                description: '唐草鎮到三曜市之間的道路',
                levelRange: [1166, 1190],
                pokemon: [
                    { id: 506, weight: 25, levelRange: [1166, 1190] },  // 小約克
                    { id: 504, weight: 20, levelRange: [1166, 1190] },  // 探探鼠
                    { id: 509, weight: 20, levelRange: [1166, 1190] },  // 扒手貓
                    { id: 511, weight: 12, levelRange: [1166, 1190] },  // 花椰猴
                    { id: 513, weight: 12, levelRange: [1166, 1190] },  // 爆香猴
                    { id: 515, weight: 11, levelRange: [1166, 1190] },  // 冷水猴
                ]
            },
            {
                id: 'unova_dreamyard',
                name: '夢之遺蹟',
                description: '三曜市郊外的神秘遺蹟',
                levelRange: [1191, 1215],
                pokemon: [
                    { id: 517, weight: 25, levelRange: [1191, 1215] },  // 食夢夢
                    { id: 543, weight: 20, levelRange: [1191, 1215] },  // 百足蜈蚣
                    { id: 540, weight: 20, levelRange: [1191, 1215] },  // 蟲寶包
                    { id: 519, weight: 15, levelRange: [1191, 1215] },  // 豆豆鴿
                    { id: 546, weight: 10, levelRange: [1191, 1215] },  // 木棉球
                    { id: 495, weight: 10, levelRange: [1191, 1215] },  // 藤藤蛇（稀有）
                ]
            },
            {
                id: 'unova_route3',
                name: '3號道路',
                description: '三曜市到七寶市之間的道路',
                levelRange: [1216, 1240],
                pokemon: [
                    { id: 522, weight: 22, levelRange: [1216, 1240] },  // 斑斑馬
                    { id: 520, weight: 20, levelRange: [1216, 1240] },  // 咕咕鴿
                    { id: 548, weight: 18, levelRange: [1216, 1240] },  // 百合根娃娃
                    { id: 535, weight: 15, levelRange: [1216, 1240] },  // 圓蝌蚪
                    { id: 505, weight: 15, levelRange: [1216, 1240] },  // 步哨鼠
                    { id: 550, weight: 12, levelRange: [1216, 1240] },  // 野蠻鱸魚
                    { id: 498, weight: 10, levelRange: [1216, 1240] },  // 暖暖豬（稀有）
                ]
            },
            {
                id: 'unova_wellspring_cave',
                name: '地下水脈穴',
                description: '連線3號道路與4號道路的洞穴',
                levelRange: [1241, 1265],
                pokemon: [
                    { id: 524, weight: 25, levelRange: [1241, 1265] },  // 石丸子
                    { id: 532, weight: 22, levelRange: [1241, 1265] },  // 搬運小匠
                    { id: 527, weight: 18, levelRange: [1241, 1265] },  // 滾滾蝙蝠
                    { id: 535, weight: 15, levelRange: [1241, 1265] },  // 圓蝌蚪
                    { id: 529, weight: 10, levelRange: [1241, 1265] },  // 螺釘地鼠
                    { id: 501, weight: 10, levelRange: [1241, 1265] },  // 水水獺（稀有）
                ]
            },
            {
                id: 'unova_route4',
                name: '4號道路（沙漠區）',
                description: '七寶市到飛雲市之間的沙漠道路',
                levelRange: [1266, 1290],
                pokemon: [
                    { id: 551, weight: 25, levelRange: [1266, 1290] },  // 黑眼鱷
                    { id: 554, weight: 18, levelRange: [1266, 1290] },  // 火紅不倒翁
                    { id: 556, weight: 15, levelRange: [1266, 1290] },  // 沙鈴仙人掌
                    { id: 557, weight: 15, levelRange: [1266, 1290] },  // 石居蟹
                    { id: 572, weight: 15, levelRange: [1266, 1290] },  // 泡沫栗鼠
                    { id: 570, weight: 12, levelRange: [1266, 1290] },  // 索羅亞（稀有）
                ]
            },
            {
                id: 'unova_pinwheel_forest',
                name: '矢車之森',
                description: '七寶市附近的茂密森林',
                levelRange: [1291, 1315],
                pokemon: [
                    { id: 540, weight: 20, levelRange: [1291, 1315] },  // 蟲寶包
                    { id: 543, weight: 18, levelRange: [1291, 1315] },  // 百足蜈蚣
                    { id: 546, weight: 15, levelRange: [1291, 1315] },  // 木棉球
                    { id: 548, weight: 15, levelRange: [1291, 1315] },  // 百合根娃娃
                    { id: 585, weight: 15, levelRange: [1291, 1315] },  // 四季鹿
                    { id: 636, weight: 10, levelRange: [1291, 1315] },  // 燃燒蟲（稀有）
                    { id: 531, weight: 7, levelRange: [1291, 1315] },   // 差不多娃娃（稀有）
                ]
            },
            {
                id: 'unova_skyarrow_bridge',
                name: '天箭橋',
                description: '連線飛雲市的宏偉大橋',
                levelRange: [1316, 1340],
                pokemon: [
                    { id: 520, weight: 22, levelRange: [1316, 1340] },  // 咕咕鴿
                    { id: 580, weight: 22, levelRange: [1316, 1340] },  // 鴨寶寶
                    { id: 568, weight: 18, levelRange: [1316, 1340] },  // 破破袋
                    { id: 595, weight: 15, levelRange: [1316, 1340] },  // 電電蟲
                    { id: 507, weight: 13, levelRange: [1316, 1340] },  // 哈約克
                    { id: 594, weight: 10, levelRange: [1316, 1340] },  // 保姆曼波
                    { id: 587, weight: 10, levelRange: [1316, 1340] },  // 電飛鼠（稀有）
                ]
            },
            {
                id: 'unova_route5',
                name: '5號道路',
                description: '飛雲市到帆巴市之間的道路',
                levelRange: [1341, 1365],
                pokemon: [
                    { id: 510, weight: 20, levelRange: [1341, 1365] },  // 酷豹
                    { id: 572, weight: 18, levelRange: [1341, 1365] },  // 泡沫栗鼠
                    { id: 595, weight: 18, levelRange: [1341, 1365] },  // 電電蟲
                    { id: 568, weight: 15, levelRange: [1341, 1365] },  // 破破袋
                    { id: 538, weight: 12, levelRange: [1341, 1365] },  // 投摔鬼
                    { id: 559, weight: 10, levelRange: [1341, 1365] },  // 滑滑小子
                    { id: 574, weight: 7, levelRange: [1341, 1365] },   // 哥德寶寶（稀有）
                ]
            },
            {
                id: 'unova_desert_resort',
                name: '古代城堡（沙漠度假區）',
                description: '合眾地區中心的廣袤沙漠遺蹟',
                levelRange: [1366, 1390],
                pokemon: [
                    { id: 551, weight: 20, levelRange: [1366, 1390] },  // 黑眼鱷
                    { id: 561, weight: 15, levelRange: [1366, 1390] },  // 象徵鳥
                    { id: 562, weight: 15, levelRange: [1366, 1390] },  // 哭哭面具
                    { id: 622, weight: 15, levelRange: [1366, 1390] },  // 泥偶小人
                    { id: 554, weight: 12, levelRange: [1366, 1390] },  // 火紅不倒翁
                    { id: 564, weight: 10, levelRange: [1366, 1390] },  // 原蓋海龜（稀有）
                    { id: 566, weight: 8, levelRange: [1366, 1390] },   // 始祖小鳥（稀有）
                    { id: 618, weight: 5, levelRange: [1366, 1390] },   // 泥巴魚（稀有）
                ]
            },
            {
                id: 'unova_route6',
                name: '6號道路',
                description: '帆巴市到電氣石洞穴之間的道路',
                levelRange: [1391, 1415],
                pokemon: [
                    { id: 585, weight: 20, levelRange: [1391, 1415] },  // 四季鹿
                    { id: 577, weight: 18, levelRange: [1391, 1415] },  // 單卵細胞球
                    { id: 536, weight: 15, levelRange: [1391, 1415] },  // 藍蟾蜍
                    { id: 599, weight: 15, levelRange: [1391, 1415] },  // 齒輪兒
                    { id: 590, weight: 15, levelRange: [1391, 1415] },  // 哎呀球菇
                    { id: 597, weight: 10, levelRange: [1391, 1415] },  // 種子鐵球（稀有）
                    { id: 607, weight: 7, levelRange: [1391, 1415] },   // 燭光靈（稀有）
                ]
            },
            {
                id: 'unova_chargestone_cave',
                name: '電氣石洞穴',
                description: '充滿電氣石的神秘洞穴',
                levelRange: [1416, 1440],
                pokemon: [
                    { id: 599, weight: 22, levelRange: [1416, 1440] },  // 齒輪兒
                    { id: 602, weight: 18, levelRange: [1416, 1440] },  // 麻麻小魚
                    { id: 525, weight: 18, levelRange: [1416, 1440] },  // 地幔巖
                    { id: 529, weight: 15, levelRange: [1416, 1440] },  // 螺釘地鼠
                    { id: 527, weight: 12, levelRange: [1416, 1440] },  // 滾滾蝙蝠
                    { id: 588, weight: 10, levelRange: [1416, 1440] },  // 蓋蓋蟲（稀有）
                    { id: 616, weight: 5, levelRange: [1416, 1440] },   // 小嘴蝸（稀有）
                ]
            },
            {
                id: 'unova_route7',
                name: '7號道路',
                description: '帆巴市到吹寄市之間的塔樓道路',
                levelRange: [1441, 1465],
                pokemon: [
                    { id: 586, weight: 20, levelRange: [1441, 1465] },  // 萌芽鹿
                    { id: 547, weight: 15, levelRange: [1441, 1465] },  // 風妖精
                    { id: 549, weight: 15, levelRange: [1441, 1465] },  // 裙兒小姐
                    { id: 521, weight: 15, levelRange: [1441, 1465] },  // 高傲雉雞
                    { id: 569, weight: 15, levelRange: [1441, 1465] },  // 灰塵山
                    { id: 582, weight: 10, levelRange: [1441, 1465] },  // 迷你冰（稀有）
                    { id: 629, weight: 10, levelRange: [1441, 1465] },  // 禿鷹丫頭
                ]
            },
            {
                id: 'unova_celestial_tower',
                name: '天堂之塔',
                description: '吹寄市附近的靈魂安息之所',
                levelRange: [1466, 1490],
                pokemon: [
                    { id: 607, weight: 25, levelRange: [1466, 1490] },  // 燭光靈
                    { id: 592, weight: 20, levelRange: [1466, 1490] },  // 輕飄飄
                    { id: 562, weight: 18, levelRange: [1466, 1490] },  // 哭哭面具
                    { id: 608, weight: 15, levelRange: [1466, 1490] },  // 燈火幽靈
                    { id: 528, weight: 12, levelRange: [1466, 1490] },  // 心蝙蝠
                    { id: 605, weight: 10, levelRange: [1466, 1490] },  // 小灰怪
                    { id: 569, weight: 10, levelRange: [1466, 1490] },  // 灰塵山
                ]
            },
            {
                id: 'unova_route8',
                name: '8號道路（溼地）',
                description: '吹寄市到雪花市之間的沼澤道路',
                levelRange: [1491, 1515],
                pokemon: [
                    { id: 537, weight: 18, levelRange: [1491, 1515] },  // 蟾蜍王
                    { id: 613, weight: 18, levelRange: [1491, 1515] },  // 噴嚏熊
                    { id: 569, weight: 15, levelRange: [1491, 1515] },  // 灰塵山
                    { id: 593, weight: 15, levelRange: [1491, 1515] },  // 胖嘟嘟
                    { id: 545, weight: 12, levelRange: [1491, 1515] },  // 蜈蚣王
                    { id: 615, weight: 12, levelRange: [1491, 1515] },  // 幾何雪花（稀有）
                    { id: 591, weight: 10, levelRange: [1491, 1515] },  // 敗露球菇
                    { id: 606, weight: 7, levelRange: [1491, 1515] },   // 大宇怪（稀有）
                    { id: 642, weight: 3, levelRange: [1515, 1515] },   // 雷電雲（傳說·風雲神）
                ]
            },
            {
                id: 'unova_twist_mountain',
                name: '螺旋山',
                description: '合眾地區中心的螺旋狀巨大山脈',
                levelRange: [1516, 1540],
                pokemon: [
                    { id: 526, weight: 20, levelRange: [1516, 1540] },  // 龐巖怪
                    { id: 534, weight: 18, levelRange: [1516, 1540] },  // 修建老匠
                    { id: 530, weight: 15, levelRange: [1516, 1540] },  // 龍頭地鼠
                    { id: 613, weight: 15, levelRange: [1516, 1540] },  // 噴嚏熊
                    { id: 624, weight: 12, levelRange: [1516, 1540] },  // 駒刀小兵
                    { id: 631, weight: 10, levelRange: [1516, 1540] },  // 熔蟻獸（稀有）
                    { id: 632, weight: 10, levelRange: [1516, 1540] },  // 鐵蟻（稀有）
                    { id: 645, weight: 3, levelRange: [1540, 1540] },   // 土地雲（傳說·風雲神）
                ]
            },
            {
                id: 'unova_route9',
                name: '9號道路',
                description: '帆巴市到雙龍市之間的購物街道路',
                levelRange: [1541, 1565],
                pokemon: [
                    { id: 560, weight: 18, levelRange: [1541, 1565] },  // 頭巾混混
                    { id: 552, weight: 18, levelRange: [1541, 1565] },  // 混混鱷
                    { id: 510, weight: 15, levelRange: [1541, 1565] },  // 酷豹
                    { id: 571, weight: 12, levelRange: [1541, 1565] },  // 索羅亞克
                    { id: 523, weight: 12, levelRange: [1541, 1565] },  // 雷電斑馬
                    { id: 619, weight: 12, levelRange: [1541, 1565] },  // 功夫鼬
                    { id: 626, weight: 8, levelRange: [1541, 1565] },   // 爆炸頭水牛（稀有）
                    { id: 610, weight: 5, levelRange: [1541, 1565] },   // 牙牙（稀有）
                    { id: 647, weight: 2, levelRange: [1565, 1565] },   // 凱路迪歐（幻之寶可夢）
                ]
            },
            {
                id: 'unova_dragonspiral_tower',
                name: '龍螺旋之塔',
                description: '合眾地區最古老的建築，傳說中龍之寶可夢沉睡之地',
                levelRange: [1566, 1590],
                pokemon: [
                    { id: 610, weight: 20, levelRange: [1566, 1590] },  // 牙牙
                    { id: 563, weight: 18, levelRange: [1566, 1590] },  // 死神棺
                    { id: 623, weight: 15, levelRange: [1566, 1590] },  // 泥偶巨人
                    { id: 609, weight: 12, levelRange: [1566, 1590] },  // 水晶燈火靈
                    { id: 576, weight: 12, levelRange: [1566, 1590] },  // 哥德小姐
                    { id: 579, weight: 10, levelRange: [1566, 1590] },  // 人造細胞卵
                    { id: 621, weight: 10, levelRange: [1566, 1590] },  // 赤面龍
                    { id: 633, weight: 8, levelRange: [1566, 1590] },   // 單首龍（稀有）
                    { id: 638, weight: 3, levelRange: [1590, 1590] },   // 勾帕路翁（傳說）
                    { id: 639, weight: 2, levelRange: [1590, 1590] },   // 代拉基翁（傳說）
                ]
            },
            {
                id: 'unova_route10',
                name: '10號道路',
                description: '通往合眾冠軍之路的入口',
                levelRange: [1591, 1615],
                pokemon: [
                    { id: 553, weight: 18, levelRange: [1591, 1615] },  // 流氓鱷
                    { id: 555, weight: 15, levelRange: [1591, 1615] },  // 達摩狒狒
                    { id: 508, weight: 15, levelRange: [1591, 1615] },  // 長毛狗
                    { id: 542, weight: 15, levelRange: [1591, 1615] },  // 保姆蟲
                    { id: 627, weight: 12, levelRange: [1591, 1615] },  // 毛頭小鷹
                    { id: 629, weight: 10, levelRange: [1591, 1615] },  // 禿鷹丫頭
                    { id: 596, weight: 10, levelRange: [1591, 1615] },  // 電蜘蛛
                    { id: 640, weight: 3, levelRange: [1615, 1615] },   // 畢力吉翁（傳說）
                    { id: 641, weight: 3, levelRange: [1615, 1615] },   // 龍捲雲（傳說）
                ]
            },
            {
                id: 'unova_victory_road',
                name: '合眾冠軍之路',
                description: '通往合眾聯盟的最終試煉',
                levelRange: [1616, 1640],
                pokemon: [
                    { id: 611, weight: 16, levelRange: [1616, 1640] },  // 斧牙龍
                    { id: 625, weight: 14, levelRange: [1616, 1640] },  // 劈斬司令
                    { id: 601, weight: 14, levelRange: [1616, 1640] },  // 齒輪怪
                    { id: 589, weight: 12, levelRange: [1616, 1640] },  // 騎士蝸牛
                    { id: 617, weight: 12, levelRange: [1616, 1640] },  // 敏捷蟲
                    { id: 637, weight: 10, levelRange: [1616, 1640] },  // 火神蛾
                    { id: 634, weight: 10, levelRange: [1616, 1640] },  // 雙首暴龍
                    { id: 628, weight: 8, levelRange: [1616, 1640] },   // 勇士雄鷹（稀有）
                    { id: 630, weight: 4, levelRange: [1616, 1640] },   // 禿鷹娜（稀有）
                    { id: 648, weight: 2, levelRange: [1640, 1640] },   // 美洛耶塔（幻之寶可夢）
                ]
            },
            {
                id: 'unova_giant_chasm',
                name: '巨人洞窟',
                description: '傳說中酋雷姆棲息的冰冷巨洞',
                levelRange: [1641, 1665],
                pokemon: [
                    { id: 614, weight: 16, levelRange: [1641, 1665] },  // 凍原熊
                    { id: 584, weight: 14, levelRange: [1641, 1665] },  // 雙倍多多冰
                    { id: 604, weight: 14, levelRange: [1641, 1665] },  // 麻麻鰻魚王
                    { id: 598, weight: 12, levelRange: [1641, 1665] },  // 堅果啞鈴
                    { id: 558, weight: 12, levelRange: [1641, 1665] },  // 巖殿居蟹
                    { id: 565, weight: 10, levelRange: [1641, 1665] },  // 肋骨海龜
                    { id: 567, weight: 10, levelRange: [1641, 1665] },  // 始祖大鳥
                    { id: 646, weight: 1, levelRange: [1665, 1665] },   // 酋雷姆（傳說）
                ]
            },
            {
                id: 'unova_n_castle',
                name: 'N之城堡',
                description: '等離子團的空中城堡，傳說之龍沉眠之地',
                levelRange: [1666, 1690],
                pokemon: [
                    { id: 612, weight: 14, levelRange: [1666, 1690] },  // 雙斧戰龍
                    { id: 635, weight: 12, levelRange: [1666, 1690] },  // 三首惡龍
                    { id: 571, weight: 12, levelRange: [1666, 1690] },  // 索羅亞克
                    { id: 555, weight: 10, levelRange: [1666, 1690] },  // 達摩狒狒
                    { id: 637, weight: 10, levelRange: [1666, 1690] },  // 火神蛾
                    { id: 609, weight: 10, levelRange: [1666, 1690] },  // 水晶燈火靈
                    { id: 539, weight: 8, levelRange: [1666, 1690] },   // 打擊鬼
                    { id: 538, weight: 8, levelRange: [1666, 1690] },   // 投摔鬼
                    { id: 643, weight: 2, levelRange: [1689, 1690] },   // 萊希拉姆（傳說）
                    { id: 644, weight: 2, levelRange: [1689, 1690] },   // 捷克羅姆（傳說）
                ]
            },
            {
                id: 'unova_liberty_garden',
                name: '自由花園 & 天涯之境',
                description: '傳說中幻之寶可夢棲息的神秘場所',
                levelRange: [1691, 1715],
                pokemon: [
                    { id: 612, weight: 14, levelRange: [1691, 1715] },  // 雙斧戰龍
                    { id: 635, weight: 12, levelRange: [1691, 1715] },  // 三首惡龍
                    { id: 637, weight: 12, levelRange: [1691, 1715] },  // 火神蛾
                    { id: 604, weight: 10, levelRange: [1691, 1715] },  // 麻麻鰻魚王
                    { id: 625, weight: 10, levelRange: [1691, 1715] },  // 劈斬司令
                    { id: 589, weight: 10, levelRange: [1691, 1715] },  // 騎士蝸牛
                    { id: 601, weight: 10, levelRange: [1691, 1715] },  // 齒輪怪
                    { id: 628, weight: 8, levelRange: [1691, 1715] },   // 勇士雄鷹
                    { id: 494, weight: 2, levelRange: [1715, 1715] },   // 比克提尼（幻之寶可夢）
                    { id: 649, weight: 1, levelRange: [1714, 1715] },   // 蓋諾賽克特（幻之寶可夢）
                ]
            },
        ]
    },
    kalos: {
        id: 'kalos',
        name: '卡洛斯地區',
        nameEn: 'Kalos',
        description: '第六世代寶可夢的故鄉，以美麗的巴黎風格城市與Mega進化聞名。需要集齊合眾地區所有寶可夢才能前往。完成卡洛斯圖鑑可獲得徽章，讓樹果成熟時間減半。',
        unlockCondition: { type: 'pokedex_complete', region: 'unova', range: [494, 649] },
        routes: [
            {
                id: 'kalos_route2',
                name: '2號道路',
                description: '白檀市到朝香鎮之間的森林小徑',
                levelRange: [1716, 1745],
                pokemon: [
                    { id: 659, weight: 30, levelRange: [1716, 1745] },  // 掘掘兔
                    { id: 661, weight: 25, levelRange: [1716, 1745] },  // 小箭雀
                    { id: 664, weight: 20, levelRange: [1716, 1745] },  // 粉蝶蟲
                    { id: 650, weight: 15, levelRange: [1716, 1745] },  // 哈力慄
                    { id: 656, weight: 10, levelRange: [1716, 1745] },  // 呱呱泡蛙（稀有）
                ]
            },
            {
                id: 'kalos_santalune_forest',
                name: '白檀森林',
                description: '白檀市附近的茂密森林，蟲系寶可夢樂園',
                levelRange: [1746, 1775],
                pokemon: [
                    { id: 664, weight: 25, levelRange: [1746, 1775] },  // 粉蝶蟲
                    { id: 665, weight: 20, levelRange: [1746, 1775] },  // 粉蝶蛹
                    { id: 661, weight: 20, levelRange: [1746, 1775] },  // 小箭雀
                    { id: 659, weight: 15, levelRange: [1746, 1775] },  // 掘掘兔
                    { id: 653, weight: 10, levelRange: [1746, 1775] },  // 火狐狸（稀有）
                    { id: 666, weight: 10, levelRange: [1746, 1775] },  // 彩粉蝶（稀有）
                ]
            },
            {
                id: 'kalos_route4',
                name: '4號道路（花庭園）',
                description: '密阿雷市南面的美麗花園道路',
                levelRange: [1776, 1805],
                pokemon: [
                    { id: 669, weight: 25, levelRange: [1776, 1805] },  // 花蓓蓓
                    { id: 667, weight: 20, levelRange: [1776, 1805] },  // 小獅獅
                    { id: 672, weight: 20, levelRange: [1776, 1805] },  // 坐騎小羊
                    { id: 661, weight: 15, levelRange: [1776, 1805] },  // 小箭雀
                    { id: 662, weight: 10, levelRange: [1776, 1805] },  // 火箭雀
                    { id: 670, weight: 10, levelRange: [1776, 1805] },  // 花葉蒂（稀有）
                ]
            },
            {
                id: 'kalos_route5',
                name: '5號道路',
                description: '密阿雷市到海翼市之間的道路',
                levelRange: [1806, 1835],
                pokemon: [
                    { id: 674, weight: 22, levelRange: [1806, 1835] },  // 頑皮熊貓
                    { id: 659, weight: 20, levelRange: [1806, 1835] },  // 掘掘兔
                    { id: 667, weight: 18, levelRange: [1806, 1835] },  // 小獅獅
                    { id: 661, weight: 15, levelRange: [1806, 1835] },  // 小箭雀
                    { id: 660, weight: 15, levelRange: [1806, 1835] },  // 掘地兔
                    { id: 650, weight: 10, levelRange: [1806, 1835] },  // 哈力慄（稀有）
                ]
            },
            {
                id: 'kalos_route7',
                name: '7號道路（要塞道路）',
                description: '通往異世石碑的古道',
                levelRange: [1836, 1865],
                pokemon: [
                    { id: 676, weight: 20, levelRange: [1836, 1865] },  // 多麗米亞
                    { id: 672, weight: 18, levelRange: [1836, 1865] },  // 坐騎小羊
                    { id: 674, weight: 18, levelRange: [1836, 1865] },  // 頑皮熊貓
                    { id: 662, weight: 15, levelRange: [1836, 1865] },  // 火箭雀
                    { id: 678, weight: 12, levelRange: [1836, 1865] },  // 超能妙喵
                    { id: 677, weight: 12, levelRange: [1836, 1865] },  // 妙喵
                    { id: 656, weight: 5, levelRange: [1836, 1865] },   // 呱呱泡蛙（稀有）
                ]
            },
            {
                id: 'kalos_connecting_cave',
                name: '連線洞穴',
                description: '連線7號道路和密阿雷市的洞窟',
                levelRange: [1866, 1895],
                pokemon: [
                    { id: 679, weight: 25, levelRange: [1866, 1895] },  // 獨劍鞘
                    { id: 703, weight: 18, levelRange: [1866, 1895] },  // 小碎鑽
                    { id: 41, weight: 18, levelRange: [1866, 1895] },   // 超音蝠
                    { id: 694, weight: 15, levelRange: [1866, 1895] },  // 傘電蜥
                    { id: 680, weight: 14, levelRange: [1866, 1895] },  // 雙劍鞘（稀有）
                    { id: 695, weight: 10, levelRange: [1866, 1895] },  // 光電傘蜥（稀有）
                ]
            },
            {
                id: 'kalos_route8',
                name: '8號道路（海岸線）',
                description: '海翼市到古香市之間的海岸道路',
                levelRange: [1896, 1925],
                pokemon: [
                    { id: 688, weight: 22, levelRange: [1896, 1925] },  // 龜腳腳
                    { id: 690, weight: 20, levelRange: [1896, 1925] },  // 垃垃藻
                    { id: 692, weight: 18, levelRange: [1896, 1925] },  // 鐵臂槍蝦
                    { id: 686, weight: 15, levelRange: [1896, 1925] },  // 好啦魷
                    { id: 689, weight: 12, levelRange: [1896, 1925] },  // 龜足巨鎧（稀有）
                    { id: 693, weight: 8, levelRange: [1896, 1925] },   // 鋼炮臂蝦（稀有）
                    { id: 687, weight: 5, levelRange: [1896, 1925] },   // 烏賊王（稀有）
                ]
            },
            {
                id: 'kalos_route9',
                name: '9號道路（碎石路）',
                description: '古香市到映照洞穴之間的陡峭山路',
                levelRange: [1926, 1955],
                pokemon: [
                    { id: 696, weight: 22, levelRange: [1926, 1955] },  // 寶寶暴龍
                    { id: 698, weight: 22, levelRange: [1926, 1955] },  // 冰雪龍
                    { id: 672, weight: 18, levelRange: [1926, 1955] },  // 坐騎小羊
                    { id: 673, weight: 15, levelRange: [1926, 1955] },  // 坐騎山羊
                    { id: 697, weight: 13, levelRange: [1926, 1955] },  // 怪顎龍（稀有）
                    { id: 699, weight: 10, levelRange: [1926, 1955] },  // 冰雪巨龍（稀有）
                ]
            },
            {
                id: 'kalos_glittering_cave',
                name: '映照洞穴',
                description: '蘊含化石的閃亮洞窟',
                levelRange: [1956, 1985],
                pokemon: [
                    { id: 703, weight: 25, levelRange: [1956, 1985] },  // 小碎鑽
                    { id: 679, weight: 20, levelRange: [1956, 1985] },  // 獨劍鞘
                    { id: 696, weight: 15, levelRange: [1956, 1985] },  // 寶寶暴龍
                    { id: 698, weight: 15, levelRange: [1956, 1985] },  // 冰雪龍
                    { id: 694, weight: 12, levelRange: [1956, 1985] },  // 傘電蜥
                    { id: 680, weight: 8, levelRange: [1956, 1985] },   // 雙劍鞘（稀有）
                    { id: 704, weight: 5, levelRange: [1956, 1985] },   // 黏黏寶（稀有）
                ]
            },
            {
                id: 'kalos_route10',
                name: '10號道路（石碑道路）',
                description: '密阿雷市到荒涼鎮之間的神秘道路',
                levelRange: [1986, 2015],
                pokemon: [
                    { id: 705, weight: 18, levelRange: [1986, 2015] },  // 黏美兒
                    { id: 667, weight: 15, levelRange: [1986, 2015] },  // 小獅獅
                    { id: 668, weight: 15, levelRange: [1986, 2015] },  // 火炎獅
                    { id: 678, weight: 15, levelRange: [1986, 2015] },  // 超能妙喵
                    { id: 662, weight: 12, levelRange: [1986, 2015] },  // 火箭雀
                    { id: 663, weight: 12, levelRange: [1986, 2015] },  // 烈箭鷹
                    { id: 706, weight: 8, levelRange: [1986, 2015] },   // 黏美龍（稀有）
                    { id: 704, weight: 5, levelRange: [1986, 2015] },   // 黏黏寶（稀有）
                    { id: 700, weight: 5, levelRange: [1986, 2015] },   // 仙子伊布（稀有）
                ]
            },
            {
                id: 'kalos_route11',
                name: '11號道路（鏡穴道路）',
                description: '通往映照洞穴的崎嶇道路',
                levelRange: [2016, 2045],
                pokemon: [
                    { id: 674, weight: 20, levelRange: [2016, 2045] },  // 頑皮熊貓
                    { id: 667, weight: 18, levelRange: [2016, 2045] },  // 小獅獅
                    { id: 675, weight: 15, levelRange: [2016, 2045] },  // 霸道熊貓
                    { id: 682, weight: 15, levelRange: [2016, 2045] },  // 粉香香
                    { id: 684, weight: 15, levelRange: [2016, 2045] },  // 綿綿泡芙
                    { id: 668, weight: 12, levelRange: [2016, 2045] },  // 火炎獅
                    { id: 683, weight: 5, levelRange: [2016, 2045] },   // 芳香精（稀有）
                ]
            },
            {
                id: 'kalos_route12',
                name: '12號道路（海濱道路）',
                description: '古香市南方的海濱道路',
                levelRange: [2046, 2075],
                pokemon: [
                    { id: 690, weight: 20, levelRange: [2046, 2075] },  // 垃垃藻
                    { id: 692, weight: 18, levelRange: [2046, 2075] },  // 鐵臂槍蝦
                    { id: 688, weight: 17, levelRange: [2046, 2075] },  // 龜腳腳
                    { id: 691, weight: 15, levelRange: [2046, 2075] },  // 毒藻龍
                    { id: 686, weight: 15, levelRange: [2046, 2075] },  // 好啦魷
                    { id: 693, weight: 10, levelRange: [2046, 2075] },  // 鋼炮臂蝦（稀有）
                    { id: 685, weight: 5, levelRange: [2046, 2075] },   // 胖甜妮（稀有）
                ]
            },
            {
                id: 'kalos_route13',
                name: '13號道路（荒地道路）',
                description: '穿越乾旱荒原的道路',
                levelRange: [2076, 2105],
                pokemon: [
                    { id: 694, weight: 22, levelRange: [2076, 2105] },  // 傘電蜥
                    { id: 660, weight: 18, levelRange: [2076, 2105] },  // 掘地兔
                    { id: 695, weight: 15, levelRange: [2076, 2105] },  // 光電傘蜥
                    { id: 673, weight: 15, levelRange: [2076, 2105] },  // 坐騎山羊
                    { id: 663, weight: 12, levelRange: [2076, 2105] },  // 烈箭鷹
                    { id: 702, weight: 10, levelRange: [2076, 2105] },  // 咚咚鼠
                    { id: 701, weight: 8, levelRange: [2076, 2105] },   // 摔角鷹人（稀有）
                ]
            },
            {
                id: 'kalos_route14',
                name: '14號道路（沼澤道路）',
                description: '穿越潮溼沼澤的陰暗道路',
                levelRange: [2106, 2135],
                pokemon: [
                    { id: 704, weight: 22, levelRange: [2106, 2135] },  // 黏黏寶
                    { id: 705, weight: 15, levelRange: [2106, 2135] },  // 黏美兒
                    { id: 675, weight: 15, levelRange: [2106, 2135] },  // 霸道熊貓
                    { id: 708, weight: 15, levelRange: [2106, 2135] },  // 小木靈
                    { id: 710, weight: 15, levelRange: [2106, 2135] },  // 南瓜精
                    { id: 709, weight: 10, levelRange: [2106, 2135] },  // 朽木妖（稀有）
                    { id: 711, weight: 8, levelRange: [2106, 2135] },   // 南瓜怪人（稀有）
                ]
            },
            {
                id: 'kalos_route15',
                name: '15號道路（日照道路）',
                description: '百刻市附近的荒野道路',
                levelRange: [2136, 2165],
                pokemon: [
                    { id: 668, weight: 18, levelRange: [2136, 2165] },  // 火炎獅
                    { id: 663, weight: 16, levelRange: [2136, 2165] },  // 烈箭鷹
                    { id: 675, weight: 16, levelRange: [2136, 2165] },  // 霸道熊貓
                    { id: 706, weight: 15, levelRange: [2136, 2165] },  // 黏美龍
                    { id: 673, weight: 15, levelRange: [2136, 2165] },  // 坐騎山羊
                    { id: 681, weight: 12, levelRange: [2136, 2165] },  // 堅盾劍怪（稀有）
                    { id: 671, weight: 8, levelRange: [2136, 2165] },   // 花潔夫人（稀有）
                ]
            },
            {
                id: 'kalos_frost_cavern',
                name: '冰雪洞窟',
                description: '卡洛斯地區北部的冰冷洞窟',
                levelRange: [2166, 2195],
                pokemon: [
                    { id: 712, weight: 22, levelRange: [2166, 2195] },  // 冰寶
                    { id: 698, weight: 20, levelRange: [2166, 2195] },  // 冰雪龍
                    { id: 699, weight: 15, levelRange: [2166, 2195] },  // 冰雪巨龍
                    { id: 703, weight: 15, levelRange: [2166, 2195] },  // 小碎鑽
                    { id: 713, weight: 12, levelRange: [2166, 2195] },  // 冰岩怪
                    { id: 706, weight: 10, levelRange: [2166, 2195] },  // 黏美龍（稀有）
                    { id: 681, weight: 6, levelRange: [2166, 2195] },   // 堅盾劍怪（稀有）
                ]
            },
            {
                id: 'kalos_route17',
                name: '17號道路（瑪姆牛道路）',
                description: '剷雪通行的雪原道路',
                levelRange: [2196, 2225],
                pokemon: [
                    { id: 712, weight: 22, levelRange: [2196, 2225] },  // 冰寶
                    { id: 713, weight: 15, levelRange: [2196, 2225] },  // 冰岩怪
                    { id: 699, weight: 15, levelRange: [2196, 2225] },  // 冰雪巨龍
                    { id: 660, weight: 13, levelRange: [2196, 2225] },  // 掘地兔
                    { id: 663, weight: 13, levelRange: [2196, 2225] },  // 烈箭鷹
                    { id: 706, weight: 12, levelRange: [2196, 2225] },  // 黏美龍
                    { id: 707, weight: 10, levelRange: [2196, 2225] },  // 鑰圈兒（稀有）
                ]
            },
            {
                id: 'kalos_route18',
                name: '18號道路（谷間道路）',
                description: '映雪市到冠軍之路之間的峽谷道路',
                levelRange: [2226, 2255],
                pokemon: [
                    { id: 706, weight: 18, levelRange: [2226, 2255] },  // 黏美龍
                    { id: 675, weight: 16, levelRange: [2226, 2255] },  // 霸道熊貓
                    { id: 681, weight: 14, levelRange: [2226, 2255] },  // 堅盾劍怪
                    { id: 668, weight: 14, levelRange: [2226, 2255] },  // 火炎獅
                    { id: 663, weight: 14, levelRange: [2226, 2255] },  // 烈箭鷹
                    { id: 697, weight: 12, levelRange: [2226, 2255] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [2226, 2255] },  // 冰雪巨龍（稀有）
                ]
            },
            {
                id: 'kalos_route19',
                name: '19號道路（大谷道路）',
                description: '通往冠軍之路的壯闊峽谷',
                levelRange: [2256, 2285],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [2256, 2285] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [2256, 2285] },  // 堅盾劍怪
                    { id: 675, weight: 14, levelRange: [2256, 2285] },  // 霸道熊貓
                    { id: 697, weight: 14, levelRange: [2256, 2285] },  // 怪顎龍
                    { id: 668, weight: 14, levelRange: [2256, 2285] },  // 火炎獅
                    { id: 663, weight: 14, levelRange: [2256, 2285] },  // 烈箭鷹
                    { id: 699, weight: 10, levelRange: [2256, 2285] },  // 冰雪巨龍
                    { id: 713, weight: 4, levelRange: [2256, 2285] },   // 冰岩怪（稀有）
                ]
            },
            {
                id: 'kalos_victory_road',
                name: '卡洛斯冠軍之路',
                description: '通往卡洛斯聯盟的最終試煉',
                levelRange: [2286, 2315],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [2286, 2315] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [2286, 2315] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [2286, 2315] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [2286, 2315] },  // 冰雪巨龍
                    { id: 675, weight: 12, levelRange: [2286, 2315] },  // 霸道熊貓
                    { id: 663, weight: 10, levelRange: [2286, 2315] },  // 烈箭鷹
                    { id: 668, weight: 10, levelRange: [2286, 2315] },  // 火炎獅
                    { id: 706, weight: 8, levelRange: [2286, 2315] },   // 黏美龍
                    { id: 714, weight: 4, levelRange: [2315, 2315] },   // 嗡蝠（稀有）
                ]
            },
            {
                id: 'kalos_terminus_cave',
                name: '終結洞窟',
                description: '傳說中基格爾德沉睡的深邃洞窟',
                levelRange: [2316, 2345],
                pokemon: [
                    { id: 703, weight: 18, levelRange: [2316, 2345] },  // 小碎鑽
                    { id: 681, weight: 15, levelRange: [2316, 2345] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [2316, 2345] },  // 怪顎龍
                    { id: 706, weight: 14, levelRange: [2316, 2345] },  // 黏美龍
                    { id: 713, weight: 12, levelRange: [2316, 2345] },  // 冰岩怪
                    { id: 715, weight: 10, levelRange: [2316, 2345] },  // 音波龍（稀有）
                    { id: 718, weight: 2, levelRange: [2345, 2345] },   // 基格爾德（傳說）
                ]
            },
            {
                id: 'kalos_unknown_dungeon',
                name: '未知洞窟',
                description: '卡洛斯地區最深處的神秘洞穴',
                levelRange: [2346, 2375],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [2346, 2375] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [2346, 2375] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [2346, 2375] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [2346, 2375] },  // 冰雪巨龍
                    { id: 675, weight: 12, levelRange: [2346, 2375] },  // 霸道熊貓
                    { id: 668, weight: 10, levelRange: [2346, 2375] },  // 火炎獅
                    { id: 716, weight: 3, levelRange: [2374, 2375] },   // 哲爾尼亞斯（傳說）
                    { id: 717, weight: 3, levelRange: [2374, 2375] },   // 伊裴爾塔爾（傳說）
                ]
            },
            {
                id: 'kalos_sea_spirits_den',
                name: '海神洞窟 & 花園',
                description: '傳說中幻之寶可夢棲息的神秘場所',
                levelRange: [2376, 2410],
                pokemon: [
                    { id: 706, weight: 14, levelRange: [2376, 2410] },  // 黏美龍
                    { id: 681, weight: 12, levelRange: [2376, 2410] },  // 堅盾劍怪
                    { id: 697, weight: 12, levelRange: [2376, 2410] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [2376, 2410] },  // 冰雪巨龍
                    { id: 668, weight: 10, levelRange: [2376, 2410] },  // 火炎獅
                    { id: 663, weight: 10, levelRange: [2376, 2410] },  // 烈箭鷹
                    { id: 675, weight: 10, levelRange: [2376, 2410] },  // 霸道熊貓
                    { id: 713, weight: 8, levelRange: [2376, 2410] },   // 冰岩怪
                    { id: 719, weight: 2, levelRange: [2405, 2410] },   // 蒂安希（幻之寶可夢）
                    { id: 720, weight: 1, levelRange: [2405, 2410] },   // 胡帕（幻之寶可夢）
                    { id: 721, weight: 1, levelRange: [2405, 2410] },   // 波爾凱尼恩（幻之寶可夢）
                ]
            },
        ]
    },
    alola: {
        id: 'alola',
        name: '阿羅拉地區',
        nameEn: 'Alola',
        description: '溫暖的南國群島，擁有獨特的地區形態寶可夢和守護神。完成阿羅拉圖鑑可獲得徽章，使生成寶石的屬性數值偏向較高值。',
        unlockCondition: { type: 'pokedex_complete', region: 'kalos', range: [650, 721] },
        routes: [
            {
                id: 'alola_route1',
                name: '1號道路',
                description: '好奧樂市到利利小鎮之間的道路',
                levelRange: [2411, 2460],
                pokemon: [
                    { id: 722, weight: 25, levelRange: [2411, 2460] },  // 木木梟
                    { id: 725, weight: 25, levelRange: [2411, 2460] },  // 火斑喵
                    { id: 728, weight: 25, levelRange: [2411, 2460] },  // 球球海獅
                    { id: 731, weight: 15, levelRange: [2411, 2460] },  // 小篤兒
                    { id: 734, weight: 10, levelRange: [2411, 2460] },  // 貓鼬少
                ]
            },
            {
                id: 'alola_route2',
                name: '2號道路',
                description: '好奧樂市郊外的道路',
                levelRange: [2461, 2520],
                pokemon: [
                    { id: 744, weight: 25, levelRange: [2461, 2520] },  // 巖狗狗
                    { id: 736, weight: 20, levelRange: [2461, 2520] },  // 強顎雞母蟲
                    { id: 739, weight: 20, levelRange: [2461, 2520] },  // 好勝蟹
                    { id: 742, weight: 20, levelRange: [2461, 2520] },  // 萌虻
                    { id: 741, weight: 15, levelRange: [2461, 2520] },  // 花舞鳥
                ]
            },
            {
                id: 'alola_route3',
                name: '3號道路',
                description: '美樂美樂島的草地道路',
                levelRange: [2521, 2580],
                pokemon: [
                    { id: 749, weight: 25, levelRange: [2521, 2580] },  // 泥驢仔
                    { id: 747, weight: 20, levelRange: [2521, 2580] },  // 好壞星
                    { id: 751, weight: 20, levelRange: [2521, 2580] },  // 滴蛛
                    { id: 753, weight: 20, levelRange: [2521, 2580] },  // 偽螳草
                    { id: 746, weight: 15, levelRange: [2521, 2580] },  // 弱丁魚
                ]
            },
            {
                id: 'alola_route4',
                name: '4號道路',
                description: '阿卡拉島的熱鬧街道',
                levelRange: [2581, 2640],
                pokemon: [
                    { id: 755, weight: 20, levelRange: [2581, 2640] },  // 睡睡菇
                    { id: 757, weight: 20, levelRange: [2581, 2640] },  // 夜盜火蜥
                    { id: 759, weight: 20, levelRange: [2581, 2640] },  // 童偶熊
                    { id: 761, weight: 20, levelRange: [2581, 2640] },  // 甜竹竹
                    { id: 764, weight: 20, levelRange: [2581, 2640] },  // 花療環環
                ]
            },
            {
                id: 'alola_route5',
                name: '5號道路',
                description: '阿卡拉島連線至皇家大道的道路',
                levelRange: [2641, 2700],
                pokemon: [
                    { id: 723, weight: 15, levelRange: [2641, 2700] },  // 投羽梟
                    { id: 726, weight: 15, levelRange: [2641, 2700] },  // 炎熱喵
                    { id: 729, weight: 15, levelRange: [2641, 2700] },  // 花漾海獅
                    { id: 765, weight: 15, levelRange: [2641, 2700] },  // 智揮猩
                    { id: 766, weight: 15, levelRange: [2641, 2700] },  // 投擲猴
                    { id: 735, weight: 15, levelRange: [2641, 2700] },  // 貓鼬探長
                    { id: 740, weight: 10, levelRange: [2641, 2700] },  // 好勝毛蟹
                ]
            },
            {
                id: 'alola_route6',
                name: '6號道路',
                description: '烏拉烏拉島的道路',
                levelRange: [2701, 2800],
                pokemon: [
                    { id: 737, weight: 20, levelRange: [2701, 2800] },  // 蟲電寶
                    { id: 743, weight: 20, levelRange: [2701, 2800] },  // 蝶結萌虻
                    { id: 745, weight: 20, levelRange: [2701, 2800] },  // 鬃巖狼人
                    { id: 732, weight: 15, levelRange: [2701, 2800] },  // 喇叭啄鳥
                    { id: 767, weight: 15, levelRange: [2701, 2800] },  // 宇宙烏賊
                    { id: 768, weight: 10, levelRange: [2701, 2800] },  // 具甲武者
                ]
            },
            {
                id: 'alola_route7',
                name: '7號道路',
                description: '烏拉烏拉島的海濱道路',
                levelRange: [2801, 2900],
                pokemon: [
                    { id: 750, weight: 20, levelRange: [2801, 2900] },  // 重泥挽馬
                    { id: 752, weight: 20, levelRange: [2801, 2900] },  // 滴蛛霸
                    { id: 754, weight: 20, levelRange: [2801, 2900] },  // 蘭螳花
                    { id: 748, weight: 15, levelRange: [2801, 2900] },  // 超壞星
                    { id: 756, weight: 15, levelRange: [2801, 2900] },  // 燈罩夜菇
                    { id: 758, weight: 10, levelRange: [2801, 2900] },  // 焰後蜥
                ]
            },
            {
                id: 'alola_route8',
                name: '8號道路',
                description: '烏拉烏拉島至波尼島的道路',
                levelRange: [2901, 3000],
                pokemon: [
                    { id: 760, weight: 15, levelRange: [2901, 3000] },  // 穿著熊
                    { id: 762, weight: 15, levelRange: [2901, 3000] },  // 甜舞妮
                    { id: 763, weight: 15, levelRange: [2901, 3000] },  // 甜冷美后
                    { id: 769, weight: 15, levelRange: [2901, 3000] },  // 沙丘娃
                    { id: 770, weight: 15, levelRange: [2901, 3000] },  // 噬沙堡爺
                    { id: 771, weight: 15, levelRange: [2901, 3000] },  // 拳海參
                    { id: 772, weight: 10, levelRange: [2901, 3000] },  // 屬性：空
                ]
            },
            {
                id: 'alola_route9',
                name: '9號道路',
                description: '波尼島的山區道路',
                levelRange: [3001, 3100],
                pokemon: [
                    { id: 724, weight: 12, levelRange: [3001, 3100] },  // 狙射樹梟
                    { id: 727, weight: 12, levelRange: [3001, 3100] },  // 熾焰咆哮虎
                    { id: 730, weight: 12, levelRange: [3001, 3100] },  // 西獅海壬
                    { id: 733, weight: 12, levelRange: [3001, 3100] },  // 銃嘴大鳥
                    { id: 738, weight: 12, levelRange: [3001, 3100] },  // 鍬農炮蟲
                    { id: 773, weight: 10, levelRange: [3001, 3100] },  // 銀伴戰獸
                    { id: 774, weight: 10, levelRange: [3001, 3100] },  // 小隕星
                    { id: 775, weight: 10, levelRange: [3001, 3100] },  // 樹枕尾熊
                    { id: 776, weight: 10, levelRange: [3001, 3100] },  // 爆焰龜獸
                ]
            },
            {
                id: 'alola_route10',
                name: '10號道路',
                description: '波尼島的花園道路',
                levelRange: [3101, 3200],
                pokemon: [
                    { id: 777, weight: 15, levelRange: [3101, 3200] },  // 託戈德瑪爾
                    { id: 778, weight: 15, levelRange: [3101, 3200] },  // 謎擬Ｑ
                    { id: 779, weight: 15, levelRange: [3101, 3200] },  // 磨牙彩皮魚
                    { id: 780, weight: 15, levelRange: [3101, 3200] },  // 老翁龍
                    { id: 781, weight: 15, levelRange: [3101, 3200] },  // 破破舵輪
                    { id: 782, weight: 15, levelRange: [3101, 3200] },  // 心鱗寶
                    { id: 783, weight: 10, levelRange: [3101, 3200] },  // 鱗甲龍
                ]
            },
            {
                id: 'alola_route11',
                name: '11號道路',
                description: '波尼島的深處道路',
                levelRange: [3201, 3300],
                pokemon: [
                    { id: 784, weight: 15, levelRange: [3201, 3300] },  // 杖尾鱗甲龍
                    { id: 789, weight: 15, levelRange: [3201, 3300] },  // 科斯莫古
                    { id: 790, weight: 15, levelRange: [3201, 3300] },  // 科斯莫姆
                    { id: 785, weight: 10, levelRange: [3201, 3300] },  // 卡璞・鳴鳴
                    { id: 786, weight: 10, levelRange: [3201, 3300] },  // 卡璞・蝶蝶
                    { id: 787, weight: 10, levelRange: [3201, 3300] },  // 卡璞・哞哞
                    { id: 788, weight: 10, levelRange: [3201, 3300] },  // 卡璞・鰭鰭
                    { id: 791, weight: 8, levelRange: [3201, 3300] },   // 索爾迦雷歐
                    { id: 792, weight: 7, levelRange: [3201, 3300] },   // 露奈雅拉
                ]
            },
            {
                id: 'alola_route12',
                name: '12號道路',
                description: '異獸出沒的異次元區域',
                levelRange: [3301, 3400],
                pokemon: [
                    { id: 793, weight: 15, levelRange: [3301, 3400] },  // 虛吾伊德
                    { id: 794, weight: 15, levelRange: [3301, 3400] },  // 爆肌蚊
                    { id: 795, weight: 15, levelRange: [3301, 3400] },  // 費洛美螂
                    { id: 796, weight: 15, levelRange: [3301, 3400] },  // 電束木
                    { id: 797, weight: 15, levelRange: [3301, 3400] },  // 鐵火輝夜
                    { id: 798, weight: 15, levelRange: [3301, 3400] },  // 紙御劍
                    { id: 799, weight: 10, levelRange: [3301, 3400] },  // 惡食大王
                ]
            },
            {
                id: 'alola_route13',
                name: '13號道路',
                description: '奈克洛茲瑪的黑暗領域',
                levelRange: [3401, 3500],
                pokemon: [
                    { id: 800, weight: 20, levelRange: [3401, 3500] },  // 奈克洛茲瑪
                    { id: 803, weight: 20, levelRange: [3401, 3500] },  // 毒貝比
                    { id: 801, weight: 15, levelRange: [3401, 3500] },  // 瑪機雅娜
                    { id: 802, weight: 15, levelRange: [3401, 3500] },  // 瑪夏多
                    { id: 804, weight: 15, levelRange: [3401, 3500] },  // 四顎針龍
                    { id: 805, weight: 15, levelRange: [3401, 3500] },  // 壘磊石
                ]
            },
            {
                id: 'alola_route14',
                name: '14號道路',
                description: '阿羅拉的極限之地',
                levelRange: [3501, 3600],
                pokemon: [
                    { id: 808, weight: 30, levelRange: [3501, 3600] },  // 美錄坦
                    { id: 809, weight: 30, levelRange: [3501, 3600] },  // 美錄梅塔
                    { id: 806, weight: 20, levelRange: [3501, 3600] },  // 火頭獠牙
                    { id: 807, weight: 20, levelRange: [3501, 3600] },  // 澤洛拉
                ]
            },
        ]
    },
    galar: {
        id: 'galar',
        name: '伽勒爾地區',
        nameEn: 'Galar',
        description: '工業發達的地區，極巨化現象讓寶可夢變得巨大化。完成伽勒爾圖鑑可獲得徽章，讓樹果收穫數量變為 2 倍。',
        unlockCondition: { type: 'pokedex_complete', region: 'alola', range: [722, 809] },
        routes: [
            {
                id: 'galar_route1',
                name: '1號道路',
                description: '木樁鎮到機擎市之間的道路',
                levelRange: [3601, 3800],
                pokemon: [
                    { id: 810, weight: 15, levelRange: [3601, 3800] },  // 敲音猴
                    { id: 813, weight: 15, levelRange: [3601, 3800] },  // 炎兔兒
                    { id: 816, weight: 15, levelRange: [3601, 3800] },  // 淚眼蜥
                    { id: 819, weight: 15, levelRange: [3601, 3800] },  // 貪心栗鼠
                    { id: 821, weight: 15, levelRange: [3601, 3800] },  // 稚山雀
                    { id: 824, weight: 15, levelRange: [3601, 3700] },  // 索偵蟲
                    { id: 827, weight: 10, levelRange: [3601, 3800] },  // 偷兒狐
                ]
            },
            {
                id: 'galar_route2',
                name: '2號道路',
                description: '機擎市郊外的礦區道路',
                levelRange: [3801, 4000],
                pokemon: [
                    { id: 829, weight: 15, levelRange: [3801, 4000] },  // 幼棉棉
                    { id: 831, weight: 15, levelRange: [3801, 4000] },  // 毛辮羊
                    { id: 820, weight: 12, levelRange: [3801, 4000] },  // 藏飽栗鼠
                    { id: 822, weight: 12, levelRange: [3801, 4000] },  // 藍鴉
                    { id: 825, weight: 12, levelRange: [3801, 4000] },  // 天罩蟲
                    { id: 828, weight: 12, levelRange: [3801, 4000] },  // 狐大盜
                    { id: 833, weight: 12, levelRange: [3801, 4000] },  // 咬咬龜
                ]
            },
            {
                id: 'galar_route3',
                name: '3號道路',
                description: '伽勒爾礦山深處',
                levelRange: [4001, 4200],
                pokemon: [
                    { id: 835, weight: 15, levelRange: [4001, 4200] },  // 來電汪
                    { id: 837, weight: 15, levelRange: [4001, 4200] },  // 小炭仔
                    { id: 811, weight: 12, levelRange: [4001, 4200] },  // 啪咚猴
                    { id: 814, weight: 12, levelRange: [4001, 4200] },  // 騰蹴小將
                    { id: 817, weight: 12, levelRange: [4001, 4200] },  // 變澀蜥
                    { id: 830, weight: 12, levelRange: [4001, 4200] },  // 白蓬蓬
                    { id: 832, weight: 12, levelRange: [4001, 4200] },  // 毛毛角羊
                ]
            },
            {
                id: 'galar_route4',
                name: '4號道路',
                description: '曠野地帶的開闊草原',
                levelRange: [4201, 4400],
                pokemon: [
                    { id: 840, weight: 15, levelRange: [4201, 4400] },  // 啃果蟲
                    { id: 843, weight: 15, levelRange: [4201, 4400] },  // 沙包蛇
                    { id: 834, weight: 12, levelRange: [4201, 4400] },  // 暴噬龜
                    { id: 836, weight: 12, levelRange: [4201, 4400] },  // 逐電犬
                    { id: 838, weight: 12, levelRange: [4201, 4400] },  // 大炭車
                    { id: 823, weight: 10, levelRange: [4201, 4400] },  // 鋼鎧鴉
                    { id: 826, weight: 10, levelRange: [4201, 4400] },  // 以歐路普
                ]
            },
            {
                id: 'galar_route5',
                name: '5號道路',
                description: '伽勒爾中部的城鎮區域',
                levelRange: [4401, 4600],
                pokemon: [
                    { id: 841, weight: 12, levelRange: [4401, 4600] },  // 蘋裹龍
                    { id: 842, weight: 12, levelRange: [4401, 4600] },  // 豐蜜龍
                    { id: 844, weight: 12, levelRange: [4401, 4600] },  // 沙螺蟒
                    { id: 839, weight: 10, levelRange: [4401, 4600] },  // 巨炭山
                    { id: 812, weight: 8, levelRange: [4401, 4600] },   // 轟擂金剛猩
                    { id: 815, weight: 8, levelRange: [4401, 4600] },   // 閃焰王牌
                    { id: 818, weight: 8, levelRange: [4401, 4600] },   // 千面避役
                ]
            },
            {
                id: 'galar_route6',
                name: '6號道路',
                description: '拳關市至棘丘市之間的濱海道路',
                levelRange: [4601, 4800],
                pokemon: [
                    { id: 846, weight: 15, levelRange: [4601, 4800] },  // 刺梭魚
                    { id: 848, weight: 15, levelRange: [4601, 4800] },  // 毒電嬰
                    { id: 850, weight: 15, levelRange: [4601, 4800] },  // 燒火蚣
                    { id: 845, weight: 12, levelRange: [4601, 4800] },  // 古月鳥
                    { id: 847, weight: 10, levelRange: [4601, 4800] },  // 戽斗尖梭
                    { id: 849, weight: 10, levelRange: [4601, 4800] },  // 顫弦蠑螈
                    { id: 851, weight: 10, levelRange: [4601, 4800] },  // 焚焰蚣
                ]
            },
            {
                id: 'galar_route7',
                name: '7號道路',
                description: '格拉球大草原的訓練區域',
                levelRange: [4801, 5000],
                pokemon: [
                    { id: 852, weight: 12, levelRange: [4801, 5000] },  // 拳拳蛸
                    { id: 854, weight: 12, levelRange: [4801, 5000] },  // 來悲茶
                    { id: 856, weight: 12, levelRange: [4801, 5000] },  // 迷布莉姆
                    { id: 853, weight: 10, levelRange: [4801, 5000] },  // 八爪武師
                    { id: 855, weight: 10, levelRange: [4801, 5000] },  // 怖思壺
                    { id: 857, weight: 10, levelRange: [4801, 5000] },  // 提布莉姆
                    { id: 858, weight: 8, levelRange: [4801, 5000] },   // 布莉姆溫
                ]
            },
            {
                id: 'galar_route8',
                name: '8號道路',
                description: '棘丘市附近的陰暗森林',
                levelRange: [5001, 5200],
                pokemon: [
                    { id: 859, weight: 12, levelRange: [5001, 5200] },  // 搗蛋小妖
                    { id: 860, weight: 10, levelRange: [5001, 5200] },  // 詐唬魔
                    { id: 862, weight: 10, levelRange: [5001, 5200] },  // 堵攔熊
                    { id: 863, weight: 10, levelRange: [5001, 5200] },  // 喵頭目
                    { id: 864, weight: 10, levelRange: [5001, 5200] },  // 魔靈珊瑚
                    { id: 865, weight: 10, levelRange: [5001, 5200] },  // 蔥遊兵
                    { id: 861, weight: 8, levelRange: [5001, 5200] },   // 長毛巨魔
                ]
            },
            {
                id: 'galar_route9',
                name: '9號道路',
                description: '冠之雪原的入口地帶',
                levelRange: [5201, 5400],
                pokemon: [
                    { id: 872, weight: 15, levelRange: [5201, 5400] },  // 雪吞蟲
                    { id: 866, weight: 12, levelRange: [5201, 5400] },  // 踏冰人偶
                    { id: 867, weight: 12, levelRange: [5201, 5400] },  // 死神板
                    { id: 868, weight: 12, levelRange: [5201, 5400] },  // 小仙奶
                    { id: 871, weight: 12, levelRange: [5201, 5400] },  // 啪嚓海膽
                    { id: 869, weight: 10, levelRange: [5201, 5400] },  // 霜奶仙
                    { id: 870, weight: 10, levelRange: [5201, 5400] },  // 列陣兵
                ]
            },
            {
                id: 'galar_route10',
                name: '10號道路',
                description: '冠之雪原的冰凍深處',
                levelRange: [5401, 5600],
                pokemon: [
                    { id: 878, weight: 15, levelRange: [5401, 5600] },  // 銅象
                    { id: 873, weight: 12, levelRange: [5401, 5600] },  // 雪絨蛾
                    { id: 876, weight: 12, levelRange: [5401, 5600] },  // 愛管侍
                    { id: 877, weight: 12, levelRange: [5401, 5600] },  // 莫魯貝可
                    { id: 875, weight: 10, levelRange: [5401, 5600] },  // 冰砌鵝
                    { id: 879, weight: 10, levelRange: [5401, 5600] },  // 大王銅象
                    { id: 874, weight: 8, levelRange: [5401, 5600] },   // 巨石丁
                ]
            },
            {
                id: 'galar_route11',
                name: '11號道路',
                description: '伽勒爾的化石遺蹟地帶',
                levelRange: [5601, 5800],
                pokemon: [
                    { id: 885, weight: 15, levelRange: [5601, 5800] },  // 多龍梅西亞
                    { id: 880, weight: 12, levelRange: [5601, 5800] },  // 雷鳥龍
                    { id: 881, weight: 12, levelRange: [5601, 5800] },  // 雷鳥海獸
                    { id: 882, weight: 12, levelRange: [5601, 5800] },  // 鰓魚龍
                    { id: 883, weight: 12, levelRange: [5601, 5800] },  // 鰓魚海獸
                    { id: 884, weight: 8, levelRange: [5601, 5800] },   // 鋁鋼龍
                ]
            },
            {
                id: 'galar_route12',
                name: '12號道路',
                description: '能量塔周邊的龍之巢穴',
                levelRange: [5801, 6000],
                pokemon: [
                    { id: 886, weight: 12, levelRange: [5801, 6000] },  // 多龍奇
                    { id: 891, weight: 12, levelRange: [5801, 6000] },  // 熊徒弟
                    { id: 887, weight: 10, levelRange: [5801, 6000] },  // 多龍巴魯託
                    { id: 894, weight: 10, levelRange: [5999, 6000] },  // 雷吉艾勒奇
                    { id: 895, weight: 8, levelRange: [5999, 6000] },   // 雷吉鐸拉戈
                ]
            },
            {
                id: 'galar_route13',
                name: '13號道路',
                description: '鎧之孤島的修煉道場',
                levelRange: [6001, 6200],
                pokemon: [
                    { id: 892, weight: 15, levelRange: [6001, 6200] },  // 武道熊師
                    { id: 893, weight: 15, levelRange: [6001, 6200] },  // 薩戮德
                    { id: 896, weight: 10, levelRange: [6001, 6200] },  // 雪暴馬
                    { id: 897, weight: 8, levelRange: [6150, 6200] },   // 靈幽馬
                    { id: 889, weight: 3, levelRange: [6199, 6200] },   // 藏瑪然特
                    
                ]
            },
            {
                id: 'galar_route14',
                name: '14號道路',
                description: '洗翠地區的古老遺蹟',
                levelRange: [6201, 6400],
                pokemon: [
                    { id: 899, weight: 15, levelRange: [6201, 6400] },  // 詭角鹿
                    { id: 900, weight: 15, levelRange: [6201, 6400] },  // 劈斧螳螂
                    { id: 902, weight: 12, levelRange: [6201, 6400] },  // 幽尾玄魚
                    { id: 903, weight: 12, levelRange: [6201, 6400] },  // 大狃拉
                    { id: 904, weight: 12, levelRange: [6201, 6400] },  // 萬針魚
                    { id: 888, weight: 3, levelRange: [6399, 6400] },   // 蒼響
                ]
            },
            {
                id: 'galar_route15',
                name: '15號道路',
                description: '洗翠之巔——傳說降臨之地',
                levelRange: [6401, 6600],
                pokemon: [
                    { id: 901, weight: 20, levelRange: [6401, 6600] },  // 月月熊
                    { id: 902, weight: 20, levelRange: [6401, 6600] },  // 幽尾玄魚
                    { id: 905, weight: 10, levelRange: [6550, 6600] },   // 眷戀雲
                    { id: 898, weight: 5, levelRange: [6599, 6600] },   // 蕾冠王
                    { id: 890, weight: 1, levelRange: [6599, 6600] },   // 無極汰那
                ]
            },
        ]
    },
    paldea: {
        id: 'paldea',
        name: '帕底亞地區',
        nameEn: 'Paldea',
        description: '廣闊的伊比利亞風格地區，擁有太晶化現象和神秘的古來/未來寶可夢。完成帕底亞圖鑑可獲得徽章，將最大離線結算時間提高至 48 小時。',
        unlockCondition: { type: 'pokedex_complete', region: 'galar', range: [810, 905] },
        routes: [
            {
                id: 'paldea_route1',
                name: '南部第一區',
                description: '桌臺市南方的草原地帶，御三家寶可夢出沒',
                levelRange: [6601, 7100],
                pokemon: [
                    { id: 906, weight: 12, levelRange: [6601, 7100] },  // 新葉喵
                    { id: 909, weight: 12, levelRange: [6601, 7100] },  // 呆火鱷
                    { id: 912, weight: 12, levelRange: [6601, 7100] },  // 潤水鴨
                    { id: 915, weight: 12, levelRange: [6601, 6850] },  // 愛吃豚
                    { id: 917, weight: 12, levelRange: [6601, 6850] },  // 團珠蛛
                    { id: 919, weight: 12, levelRange: [6601, 6850] },  // 豆蟋蟀
                    { id: 921, weight: 12, levelRange: [6601, 6850] },  // 布撥
                    { id: 924, weight: 8, levelRange: [6601, 7100] },   // 一對鼠
                    { id: 926, weight: 8, levelRange: [6601, 7100] },   // 狗仔包
                ]
            },
            {
                id: 'paldea_route2',
                name: '南部第二區',
                description: '桌臺市東南方的田園地帶',
                levelRange: [7101, 7600],
                pokemon: [
                    { id: 922, weight: 12, levelRange: [7101, 7600] },  // 布土撥
                    { id: 928, weight: 12, levelRange: [7101, 7600] },  // 迷你芙
                    { id: 929, weight: 12, levelRange: [7101, 7600] },  // 奧利紐
                    { id: 918, weight: 10, levelRange: [7101, 7600] },  // 操陷蛛
                    { id: 920, weight: 10, levelRange: [7101, 7600] },  // 烈腿蝗
                    { id: 925, weight: 10, levelRange: [7101, 7600] },  // 一家鼠
                    { id: 927, weight: 10, levelRange: [7101, 7600] },  // 麻花犬
                    { id: 931, weight: 10, levelRange: [7101, 7600] },  // 怒鸚哥
                    { id: 932, weight: 8, levelRange: [7101, 7600] },   // 鹽石寶
                ]
            },
            {
                id: 'paldea_route3',
                name: '西部第一區',
                description: '帕底亞西部的山谷地帶',
                levelRange: [7601, 8100],
                pokemon: [
                    { id: 935, weight: 12, levelRange: [7601, 8100] },  // 炭小侍
                    { id: 938, weight: 12, levelRange: [7601, 8100] },  // 光蚪仔
                    { id: 907, weight: 10, levelRange: [7601, 8100] },  // 蒂蕾喵
                    { id: 910, weight: 10, levelRange: [7601, 8100] },  // 炙燙鱷
                    { id: 913, weight: 10, levelRange: [7601, 8100] },  // 湧躍鴨
                    { id: 916, weight: 10, levelRange: [7601, 8100] },  // 飄香豚
                    { id: 923, weight: 10, levelRange: [7601, 8100] },  // 巴布土撥
                    { id: 930, weight: 10, levelRange: [7601, 8100] },  // 奧利瓦
                    { id: 933, weight: 10, levelRange: [7601, 8100] },  // 鹽石壘
                ]
            },
            {
                id: 'paldea_route4',
                name: '西部第二區',
                description: '帕底亞西部的高原巖區',
                levelRange: [8101, 8600],
                pokemon: [
                    { id: 942, weight: 12, levelRange: [8101, 8600] },  // 偶叫獒
                    { id: 944, weight: 12, levelRange: [8101, 8600] },  // 滋汁鼴
                    { id: 936, weight: 10, levelRange: [8101, 8600] },  // 紅蓮鎧騎
                    { id: 937, weight: 10, levelRange: [8101, 8600] },  // 蒼炎刃鬼
                    { id: 939, weight: 10, levelRange: [8101, 8600] },  // 電肚蛙
                    { id: 940, weight: 10, levelRange: [8101, 8600] },  // 電海燕
                    { id: 934, weight: 8, levelRange: [8101, 8600] },   // 鹽石巨靈
                    { id: 941, weight: 8, levelRange: [8101, 8600] },   // 大電海燕
                    { id: 943, weight: 8, levelRange: [8101, 8600] },   // 獒教父
                ]
            },
            {
                id: 'paldea_route5',
                name: '東部第一區',
                description: '帕底亞東部的沿海區域',
                levelRange: [8601, 9100],
                pokemon: [
                    { id: 948, weight: 12, levelRange: [8601, 9100] },  // 原野水母
                    { id: 945, weight: 10, levelRange: [8601, 9100] },  // 塗標客
                    { id: 946, weight: 10, levelRange: [8601, 9100] },  // 納噬草
                    { id: 947, weight: 10, levelRange: [8601, 9100] },  // 怖納噬草
                    { id: 949, weight: 10, levelRange: [8601, 9100] },  // 陸地水母
                    { id: 950, weight: 10, levelRange: [8601, 9100] },  // 毛崖蟹
                    { id: 908, weight: 8, levelRange: [8601, 9100] },   // 魔幻假面喵
                    { id: 911, weight: 8, levelRange: [8601, 9100] },   // 骨紋巨聲鱷
                    { id: 914, weight: 8, levelRange: [8601, 9100] },   // 狂歡浪舞鴨
                ]
            },
            {
                id: 'paldea_route6',
                name: '東部第二區',
                description: '帕底亞東部的火山地帶',
                levelRange: [9101, 9600],
                pokemon: [
                    { id: 953, weight: 12, levelRange: [9101, 9600] },  // 蟲滾泥
                    { id: 955, weight: 12, levelRange: [9101, 9600] },  // 飄飄雛
                    { id: 957, weight: 12, levelRange: [9101, 9600] },  // 小鍛匠
                    { id: 951, weight: 10, levelRange: [9101, 9600] },  // 熱辣娃
                    { id: 952, weight: 10, levelRange: [9101, 9600] },  // 狠辣椒
                    { id: 954, weight: 10, levelRange: [9101, 9600] },  // 蟲甲聖
                    { id: 958, weight: 10, levelRange: [9101, 9600] },  // 巧鍛匠
                    { id: 956, weight: 8, levelRange: [9101, 9600] },   // 超能豔鴕
                    { id: 959, weight: 8, levelRange: [9101, 9600] },   // 巨鍛匠
                ]
            },
            {
                id: 'paldea_route7',
                name: '北部第一區',
                description: '帕底亞北部的凍土地帶',
                levelRange: [9601, 10100],
                pokemon: [
                    { id: 960, weight: 12, levelRange: [9601, 10100] },  // 海地鼠
                    { id: 963, weight: 12, levelRange: [9601, 10100] },  // 波普海豚
                    { id: 965, weight: 12, levelRange: [9601, 10100] },  // 噗隆隆
                    { id: 961, weight: 10, levelRange: [9601, 10100] },  // 三海地鼠
                    { id: 962, weight: 10, levelRange: [9601, 10100] },  // 下石鳥
                    { id: 967, weight: 10, levelRange: [9601, 10100] },  // 摩托蜥
                    { id: 968, weight: 10, levelRange: [9601, 10100] },  // 拖拖蚓
                    { id: 964, weight: 8, levelRange: [9601, 10100] },   // 海豚俠
                    { id: 966, weight: 8, levelRange: [9601, 10100] },   // 普隆隆姆
                ]
            },
            {
                id: 'paldea_route8',
                name: '北部第二區',
                description: '帕底亞北部的雪山區域',
                levelRange: [10101, 10600],
                pokemon: [
                    { id: 969, weight: 12, levelRange: [10101, 10600] },  // 晶光芽
                    { id: 971, weight: 12, levelRange: [10101, 10600] },  // 墓仔狗
                    { id: 974, weight: 12, levelRange: [10101, 10600] },  // 走鯨
                    { id: 972, weight: 10, levelRange: [10101, 10600] },  // 墓揚犬
                    { id: 973, weight: 10, levelRange: [10101, 10600] },  // 纏紅鶴
                    { id: 976, weight: 10, levelRange: [10101, 10600] },  // 輕身鱈
                    { id: 970, weight: 8, levelRange: [10101, 10600] },   // 晶光花
                    { id: 975, weight: 8, levelRange: [10101, 10600] },   // 浩大鯨
                    { id: 977, weight: 5, levelRange: [10450, 10600] },   // 吃吼霸
                ]
            },
            {
                id: 'paldea_route9',
                name: '帕底亞大坑洞入口',
                description: '帕底亞中央大坑洞的入口區域',
                levelRange: [10601, 11100],
                pokemon: [
                    { id: 996, weight: 12, levelRange: [10601, 11100] },  // 涼脊龍
                    { id: 978, weight: 10, levelRange: [10601, 11100] },  // 米立龍
                    { id: 980, weight: 10, levelRange: [10601, 11100] },  // 土王
                    { id: 981, weight: 10, levelRange: [10601, 11100] },  // 奇麒麟
                    { id: 982, weight: 10, levelRange: [10601, 11100] },  // 土龍節節
                    { id: 999, weight: 10, levelRange: [10601, 11100] },  // 索財靈
                    { id: 979, weight: 8, levelRange: [10601, 11100] },   // 棄世猴
                    { id: 983, weight: 8, levelRange: [10601, 11100] },   // 僕刀將軍
                    { id: 997, weight: 8, levelRange: [10601, 11100] },   // 凍脊龍
                ]
            },
            {
                id: 'paldea_route10',
                name: '帕底亞大坑洞深處',
                description: '大坑洞的深層區域，古來寶可夢出沒',
                levelRange: [11101, 12000],
                pokemon: [
                    { id: 984, weight: 10, levelRange: [11101, 12000] },  // 雄偉牙（古來種）
                    { id: 985, weight: 10, levelRange: [11101, 12000] },  // 吼叫尾（古來種）
                    { id: 986, weight: 10, levelRange: [11101, 12000] },  // 猛惡菇（古來種）
                    { id: 987, weight: 8, levelRange: [11101, 12000] },   // 振翼發（古來種）
                    { id: 988, weight: 8, levelRange: [11101, 12000] },   // 爬地翅（古來種）
                    { id: 989, weight: 8, levelRange: [11101, 12000] },   // 沙鐵皮（古來種）
                    { id: 998, weight: 5, levelRange: [11400, 12000] },   // 戟脊龍
                    { id: 1000, weight: 2, levelRange: [11400, 12000] },  // 賽富豪
                ]
            },
            {
                id: 'paldea_route11',
                name: '零區深處',
                description: '帕底亞大坑洞最深處，未來種悖論寶可夢出沒',
                levelRange: [12001, 13000],
                pokemon: [
                    { id: 990, weight: 10, levelRange: [12001, 13000] },  // 鐵轍跡（未來種）
                    { id: 991, weight: 10, levelRange: [12001, 13000] },  // 鐵包袱（未來種）
                    { id: 992, weight: 10, levelRange: [12001, 13000] },  // 鐵臂膀（未來種）
                    { id: 993, weight: 10, levelRange: [12001, 13000] },  // 鐵脖頸（未來種）
                    { id: 994, weight: 10, levelRange: [12001, 13000] },  // 鐵毒蛾（未來種）
                    { id: 995, weight: 10, levelRange: [12001, 13000] },  // 鐵荊棘（未來種）
                    { id: 1005, weight: 5, levelRange: [12001, 13000] },  // 轟鳴月
                    { id: 1006, weight: 5, levelRange: [12001, 13000] },  // 鐵武者
                ]
            },
            {
                id: 'paldea_route12',
                name: '災厄之域',
                description: '傳說中四災寶可夢封印之地',
                levelRange: [14001, 15000],
                pokemon: [
                    { id: 1001, weight: 10, levelRange: [14001, 15000] },  // 古簡蝸
                    { id: 1002, weight: 10, levelRange: [14001, 15000] },  // 古劍豹
                    { id: 1003, weight: 10, levelRange: [14001, 15000] },  // 古鼎鹿
                    { id: 1004, weight: 10, levelRange: [14001, 15000] },  // 古玉魚
                    { id: 1009, weight: 8, levelRange: [14001, 15000] },   // 波盪水
                    { id: 1010, weight: 8, levelRange: [14001, 15000] },   // 鐵斑葉
                ]
            },
            {
                id: 'paldea_route13',
                name: '藍莓學園',
                description: 'DLC藍莓學園的特訓區域，新夥伴登場',
                levelRange: [15001, 16000],
                pokemon: [
                    { id: 1012, weight: 12, levelRange: [15001, 16000] },  // 斯魔茶
                    { id: 1011, weight: 10, levelRange: [15001, 16000] },  // 裹蜜蟲
                    { id: 1013, weight: 8, levelRange: [15001, 16000] },   // 來悲粗茶
                    { id: 1014, weight: 8, levelRange: [15001, 16000] },   // 夠贊狗
                    { id: 1015, weight: 8, levelRange: [15001, 16000] },   // 願增猿
                    { id: 1016, weight: 8, levelRange: [15001, 16000] },   // 吉雉雞
                    { id: 1017, weight: 8, levelRange: [15001, 16000] },   // 厄詭椪
                    { id: 1018, weight: 5, levelRange: [15001, 16000] },   // 鋁鋼橋龍
                    { id: 1019, weight: 5, levelRange: [15001, 16000] },   // 蜜集大蛇
                ]
            },
            {
                id: 'paldea_route14',
                name: '傳說之路',
                description: '帕底亞的終極區域，隱藏著最強的傳說寶可夢',
                levelRange: [16001, 17000],
                pokemon: [
                    { id: 1020, weight: 8, levelRange: [16001, 17000] },   // 破空焰
                    { id: 1021, weight: 8, levelRange: [16001, 17000] },   // 猛雷鼓
                    { id: 1022, weight: 8, levelRange: [16001, 17000] },   // 鐵磐巖
                    { id: 1023, weight: 8, levelRange: [16001, 17000] },   // 鐵頭殼
                    { id: 1024, weight: 5, levelRange: [16001, 17000] },   // 太樂巴戈斯
                    { id: 1025, weight: 5, levelRange: [16001, 17000] },   // 桃歹郎
                    { id: 1007, weight: 1, levelRange: [17000, 17000] },   // 故勒頓
                    { id: 1008, weight: 1, levelRange: [17000, 17000] },   // 密勒頓
                ]
            },
        ]
    },

    // ===================== 第10地區: Mega進化地區 (ID 1026-1073) =====================
    mega: {
        id: 'mega',
        name: 'Mega進化地區',
        nameEn: 'Mega Evolution',
        description: '超越極限的Mega進化之地，經典Mega寶可夢聚集於此。需完成帕底亞圖鑑方可進入。完成 Mega 圖鑑可獲得徽章，使不在隊伍中的圖鑑寶可夢所獲經驗提高 50%。',
        unlockCondition: { type: 'pokedex_complete', region: 'paldea', range: [906, 1025] },
        routes: [
            {
                id: 'mega_route1',
                name: 'Mega覺醒之路',
                description: '初代Mega進化的覺醒之地，關都初始御三家和蟲系Mega匯聚於此',
                levelRange: [17001, 18500],
                pokemon: [
                    { id: 1026, weight: 12, levelRange: [17001, 18500] },  // Mega妙蛙花
                    { id: 1029, weight: 12, levelRange: [17001, 18500] },  // Mega水箭龜
                    { id: 1027, weight: 10, levelRange: [17001, 18500] },  // Mega噴火龍X
                    { id: 1028, weight: 10, levelRange: [17001, 18500] },  // Mega噴火龍Y
                    { id: 1030, weight: 10, levelRange: [17001, 18500] },  // Mega大針蜂
                    { id: 1031, weight: 10, levelRange: [17001, 18500] },  // Mega大比鳥
                    { id: 1032, weight: 10, levelRange: [17001, 18500] },  // Mega胡地
                    { id: 1033, weight: 10, levelRange: [17001, 18500] },  // Mega呆殼獸
                    { id: 1034, weight: 8, levelRange: [17001, 18500] },   // Mega耿鬼
                    { id: 1035, weight: 8, levelRange: [17001, 18500] },   // Mega袋獸
                ]
            },
            {
                id: 'mega_route2',
                name: 'Mega進化之森',
                description: '暗藏強大Mega力量的森林，關都後期Mega寶可夢出沒',
                levelRange: [18501, 20000],
                pokemon: [
                    { id: 1043, weight: 12, levelRange: [18501, 20000] },  // Mega巨鉗螳螂
                    { id: 1044, weight: 12, levelRange: [18501, 20000] },  // Mega赫拉克羅斯
                    { id: 1036, weight: 10, levelRange: [18501, 20000] },  // Mega大甲
                    { id: 1037, weight: 10, levelRange: [18501, 20000] },  // Mega暴鯉龍
                    { id: 1038, weight: 10, levelRange: [18501, 20000] },  // Mega化石翼龍
                    { id: 1041, weight: 10, levelRange: [18501, 20000] },  // Mega電龍
                    { id: 1042, weight: 10, levelRange: [18501, 20000] },  // Mega大鋼蛇
                    { id: 1045, weight: 10, levelRange: [18501, 20000] },  // Mega黑魯加
                    { id: 1039, weight: 5, levelRange: [19000, 20000] },   // Mega超夢X
                    { id: 1040, weight: 5, levelRange: [19000, 20000] },   // Mega超夢Y
                ]
            },
            {
                id: 'mega_route3',
                name: 'Mega岩漿峽谷',
                description: '城都與豐緣強力Mega寶可夢棲息的灼熱峽谷',
                levelRange: [20001, 21500],
                pokemon: [
                    { id: 1051, weight: 12, levelRange: [20001, 21500] },  // Mega勾魂眼
                    { id: 1052, weight: 12, levelRange: [20001, 21500] },  // Mega大嘴娃
                    { id: 1047, weight: 10, levelRange: [20001, 21500] },  // Mega蜥蜴王
                    { id: 1048, weight: 10, levelRange: [20001, 21500] },  // Mega火焰雞
                    { id: 1049, weight: 10, levelRange: [20001, 21500] },  // Mega巨沼怪
                    { id: 1050, weight: 10, levelRange: [20001, 21500] },  // Mega沙奈朵
                    { id: 1053, weight: 10, levelRange: [20001, 21500] },  // Mega波士可多拉
                    { id: 1054, weight: 10, levelRange: [20001, 21500] },  // Mega恰雷姆
                    { id: 1046, weight: 8, levelRange: [20001, 21500] },   // Mega班基拉斯
                ]
            },
            {
                id: 'mega_route4',
                name: 'Mega暴風海域',
                description: '豐緣Mega後半部隊駐守的狂風暴雨海域',
                levelRange: [21501, 23000],
                pokemon: [
                    { id: 1055, weight: 10, levelRange: [21501, 23000] },  // Mega雷電獸
                    { id: 1056, weight: 10, levelRange: [21501, 23000] },  // Mega巨牙鯊
                    { id: 1057, weight: 10, levelRange: [21501, 23000] },  // Mega噴火駝
                    { id: 1058, weight: 10, levelRange: [21501, 23000] },  // Mega七夕青鳥
                    { id: 1059, weight: 10, levelRange: [21501, 23000] },  // Mega詛咒娃娃
                    { id: 1060, weight: 10, levelRange: [21501, 23000] },  // Mega阿勃梭魯
                    { id: 1061, weight: 10, levelRange: [21501, 23000] },  // Mega冰鬼護
                    { id: 1062, weight: 8, levelRange: [21501, 23000] },   // Mega暴飛龍
                    { id: 1063, weight: 8, levelRange: [21501, 23000] },   // Mega巨金怪
                    { id: 1064, weight: 7, levelRange: [21501, 23000] },   // Mega拉帝亞斯
                ]
            },
            {
                id: 'mega_route5',
                name: 'Mega極光冰原',
                description: '傳說級Mega寶可夢與神奧Mega聚集的極寒之地',
                levelRange: [23001, 24500],
                pokemon: [
                    { id: 1070, weight: 12, levelRange: [23001, 24500] },  // Mega雪暴王
                    { id: 1072, weight: 12, levelRange: [23001, 24500] },  // Mega差不多娃娃
                    { id: 1067, weight: 12, levelRange: [23001, 24500] },  // Mega長耳兔
                    { id: 1071, weight: 10, levelRange: [23001, 24500] },  // Mega艾路雷朵
                    { id: 1068, weight: 8, levelRange: [23001, 24500] },   // Mega烈咬陸鯊
                    { id: 1069, weight: 8, levelRange: [23001, 24500] },   // Mega路卡利歐
                    { id: 1073, weight: 8, levelRange: [23001, 24500] },   // Mega蒂安希
                    { id: 1065, weight: 7, levelRange: [23001, 24500] },   // Mega拉帝歐斯
                    { id: 1066, weight: 3, levelRange: [24000, 24500] },   // Mega裂空座
                ]
            },
        ]
    }
};
