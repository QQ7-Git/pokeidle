// ============================================================
// 地區與道路資料 - 等級逐步提升，無重疊；野生等級不設全域上限
// ============================================================
//
// 【道路等級規則】（新增地區時請參考）
//
//  地區序號 | 地區名稱 | 道路數 | 等級範圍
//  ---------|----------|--------|----------------
// 1 | 關都 | 27? | 1 - 91
// 2 | 城都 | 23? | 92 - 201
// 3 | 豐緣 | 24? | 202 - 442
// 4 | 神奧 | 24? | 443 - 763
// 5 | 合眾 | 23? | 764 - 1149
// 6 | 卡洛斯 | 23? | 1150 - 1614
// 7 | 阿羅拉 | 14? | 1615 - 2410
// 8 | 伽勒爾 | 15? | 2411 - 4419
// 9 | 帕底亞 | 14? | 4420 - 11380
// 10 | Mega進化 | 5? | 11381 - 17999
//
// 規則說明：
//   - 關都至帕底亞依原始道路等級比例縮放，帕底亞最高約 11380 級。
//   - Mega 從 11381 級平滑延伸至 17999 級，之後可挑戰極限對戰塔。
//   - 野生等級沒有全域上限；17999 級只是目前 Mega 區的終點。
//   - 每條道路等級範圍不重疊；遭遇寶可夢等級範圍維持在道路範圍內。
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
                levelRange: [1, 4],
                pokemon: [
                    { id: 19, weight: 55, levelRange: [1, 3] },  // 小拉達
                    { id: 16, weight: 45, levelRange: [1, 4] },  // 波波
                ]
            },
            {
                id: 'kanto_route2',
                name: '2號道路',
                description: '常磐市到常磐森林之間的道路',
                levelRange: [5, 7],
                pokemon: [
                    { id: 16, weight: 30, levelRange: [5, 7] },  // 波波
                    { id: 19, weight: 30, levelRange: [5, 7] },  // 小拉達
                    { id: 10, weight: 20, levelRange: [5, 7] },  // 綠毛蟲
                    { id: 13, weight: 20, levelRange: [5, 7] },  // 獨角蟲
                ]
            },
            {
                id: 'kanto_viridian_forest',
                name: '常磐森林',
                description: '一片茂密的森林，蟲系寶可夢的天堂',
                levelRange: [8, 10],
                pokemon: [
                    { id: 10, weight: 25, levelRange: [8, 10] },  // 綠毛蟲
                    { id: 13, weight: 25, levelRange: [8, 10] },  // 獨角蟲
                    { id: 46, weight: 25, levelRange: [8, 10] },  // 派拉斯
                    { id: 11, weight: 10, levelRange: [8, 10] },  // 鐵甲蛹
                    { id: 14, weight: 10, levelRange: [8, 10] },  // 鐵殼蛹
                    { id: 25, weight: 5, levelRange: [8, 10] },   // 皮卡丘（稀有）
                ]
            },
            {
                id: 'kanto_route3',
                name: '3號道路',
                description: '尼比市到月見山之間的道路',
                levelRange: [11, 14],
                pokemon: [
                    { id: 21, weight: 30, levelRange: [11, 14] }, // 烈雀
                    { id: 27, weight: 20, levelRange: [11, 14] }, // 穿山鼠
                    { id: 32, weight: 20, levelRange: [11, 14] }, // 尼多朗
                    { id: 29, weight: 20, levelRange: [11, 14] }, // 尼多蘭
                    { id: 39, weight: 10, levelRange: [11, 14] },  // 胖丁
                ]
            },
            {
                id: 'kanto_mt_moon',
                name: '月見山',
                description: '連線尼比市和華藍市的山洞',
                levelRange: [15, 17],
                pokemon: [
                    { id: 41, weight: 35, levelRange: [15, 17] }, // 超音蝠
                    { id: 74, weight: 25, levelRange: [15, 17] }, // 小拳石
                    { id: 46, weight: 15, levelRange: [15, 17] }, // 派拉斯
                    { id: 27, weight: 15, levelRange: [15, 17] }, // 穿山鼠
                    { id: 35, weight: 10, levelRange: [15, 17] }, // 皮皮（稀有）
                ]
            },
            {
                id: 'kanto_route4',
                name: '4號道路',
                description: '月見山到華藍市之間的道路',
                levelRange: [18, 20],
                pokemon: [
                    { id: 21, weight: 25, levelRange: [18, 20] },  // 烈雀
                    { id: 23, weight: 20, levelRange: [18, 20] },  // 阿柏蛇
                    { id: 27, weight: 20, levelRange: [18, 20] },  // 穿山鼠
                    { id: 56, weight: 20, levelRange: [18, 20] },  // 猴怪
                    { id: 48, weight: 15, levelRange: [18, 20] },  // 毛球
                ]
            },
            {
                id: 'kanto_route24',
                name: '24號道路 (黃金橋)',
                description: '華藍市北方的著名橋樑',
                levelRange: [21, 24],
                pokemon: [
                    { id: 43, weight: 25, levelRange: [21, 24] }, // 走路草
                    { id: 69, weight: 25, levelRange: [21, 24] }, // 喇叭芽
                    { id: 16, weight: 20, levelRange: [21, 24] }, // 波波
                    { id: 10, weight: 15, levelRange: [21, 24] }, // 綠毛蟲
                    { id: 63, weight: 15, levelRange: [21, 24] }, // 凱西
                ]
            },
            {
                id: 'kanto_route5',
                name: '5號道路',
                description: '華藍市到金黃市之間的道路',
                levelRange: [25, 27],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [25, 27] }, // 喵喵
                    { id: 43, weight: 25, levelRange: [25, 27] }, // 走路草
                    { id: 16, weight: 20, levelRange: [25, 27] }, // 波波
                    { id: 56, weight: 12, levelRange: [25, 27] }, // 猴怪
                    { id: 63, weight: 12, levelRange: [25, 27] }, // 凱西
                    { id: 1, weight: 6, levelRange: [25, 27] },   // 妙蛙種子（稀有）
                ]
            },
            {
                id: 'kanto_route6',
                name: '6號道路',
                description: '金黃市到枯葉市之間的道路',
                levelRange: [28, 30],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [28, 30] }, // 喵喵
                    { id: 69, weight: 25, levelRange: [28, 30] }, // 喇叭芽
                    { id: 16, weight: 18, levelRange: [28, 30] }, // 波波
                    { id: 56, weight: 13, levelRange: [28, 30] }, // 猴怪
                    { id: 63, weight: 13, levelRange: [28, 30] }, // 凱西
                    { id: 7, weight: 6, levelRange: [28, 30] },   // 傑尼龜（稀有）
                ]
            },
            {
                id: 'kanto_route9',
                name: '9號道路',
                description: '華藍市到巖山隧道的崎嶇山路',
                levelRange: [31, 34],
                pokemon: [
                    { id: 21, weight: 25, levelRange: [31, 34] }, // 烈雀
                    { id: 19, weight: 20, levelRange: [31, 34] }, // 小拉達
                    { id: 23, weight: 20, levelRange: [31, 34] }, // 阿柏蛇
                    { id: 48, weight: 20, levelRange: [31, 34] }, // 毛球
                    { id: 100, weight: 15, levelRange: [31, 34] }, // 霹靂電球
                ]
            },
            {
                id: 'kanto_rock_tunnel',
                name: '巖山隧道',
                description: '漆黑的岩石隧道，連線華藍市和紫苑鎮',
                levelRange: [35, 37],
                pokemon: [
                    { id: 41, weight: 25, levelRange: [35, 37] }, // 超音蝠
                    { id: 74, weight: 25, levelRange: [35, 37] }, // 小拳石
                    { id: 66, weight: 20, levelRange: [35, 37] }, // 腕力
                    { id: 104, weight: 20, levelRange: [35, 37] }, // 卡拉卡拉
                    { id: 95, weight: 10, levelRange: [35, 37] }, // 大巖蛇
                ]
            },
            {
                id: 'kanto_route7',
                name: '7號道路',
                description: '金黃市到彩虹市之間的短道路',
                levelRange: [38, 40],
                pokemon: [
                    { id: 52, weight: 25, levelRange: [38, 40] }, // 喵喵
                    { id: 37, weight: 20, levelRange: [38, 40] }, // 六尾
                    { id: 58, weight: 20, levelRange: [38, 40] }, // 卡蒂狗
                    { id: 43, weight: 17, levelRange: [38, 40] }, // 走路草
                    { id: 17, weight: 12, levelRange: [38, 40] }, // 比比鳥
                    { id: 4, weight: 6, levelRange: [38, 40] },   // 小火龍（稀有）
                ]
            },
            {
                id: 'kanto_route8',
                name: '8號道路',
                description: '金黃市到紫苑鎮之間的道路',
                levelRange: [41, 44],
                pokemon: [
                    { id: 96, weight: 25, levelRange: [41, 44] }, // 催眠貘
                    { id: 37, weight: 20, levelRange: [41, 44] }, // 六尾
                    { id: 58, weight: 20, levelRange: [41, 44] }, // 卡蒂狗
                    { id: 69, weight: 15, levelRange: [41, 44] }, // 喇叭芽
                    { id: 25, weight: 15, levelRange: [41, 44] }, // 皮卡丘
                    { id: 122, weight: 5, levelRange: [41, 44] }, // 魔牆人偶（稀有）
                ]
            },
            {
                id: 'kanto_pokemon_tower',
                name: '寶可夢塔',
                description: '紫苑鎮的靈魂安息之所',
                levelRange: [45, 47],
                pokemon: [
                    { id: 92, weight: 35, levelRange: [45, 47] }, // 鬼斯
                    { id: 104, weight: 25, levelRange: [45, 47] }, // 卡拉卡拉
                    { id: 41, weight: 25, levelRange: [45, 47] }, // 超音蝠
                    { id: 93, weight: 15, levelRange: [45, 47] }, // 鬼斯通
                ]
            },
            {
                id: 'kanto_route10',
                name: '10號道路',
                description: '巖山隧道入口和無人發電廠附近',
                levelRange: [48, 51],
                pokemon: [
                    { id: 100, weight: 30, levelRange: [48, 51] }, // 霹靂電球
                    { id: 81, weight: 28, levelRange: [48, 51] },  // 小磁怪
                    { id: 21, weight: 20, levelRange: [48, 51] },  // 烈雀
                    { id: 23, weight: 15, levelRange: [48, 51] },  // 阿柏蛇
                    { id: 125, weight: 6, levelRange: [48, 51] },  // 電擊獸（稀有）
                    { id: 145, weight: 3, levelRange: [51, 51] },  // 閃電鳥（傳說）
                ]
            },
            {
                id: 'kanto_route11',
                name: '11號道路',
                description: '枯葉市東方的道路',
                levelRange: [52, 54],
                pokemon: [
                    { id: 23, weight: 25, levelRange: [52, 54] }, // 阿柏蛇
                    { id: 84, weight: 20, levelRange: [52, 54] }, // 嘟嘟
                    { id: 50, weight: 20, levelRange: [52, 54] }, // 地鼠
                    { id: 96, weight: 15, levelRange: [52, 54] }, // 催眠貘
                    { id: 19, weight: 15, levelRange: [52, 54] }, // 小拉達
                    { id: 138, weight: 5, levelRange: [52, 54] },  // 菊石獸（稀有）
                ]
            },
            {
                id: 'kanto_route12',
                name: '12號道路',
                description: '枯葉市到紫苑鎮的海邊道路',
                levelRange: [55, 57],
                pokemon: [
                    { id: 79, weight: 30, levelRange: [55, 57] }, // 呆呆獸
                    { id: 129, weight: 25, levelRange: [55, 57] }, // 鯉魚王
                    { id: 48, weight: 20, levelRange: [55, 57] }, // 毛球
                    { id: 72, weight: 15, levelRange: [55, 57] }, // 瑪瑙水母
                    { id: 83, weight: 7, levelRange: [55, 57] },  // 大蔥鴨（稀有）
                    { id: 143, weight: 3, levelRange: [57, 57] }, // 卡比獸（稀有）
                ]
            },
            {
                id: 'kanto_route13',
                name: '13號道路',
                description: '連線紫苑鎮和淺紅市的道路',
                levelRange: [58, 61],
                pokemon: [
                    { id: 43, weight: 20, levelRange: [58, 61] }, // 走路草
                    { id: 69, weight: 20, levelRange: [58, 61] }, // 喇叭芽
                    { id: 54, weight: 20, levelRange: [58, 61] }, // 可達鴨
                    { id: 17, weight: 20, levelRange: [58, 61] }, // 比比鳥
                    { id: 84, weight: 15, levelRange: [58, 61] }, // 嘟嘟
                    { id: 133, weight: 5, levelRange: [58, 61] },  // 伊布（稀有）
                ]
            },
            {
                id: 'kanto_safari_zone',
                name: '狩獵區',
                description: '淺紅市的大型自然保護區',
                levelRange: [62, 64],
                pokemon: [
                    { id: 114, weight: 13, levelRange: [62, 64] }, // 蔓藤怪
                    { id: 29, weight: 12, levelRange: [62, 64] },  // 尼多蘭
                    { id: 32, weight: 12, levelRange: [62, 64] },  // 尼多朗
                    { id: 102, weight: 12, levelRange: [62, 64] }, // 蛋蛋
                    { id: 111, weight: 10, levelRange: [62, 64] }, // 獨角犀牛
                    { id: 123, weight: 10, levelRange: [62, 64] }, // 飛天螳螂
                    { id: 127, weight: 10, levelRange: [62, 64] }, // 凱羅斯
                    { id: 115, weight: 8, levelRange: [62, 64] },  // 袋獸
                    { id: 128, weight: 8, levelRange: [62, 64] },  // 肯泰羅
                    { id: 113, weight: 5, levelRange: [62, 64] },  // 吉利蛋
                ]
            },
            {
                id: 'kanto_route17',
                name: '17號道路 (腳踏車道)',
                description: '從金黃市到淺紅市的下坡道路',
                levelRange: [65, 67],
                pokemon: [
                    { id: 84, weight: 20, levelRange: [65, 67] }, // 嘟嘟
                    { id: 50, weight: 20, levelRange: [65, 67] }, // 地鼠
                    { id: 20, weight: 20, levelRange: [65, 67] }, // 拉達
                    { id: 88, weight: 20, levelRange: [65, 67] }, // 臭泥
                    { id: 109, weight: 15, levelRange: [65, 67] }, // 瓦斯彈
                    { id: 140, weight: 5, levelRange: [65, 67] }, // 化石盔（稀有）
                ]
            },
            {
                id: 'kanto_route19',
                name: '19號水道',
                description: '淺紅市到雙子島的海上道路',
                levelRange: [68, 71],
                pokemon: [
                    { id: 72, weight: 30, levelRange: [68, 71] }, // 瑪瑙水母
                    { id: 116, weight: 20, levelRange: [68, 71] }, // 墨海馬
                    { id: 60, weight: 20, levelRange: [68, 71] }, // 蚊香蝌蚪
                    { id: 120, weight: 15, levelRange: [68, 71] }, // 海星星
                    { id: 86, weight: 15, levelRange: [68, 71] }, // 小海獅
                ]
            },
            {
                id: 'kanto_seafoam_islands',
                name: '雙子島',
                description: '傳說中急凍鳥棲息的冰冷洞窟',
                levelRange: [72, 74],
                pokemon: [
                    { id: 86, weight: 25, levelRange: [72, 74] }, // 小海獅
                    { id: 90, weight: 25, levelRange: [72, 74] }, // 大舌貝
                    { id: 98, weight: 20, levelRange: [72, 74] }, // 大鉗蟹
                    { id: 87, weight: 15, levelRange: [72, 74] }, // 白海獅
                    { id: 131, weight: 8, levelRange: [72, 74] }, // 拉普拉斯（稀有）
                    { id: 124, weight: 6, levelRange: [72, 74] }, // 迷唇姐（稀有）
                    { id: 144, weight: 3, levelRange: [74, 74] }, // 急凍鳥（傳說）
                ]
            },
            {
                id: 'kanto_pokemon_mansion',
                name: '寶可夢屋',
                description: '紅蓮島上的廢棄大宅，曾經的研究所',
                levelRange: [75, 77],
                pokemon: [
                    { id: 77, weight: 25, levelRange: [75, 77] }, // 小火馬
                    { id: 58, weight: 20, levelRange: [75, 77] }, // 卡蒂狗
                    { id: 109, weight: 20, levelRange: [75, 77] }, // 瓦斯彈
                    { id: 132, weight: 20, levelRange: [75, 77] }, // 百變怪
                    { id: 108, weight: 8, levelRange: [75, 77] }, // 大舌頭（稀有）
                    { id: 126, weight: 7, levelRange: [75, 77] }, // 鴨嘴火獸（稀有）
                ]
            },
            {
                id: 'kanto_route21',
                name: '21號水道',
                description: '紅蓮島到真新鎮之間的海上道路',
                levelRange: [78, 81],
                pokemon: [
                    { id: 72, weight: 25, levelRange: [78, 81] }, // 瑪瑙水母
                    { id: 129, weight: 20, levelRange: [78, 81] }, // 鯉魚王
                    { id: 116, weight: 15, levelRange: [78, 81] }, // 墨海馬
                    { id: 118, weight: 15, levelRange: [78, 81] }, // 角金魚
                    { id: 90, weight: 15, levelRange: [78, 81] }, // 大舌貝
                    { id: 73, weight: 10, levelRange: [78, 81] }, // 毒刺水母
                ]
            },
            {
                id: 'kanto_route22',
                name: '22號道路',
                description: '常磐市到冠軍之路入口',
                levelRange: [82, 84],
                pokemon: [
                    { id: 21, weight: 20, levelRange: [82, 84] }, // 烈雀
                    { id: 56, weight: 20, levelRange: [82, 84] }, // 猴怪
                    { id: 19, weight: 15, levelRange: [82, 84] }, // 小拉達
                    { id: 29, weight: 15, levelRange: [82, 84] }, // 尼多蘭
                    { id: 32, weight: 15, levelRange: [82, 84] }, // 尼多朗
                    { id: 50, weight: 15, levelRange: [82, 84] }, // 地鼠
                ]
            },
            {
                id: 'kanto_victory_road',
                name: '冠軍之路',
                description: '通往石英高原的最後試煉',
                levelRange: [85, 87],
                pokemon: [
                    { id: 67, weight: 27, levelRange: [85, 87] }, // 豪力
                    { id: 75, weight: 27, levelRange: [85, 87] }, // 隆隆石
                    { id: 95, weight: 23, levelRange: [85, 87] }, // 大巖蛇
                    { id: 106, weight: 8, levelRange: [85, 87] }, // 飛腿郎（稀有）
                    { id: 107, weight: 8, levelRange: [85, 87] }, // 快拳郎（稀有）
                    { id: 142, weight: 6, levelRange: [85, 87] }, // 化石翼龍（稀有）
                    { id: 146, weight: 3, levelRange: [87, 87] }, // 火焰鳥（傳說）
                ]
            },
            {
                id: 'kanto_cerulean_cave',
                name: '華藍洞窟',
                description: '傳說中最強寶可夢棲息的神秘洞窟',
                levelRange: [88, 91],
                pokemon: [
                    { id: 64, weight: 28, levelRange: [88, 91] },  // 勇基拉
                    { id: 147, weight: 25, levelRange: [88, 91] }, // 迷你龍
                    { id: 82, weight: 22, levelRange: [88, 91] },  // 三合一磁怪
                    { id: 137, weight: 14, levelRange: [88, 91] }, // 多邊獸（稀有）
                    { id: 149, weight: 8, levelRange: [88, 91] },  // 快龍（稀有）
                    { id: 150, weight: 2, levelRange: [91, 91] },  // 超夢（傳說）
                    { id: 151, weight: 1, levelRange: [91, 91] },  // 夢幻（幻之寶可夢）
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
                levelRange: [92, 94],
                pokemon: [
                    { id: 161, weight: 35, levelRange: [92, 94] },  // 尾立
                    { id: 163, weight: 30, levelRange: [92, 94] },  // 咕咕
                    { id: 187, weight: 20, levelRange: [92, 94] },  // 毽子草
                    { id: 172, weight: 15, levelRange: [92, 94] },  // 皮丘
                ]
            },
            {
                id: 'johto_route30',
                name: '30號道路',
                description: '吉花市到桔梗市之間的道路',
                levelRange: [95, 97],
                pokemon: [
                    { id: 165, weight: 25, levelRange: [95, 97] },  // 芭瓢蟲
                    { id: 167, weight: 25, levelRange: [95, 97] },  // 圓絲蛛
                    { id: 161, weight: 20, levelRange: [95, 97] },  // 尾立
                    { id: 175, weight: 10, levelRange: [95, 97] },  // 波克比
                    { id: 173, weight: 10, levelRange: [95, 97] },  // 皮寶寶
                    { id: 174, weight: 10, levelRange: [95, 97] },  // 寶寶丁
                ]
            },
            {
                id: 'johto_sprout_tower',
                name: '喇叭芽之塔',
                description: '桔梗市中供奉喇叭芽的古塔',
                levelRange: [98, 101],
                pokemon: [
                    { id: 92, weight: 25, levelRange: [98, 101] },   // 鬼斯
                    { id: 69, weight: 20, levelRange: [98, 101] },   // 喇叭芽
                    { id: 177, weight: 20, levelRange: [98, 101] },  // 天然雀
                    { id: 163, weight: 15, levelRange: [98, 101] },  // 咕咕
                    { id: 201, weight: 10, levelRange: [98, 101] },  // 未知圖騰
                    { id: 200, weight: 10, levelRange: [98, 101] },  // 夢妖
                ]
            },
            {
                id: 'johto_route32',
                name: '32號道路',
                description: '桔梗市到聯合洞穴的長道路',
                levelRange: [102, 104],
                pokemon: [
                    { id: 179, weight: 28, levelRange: [102, 104] },  // 咩利羊
                    { id: 194, weight: 22, levelRange: [102, 104] },  // 烏波
                    { id: 187, weight: 20, levelRange: [102, 104] },  // 毽子草
                    { id: 190, weight: 15, levelRange: [102, 104] },  // 長尾怪手
                    { id: 206, weight: 10, levelRange: [102, 104] },  // 土龍弟弟
                    { id: 152, weight: 5, levelRange: [102, 104] },   // 菊草葉（稀有）
                ]
            },
            {
                id: 'johto_union_cave',
                name: '聯合洞穴',
                description: '連線桔梗市和滿金市的自然洞穴',
                levelRange: [105, 107],
                pokemon: [
                    { id: 74, weight: 25, levelRange: [105, 107] },   // 小拳石
                    { id: 194, weight: 18, levelRange: [105, 107] },  // 烏波
                    { id: 204, weight: 18, levelRange: [105, 107] },  // 榛果球
                    { id: 231, weight: 15, levelRange: [105, 107] },  // 小小象
                    { id: 95, weight: 12, levelRange: [105, 107] },   // 大巖蛇
                    { id: 236, weight: 12, levelRange: [105, 107] },  // 無畏小子
                ]
            },
            {
                id: 'johto_route34',
                name: '34號道路',
                description: '滿金市南方的道路',
                levelRange: [108, 111],
                pokemon: [
                    { id: 183, weight: 22, levelRange: [108, 111] },  // 瑪力露
                    { id: 209, weight: 22, levelRange: [108, 111] },  // 布魯
                    { id: 191, weight: 18, levelRange: [108, 111] },  // 向日種子
                    { id: 203, weight: 18, levelRange: [108, 111] },  // 麒麟奇
                    { id: 185, weight: 15, levelRange: [108, 111] },  // 胡說樹
                    { id: 155, weight: 5, levelRange: [108, 111] },   // 火球鼠（稀有）
                ]
            },
            {
                id: 'johto_national_park',
                name: '自然公園',
                description: '滿金市北方的蟲系寶可夢樂園',
                levelRange: [112, 114],
                pokemon: [
                    { id: 165, weight: 25, levelRange: [112, 114] },  // 芭瓢蟲
                    { id: 193, weight: 20, levelRange: [112, 114] },  // 蜻蜻蜓
                    { id: 123, weight: 15, levelRange: [112, 114] },  // 飛天螳螂
                    { id: 127, weight: 15, levelRange: [112, 114] },  // 凱羅斯
                    { id: 214, weight: 15, levelRange: [112, 114] },  // 赫拉克羅斯
                    { id: 213, weight: 10, levelRange: [112, 114] },  // 壺壺（稀有）
                ]
            },
            {
                id: 'johto_route35',
                name: '35號道路',
                description: '滿金市到圓朱市的道路',
                levelRange: [115, 117],
                pokemon: [
                    { id: 190, weight: 20, levelRange: [115, 117] },  // 長尾怪手
                    { id: 216, weight: 20, levelRange: [115, 117] },  // 熊寶寶
                    { id: 198, weight: 20, levelRange: [115, 117] },  // 黑暗鴉
                    { id: 234, weight: 15, levelRange: [115, 117] },  // 驚角鹿
                    { id: 202, weight: 15, levelRange: [115, 117] },  // 果然翁
                    { id: 235, weight: 10, levelRange: [115, 117] },  // 圖圖犬（稀有）
                ]
            },
            {
                id: 'johto_burned_tower',
                name: '焚燒塔',
                description: '圓朱市中被燒燬的古塔，傳說中三聖獸在此誕生',
                levelRange: [118, 121],
                pokemon: [
                    { id: 92, weight: 25, levelRange: [118, 121] },   // 鬼斯
                    { id: 200, weight: 20, levelRange: [118, 121] },  // 夢妖
                    { id: 93, weight: 18, levelRange: [118, 121] },   // 鬼斯通
                    { id: 228, weight: 17, levelRange: [118, 121] },  // 戴魯比
                    { id: 218, weight: 15, levelRange: [118, 121] },  // 熔岩蟲
                    { id: 158, weight: 5, levelRange: [118, 121] },   // 小鋸鱷（稀有）
                ]
            },
            {
                id: 'johto_route38',
                name: '38號道路',
                description: '圓朱市到淺黃市的道路',
                levelRange: [122, 124],
                pokemon: [
                    { id: 58, weight: 20, levelRange: [122, 124] },   // 卡蒂狗
                    { id: 52, weight: 20, levelRange: [122, 124] },   // 喵喵
                    { id: 128, weight: 15, levelRange: [122, 124] },  // 肯泰羅
                    { id: 241, weight: 15, levelRange: [122, 124] },  // 大奶罐
                    { id: 164, weight: 15, levelRange: [122, 124] },  // 貓頭夜鷹
                    { id: 162, weight: 15, levelRange: [122, 124] },  // 大尾立
                ]
            },
            {
                id: 'johto_route40',
                name: '40號水道',
                description: '淺黃市到漩渦列島的海上道路',
                levelRange: [125, 128],
                pokemon: [
                    { id: 72, weight: 25, levelRange: [125, 128] },   // 瑪瑙水母
                    { id: 222, weight: 20, levelRange: [125, 128] },  // 太陽珊瑚
                    { id: 223, weight: 20, levelRange: [125, 128] },  // 鐵炮魚
                    { id: 170, weight: 20, levelRange: [125, 128] },  // 燈籠魚
                    { id: 211, weight: 10, levelRange: [125, 128] },  // 千針魚
                    { id: 226, weight: 5, levelRange: [125, 128] },   // 巨翅飛魚（稀有）
                ]
            },
            {
                id: 'johto_route42',
                name: '42號道路',
                description: '滿金市到阿馹山區的道路',
                levelRange: [129, 131],
                pokemon: [
                    { id: 207, weight: 22, levelRange: [129, 131] },  // 天蠍
                    { id: 215, weight: 20, levelRange: [129, 131] },  // 狃拉
                    { id: 227, weight: 15, levelRange: [129, 131] },  // 盔甲鳥
                    { id: 238, weight: 15, levelRange: [129, 131] },  // 迷唇娃
                    { id: 240, weight: 15, levelRange: [129, 131] },  // 小鴨嘴龍
                    { id: 239, weight: 13, levelRange: [129, 131] },  // 電擊怪
                ]
            },
            {
                id: 'johto_route43',
                name: '43號道路',
                description: '通往憤怒之湖的道路',
                levelRange: [132, 134],
                pokemon: [
                    { id: 23, weight: 18, levelRange: [132, 134] },   // 阿柏蛇
                    { id: 96, weight: 18, levelRange: [132, 134] },   // 催眠貘
                    { id: 129, weight: 18, levelRange: [132, 134] },  // 鯉魚王
                    { id: 234, weight: 16, levelRange: [132, 134] },  // 驚角鹿
                    { id: 164, weight: 15, levelRange: [132, 134] },  // 貓頭夜鷹
                    { id: 198, weight: 15, levelRange: [132, 134] },  // 黑暗鴉
                ]
            },
            {
                id: 'johto_lake_of_rage',
                name: '憤怒之湖',
                description: '傳說中紅色暴鯉龍出沒的湖泊',
                levelRange: [135, 141],
                pokemon: [
                    { id: 129, weight: 28, levelRange: [135, 141] },  // 鯉魚王
                    { id: 118, weight: 18, levelRange: [135, 141] },  // 角金魚
                    { id: 183, weight: 15, levelRange: [135, 141] },  // 瑪力露
                    { id: 195, weight: 15, levelRange: [135, 141] },  // 沼王
                    { id: 130, weight: 12, levelRange: [135, 141] },  // 暴鯉龍
                    { id: 119, weight: 12, levelRange: [135, 141] },  // 金魚王
                ]
            },
            {
                id: 'johto_route44',
                name: '44號道路',
                description: '通往冰之通道的寒冷道路',
                levelRange: [142, 148],
                pokemon: [
                    { id: 220, weight: 25, levelRange: [142, 148] },  // 小山豬
                    { id: 216, weight: 20, levelRange: [142, 148] },  // 熊寶寶
                    { id: 215, weight: 18, levelRange: [142, 148] },  // 狃拉
                    { id: 207, weight: 17, levelRange: [142, 148] },  // 天蠍
                    { id: 178, weight: 12, levelRange: [142, 148] },  // 天然鳥
                    { id: 176, weight: 8, levelRange: [142, 148] },   // 波克基古（稀有）
                ]
            },
            {
                id: 'johto_ice_path',
                name: '冰之通道',
                description: '連線滿金和淺黃的冰冷洞穴',
                levelRange: [149, 154],
                pokemon: [
                    { id: 220, weight: 25, levelRange: [149, 154] },  // 小山豬
                    { id: 86, weight: 20, levelRange: [149, 154] },   // 小海獅
                    { id: 221, weight: 15, levelRange: [149, 154] },  // 長毛豬
                    { id: 225, weight: 15, levelRange: [149, 154] },  // 信使鳥
                    { id: 124, weight: 13, levelRange: [149, 154] },  // 迷唇姐
                    { id: 87, weight: 12, levelRange: [149, 154] },   // 白海獅
                ]
            },
            {
                id: 'johto_route45',
                name: '45號道路',
                description: '黑暗市南方的陡峭山路',
                levelRange: [155, 161],
                pokemon: [
                    { id: 74, weight: 22, levelRange: [155, 161] },   // 小拳石
                    { id: 207, weight: 22, levelRange: [155, 161] },  // 天蠍
                    { id: 111, weight: 22, levelRange: [155, 161] },  // 獨角犀牛
                    { id: 231, weight: 17, levelRange: [155, 161] },  // 小小象
                    { id: 246, weight: 10, levelRange: [155, 161] },  // 幼基拉斯
                    { id: 227, weight: 7, levelRange: [155, 161] },   // 盔甲鳥（稀有）
                ]
            },
            {
                id: 'johto_dark_cave',
                name: '漆黑洞穴',
                description: '城都地區的幽暗洞窟',
                levelRange: [162, 168],
                pokemon: [
                    { id: 74, weight: 20, levelRange: [162, 168] },   // 小拳石
                    { id: 200, weight: 20, levelRange: [162, 168] },  // 夢妖
                    { id: 228, weight: 20, levelRange: [162, 168] },  // 戴魯比
                    { id: 204, weight: 15, levelRange: [162, 168] },  // 榛果球
                    { id: 206, weight: 15, levelRange: [162, 168] },  // 土龍弟弟
                    { id: 202, weight: 10, levelRange: [162, 168] },  // 果然翁
                ]
            },
            {
                id: 'johto_route27',
                name: '27號道路',
                description: '通往關都地區的長道路',
                levelRange: [169, 174],
                pokemon: [
                    { id: 189, weight: 18, levelRange: [169, 174] },  // 毽子棉
                    { id: 229, weight: 18, levelRange: [169, 174] },  // 黑魯加
                    { id: 217, weight: 18, levelRange: [169, 174] },  // 圈圈熊
                    { id: 232, weight: 18, levelRange: [169, 174] },  // 頓甲
                    { id: 205, weight: 18, levelRange: [169, 174] },  // 佛烈託斯
                    { id: 224, weight: 10, levelRange: [169, 174] },  // 章魚桶
                ]
            },
            {
                id: 'johto_victory_road',
                name: '城都冠軍之路',
                description: '通往石英聯盟的最終試煉',
                levelRange: [175, 181],
                pokemon: [
                    { id: 221, weight: 25, levelRange: [175, 181] },  // 長毛豬
                    { id: 67, weight: 18, levelRange: [175, 181] },   // 豪力
                    { id: 75, weight: 18, levelRange: [175, 181] },   // 隆隆石
                    { id: 219, weight: 15, levelRange: [175, 181] },  // 熔岩蝸牛
                    { id: 246, weight: 12, levelRange: [175, 181] },  // 幼基拉斯
                    { id: 247, weight: 12, levelRange: [175, 181] },  // 沙基拉斯
                ]
            },
            {
                id: 'johto_whirl_islands',
                name: '漩渦列島',
                description: '傳說中洛奇亞棲息的海底洞窟',
                levelRange: [182, 188],
                pokemon: [
                    { id: 116, weight: 25, levelRange: [182, 188] },  // 墨海馬
                    { id: 171, weight: 22, levelRange: [182, 188] },  // 電燈怪
                    { id: 117, weight: 20, levelRange: [182, 188] },  // 海刺龍
                    { id: 226, weight: 18, levelRange: [182, 188] },  // 巨翅飛魚
                    { id: 131, weight: 12, levelRange: [182, 188] },  // 拉普拉斯
                    { id: 245, weight: 3, levelRange: [188, 188] },   // 水君（傳說）
                    { id: 249, weight: 2, levelRange: [188, 188] },   // 洛奇亞（傳說）
                ]
            },
            {
                id: 'johto_tin_tower',
                name: '鐘塔',
                description: '圓朱市中供奉鳳王的神聖塔樓',
                levelRange: [189, 194],
                pokemon: [
                    { id: 92, weight: 20, levelRange: [189, 194] },   // 鬼斯
                    { id: 177, weight: 20, levelRange: [189, 194] },  // 天然雀
                    { id: 178, weight: 19, levelRange: [189, 194] },  // 天然鳥
                    { id: 93, weight: 18, levelRange: [189, 194] },   // 鬼斯通
                    { id: 200, weight: 18, levelRange: [189, 194] },  // 夢妖
                    { id: 243, weight: 4, levelRange: [194, 194] },   // 雷公（傳說）
                    { id: 244, weight: 4, levelRange: [194, 194] },   // 炎帝（傳說）
                    { id: 250, weight: 2, levelRange: [194, 194] },   // 鳳王（傳說）
                ]
            },
            {
                id: 'johto_mt_silver',
                name: '白銀山',
                description: '城都地區最高峰，最強訓練師的修煉聖地',
                levelRange: [195, 201],
                pokemon: [
                    { id: 221, weight: 18, levelRange: [195, 201] },   // 長毛豬
                    { id: 217, weight: 18, levelRange: [195, 201] },   // 圈圈熊
                    { id: 215, weight: 18, levelRange: [195, 201] },   // 狃拉
                    { id: 42, weight: 15, levelRange: [195, 201] },    // 大嘴蝠
                    { id: 246, weight: 15, levelRange: [195, 201] },   // 幼基拉斯
                    { id: 247, weight: 15, levelRange: [195, 201] },   // 沙基拉斯
                    { id: 251, weight: 1, levelRange: [201, 201] },    // 時拉比（幻之寶可夢）
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
                levelRange: [202, 211],
                pokemon: [
                    { id: 263, weight: 35, levelRange: [202, 211] },  // 蛇紋熊
                    { id: 261, weight: 30, levelRange: [202, 211] },  // 土狼犬
                    { id: 265, weight: 20, levelRange: [202, 211] },  // 刺尾蟲
                    { id: 276, weight: 15, levelRange: [202, 211] },  // 傲骨燕
                ]
            },
            {
                id: 'hoenn_route102',
                name: '102號道路',
                description: '古辰鎮到橙華市之間的道路',
                levelRange: [212, 221],
                pokemon: [
                    { id: 270, weight: 25, levelRange: [212, 221] },  // 蓮葉童子
                    { id: 273, weight: 25, levelRange: [212, 221] },  // 橡實果
                    { id: 280, weight: 20, levelRange: [212, 221] },  // 拉魯拉絲
                    { id: 283, weight: 15, levelRange: [212, 221] },  // 溜溜糖球
                    { id: 298, weight: 15, levelRange: [212, 221] },  // 露力麗
                ]
            },
            {
                id: 'hoenn_petalburg_woods',
                name: '橙華森林',
                description: '橙華市附近的茂密森林',
                levelRange: [222, 231],
                pokemon: [
                    { id: 265, weight: 25, levelRange: [222, 231] },  // 刺尾蟲
                    { id: 285, weight: 20, levelRange: [222, 231] },  // 蘑蘑菇
                    { id: 287, weight: 15, levelRange: [222, 231] },  // 懶人獺
                    { id: 266, weight: 15, levelRange: [222, 231] },  // 甲殼繭
                    { id: 268, weight: 15, levelRange: [222, 231] },  // 盾甲繭
                    { id: 252, weight: 10, levelRange: [222, 231] },  // 木守宮（稀有）
                ]
            },
            {
                id: 'hoenn_route104',
                name: '104號道路',
                description: '橙華市到卡那茲市之間的海岸道路',
                levelRange: [232, 241],
                pokemon: [
                    { id: 278, weight: 25, levelRange: [232, 241] },  // 長翅鷗
                    { id: 276, weight: 20, levelRange: [232, 241] },  // 傲骨燕
                    { id: 263, weight: 20, levelRange: [232, 241] },  // 蛇紋熊
                    { id: 300, weight: 15, levelRange: [232, 241] },  // 向尾喵
                    { id: 183, weight: 10, levelRange: [232, 241] },  // 瑪力露
                    { id: 255, weight: 10, levelRange: [232, 241] },  // 火稚雞（稀有）
                ]
            },
            {
                id: 'hoenn_rustboro_tunnel',
                name: '石之洞窟',
                description: '卡那茲市附近的岩石洞窟',
                levelRange: [242, 251],
                pokemon: [
                    { id: 304, weight: 25, levelRange: [242, 251] },  // 可可多拉
                    { id: 296, weight: 20, levelRange: [242, 251] },  // 幕下力士
                    { id: 74, weight: 20, levelRange: [242, 251] },   // 小拳石
                    { id: 299, weight: 15, levelRange: [242, 251] },  // 朝北鼻
                    { id: 290, weight: 10, levelRange: [242, 251] },  // 土居忍士
                    { id: 303, weight: 10, levelRange: [242, 251] },  // 大嘴娃（稀有）
                ]
            },
            {
                id: 'hoenn_route110',
                name: '110號道路',
                description: '紫堇市到凱那市之間的長道路',
                levelRange: [252, 261],
                pokemon: [
                    { id: 309, weight: 25, levelRange: [252, 261] },  // 落雷獸
                    { id: 311, weight: 15, levelRange: [252, 261] },  // 正電拍拍
                    { id: 312, weight: 15, levelRange: [252, 261] },  // 負電拍拍
                    { id: 293, weight: 15, levelRange: [252, 261] },  // 咕妞妞
                    { id: 316, weight: 15, levelRange: [252, 261] },  // 溶食獸
                    { id: 258, weight: 15, levelRange: [252, 261] },  // 水躍魚（稀有）
                ]
            },
            {
                id: 'hoenn_route111',
                name: '111號道路 (沙漠地帶)',
                description: '紫堇市北方的炎熱沙漠',
                levelRange: [262, 271],
                pokemon: [
                    { id: 328, weight: 25, levelRange: [262, 271] },  // 大顎蟻
                    { id: 322, weight: 20, levelRange: [262, 271] },  // 呆火駝
                    { id: 331, weight: 20, levelRange: [262, 271] },  // 刺球仙人掌
                    { id: 343, weight: 15, levelRange: [262, 271] },  // 天秤偶
                    { id: 327, weight: 10, levelRange: [262, 271] },  // 晃晃斑
                    { id: 345, weight: 10, levelRange: [262, 271] },  // 觸手百合（稀有）
                ]
            },
            {
                id: 'hoenn_route112',
                name: '112號道路 (煙突山)',
                description: '通往釜炎鎮的火山道路',
                levelRange: [272, 281],
                pokemon: [
                    { id: 322, weight: 25, levelRange: [272, 281] },  // 呆火駝
                    { id: 324, weight: 15, levelRange: [272, 281] },  // 煤炭龜
                    { id: 307, weight: 15, levelRange: [272, 281] },  // 瑪沙那
                    { id: 325, weight: 15, levelRange: [272, 281] },  // 跳跳豬
                    { id: 261, weight: 15, levelRange: [272, 281] },  // 土狼犬
                    { id: 347, weight: 15, levelRange: [272, 281] },  // 太古羽蟲（稀有）
                ]
            },
            {
                id: 'hoenn_route113',
                name: '113號道路',
                description: '釜炎鎮到飛翠市之間被火山灰覆蓋的道路',
                levelRange: [282, 292],
                pokemon: [
                    { id: 327, weight: 20, levelRange: [282, 292] },  // 晃晃斑
                    { id: 315, weight: 20, levelRange: [282, 292] },  // 毒薔薇
                    { id: 313, weight: 15, levelRange: [282, 292] },  // 電螢蟲
                    { id: 314, weight: 15, levelRange: [282, 292] },  // 甜甜螢
                    { id: 336, weight: 15, levelRange: [282, 292] },  // 飯匙蛇
                    { id: 335, weight: 15, levelRange: [282, 292] },  // 貓鼬斬
                ]
            },
            {
                id: 'hoenn_route114',
                name: '114號道路',
                description: '流星瀑布附近的道路',
                levelRange: [293, 302],
                pokemon: [
                    { id: 333, weight: 25, levelRange: [293, 302] },  // 青綿鳥
                    { id: 339, weight: 20, levelRange: [293, 302] },  // 泥泥鰍
                    { id: 337, weight: 15, levelRange: [293, 302] },  // 月石
                    { id: 338, weight: 15, levelRange: [293, 302] },  // 太陽巖
                    { id: 302, weight: 15, levelRange: [293, 302] },  // 勾魂眼
                    { id: 351, weight: 10, levelRange: [293, 302] },  // 飄浮泡泡（稀有）
                ]
            },
            {
                id: 'hoenn_meteor_falls',
                name: '流星瀑布',
                description: '傳說中龍系寶可夢棲息的神秘洞窟',
                levelRange: [303, 312],
                pokemon: [
                    { id: 371, weight: 25, levelRange: [303, 312] },  // 寶貝龍
                    { id: 304, weight: 20, levelRange: [303, 312] },  // 可可多拉
                    { id: 41, weight: 15, levelRange: [303, 312] },   // 超音蝠
                    { id: 337, weight: 15, levelRange: [303, 312] },  // 月石
                    { id: 338, weight: 15, levelRange: [303, 312] },  // 太陽巖
                    { id: 374, weight: 10, levelRange: [303, 312] },  // 鐵啞鈴（稀有）
                ]
            },
            {
                id: 'hoenn_route118',
                name: '118號道路',
                description: '凱那市東方的海岸道路',
                levelRange: [313, 322],
                pokemon: [
                    { id: 309, weight: 20, levelRange: [313, 322] },  // 落雷獸
                    { id: 278, weight: 20, levelRange: [313, 322] },  // 長翅鷗
                    { id: 341, weight: 20, levelRange: [313, 322] },  // 龍蝦小兵
                    { id: 318, weight: 15, levelRange: [313, 322] },  // 利牙魚
                    { id: 352, weight: 15, levelRange: [313, 322] },  // 變隱龍
                    { id: 359, weight: 10, levelRange: [313, 322] },  // 阿勃梭魯（稀有）
                ]
            },
            {
                id: 'hoenn_route119',
                name: '119號道路',
                description: '天氣研究所附近的熱帶雨林',
                levelRange: [323, 332],
                pokemon: [
                    { id: 357, weight: 20, levelRange: [323, 332] },  // 熱帶龍
                    { id: 352, weight: 20, levelRange: [323, 332] },  // 變隱龍
                    { id: 283, weight: 15, levelRange: [323, 332] },  // 溜溜糖球
                    { id: 261, weight: 15, levelRange: [323, 332] },  // 土狼犬
                    { id: 315, weight: 15, levelRange: [323, 332] },  // 毒薔薇
                    { id: 349, weight: 15, levelRange: [323, 332] },  // 醜醜魚（稀有）
                ]
            },
            {
                id: 'hoenn_route120',
                name: '120號道路',
                description: '茵鬱市附近的神秘道路',
                levelRange: [333, 342],
                pokemon: [
                    { id: 359, weight: 18, levelRange: [333, 342] },  // 阿勃梭魯
                    { id: 353, weight: 18, levelRange: [333, 342] },  // 怨影娃娃
                    { id: 355, weight: 18, levelRange: [333, 342] },  // 夜巡靈
                    { id: 302, weight: 16, levelRange: [333, 342] },  // 勾魂眼
                    { id: 358, weight: 15, levelRange: [333, 342] },  // 風鈴鈴
                    { id: 327, weight: 15, levelRange: [333, 342] },  // 晃晃斑
                ]
            },
            {
                id: 'hoenn_route121',
                name: '121號道路',
                description: '綠嶺市到凱那市的道路',
                levelRange: [343, 352],
                pokemon: [
                    { id: 353, weight: 18, levelRange: [343, 352] },  // 怨影娃娃
                    { id: 355, weight: 18, levelRange: [343, 352] },  // 夜巡靈
                    { id: 320, weight: 17, levelRange: [343, 352] },  // 吼吼鯨
                    { id: 370, weight: 17, levelRange: [343, 352] },  // 愛心魚
                    { id: 261, weight: 15, levelRange: [343, 352] },  // 土狼犬
                    { id: 278, weight: 15, levelRange: [343, 352] },  // 長翅鷗
                ]
            },
            {
                id: 'hoenn_mt_pyre',
                name: '送火山',
                description: '寶可夢靈魂安息的聖山',
                levelRange: [353, 362],
                pokemon: [
                    { id: 353, weight: 20, levelRange: [353, 362] },  // 怨影娃娃
                    { id: 355, weight: 20, levelRange: [353, 362] },  // 夜巡靈
                    { id: 92, weight: 17, levelRange: [353, 362] },   // 鬼斯
                    { id: 93, weight: 14, levelRange: [353, 362] },   // 鬼斯通
                    { id: 307, weight: 12, levelRange: [353, 362] },  // 瑪沙那
                    { id: 358, weight: 10, levelRange: [353, 362] },  // 風鈴鈴
                    { id: 383, weight: 4, levelRange: [361, 362] },   // 固拉多（傳說）
                ]
            },
            {
                id: 'hoenn_route124',
                name: '124號水道',
                description: '通往潛水區域的深海水道',
                levelRange: [363, 372],
                pokemon: [
                    { id: 320, weight: 22, levelRange: [363, 372] },  // 吼吼鯨
                    { id: 318, weight: 18, levelRange: [363, 372] },  // 利牙魚
                    { id: 366, weight: 18, levelRange: [363, 372] },  // 珍珠貝
                    { id: 370, weight: 15, levelRange: [363, 372] },  // 愛心魚
                    { id: 363, weight: 15, levelRange: [363, 372] },  // 海豹球
                    { id: 369, weight: 12, levelRange: [363, 372] },  // 古空棘魚
                ]
            },
            {
                id: 'hoenn_shoal_cave',
                name: '淺灘洞穴',
                description: '琉璃市附近受潮汐影響的洞穴',
                levelRange: [373, 382],
                pokemon: [
                    { id: 363, weight: 25, levelRange: [373, 382] },  // 海豹球
                    { id: 361, weight: 22, levelRange: [373, 382] },  // 雪童子
                    { id: 41, weight: 15, levelRange: [373, 382] },   // 超音蝠
                    { id: 339, weight: 15, levelRange: [373, 382] },  // 泥泥鰍
                    { id: 360, weight: 13, levelRange: [373, 382] },  // 小果然
                    { id: 362, weight: 10, levelRange: [373, 382] },  // 冰鬼護（稀有）
                ]
            },
            {
                id: 'hoenn_route126',
                name: '126號水道',
                description: '通往海底洞窟的深海區域',
                levelRange: [383, 392],
                pokemon: [
                    { id: 341, weight: 20, levelRange: [383, 392] },  // 龍蝦小兵
                    { id: 318, weight: 17, levelRange: [383, 392] },  // 利牙魚
                    { id: 320, weight: 17, levelRange: [383, 392] },  // 吼吼鯨
                    { id: 72, weight: 15, levelRange: [383, 392] },   // 瑪瑙水母
                    { id: 170, weight: 14, levelRange: [383, 392] },  // 燈籠魚
                    { id: 369, weight: 10, levelRange: [383, 392] },  // 古空棘魚
                    { id: 382, weight: 4, levelRange: [391, 392] },   // 蓋歐卡（傳說）
                ]
            },
            {
                id: 'hoenn_route128',
                name: '128號水道',
                description: '通往彩幽市的危險海域',
                levelRange: [393, 402],
                pokemon: [
                    { id: 319, weight: 20, levelRange: [393, 402] },  // 巨牙鯊
                    { id: 321, weight: 20, levelRange: [393, 402] },  // 吼鯨王
                    { id: 342, weight: 16, levelRange: [393, 402] },  // 鐵螯龍蝦
                    { id: 340, weight: 14, levelRange: [393, 402] },  // 鯰魚王
                    { id: 226, weight: 12, levelRange: [393, 402] },  // 巨翅飛魚
                    { id: 350, weight: 12, levelRange: [393, 402] },  // 美納斯（稀有）
                    { id: 380, weight: 3, levelRange: [401, 402] },   // 拉帝亞斯（傳說）
                ]
            },
            {
                id: 'hoenn_victory_road',
                name: '豐緣冠軍之路',
                description: '通往聯盟的最終試煉',
                levelRange: [403, 412],
                pokemon: [
                    { id: 305, weight: 17, levelRange: [403, 412] },  // 可多拉
                    { id: 329, weight: 16, levelRange: [403, 412] },  // 超音波幼蟲
                    { id: 308, weight: 16, levelRange: [403, 412] },  // 恰雷姆
                    { id: 344, weight: 14, levelRange: [403, 412] },  // 念力土偶
                    { id: 356, weight: 12, levelRange: [403, 412] },  // 彷徨夜靈
                    { id: 372, weight: 12, levelRange: [403, 412] },  // 甲殼龍
                    { id: 375, weight: 11, levelRange: [403, 412] },  // 金屬怪（稀有）
                    { id: 381, weight: 3, levelRange: [411, 412] },   // 拉帝歐斯（傳說）
                ]
            },
            {
                id: 'hoenn_sealed_chamber',
                name: '封印遺蹟',
                description: '隱藏在豐緣各處的古代遺蹟',
                levelRange: [413, 422],
                pokemon: [
                    { id: 344, weight: 24, levelRange: [413, 422] },  // 念力土偶
                    { id: 346, weight: 20, levelRange: [413, 422] },  // 搖籃百合
                    { id: 348, weight: 19, levelRange: [413, 422] },  // 太古盔甲
                    { id: 330, weight: 12, levelRange: [413, 422] },  // 沙漠蜻蜓
                    { id: 334, weight: 12, levelRange: [413, 422] },  // 七夕青鳥
                    { id: 377, weight: 6, levelRange: [419, 422] },  // 雷吉洛克（傳說）
                    { id: 378, weight: 6, levelRange: [419, 422] },  // 雷吉艾斯（傳說）
                    { id: 379, weight: 3, levelRange: [422, 422] },   // 雷吉斯奇魯（傳說）
                ]
            },
            {
                id: 'hoenn_sky_pillar',
                name: '天空之柱',
                description: '傳說中烈空坐棲息的高塔',
                levelRange: [423, 432],
                pokemon: [
                    { id: 373, weight: 20, levelRange: [423, 432] },  // 暴飛龍
                    { id: 376, weight: 18, levelRange: [423, 432] },  // 巨金怪
                    { id: 354, weight: 16, levelRange: [423, 432] },  // 詛咒娃娃
                    { id: 356, weight: 15, levelRange: [423, 432] },  // 彷徨夜靈
                    { id: 332, weight: 14, levelRange: [423, 432] },  // 夢歌仙人掌
                    { id: 334, weight: 12, levelRange: [423, 432] },  // 七夕青鳥
                    { id: 384, weight: 4, levelRange: [432, 432] },   // 烈空坐（傳說）
                ]
            },
            {
                id: 'hoenn_birth_island',
                name: '誕生之島',
                description: '傳說中代歐奇希斯降臨的神秘小島',
                levelRange: [433, 442],
                pokemon: [
                    { id: 373, weight: 20, levelRange: [433, 442] },  // 暴飛龍
                    { id: 376, weight: 20, levelRange: [433, 442] },  // 巨金怪
                    { id: 289, weight: 15, levelRange: [433, 442] },  // 請假王
                    { id: 297, weight: 15, levelRange: [433, 442] },  // 鐵掌力士
                    { id: 330, weight: 14, levelRange: [433, 442] },  // 沙漠蜻蜓
                    { id: 365, weight: 10, levelRange: [433, 442] },  // 帝牙海獅
                    { id: 350, weight: 4, levelRange: [433, 442] },   // 美納斯
                    { id: 385, weight: 2, levelRange: [441, 442] },   // 基拉祈（幻之寶可夢）
                    { id: 386, weight: 1, levelRange: [442, 442] },   // 代歐奇希斯（幻之寶可夢）
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
                levelRange: [443, 456],
                pokemon: [
                    { id: 396, weight: 35, levelRange: [443, 456] },  // 姆克兒
                    { id: 399, weight: 30, levelRange: [443, 456] },  // 大牙狸
                    { id: 401, weight: 20, levelRange: [443, 456] },  // 圓法師
                    { id: 403, weight: 15, levelRange: [443, 456] },  // 小貓怪
                ]
            },
            {
                id: 'sinnoh_route202',
                name: '202號道路',
                description: '真砂鎮到祝慶市之間的道路',
                levelRange: [457, 469],
                pokemon: [
                    { id: 396, weight: 25, levelRange: [457, 469] },  // 姆克兒
                    { id: 403, weight: 20, levelRange: [457, 469] },  // 小貓怪
                    { id: 406, weight: 20, levelRange: [457, 469] },  // 含羞苞
                    { id: 399, weight: 20, levelRange: [457, 469] },  // 大牙狸
                    { id: 387, weight: 15, levelRange: [457, 469] },  // 草苗龜（稀有）
                ]
            },
            {
                id: 'sinnoh_route204',
                name: '204號道路',
                description: '祝慶市到苑之鎮之間的道路',
                levelRange: [470, 482],
                pokemon: [
                    { id: 406, weight: 22, levelRange: [470, 482] },  // 含羞苞
                    { id: 401, weight: 20, levelRange: [470, 482] },  // 圓法師
                    { id: 418, weight: 20, levelRange: [470, 482] },  // 泳圈鼬
                    { id: 396, weight: 18, levelRange: [470, 482] },  // 姆克兒
                    { id: 412, weight: 10, levelRange: [470, 482] },  // 結草兒
                    { id: 390, weight: 10, levelRange: [470, 482] },  // 小火焰猴（稀有）
                ]
            },
            {
                id: 'sinnoh_ravaged_path',
                name: '荒蕪小道',
                description: '連線204號道路兩段的洞穴',
                levelRange: [483, 496],
                pokemon: [
                    { id: 41, weight: 25, levelRange: [483, 496] },   // 超音蝠
                    { id: 74, weight: 20, levelRange: [483, 496] },   // 小拳石
                    { id: 408, weight: 20, levelRange: [483, 496] },  // 頭蓋龍
                    { id: 410, weight: 15, levelRange: [483, 496] },  // 盾甲龍
                    { id: 393, weight: 10, levelRange: [483, 496] },  // 波加曼（稀有）
                    { id: 436, weight: 10, levelRange: [483, 496] },  // 銅鏡怪
                ]
            },
            {
                id: 'sinnoh_route205',
                name: '205號道路',
                description: '苑之鎮到百代森林之間的道路',
                levelRange: [497, 509],
                pokemon: [
                    { id: 418, weight: 22, levelRange: [497, 509] },  // 泳圈鼬
                    { id: 422, weight: 22, levelRange: [497, 509] },  // 無殼海兔
                    { id: 420, weight: 18, levelRange: [497, 509] },  // 櫻花寶
                    { id: 397, weight: 18, levelRange: [497, 509] },  // 姆克鳥
                    { id: 415, weight: 10, levelRange: [497, 509] },  // 三蜜蜂
                    { id: 414, weight: 10, levelRange: [497, 509] },  // 紳士蛾
                    { id: 458, weight: 8, levelRange: [497, 509] },   // 小球飛魚
                ]
            },
            {
                id: 'sinnoh_eterna_forest',
                name: '百代森林',
                description: '百代市附近的古老森林',
                levelRange: [510, 522],
                pokemon: [
                    { id: 406, weight: 20, levelRange: [510, 522] },  // 含羞苞
                    { id: 412, weight: 15, levelRange: [510, 522] },  // 結草兒
                    { id: 414, weight: 15, levelRange: [510, 522] },  // 紳士蛾
                    { id: 415, weight: 15, levelRange: [510, 522] },  // 三蜜蜂
                    { id: 425, weight: 15, levelRange: [510, 522] },  // 飄飄球
                    { id: 442, weight: 10, levelRange: [510, 522] },  // 花巖怪（稀有）
                    { id: 440, weight: 10, levelRange: [510, 522] },  // 小福蛋
                    { id: 417, weight: 8, levelRange: [510, 522] },  // 帕奇利茲
                ]
            },
            {
                id: 'sinnoh_route206',
                name: '206號道路（腳踏車道）',
                description: '百代市到隨意遺蹟之間的下坡道路',
                levelRange: [523, 536],
                pokemon: [
                    { id: 434, weight: 22, levelRange: [523, 536] },  // 臭鼬噗
                    { id: 403, weight: 20, levelRange: [523, 536] },  // 小貓怪
                    { id: 397, weight: 18, levelRange: [523, 536] },  // 姆克鳥
                    { id: 432, weight: 15, levelRange: [523, 536] },  // 東施喵
                    { id: 431, weight: 15, levelRange: [523, 536] },  // 魅力喵
                    { id: 433, weight: 10, levelRange: [523, 536] },  // 鈴鐺響
                ]
            },
            {
                id: 'sinnoh_wayward_cave',
                name: '迷幻洞窟',
                description: '206號道路下方隱藏的洞穴',
                levelRange: [537, 549],
                pokemon: [
                    { id: 74, weight: 20, levelRange: [537, 549] },   // 小拳石
                    { id: 41, weight: 18, levelRange: [537, 549] },   // 超音蝠
                    { id: 436, weight: 18, levelRange: [537, 549] },  // 銅鏡怪
                    { id: 438, weight: 17, levelRange: [537, 549] },  // 盆才怪
                    { id: 439, weight: 15, levelRange: [537, 549] },  // 魔尼尼
                    { id: 443, weight: 12, levelRange: [537, 549] },  // 圓陸鯊（稀有）
                ]
            },
            {
                id: 'sinnoh_route209',
                name: '209號道路',
                description: '隨意鎮到迷路市之間的道路',
                levelRange: [550, 563],
                pokemon: [
                    { id: 431, weight: 20, levelRange: [550, 563] },  // 魅力喵
                    { id: 397, weight: 18, levelRange: [550, 563] },  // 姆克鳥
                    { id: 425, weight: 18, levelRange: [550, 563] },  // 飄飄球
                    { id: 427, weight: 18, levelRange: [550, 563] },  // 卷卷耳
                    { id: 440, weight: 12, levelRange: [550, 563] },  // 小福蛋
                    { id: 442, weight: 8, levelRange: [550, 563] },   // 花巖怪（稀有）
                    { id: 429, weight: 6, levelRange: [563, 563] },   // 夢妖魔（稀有）
                ]
            },
            {
                id: 'sinnoh_lost_tower',
                name: '失落之塔',
                description: '迷路市附近的寶可夢靈魂安息之所',
                levelRange: [564, 576],
                pokemon: [
                    { id: 92, weight: 22, levelRange: [564, 576] },   // 鬼斯
                    { id: 93, weight: 18, levelRange: [564, 576] },   // 鬼斯通
                    { id: 355, weight: 18, levelRange: [564, 576] },  // 夜巡靈
                    { id: 425, weight: 17, levelRange: [564, 576] },  // 飄飄球
                    { id: 200, weight: 15, levelRange: [564, 576] },  // 夢妖
                    { id: 442, weight: 10, levelRange: [564, 576] },  // 花巖怪（稀有）
                ]
            },
            {
                id: 'sinnoh_route210',
                name: '210號道路',
                description: '通往神和鎮的濃霧道路',
                levelRange: [577, 589],
                pokemon: [
                    { id: 397, weight: 18, levelRange: [577, 589] },  // 姆克鳥
                    { id: 423, weight: 18, levelRange: [577, 589] },  // 海兔獸
                    { id: 434, weight: 18, levelRange: [577, 589] },  // 臭鼬噗
                    { id: 419, weight: 16, levelRange: [577, 589] },  // 浮潛鼬
                    { id: 433, weight: 15, levelRange: [577, 589] },  // 鈴鐺響
                    { id: 441, weight: 15, levelRange: [577, 589] },  // 聒噪鳥
                ]
            },
            {
                id: 'sinnoh_route212',
                name: '212號道路',
                description: '帷幕市到水脈市之間的沼澤道路',
                levelRange: [590, 603],
                pokemon: [
                    { id: 453, weight: 22, levelRange: [590, 603] },  // 不良蛙
                    { id: 422, weight: 20, levelRange: [590, 603] },  // 無殼海兔
                    { id: 397, weight: 15, levelRange: [590, 603] },  // 姆克鳥
                    { id: 449, weight: 15, levelRange: [590, 603] },  // 沙河馬
                    { id: 455, weight: 15, levelRange: [590, 603] },  // 尖牙籠（稀有）
                    { id: 415, weight: 13, levelRange: [590, 603] },  // 三蜜蜂
                ]
            },
            {
                id: 'sinnoh_great_marsh',
                name: '大溼地',
                description: '水脈市的廣闊溼地保護區',
                levelRange: [604, 616],
                pokemon: [
                    { id: 453, weight: 18, levelRange: [604, 616] },  // 不良蛙
                    { id: 451, weight: 18, levelRange: [604, 616] },  // 鉗尾蠍
                    { id: 455, weight: 15, levelRange: [604, 616] },  // 尖牙籠
                    { id: 449, weight: 15, levelRange: [604, 616] },  // 沙河馬
                    { id: 400, weight: 12, levelRange: [604, 616] },  // 大尾狸
                    { id: 416, weight: 12, levelRange: [604, 616] },  // 蜂女王（稀有）
                    { id: 454, weight: 10, levelRange: [604, 616] },  // 毒骷蛙（稀有）
                ]
            },
            {
                id: 'sinnoh_route214',
                name: '214號道路',
                description: '帷幕市到水脈市東面的道路',
                levelRange: [617, 630],
                pokemon: [
                    { id: 449, weight: 20, levelRange: [617, 630] },  // 沙河馬
                    { id: 434, weight: 18, levelRange: [617, 630] },  // 臭鼬噗
                    { id: 453, weight: 18, levelRange: [617, 630] },  // 不良蛙
                    { id: 404, weight: 15, levelRange: [617, 630] },  // 勒克貓
                    { id: 435, weight: 12, levelRange: [617, 630] },  // 坦克臭鼬
                    { id: 450, weight: 10, levelRange: [617, 630] },  // 河馬獸（稀有）
                    { id: 446, weight: 7, levelRange: [617, 630] },   // 小卡比獸（稀有）
                ]
            },
            {
                id: 'sinnoh_route215',
                name: '215號道路',
                description: '帷幕市北方的雨天道路',
                levelRange: [631, 643],
                pokemon: [
                    { id: 404, weight: 22, levelRange: [631, 643] },  // 勒克貓
                    { id: 397, weight: 18, levelRange: [631, 643] },  // 姆克鳥
                    { id: 427, weight: 18, levelRange: [631, 643] },  // 卷卷耳
                    { id: 434, weight: 18, levelRange: [631, 643] },  // 臭鼬噗
                    { id: 428, weight: 12, levelRange: [631, 643] },  // 長耳兔（稀有）
                    { id: 448, weight: 12, levelRange: [631, 643] },  // 路卡利歐（稀有）
                ]
            },
            {
                id: 'sinnoh_mt_coronet_south',
                name: '天冠山（南部）',
                description: '神奧地區中央的雄偉山脈',
                levelRange: [644, 656],
                pokemon: [
                    { id: 436, weight: 20, levelRange: [644, 656] },  // 銅鏡怪
                    { id: 74, weight: 18, levelRange: [644, 656] },   // 小拳石
                    { id: 437, weight: 15, levelRange: [644, 656] },  // 青銅鐘
                    { id: 447, weight: 15, levelRange: [644, 656] },  // 利歐路
                    { id: 443, weight: 12, levelRange: [644, 656] },  // 圓陸鯊
                    { id: 408, weight: 10, levelRange: [644, 656] },  // 頭蓋龍
                    { id: 410, weight: 10, levelRange: [644, 656] },  // 盾甲龍
                    { id: 482, weight: 3, levelRange: [656, 656] },   // 亞克諾姆（傳說）
                ]
            },
            {
                id: 'sinnoh_route216',
                name: '216號道路',
                description: '通往切鋒市的雪地道路',
                levelRange: [657, 670],
                pokemon: [
                    { id: 459, weight: 25, levelRange: [657, 670] },  // 雪笠怪
                    { id: 215, weight: 20, levelRange: [657, 670] },  // 狃拉
                    { id: 220, weight: 18, levelRange: [657, 670] },  // 小山豬
                    { id: 397, weight: 17, levelRange: [657, 670] },  // 姆克鳥
                    { id: 461, weight: 10, levelRange: [657, 670] },  // 瑪狃拉（稀有）
                    { id: 460, weight: 10, levelRange: [657, 670] },  // 暴雪王（稀有）
                ]
            },
            {
                id: 'sinnoh_lake_acuity',
                name: '睿智湖',
                description: '切鋒市附近的神聖湖泊',
                levelRange: [671, 683],
                pokemon: [
                    { id: 459, weight: 22, levelRange: [671, 683] },  // 雪笠怪
                    { id: 215, weight: 20, levelRange: [671, 683] },  // 狃拉
                    { id: 461, weight: 16, levelRange: [671, 683] },  // 瑪狃拉
                    { id: 460, weight: 15, levelRange: [671, 683] },  // 暴雪王
                    { id: 437, weight: 15, levelRange: [671, 683] },  // 青銅鐘
                    { id: 478, weight: 9, levelRange: [671, 683] },   // 雪妖女（稀有）
                    { id: 480, weight: 3, levelRange: [683, 683] },   // 由克希（傳說）
                    { id: 481, weight: 3, levelRange: [683, 683] },   // 艾姆利多（傳說）
                ]
            },
            {
                id: 'sinnoh_route222',
                name: '222號道路',
                description: '通往水脈市的海岸道路',
                levelRange: [684, 696],
                pokemon: [
                    { id: 423, weight: 20, levelRange: [684, 696] },  // 海兔獸
                    { id: 419, weight: 18, levelRange: [684, 696] },  // 浮潛鼬
                    { id: 405, weight: 15, levelRange: [684, 696] },  // 倫琴貓
                    { id: 398, weight: 15, levelRange: [684, 696] },  // 姆克鷹
                    { id: 457, weight: 15, levelRange: [684, 696] },  // 霓虹魚
                    { id: 456, weight: 10, levelRange: [684, 696] },  // 熒光魚
                    { id: 479, weight: 7, levelRange: [696, 696] },   // 洛託姆（稀有）
                    { id: 489, weight: 1, levelRange: [696, 696] },   // 霏歐納（傳說）
                ]
            },
            {
                id: 'sinnoh_mt_coronet_summit',
                name: '天冠山（槍之柱）',
                description: '天冠山頂峰，傳說中時空扭曲之地',
                levelRange: [697, 710],
                pokemon: [
                    { id: 444, weight: 20, levelRange: [697, 710] },  // 尖牙陸鯊
                    { id: 437, weight: 20, levelRange: [697, 710] },  // 青銅鐘
                    { id: 448, weight: 14, levelRange: [697, 710] },  // 路卡利歐
                    { id: 460, weight: 12, levelRange: [697, 710] },  // 暴雪王
                    { id: 476, weight: 12, levelRange: [697, 710] },  // 大朝北鼻
                    { id: 485, weight: 7, levelRange: [709, 710] },   // 席多藍恩（傳說）
                    { id: 483, weight: 2, levelRange: [710, 710] },   // 帝牙盧卡（傳說）
                    { id: 484, weight: 2, levelRange: [710, 710] },   // 帕路奇亞（傳說）
                ]
            },
            {
                id: 'sinnoh_victory_road',
                name: '神奧冠軍之路',
                description: '通往神奧聯盟的最終試煉',
                levelRange: [711, 723],
                pokemon: [
                    { id: 445, weight: 16, levelRange: [711, 723] },  // 烈咬陸鯊
                    { id: 398, weight: 16, levelRange: [711, 723] },  // 姆克鷹
                    { id: 448, weight: 14, levelRange: [711, 723] },  // 路卡利歐
                    { id: 405, weight: 14, levelRange: [711, 723] },  // 倫琴貓
                    { id: 452, weight: 12, levelRange: [711, 723] },  // 龍王蠍
                    { id: 444, weight: 12, levelRange: [711, 723] },  // 尖牙陸鯊
                    { id: 475, weight: 10, levelRange: [711, 723] },  // 艾路雷朵（稀有）
                    { id: 473, weight: 6, levelRange: [711, 723] },   // 象牙豬（稀有）
                    { id: 486, weight: 2, levelRange: [723, 723] },   // 雷吉奇卡斯（傳說）
                ]
            },
            {
                id: 'sinnoh_sendoff_spring',
                name: '歸途洞窟',
                description: '通往反轉世界入口的神秘洞窟',
                levelRange: [724, 737],
                pokemon: [
                    { id: 445, weight: 18, levelRange: [724, 737] },  // 烈咬陸鯊
                    { id: 452, weight: 16, levelRange: [724, 737] },  // 龍王蠍
                    { id: 429, weight: 14, levelRange: [724, 737] },  // 夢妖魔
                    { id: 477, weight: 14, levelRange: [724, 737] },  // 黑夜魔靈
                    { id: 472, weight: 12, levelRange: [724, 737] },  // 天蠍王
                    { id: 442, weight: 10, levelRange: [724, 737] },  // 花巖怪
                    { id: 487, weight: 2, levelRange: [737, 737] },   // 騎拉帝納（傳說）
                ]
            },
            {
                id: 'sinnoh_fullmoon_island',
                name: '滿月島 & 新月島',
                description: '傳說中蕾冠王與達克萊伊棲息的神秘島嶼',
                levelRange: [738, 750],
                pokemon: [
                    { id: 445, weight: 18, levelRange: [738, 750] },  // 烈咬陸鯊
                    { id: 448, weight: 16, levelRange: [738, 750] },  // 路卡利歐
                    { id: 405, weight: 14, levelRange: [738, 750] },  // 倫琴貓
                    { id: 475, weight: 13, levelRange: [738, 750] },  // 艾路雷朵
                    { id: 428, weight: 12, levelRange: [738, 750] },  // 長耳兔
                    { id: 488, weight: 3, levelRange: [750, 750] },   // 克雷色利亞（傳說）
                    { id: 491, weight: 3, levelRange: [750, 750] },   // 達克萊伊（傳說）
                    { id: 490, weight: 3, levelRange: [750, 750] },   // 瑪納霏（傳說）
                ]
            },
            {
                id: 'sinnoh_hall_of_origin',
                name: '創始之間',
                description: '傳說中阿爾宙斯降臨的至高聖域',
                levelRange: [751, 763],
                pokemon: [
                    { id: 445, weight: 16, levelRange: [751, 763] },  // 烈咬陸鯊
                    { id: 448, weight: 14, levelRange: [751, 763] },  // 路卡利歐
                    { id: 475, weight: 14, levelRange: [751, 763] },  // 艾路雷朵
                    { id: 473, weight: 12, levelRange: [751, 763] },  // 象牙豬
                    { id: 477, weight: 12, levelRange: [751, 763] },  // 黑夜魔靈
                    { id: 476, weight: 10, levelRange: [751, 763] },  // 大朝北鼻
                    { id: 474, weight: 8, levelRange: [751, 763] },   // 多邊獸Z（稀有）
                    { id: 492, weight: 2, levelRange: [763, 763] },   // 謝米（幻之寶可夢）
                    { id: 493, weight: 1, levelRange: [763, 763] },   // 阿爾宙斯（幻之寶可夢）
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
                levelRange: [764, 780],
                pokemon: [
                    { id: 504, weight: 35, levelRange: [764, 780] },  // 探探鼠
                    { id: 519, weight: 30, levelRange: [764, 780] },  // 豆豆鴿
                    { id: 506, weight: 20, levelRange: [764, 780] },  // 小約克
                    { id: 509, weight: 15, levelRange: [764, 780] },  // 扒手貓
                ]
            },
            {
                id: 'unova_route2',
                name: '2號道路',
                description: '唐草鎮到三曜市之間的道路',
                levelRange: [781, 797],
                pokemon: [
                    { id: 506, weight: 25, levelRange: [781, 797] },  // 小約克
                    { id: 504, weight: 20, levelRange: [781, 797] },  // 探探鼠
                    { id: 509, weight: 20, levelRange: [781, 797] },  // 扒手貓
                    { id: 511, weight: 12, levelRange: [781, 797] },  // 花椰猴
                    { id: 513, weight: 12, levelRange: [781, 797] },  // 爆香猴
                    { id: 515, weight: 11, levelRange: [781, 797] },  // 冷水猴
                ]
            },
            {
                id: 'unova_dreamyard',
                name: '夢之遺蹟',
                description: '三曜市郊外的神秘遺蹟',
                levelRange: [798, 814],
                pokemon: [
                    { id: 517, weight: 25, levelRange: [798, 814] },  // 食夢夢
                    { id: 543, weight: 20, levelRange: [798, 814] },  // 百足蜈蚣
                    { id: 540, weight: 20, levelRange: [798, 814] },  // 蟲寶包
                    { id: 519, weight: 15, levelRange: [798, 814] },  // 豆豆鴿
                    { id: 546, weight: 10, levelRange: [798, 814] },  // 木棉球
                    { id: 495, weight: 10, levelRange: [798, 814] },  // 藤藤蛇（稀有）
                ]
            },
            {
                id: 'unova_route3',
                name: '3號道路',
                description: '三曜市到七寶市之間的道路',
                levelRange: [815, 830],
                pokemon: [
                    { id: 522, weight: 22, levelRange: [815, 830] },  // 斑斑馬
                    { id: 520, weight: 20, levelRange: [815, 830] },  // 咕咕鴿
                    { id: 548, weight: 18, levelRange: [815, 830] },  // 百合根娃娃
                    { id: 535, weight: 15, levelRange: [815, 830] },  // 圓蝌蚪
                    { id: 505, weight: 15, levelRange: [815, 830] },  // 步哨鼠
                    { id: 550, weight: 12, levelRange: [815, 830] },  // 野蠻鱸魚
                    { id: 498, weight: 10, levelRange: [815, 830] },  // 暖暖豬（稀有）
                ]
            },
            {
                id: 'unova_wellspring_cave',
                name: '地下水脈穴',
                description: '連線3號道路與4號道路的洞穴',
                levelRange: [831, 847],
                pokemon: [
                    { id: 524, weight: 25, levelRange: [831, 847] },  // 石丸子
                    { id: 532, weight: 22, levelRange: [831, 847] },  // 搬運小匠
                    { id: 527, weight: 18, levelRange: [831, 847] },  // 滾滾蝙蝠
                    { id: 535, weight: 15, levelRange: [831, 847] },  // 圓蝌蚪
                    { id: 529, weight: 10, levelRange: [831, 847] },  // 螺釘地鼠
                    { id: 501, weight: 10, levelRange: [831, 847] },  // 水水獺（稀有）
                ]
            },
            {
                id: 'unova_route4',
                name: '4號道路（沙漠區）',
                description: '七寶市到飛雲市之間的沙漠道路',
                levelRange: [848, 864],
                pokemon: [
                    { id: 551, weight: 25, levelRange: [848, 864] },  // 黑眼鱷
                    { id: 554, weight: 18, levelRange: [848, 864] },  // 火紅不倒翁
                    { id: 556, weight: 15, levelRange: [848, 864] },  // 沙鈴仙人掌
                    { id: 557, weight: 15, levelRange: [848, 864] },  // 石居蟹
                    { id: 572, weight: 15, levelRange: [848, 864] },  // 泡沫栗鼠
                    { id: 570, weight: 12, levelRange: [848, 864] },  // 索羅亞（稀有）
                ]
            },
            {
                id: 'unova_pinwheel_forest',
                name: '矢車之森',
                description: '七寶市附近的茂密森林',
                levelRange: [865, 881],
                pokemon: [
                    { id: 540, weight: 20, levelRange: [865, 881] },  // 蟲寶包
                    { id: 543, weight: 18, levelRange: [865, 881] },  // 百足蜈蚣
                    { id: 546, weight: 15, levelRange: [865, 881] },  // 木棉球
                    { id: 548, weight: 15, levelRange: [865, 881] },  // 百合根娃娃
                    { id: 585, weight: 15, levelRange: [865, 881] },  // 四季鹿
                    { id: 636, weight: 10, levelRange: [865, 881] },  // 燃燒蟲（稀有）
                    { id: 531, weight: 7, levelRange: [865, 881] },   // 差不多娃娃（稀有）
                ]
            },
            {
                id: 'unova_skyarrow_bridge',
                name: '天箭橋',
                description: '連線飛雲市的宏偉大橋',
                levelRange: [882, 897],
                pokemon: [
                    { id: 520, weight: 22, levelRange: [882, 897] },  // 咕咕鴿
                    { id: 580, weight: 22, levelRange: [882, 897] },  // 鴨寶寶
                    { id: 568, weight: 18, levelRange: [882, 897] },  // 破破袋
                    { id: 595, weight: 15, levelRange: [882, 897] },  // 電電蟲
                    { id: 507, weight: 13, levelRange: [882, 897] },  // 哈約克
                    { id: 594, weight: 10, levelRange: [882, 897] },  // 保姆曼波
                    { id: 587, weight: 10, levelRange: [882, 897] },  // 電飛鼠（稀有）
                ]
            },
            {
                id: 'unova_route5',
                name: '5號道路',
                description: '飛雲市到帆巴市之間的道路',
                levelRange: [898, 914],
                pokemon: [
                    { id: 510, weight: 20, levelRange: [898, 914] },  // 酷豹
                    { id: 572, weight: 18, levelRange: [898, 914] },  // 泡沫栗鼠
                    { id: 595, weight: 18, levelRange: [898, 914] },  // 電電蟲
                    { id: 568, weight: 15, levelRange: [898, 914] },  // 破破袋
                    { id: 538, weight: 12, levelRange: [898, 914] },  // 投摔鬼
                    { id: 559, weight: 10, levelRange: [898, 914] },  // 滑滑小子
                    { id: 574, weight: 7, levelRange: [898, 914] },   // 哥德寶寶（稀有）
                ]
            },
            {
                id: 'unova_desert_resort',
                name: '古代城堡（沙漠度假區）',
                description: '合眾地區中心的廣袤沙漠遺蹟',
                levelRange: [915, 931],
                pokemon: [
                    { id: 551, weight: 20, levelRange: [915, 931] },  // 黑眼鱷
                    { id: 561, weight: 15, levelRange: [915, 931] },  // 象徵鳥
                    { id: 562, weight: 15, levelRange: [915, 931] },  // 哭哭面具
                    { id: 622, weight: 15, levelRange: [915, 931] },  // 泥偶小人
                    { id: 554, weight: 12, levelRange: [915, 931] },  // 火紅不倒翁
                    { id: 564, weight: 10, levelRange: [915, 931] },  // 原蓋海龜（稀有）
                    { id: 566, weight: 8, levelRange: [915, 931] },   // 始祖小鳥（稀有）
                    { id: 618, weight: 5, levelRange: [915, 931] },   // 泥巴魚（稀有）
                ]
            },
            {
                id: 'unova_route6',
                name: '6號道路',
                description: '帆巴市到電氣石洞穴之間的道路',
                levelRange: [932, 947],
                pokemon: [
                    { id: 585, weight: 20, levelRange: [932, 947] },  // 四季鹿
                    { id: 577, weight: 18, levelRange: [932, 947] },  // 單卵細胞球
                    { id: 536, weight: 15, levelRange: [932, 947] },  // 藍蟾蜍
                    { id: 599, weight: 15, levelRange: [932, 947] },  // 齒輪兒
                    { id: 590, weight: 15, levelRange: [932, 947] },  // 哎呀球菇
                    { id: 597, weight: 10, levelRange: [932, 947] },  // 種子鐵球（稀有）
                    { id: 607, weight: 7, levelRange: [932, 947] },   // 燭光靈（稀有）
                ]
            },
            {
                id: 'unova_chargestone_cave',
                name: '電氣石洞穴',
                description: '充滿電氣石的神秘洞穴',
                levelRange: [948, 964],
                pokemon: [
                    { id: 599, weight: 22, levelRange: [948, 964] },  // 齒輪兒
                    { id: 602, weight: 18, levelRange: [948, 964] },  // 麻麻小魚
                    { id: 525, weight: 18, levelRange: [948, 964] },  // 地幔巖
                    { id: 529, weight: 15, levelRange: [948, 964] },  // 螺釘地鼠
                    { id: 527, weight: 12, levelRange: [948, 964] },  // 滾滾蝙蝠
                    { id: 588, weight: 10, levelRange: [948, 964] },  // 蓋蓋蟲（稀有）
                    { id: 616, weight: 5, levelRange: [948, 964] },   // 小嘴蝸（稀有）
                ]
            },
            {
                id: 'unova_route7',
                name: '7號道路',
                description: '帆巴市到吹寄市之間的塔樓道路',
                levelRange: [965, 981],
                pokemon: [
                    { id: 586, weight: 20, levelRange: [965, 981] },  // 萌芽鹿
                    { id: 547, weight: 15, levelRange: [965, 981] },  // 風妖精
                    { id: 549, weight: 15, levelRange: [965, 981] },  // 裙兒小姐
                    { id: 521, weight: 15, levelRange: [965, 981] },  // 高傲雉雞
                    { id: 569, weight: 15, levelRange: [965, 981] },  // 灰塵山
                    { id: 582, weight: 10, levelRange: [965, 981] },  // 迷你冰（稀有）
                    { id: 629, weight: 10, levelRange: [965, 981] },  // 禿鷹丫頭
                ]
            },
            {
                id: 'unova_celestial_tower',
                name: '天堂之塔',
                description: '吹寄市附近的靈魂安息之所',
                levelRange: [982, 998],
                pokemon: [
                    { id: 607, weight: 25, levelRange: [982, 998] },  // 燭光靈
                    { id: 592, weight: 20, levelRange: [982, 998] },  // 輕飄飄
                    { id: 562, weight: 18, levelRange: [982, 998] },  // 哭哭面具
                    { id: 608, weight: 15, levelRange: [982, 998] },  // 燈火幽靈
                    { id: 528, weight: 12, levelRange: [982, 998] },  // 心蝙蝠
                    { id: 605, weight: 10, levelRange: [982, 998] },  // 小灰怪
                    { id: 569, weight: 10, levelRange: [982, 998] },  // 灰塵山
                ]
            },
            {
                id: 'unova_route8',
                name: '8號道路（溼地）',
                description: '吹寄市到雪花市之間的沼澤道路',
                levelRange: [999, 1014],
                pokemon: [
                    { id: 537, weight: 18, levelRange: [999, 1014] },  // 蟾蜍王
                    { id: 613, weight: 18, levelRange: [999, 1014] },  // 噴嚏熊
                    { id: 569, weight: 15, levelRange: [999, 1014] },  // 灰塵山
                    { id: 593, weight: 15, levelRange: [999, 1014] },  // 胖嘟嘟
                    { id: 545, weight: 12, levelRange: [999, 1014] },  // 蜈蚣王
                    { id: 615, weight: 12, levelRange: [999, 1014] },  // 幾何雪花（稀有）
                    { id: 591, weight: 10, levelRange: [999, 1014] },  // 敗露球菇
                    { id: 606, weight: 7, levelRange: [999, 1014] },   // 大宇怪（稀有）
                    { id: 642, weight: 3, levelRange: [1014, 1014] },   // 雷電雲（傳說·風雲神）
                ]
            },
            {
                id: 'unova_twist_mountain',
                name: '螺旋山',
                description: '合眾地區中心的螺旋狀巨大山脈',
                levelRange: [1015, 1031],
                pokemon: [
                    { id: 526, weight: 20, levelRange: [1015, 1031] },  // 龐巖怪
                    { id: 534, weight: 18, levelRange: [1015, 1031] },  // 修建老匠
                    { id: 530, weight: 15, levelRange: [1015, 1031] },  // 龍頭地鼠
                    { id: 613, weight: 15, levelRange: [1015, 1031] },  // 噴嚏熊
                    { id: 624, weight: 12, levelRange: [1015, 1031] },  // 駒刀小兵
                    { id: 631, weight: 10, levelRange: [1015, 1031] },  // 熔蟻獸（稀有）
                    { id: 632, weight: 10, levelRange: [1015, 1031] },  // 鐵蟻（稀有）
                    { id: 645, weight: 3, levelRange: [1031, 1031] },   // 土地雲（傳說·風雲神）
                ]
            },
            {
                id: 'unova_route9',
                name: '9號道路',
                description: '帆巴市到雙龍市之間的購物街道路',
                levelRange: [1032, 1048],
                pokemon: [
                    { id: 560, weight: 18, levelRange: [1032, 1048] },  // 頭巾混混
                    { id: 552, weight: 18, levelRange: [1032, 1048] },  // 混混鱷
                    { id: 510, weight: 15, levelRange: [1032, 1048] },  // 酷豹
                    { id: 571, weight: 12, levelRange: [1032, 1048] },  // 索羅亞克
                    { id: 523, weight: 12, levelRange: [1032, 1048] },  // 雷電斑馬
                    { id: 619, weight: 12, levelRange: [1032, 1048] },  // 功夫鼬
                    { id: 626, weight: 8, levelRange: [1032, 1048] },   // 爆炸頭水牛（稀有）
                    { id: 610, weight: 5, levelRange: [1032, 1048] },   // 牙牙（稀有）
                    { id: 647, weight: 2, levelRange: [1048, 1048] },   // 凱路迪歐（幻之寶可夢）
                ]
            },
            {
                id: 'unova_dragonspiral_tower',
                name: '龍螺旋之塔',
                description: '合眾地區最古老的建築，傳說中龍之寶可夢沉睡之地',
                levelRange: [1049, 1065],
                pokemon: [
                    { id: 610, weight: 20, levelRange: [1049, 1065] },  // 牙牙
                    { id: 563, weight: 18, levelRange: [1049, 1065] },  // 死神棺
                    { id: 623, weight: 15, levelRange: [1049, 1065] },  // 泥偶巨人
                    { id: 609, weight: 12, levelRange: [1049, 1065] },  // 水晶燈火靈
                    { id: 576, weight: 12, levelRange: [1049, 1065] },  // 哥德小姐
                    { id: 579, weight: 10, levelRange: [1049, 1065] },  // 人造細胞卵
                    { id: 621, weight: 10, levelRange: [1049, 1065] },  // 赤面龍
                    { id: 633, weight: 8, levelRange: [1049, 1065] },   // 單首龍（稀有）
                    { id: 638, weight: 3, levelRange: [1065, 1065] },   // 勾帕路翁（傳說）
                    { id: 639, weight: 2, levelRange: [1065, 1065] },   // 代拉基翁（傳說）
                ]
            },
            {
                id: 'unova_route10',
                name: '10號道路',
                description: '通往合眾冠軍之路的入口',
                levelRange: [1066, 1081],
                pokemon: [
                    { id: 553, weight: 18, levelRange: [1066, 1081] },  // 流氓鱷
                    { id: 555, weight: 15, levelRange: [1066, 1081] },  // 達摩狒狒
                    { id: 508, weight: 15, levelRange: [1066, 1081] },  // 長毛狗
                    { id: 542, weight: 15, levelRange: [1066, 1081] },  // 保姆蟲
                    { id: 627, weight: 12, levelRange: [1066, 1081] },  // 毛頭小鷹
                    { id: 629, weight: 10, levelRange: [1066, 1081] },  // 禿鷹丫頭
                    { id: 596, weight: 10, levelRange: [1066, 1081] },  // 電蜘蛛
                    { id: 640, weight: 3, levelRange: [1081, 1081] },   // 畢力吉翁（傳說）
                    { id: 641, weight: 3, levelRange: [1081, 1081] },   // 龍捲雲（傳說）
                ]
            },
            {
                id: 'unova_victory_road',
                name: '合眾冠軍之路',
                description: '通往合眾聯盟的最終試煉',
                levelRange: [1082, 1098],
                pokemon: [
                    { id: 611, weight: 16, levelRange: [1082, 1098] },  // 斧牙龍
                    { id: 625, weight: 14, levelRange: [1082, 1098] },  // 劈斬司令
                    { id: 601, weight: 14, levelRange: [1082, 1098] },  // 齒輪怪
                    { id: 589, weight: 12, levelRange: [1082, 1098] },  // 騎士蝸牛
                    { id: 617, weight: 12, levelRange: [1082, 1098] },  // 敏捷蟲
                    { id: 637, weight: 10, levelRange: [1082, 1098] },  // 火神蛾
                    { id: 634, weight: 10, levelRange: [1082, 1098] },  // 雙首暴龍
                    { id: 628, weight: 8, levelRange: [1082, 1098] },   // 勇士雄鷹（稀有）
                    { id: 630, weight: 4, levelRange: [1082, 1098] },   // 禿鷹娜（稀有）
                    { id: 648, weight: 2, levelRange: [1098, 1098] },   // 美洛耶塔（幻之寶可夢）
                ]
            },
            {
                id: 'unova_giant_chasm',
                name: '巨人洞窟',
                description: '傳說中酋雷姆棲息的冰冷巨洞',
                levelRange: [1099, 1115],
                pokemon: [
                    { id: 614, weight: 16, levelRange: [1099, 1115] },  // 凍原熊
                    { id: 584, weight: 14, levelRange: [1099, 1115] },  // 雙倍多多冰
                    { id: 604, weight: 14, levelRange: [1099, 1115] },  // 麻麻鰻魚王
                    { id: 598, weight: 12, levelRange: [1099, 1115] },  // 堅果啞鈴
                    { id: 558, weight: 12, levelRange: [1099, 1115] },  // 巖殿居蟹
                    { id: 565, weight: 10, levelRange: [1099, 1115] },  // 肋骨海龜
                    { id: 567, weight: 10, levelRange: [1099, 1115] },  // 始祖大鳥
                    { id: 646, weight: 1, levelRange: [1115, 1115] },   // 酋雷姆（傳說）
                ]
            },
            {
                id: 'unova_n_castle',
                name: 'N之城堡',
                description: '等離子團的空中城堡，傳說之龍沉眠之地',
                levelRange: [1116, 1132],
                pokemon: [
                    { id: 612, weight: 14, levelRange: [1116, 1132] },  // 雙斧戰龍
                    { id: 635, weight: 12, levelRange: [1116, 1132] },  // 三首惡龍
                    { id: 571, weight: 12, levelRange: [1116, 1132] },  // 索羅亞克
                    { id: 555, weight: 10, levelRange: [1116, 1132] },  // 達摩狒狒
                    { id: 637, weight: 10, levelRange: [1116, 1132] },  // 火神蛾
                    { id: 609, weight: 10, levelRange: [1116, 1132] },  // 水晶燈火靈
                    { id: 539, weight: 8, levelRange: [1116, 1132] },   // 打擊鬼
                    { id: 538, weight: 8, levelRange: [1116, 1132] },   // 投摔鬼
                    { id: 643, weight: 2, levelRange: [1131, 1132] },   // 萊希拉姆（傳說）
                    { id: 644, weight: 2, levelRange: [1131, 1132] },   // 捷克羅姆（傳說）
                ]
            },
            {
                id: 'unova_liberty_garden',
                name: '自由花園 & 天涯之境',
                description: '傳說中幻之寶可夢棲息的神秘場所',
                levelRange: [1133, 1149],
                pokemon: [
                    { id: 612, weight: 14, levelRange: [1133, 1149] },  // 雙斧戰龍
                    { id: 635, weight: 12, levelRange: [1133, 1149] },  // 三首惡龍
                    { id: 637, weight: 12, levelRange: [1133, 1149] },  // 火神蛾
                    { id: 604, weight: 10, levelRange: [1133, 1149] },  // 麻麻鰻魚王
                    { id: 625, weight: 10, levelRange: [1133, 1149] },  // 劈斬司令
                    { id: 589, weight: 10, levelRange: [1133, 1149] },  // 騎士蝸牛
                    { id: 601, weight: 10, levelRange: [1133, 1149] },  // 齒輪怪
                    { id: 628, weight: 8, levelRange: [1133, 1149] },   // 勇士雄鷹
                    { id: 494, weight: 2, levelRange: [1149, 1149] },   // 比克提尼（幻之寶可夢）
                    { id: 649, weight: 1, levelRange: [1148, 1149] },   // 蓋諾賽克特（幻之寶可夢）
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
                levelRange: [1150, 1168],
                pokemon: [
                    { id: 659, weight: 30, levelRange: [1150, 1168] },  // 掘掘兔
                    { id: 661, weight: 25, levelRange: [1150, 1168] },  // 小箭雀
                    { id: 664, weight: 20, levelRange: [1150, 1168] },  // 粉蝶蟲
                    { id: 650, weight: 15, levelRange: [1150, 1168] },  // 哈力慄
                    { id: 656, weight: 10, levelRange: [1150, 1168] },  // 呱呱泡蛙（稀有）
                ]
            },
            {
                id: 'kalos_santalune_forest',
                name: '白檀森林',
                description: '白檀市附近的茂密森林，蟲系寶可夢樂園',
                levelRange: [1169, 1188],
                pokemon: [
                    { id: 664, weight: 25, levelRange: [1169, 1188] },  // 粉蝶蟲
                    { id: 665, weight: 20, levelRange: [1169, 1188] },  // 粉蝶蛹
                    { id: 661, weight: 20, levelRange: [1169, 1188] },  // 小箭雀
                    { id: 659, weight: 15, levelRange: [1169, 1188] },  // 掘掘兔
                    { id: 653, weight: 10, levelRange: [1169, 1188] },  // 火狐狸（稀有）
                    { id: 666, weight: 10, levelRange: [1169, 1188] },  // 彩粉蝶（稀有）
                ]
            },
            {
                id: 'kalos_route4',
                name: '4號道路（花庭園）',
                description: '密阿雷市南面的美麗花園道路',
                levelRange: [1189, 1209],
                pokemon: [
                    { id: 669, weight: 25, levelRange: [1189, 1209] },  // 花蓓蓓
                    { id: 667, weight: 20, levelRange: [1189, 1209] },  // 小獅獅
                    { id: 672, weight: 20, levelRange: [1189, 1209] },  // 坐騎小羊
                    { id: 661, weight: 15, levelRange: [1189, 1209] },  // 小箭雀
                    { id: 662, weight: 10, levelRange: [1189, 1209] },  // 火箭雀
                    { id: 670, weight: 10, levelRange: [1189, 1209] },  // 花葉蒂（稀有）
                ]
            },
            {
                id: 'kalos_route5',
                name: '5號道路',
                description: '密阿雷市到海翼市之間的道路',
                levelRange: [1210, 1229],
                pokemon: [
                    { id: 674, weight: 22, levelRange: [1210, 1229] },  // 頑皮熊貓
                    { id: 659, weight: 20, levelRange: [1210, 1229] },  // 掘掘兔
                    { id: 667, weight: 18, levelRange: [1210, 1229] },  // 小獅獅
                    { id: 661, weight: 15, levelRange: [1210, 1229] },  // 小箭雀
                    { id: 660, weight: 15, levelRange: [1210, 1229] },  // 掘地兔
                    { id: 650, weight: 10, levelRange: [1210, 1229] },  // 哈力慄（稀有）
                ]
            },
            {
                id: 'kalos_route7',
                name: '7號道路（要塞道路）',
                description: '通往異世石碑的古道',
                levelRange: [1230, 1249],
                pokemon: [
                    { id: 676, weight: 20, levelRange: [1230, 1249] },  // 多麗米亞
                    { id: 672, weight: 18, levelRange: [1230, 1249] },  // 坐騎小羊
                    { id: 674, weight: 18, levelRange: [1230, 1249] },  // 頑皮熊貓
                    { id: 662, weight: 15, levelRange: [1230, 1249] },  // 火箭雀
                    { id: 678, weight: 12, levelRange: [1230, 1249] },  // 超能妙喵
                    { id: 677, weight: 12, levelRange: [1230, 1249] },  // 妙喵
                    { id: 656, weight: 5, levelRange: [1230, 1249] },   // 呱呱泡蛙（稀有）
                ]
            },
            {
                id: 'kalos_connecting_cave',
                name: '連線洞穴',
                description: '連線7號道路和密阿雷市的洞窟',
                levelRange: [1250, 1269],
                pokemon: [
                    { id: 679, weight: 25, levelRange: [1250, 1269] },  // 獨劍鞘
                    { id: 703, weight: 18, levelRange: [1250, 1269] },  // 小碎鑽
                    { id: 41, weight: 18, levelRange: [1250, 1269] },   // 超音蝠
                    { id: 694, weight: 15, levelRange: [1250, 1269] },  // 傘電蜥
                    { id: 680, weight: 14, levelRange: [1250, 1269] },  // 雙劍鞘（稀有）
                    { id: 695, weight: 10, levelRange: [1250, 1269] },  // 光電傘蜥（稀有）
                ]
            },
            {
                id: 'kalos_route8',
                name: '8號道路（海岸線）',
                description: '海翼市到古香市之間的海岸道路',
                levelRange: [1270, 1289],
                pokemon: [
                    { id: 688, weight: 22, levelRange: [1270, 1289] },  // 龜腳腳
                    { id: 690, weight: 20, levelRange: [1270, 1289] },  // 垃垃藻
                    { id: 692, weight: 18, levelRange: [1270, 1289] },  // 鐵臂槍蝦
                    { id: 686, weight: 15, levelRange: [1270, 1289] },  // 好啦魷
                    { id: 689, weight: 12, levelRange: [1270, 1289] },  // 龜足巨鎧（稀有）
                    { id: 693, weight: 8, levelRange: [1270, 1289] },   // 鋼炮臂蝦（稀有）
                    { id: 687, weight: 5, levelRange: [1270, 1289] },   // 烏賊王（稀有）
                ]
            },
            {
                id: 'kalos_route9',
                name: '9號道路（碎石路）',
                description: '古香市到映照洞穴之間的陡峭山路',
                levelRange: [1290, 1309],
                pokemon: [
                    { id: 696, weight: 22, levelRange: [1290, 1309] },  // 寶寶暴龍
                    { id: 698, weight: 22, levelRange: [1290, 1309] },  // 冰雪龍
                    { id: 672, weight: 18, levelRange: [1290, 1309] },  // 坐騎小羊
                    { id: 673, weight: 15, levelRange: [1290, 1309] },  // 坐騎山羊
                    { id: 697, weight: 13, levelRange: [1290, 1309] },  // 怪顎龍（稀有）
                    { id: 699, weight: 10, levelRange: [1290, 1309] },  // 冰雪巨龍（稀有）
                ]
            },
            {
                id: 'kalos_glittering_cave',
                name: '映照洞穴',
                description: '蘊含化石的閃亮洞窟',
                levelRange: [1310, 1329],
                pokemon: [
                    { id: 703, weight: 25, levelRange: [1310, 1329] },  // 小碎鑽
                    { id: 679, weight: 20, levelRange: [1310, 1329] },  // 獨劍鞘
                    { id: 696, weight: 15, levelRange: [1310, 1329] },  // 寶寶暴龍
                    { id: 698, weight: 15, levelRange: [1310, 1329] },  // 冰雪龍
                    { id: 694, weight: 12, levelRange: [1310, 1329] },  // 傘電蜥
                    { id: 680, weight: 8, levelRange: [1310, 1329] },   // 雙劍鞘（稀有）
                    { id: 704, weight: 5, levelRange: [1310, 1329] },   // 黏黏寶（稀有）
                ]
            },
            {
                id: 'kalos_route10',
                name: '10號道路（石碑道路）',
                description: '密阿雷市到荒涼鎮之間的神秘道路',
                levelRange: [1330, 1349],
                pokemon: [
                    { id: 705, weight: 18, levelRange: [1330, 1349] },  // 黏美兒
                    { id: 667, weight: 15, levelRange: [1330, 1349] },  // 小獅獅
                    { id: 668, weight: 15, levelRange: [1330, 1349] },  // 火炎獅
                    { id: 678, weight: 15, levelRange: [1330, 1349] },  // 超能妙喵
                    { id: 662, weight: 12, levelRange: [1330, 1349] },  // 火箭雀
                    { id: 663, weight: 12, levelRange: [1330, 1349] },  // 烈箭鷹
                    { id: 706, weight: 8, levelRange: [1330, 1349] },   // 黏美龍（稀有）
                    { id: 704, weight: 5, levelRange: [1330, 1349] },   // 黏黏寶（稀有）
                    { id: 700, weight: 5, levelRange: [1330, 1349] },   // 仙子伊布（稀有）
                ]
            },
            {
                id: 'kalos_route11',
                name: '11號道路（鏡穴道路）',
                description: '通往映照洞穴的崎嶇道路',
                levelRange: [1350, 1369],
                pokemon: [
                    { id: 674, weight: 20, levelRange: [1350, 1369] },  // 頑皮熊貓
                    { id: 667, weight: 18, levelRange: [1350, 1369] },  // 小獅獅
                    { id: 675, weight: 15, levelRange: [1350, 1369] },  // 霸道熊貓
                    { id: 682, weight: 15, levelRange: [1350, 1369] },  // 粉香香
                    { id: 684, weight: 15, levelRange: [1350, 1369] },  // 綿綿泡芙
                    { id: 668, weight: 12, levelRange: [1350, 1369] },  // 火炎獅
                    { id: 683, weight: 5, levelRange: [1350, 1369] },   // 芳香精（稀有）
                ]
            },
            {
                id: 'kalos_route12',
                name: '12號道路（海濱道路）',
                description: '古香市南方的海濱道路',
                levelRange: [1370, 1389],
                pokemon: [
                    { id: 690, weight: 20, levelRange: [1370, 1389] },  // 垃垃藻
                    { id: 692, weight: 18, levelRange: [1370, 1389] },  // 鐵臂槍蝦
                    { id: 688, weight: 17, levelRange: [1370, 1389] },  // 龜腳腳
                    { id: 691, weight: 15, levelRange: [1370, 1389] },  // 毒藻龍
                    { id: 686, weight: 15, levelRange: [1370, 1389] },  // 好啦魷
                    { id: 693, weight: 10, levelRange: [1370, 1389] },  // 鋼炮臂蝦（稀有）
                    { id: 685, weight: 5, levelRange: [1370, 1389] },   // 胖甜妮（稀有）
                ]
            },
            {
                id: 'kalos_route13',
                name: '13號道路（荒地道路）',
                description: '穿越乾旱荒原的道路',
                levelRange: [1390, 1409],
                pokemon: [
                    { id: 694, weight: 22, levelRange: [1390, 1409] },  // 傘電蜥
                    { id: 660, weight: 18, levelRange: [1390, 1409] },  // 掘地兔
                    { id: 695, weight: 15, levelRange: [1390, 1409] },  // 光電傘蜥
                    { id: 673, weight: 15, levelRange: [1390, 1409] },  // 坐騎山羊
                    { id: 663, weight: 12, levelRange: [1390, 1409] },  // 烈箭鷹
                    { id: 702, weight: 10, levelRange: [1390, 1409] },  // 咚咚鼠
                    { id: 701, weight: 8, levelRange: [1390, 1409] },   // 摔角鷹人（稀有）
                ]
            },
            {
                id: 'kalos_route14',
                name: '14號道路（沼澤道路）',
                description: '穿越潮溼沼澤的陰暗道路',
                levelRange: [1410, 1429],
                pokemon: [
                    { id: 704, weight: 22, levelRange: [1410, 1429] },  // 黏黏寶
                    { id: 705, weight: 15, levelRange: [1410, 1429] },  // 黏美兒
                    { id: 675, weight: 15, levelRange: [1410, 1429] },  // 霸道熊貓
                    { id: 708, weight: 15, levelRange: [1410, 1429] },  // 小木靈
                    { id: 710, weight: 15, levelRange: [1410, 1429] },  // 南瓜精
                    { id: 709, weight: 10, levelRange: [1410, 1429] },  // 朽木妖（稀有）
                    { id: 711, weight: 8, levelRange: [1410, 1429] },   // 南瓜怪人（稀有）
                ]
            },
            {
                id: 'kalos_route15',
                name: '15號道路（日照道路）',
                description: '百刻市附近的荒野道路',
                levelRange: [1430, 1450],
                pokemon: [
                    { id: 668, weight: 18, levelRange: [1430, 1450] },  // 火炎獅
                    { id: 663, weight: 16, levelRange: [1430, 1450] },  // 烈箭鷹
                    { id: 675, weight: 16, levelRange: [1430, 1450] },  // 霸道熊貓
                    { id: 706, weight: 15, levelRange: [1430, 1450] },  // 黏美龍
                    { id: 673, weight: 15, levelRange: [1430, 1450] },  // 坐騎山羊
                    { id: 681, weight: 12, levelRange: [1430, 1450] },  // 堅盾劍怪（稀有）
                    { id: 671, weight: 8, levelRange: [1430, 1450] },   // 花潔夫人（稀有）
                ]
            },
            {
                id: 'kalos_frost_cavern',
                name: '冰雪洞窟',
                description: '卡洛斯地區北部的冰冷洞窟',
                levelRange: [1451, 1470],
                pokemon: [
                    { id: 712, weight: 22, levelRange: [1451, 1470] },  // 冰寶
                    { id: 698, weight: 20, levelRange: [1451, 1470] },  // 冰雪龍
                    { id: 699, weight: 15, levelRange: [1451, 1470] },  // 冰雪巨龍
                    { id: 703, weight: 15, levelRange: [1451, 1470] },  // 小碎鑽
                    { id: 713, weight: 12, levelRange: [1451, 1470] },  // 冰岩怪
                    { id: 706, weight: 10, levelRange: [1451, 1470] },  // 黏美龍（稀有）
                    { id: 681, weight: 6, levelRange: [1451, 1470] },   // 堅盾劍怪（稀有）
                ]
            },
            {
                id: 'kalos_route17',
                name: '17號道路（瑪姆牛道路）',
                description: '剷雪通行的雪原道路',
                levelRange: [1471, 1490],
                pokemon: [
                    { id: 712, weight: 22, levelRange: [1471, 1490] },  // 冰寶
                    { id: 713, weight: 15, levelRange: [1471, 1490] },  // 冰岩怪
                    { id: 699, weight: 15, levelRange: [1471, 1490] },  // 冰雪巨龍
                    { id: 660, weight: 13, levelRange: [1471, 1490] },  // 掘地兔
                    { id: 663, weight: 13, levelRange: [1471, 1490] },  // 烈箭鷹
                    { id: 706, weight: 12, levelRange: [1471, 1490] },  // 黏美龍
                    { id: 707, weight: 10, levelRange: [1471, 1490] },  // 鑰圈兒（稀有）
                ]
            },
            {
                id: 'kalos_route18',
                name: '18號道路（谷間道路）',
                description: '映雪市到冠軍之路之間的峽谷道路',
                levelRange: [1491, 1510],
                pokemon: [
                    { id: 706, weight: 18, levelRange: [1491, 1510] },  // 黏美龍
                    { id: 675, weight: 16, levelRange: [1491, 1510] },  // 霸道熊貓
                    { id: 681, weight: 14, levelRange: [1491, 1510] },  // 堅盾劍怪
                    { id: 668, weight: 14, levelRange: [1491, 1510] },  // 火炎獅
                    { id: 663, weight: 14, levelRange: [1491, 1510] },  // 烈箭鷹
                    { id: 697, weight: 12, levelRange: [1491, 1510] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [1491, 1510] },  // 冰雪巨龍（稀有）
                ]
            },
            {
                id: 'kalos_route19',
                name: '19號道路（大谷道路）',
                description: '通往冠軍之路的壯闊峽谷',
                levelRange: [1511, 1530],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [1511, 1530] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [1511, 1530] },  // 堅盾劍怪
                    { id: 675, weight: 14, levelRange: [1511, 1530] },  // 霸道熊貓
                    { id: 697, weight: 14, levelRange: [1511, 1530] },  // 怪顎龍
                    { id: 668, weight: 14, levelRange: [1511, 1530] },  // 火炎獅
                    { id: 663, weight: 14, levelRange: [1511, 1530] },  // 烈箭鷹
                    { id: 699, weight: 10, levelRange: [1511, 1530] },  // 冰雪巨龍
                    { id: 713, weight: 4, levelRange: [1511, 1530] },   // 冰岩怪（稀有）
                ]
            },
            {
                id: 'kalos_victory_road',
                name: '卡洛斯冠軍之路',
                description: '通往卡洛斯聯盟的最終試煉',
                levelRange: [1531, 1550],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [1531, 1550] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [1531, 1550] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [1531, 1550] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [1531, 1550] },  // 冰雪巨龍
                    { id: 675, weight: 12, levelRange: [1531, 1550] },  // 霸道熊貓
                    { id: 663, weight: 10, levelRange: [1531, 1550] },  // 烈箭鷹
                    { id: 668, weight: 10, levelRange: [1531, 1550] },  // 火炎獅
                    { id: 706, weight: 8, levelRange: [1531, 1550] },   // 黏美龍
                    { id: 714, weight: 4, levelRange: [1550, 1550] },   // 嗡蝠（稀有）
                ]
            },
            {
                id: 'kalos_terminus_cave',
                name: '終結洞窟',
                description: '傳說中基格爾德沉睡的深邃洞窟',
                levelRange: [1551, 1570],
                pokemon: [
                    { id: 703, weight: 18, levelRange: [1551, 1570] },  // 小碎鑽
                    { id: 681, weight: 15, levelRange: [1551, 1570] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [1551, 1570] },  // 怪顎龍
                    { id: 706, weight: 14, levelRange: [1551, 1570] },  // 黏美龍
                    { id: 713, weight: 12, levelRange: [1551, 1570] },  // 冰岩怪
                    { id: 715, weight: 10, levelRange: [1551, 1570] },  // 音波龍（稀有）
                    { id: 718, weight: 2, levelRange: [1570, 1570] },   // 基格爾德（傳說）
                ]
            },
            {
                id: 'kalos_unknown_dungeon',
                name: '未知洞窟',
                description: '卡洛斯地區最深處的神秘洞穴',
                levelRange: [1571, 1590],
                pokemon: [
                    { id: 706, weight: 16, levelRange: [1571, 1590] },  // 黏美龍
                    { id: 681, weight: 14, levelRange: [1571, 1590] },  // 堅盾劍怪
                    { id: 697, weight: 14, levelRange: [1571, 1590] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [1571, 1590] },  // 冰雪巨龍
                    { id: 675, weight: 12, levelRange: [1571, 1590] },  // 霸道熊貓
                    { id: 668, weight: 10, levelRange: [1571, 1590] },  // 火炎獅
                    { id: 716, weight: 3, levelRange: [1589, 1590] },   // 哲爾尼亞斯（傳說）
                    { id: 717, weight: 3, levelRange: [1589, 1590] },   // 伊裴爾塔爾（傳說）
                ]
            },
            {
                id: 'kalos_sea_spirits_den',
                name: '海神洞窟 & 花園',
                description: '傳說中幻之寶可夢棲息的神秘場所',
                levelRange: [1591, 1614],
                pokemon: [
                    { id: 706, weight: 14, levelRange: [1591, 1614] },  // 黏美龍
                    { id: 681, weight: 12, levelRange: [1591, 1614] },  // 堅盾劍怪
                    { id: 697, weight: 12, levelRange: [1591, 1614] },  // 怪顎龍
                    { id: 699, weight: 12, levelRange: [1591, 1614] },  // 冰雪巨龍
                    { id: 668, weight: 10, levelRange: [1591, 1614] },  // 火炎獅
                    { id: 663, weight: 10, levelRange: [1591, 1614] },  // 烈箭鷹
                    { id: 675, weight: 10, levelRange: [1591, 1614] },  // 霸道熊貓
                    { id: 713, weight: 8, levelRange: [1591, 1614] },   // 冰岩怪
                    { id: 719, weight: 2, levelRange: [1610, 1614] },   // 蒂安希（幻之寶可夢）
                    { id: 720, weight: 1, levelRange: [1610, 1614] },   // 胡帕（幻之寶可夢）
                    { id: 721, weight: 1, levelRange: [1610, 1614] },   // 波爾凱尼恩（幻之寶可夢）
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
                levelRange: [1615, 1647],
                pokemon: [
                    { id: 722, weight: 25, levelRange: [1615, 1647] },  // 木木梟
                    { id: 725, weight: 25, levelRange: [1615, 1647] },  // 火斑喵
                    { id: 728, weight: 25, levelRange: [1615, 1647] },  // 球球海獅
                    { id: 731, weight: 15, levelRange: [1615, 1647] },  // 小篤兒
                    { id: 734, weight: 10, levelRange: [1615, 1647] },  // 貓鼬少
                ]
            },
            {
                id: 'alola_route2',
                name: '2號道路',
                description: '好奧樂市郊外的道路',
                levelRange: [1648, 1687],
                pokemon: [
                    { id: 744, weight: 25, levelRange: [1648, 1687] },  // 巖狗狗
                    { id: 736, weight: 20, levelRange: [1648, 1687] },  // 強顎雞母蟲
                    { id: 739, weight: 20, levelRange: [1648, 1687] },  // 好勝蟹
                    { id: 742, weight: 20, levelRange: [1648, 1687] },  // 萌虻
                    { id: 741, weight: 15, levelRange: [1648, 1687] },  // 花舞鳥
                ]
            },
            {
                id: 'alola_route3',
                name: '3號道路',
                description: '美樂美樂島的草地道路',
                levelRange: [1688, 1727],
                pokemon: [
                    { id: 749, weight: 25, levelRange: [1688, 1727] },  // 泥驢仔
                    { id: 747, weight: 20, levelRange: [1688, 1727] },  // 好壞星
                    { id: 751, weight: 20, levelRange: [1688, 1727] },  // 滴蛛
                    { id: 753, weight: 20, levelRange: [1688, 1727] },  // 偽螳草
                    { id: 746, weight: 15, levelRange: [1688, 1727] },  // 弱丁魚
                ]
            },
            {
                id: 'alola_route4',
                name: '4號道路',
                description: '阿卡拉島的熱鬧街道',
                levelRange: [1728, 1767],
                pokemon: [
                    { id: 755, weight: 20, levelRange: [1728, 1767] },  // 睡睡菇
                    { id: 757, weight: 20, levelRange: [1728, 1767] },  // 夜盜火蜥
                    { id: 759, weight: 20, levelRange: [1728, 1767] },  // 童偶熊
                    { id: 761, weight: 20, levelRange: [1728, 1767] },  // 甜竹竹
                    { id: 764, weight: 20, levelRange: [1728, 1767] },  // 花療環環
                ]
            },
            {
                id: 'alola_route5',
                name: '5號道路',
                description: '阿卡拉島連線至皇家大道的道路',
                levelRange: [1768, 1808],
                pokemon: [
                    { id: 723, weight: 15, levelRange: [1768, 1808] },  // 投羽梟
                    { id: 726, weight: 15, levelRange: [1768, 1808] },  // 炎熱喵
                    { id: 729, weight: 15, levelRange: [1768, 1808] },  // 花漾海獅
                    { id: 765, weight: 15, levelRange: [1768, 1808] },  // 智揮猩
                    { id: 766, weight: 15, levelRange: [1768, 1808] },  // 投擲猴
                    { id: 735, weight: 15, levelRange: [1768, 1808] },  // 貓鼬探長
                    { id: 740, weight: 10, levelRange: [1768, 1808] },  // 好勝毛蟹
                ]
            },
            {
                id: 'alola_route6',
                name: '6號道路',
                description: '烏拉烏拉島的道路',
                levelRange: [1809, 1875],
                pokemon: [
                    { id: 737, weight: 20, levelRange: [1809, 1875] },  // 蟲電寶
                    { id: 743, weight: 20, levelRange: [1809, 1875] },  // 蝶結萌虻
                    { id: 745, weight: 20, levelRange: [1809, 1875] },  // 鬃巖狼人
                    { id: 732, weight: 15, levelRange: [1809, 1875] },  // 喇叭啄鳥
                    { id: 767, weight: 15, levelRange: [1809, 1875] },  // 宇宙烏賊
                    { id: 768, weight: 10, levelRange: [1809, 1875] },  // 具甲武者
                ]
            },
            {
                id: 'alola_route7',
                name: '7號道路',
                description: '烏拉烏拉島的海濱道路',
                levelRange: [1876, 1942],
                pokemon: [
                    { id: 750, weight: 20, levelRange: [1876, 1942] },  // 重泥挽馬
                    { id: 752, weight: 20, levelRange: [1876, 1942] },  // 滴蛛霸
                    { id: 754, weight: 20, levelRange: [1876, 1942] },  // 蘭螳花
                    { id: 748, weight: 15, levelRange: [1876, 1942] },  // 超壞星
                    { id: 756, weight: 15, levelRange: [1876, 1942] },  // 燈罩夜菇
                    { id: 758, weight: 10, levelRange: [1876, 1942] },  // 焰後蜥
                ]
            },
            {
                id: 'alola_route8',
                name: '8號道路',
                description: '烏拉烏拉島至波尼島的道路',
                levelRange: [1943, 2008],
                pokemon: [
                    { id: 760, weight: 15, levelRange: [1943, 2008] },  // 穿著熊
                    { id: 762, weight: 15, levelRange: [1943, 2008] },  // 甜舞妮
                    { id: 763, weight: 15, levelRange: [1943, 2008] },  // 甜冷美后
                    { id: 769, weight: 15, levelRange: [1943, 2008] },  // 沙丘娃
                    { id: 770, weight: 15, levelRange: [1943, 2008] },  // 噬沙堡爺
                    { id: 771, weight: 15, levelRange: [1943, 2008] },  // 拳海參
                    { id: 772, weight: 10, levelRange: [1943, 2008] },  // 屬性：空
                ]
            },
            {
                id: 'alola_route9',
                name: '9號道路',
                description: '波尼島的山區道路',
                levelRange: [2009, 2075],
                pokemon: [
                    { id: 724, weight: 12, levelRange: [2009, 2075] },  // 狙射樹梟
                    { id: 727, weight: 12, levelRange: [2009, 2075] },  // 熾焰咆哮虎
                    { id: 730, weight: 12, levelRange: [2009, 2075] },  // 西獅海壬
                    { id: 733, weight: 12, levelRange: [2009, 2075] },  // 銃嘴大鳥
                    { id: 738, weight: 12, levelRange: [2009, 2075] },  // 鍬農炮蟲
                    { id: 773, weight: 10, levelRange: [2009, 2075] },  // 銀伴戰獸
                    { id: 774, weight: 10, levelRange: [2009, 2075] },  // 小隕星
                    { id: 775, weight: 10, levelRange: [2009, 2075] },  // 樹枕尾熊
                    { id: 776, weight: 10, levelRange: [2009, 2075] },  // 爆焰龜獸
                ]
            },
            {
                id: 'alola_route10',
                name: '10號道路',
                description: '波尼島的花園道路',
                levelRange: [2076, 2142],
                pokemon: [
                    { id: 777, weight: 15, levelRange: [2076, 2142] },  // 託戈德瑪爾
                    { id: 778, weight: 15, levelRange: [2076, 2142] },  // 謎擬Ｑ
                    { id: 779, weight: 15, levelRange: [2076, 2142] },  // 磨牙彩皮魚
                    { id: 780, weight: 15, levelRange: [2076, 2142] },  // 老翁龍
                    { id: 781, weight: 15, levelRange: [2076, 2142] },  // 破破舵輪
                    { id: 782, weight: 15, levelRange: [2076, 2142] },  // 心鱗寶
                    { id: 783, weight: 10, levelRange: [2076, 2142] },  // 鱗甲龍
                ]
            },
            {
                id: 'alola_route11',
                name: '11號道路',
                description: '波尼島的深處道路',
                levelRange: [2143, 2209],
                pokemon: [
                    { id: 784, weight: 15, levelRange: [2143, 2209] },  // 杖尾鱗甲龍
                    { id: 789, weight: 15, levelRange: [2143, 2209] },  // 科斯莫古
                    { id: 790, weight: 15, levelRange: [2143, 2209] },  // 科斯莫姆
                    { id: 785, weight: 10, levelRange: [2143, 2209] },  // 卡璞・鳴鳴
                    { id: 786, weight: 10, levelRange: [2143, 2209] },  // 卡璞・蝶蝶
                    { id: 787, weight: 10, levelRange: [2143, 2209] },  // 卡璞・哞哞
                    { id: 788, weight: 10, levelRange: [2143, 2209] },  // 卡璞・鰭鰭
                    { id: 791, weight: 8, levelRange: [2143, 2209] },   // 索爾迦雷歐
                    { id: 792, weight: 7, levelRange: [2143, 2209] },   // 露奈雅拉
                ]
            },
            {
                id: 'alola_route12',
                name: '12號道路',
                description: '異獸出沒的異次元區域',
                levelRange: [2210, 2276],
                pokemon: [
                    { id: 793, weight: 15, levelRange: [2210, 2276] },  // 虛吾伊德
                    { id: 794, weight: 15, levelRange: [2210, 2276] },  // 爆肌蚊
                    { id: 795, weight: 15, levelRange: [2210, 2276] },  // 費洛美螂
                    { id: 796, weight: 15, levelRange: [2210, 2276] },  // 電束木
                    { id: 797, weight: 15, levelRange: [2210, 2276] },  // 鐵火輝夜
                    { id: 798, weight: 15, levelRange: [2210, 2276] },  // 紙御劍
                    { id: 799, weight: 10, levelRange: [2210, 2276] },  // 惡食大王
                ]
            },
            {
                id: 'alola_route13',
                name: '13號道路',
                description: '奈克洛茲瑪的黑暗領域',
                levelRange: [2277, 2343],
                pokemon: [
                    { id: 800, weight: 20, levelRange: [2277, 2343] },  // 奈克洛茲瑪
                    { id: 803, weight: 20, levelRange: [2277, 2343] },  // 毒貝比
                    { id: 801, weight: 15, levelRange: [2277, 2343] },  // 瑪機雅娜
                    { id: 802, weight: 15, levelRange: [2277, 2343] },  // 瑪夏多
                    { id: 804, weight: 15, levelRange: [2277, 2343] },  // 四顎針龍
                    { id: 805, weight: 15, levelRange: [2277, 2343] },  // 壘磊石
                ]
            },
            {
                id: 'alola_route14',
                name: '14號道路',
                description: '阿羅拉的極限之地',
                levelRange: [2344, 2410],
                pokemon: [
                    { id: 808, weight: 30, levelRange: [2344, 2410] },  // 美錄坦
                    { id: 809, weight: 30, levelRange: [2344, 2410] },  // 美錄梅塔
                    { id: 806, weight: 20, levelRange: [2344, 2410] },  // 火頭獠牙
                    { id: 807, weight: 20, levelRange: [2344, 2410] },  // 澤洛拉
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
                levelRange: [2411, 2544],
                pokemon: [
                    { id: 810, weight: 15, levelRange: [2411, 2544] },  // 敲音猴
                    { id: 813, weight: 15, levelRange: [2411, 2544] },  // 炎兔兒
                    { id: 816, weight: 15, levelRange: [2411, 2544] },  // 淚眼蜥
                    { id: 819, weight: 15, levelRange: [2411, 2544] },  // 貪心栗鼠
                    { id: 821, weight: 15, levelRange: [2411, 2544] },  // 稚山雀
                    { id: 824, weight: 15, levelRange: [2411, 2477] },  // 索偵蟲
                    { id: 827, weight: 10, levelRange: [2411, 2544] },  // 偷兒狐
                ]
            },
            {
                id: 'galar_route2',
                name: '2號道路',
                description: '機擎市郊外的礦區道路',
                levelRange: [2545, 2678],
                pokemon: [
                    { id: 829, weight: 15, levelRange: [2545, 2678] },  // 幼棉棉
                    { id: 831, weight: 15, levelRange: [2545, 2678] },  // 毛辮羊
                    { id: 820, weight: 12, levelRange: [2545, 2678] },  // 藏飽栗鼠
                    { id: 822, weight: 12, levelRange: [2545, 2678] },  // 藍鴉
                    { id: 825, weight: 12, levelRange: [2545, 2678] },  // 天罩蟲
                    { id: 828, weight: 12, levelRange: [2545, 2678] },  // 狐大盜
                    { id: 833, weight: 12, levelRange: [2545, 2678] },  // 咬咬龜
                ]
            },
            {
                id: 'galar_route3',
                name: '3號道路',
                description: '伽勒爾礦山深處',
                levelRange: [2679, 2812],
                pokemon: [
                    { id: 835, weight: 15, levelRange: [2679, 2812] },  // 來電汪
                    { id: 837, weight: 15, levelRange: [2679, 2812] },  // 小炭仔
                    { id: 811, weight: 12, levelRange: [2679, 2812] },  // 啪咚猴
                    { id: 814, weight: 12, levelRange: [2679, 2812] },  // 騰蹴小將
                    { id: 817, weight: 12, levelRange: [2679, 2812] },  // 變澀蜥
                    { id: 830, weight: 12, levelRange: [2679, 2812] },  // 白蓬蓬
                    { id: 832, weight: 12, levelRange: [2679, 2812] },  // 毛毛角羊
                ]
            },
            {
                id: 'galar_route4',
                name: '4號道路',
                description: '曠野地帶的開闊草原',
                levelRange: [2813, 2946],
                pokemon: [
                    { id: 840, weight: 15, levelRange: [2813, 2946] },  // 啃果蟲
                    { id: 843, weight: 15, levelRange: [2813, 2946] },  // 沙包蛇
                    { id: 834, weight: 12, levelRange: [2813, 2946] },  // 暴噬龜
                    { id: 836, weight: 12, levelRange: [2813, 2946] },  // 逐電犬
                    { id: 838, weight: 12, levelRange: [2813, 2946] },  // 大炭車
                    { id: 823, weight: 10, levelRange: [2813, 2946] },  // 鋼鎧鴉
                    { id: 826, weight: 10, levelRange: [2813, 2946] },  // 以歐路普
                ]
            },
            {
                id: 'galar_route5',
                name: '5號道路',
                description: '伽勒爾中部的城鎮區域',
                levelRange: [2947, 3079],
                pokemon: [
                    { id: 841, weight: 12, levelRange: [2947, 3079] },  // 蘋裹龍
                    { id: 842, weight: 12, levelRange: [2947, 3079] },  // 豐蜜龍
                    { id: 844, weight: 12, levelRange: [2947, 3079] },  // 沙螺蟒
                    { id: 839, weight: 10, levelRange: [2947, 3079] },  // 巨炭山
                    { id: 812, weight: 8, levelRange: [2947, 3079] },   // 轟擂金剛猩
                    { id: 815, weight: 8, levelRange: [2947, 3079] },   // 閃焰王牌
                    { id: 818, weight: 8, levelRange: [2947, 3079] },   // 千面避役
                ]
            },
            {
                id: 'galar_route6',
                name: '6號道路',
                description: '拳關市至棘丘市之間的濱海道路',
                levelRange: [3080, 3213],
                pokemon: [
                    { id: 846, weight: 15, levelRange: [3080, 3213] },  // 刺梭魚
                    { id: 848, weight: 15, levelRange: [3080, 3213] },  // 毒電嬰
                    { id: 850, weight: 15, levelRange: [3080, 3213] },  // 燒火蚣
                    { id: 845, weight: 12, levelRange: [3080, 3213] },  // 古月鳥
                    { id: 847, weight: 10, levelRange: [3080, 3213] },  // 戽斗尖梭
                    { id: 849, weight: 10, levelRange: [3080, 3213] },  // 顫弦蠑螈
                    { id: 851, weight: 10, levelRange: [3080, 3213] },  // 焚焰蚣
                ]
            },
            {
                id: 'galar_route7',
                name: '7號道路',
                description: '格拉球大草原的訓練區域',
                levelRange: [3214, 3347],
                pokemon: [
                    { id: 852, weight: 12, levelRange: [3214, 3347] },  // 拳拳蛸
                    { id: 854, weight: 12, levelRange: [3214, 3347] },  // 來悲茶
                    { id: 856, weight: 12, levelRange: [3214, 3347] },  // 迷布莉姆
                    { id: 853, weight: 10, levelRange: [3214, 3347] },  // 八爪武師
                    { id: 855, weight: 10, levelRange: [3214, 3347] },  // 怖思壺
                    { id: 857, weight: 10, levelRange: [3214, 3347] },  // 提布莉姆
                    { id: 858, weight: 8, levelRange: [3214, 3347] },   // 布莉姆溫
                ]
            },
            {
                id: 'galar_route8',
                name: '8號道路',
                description: '棘丘市附近的陰暗森林',
                levelRange: [3348, 3481],
                pokemon: [
                    { id: 859, weight: 12, levelRange: [3348, 3481] },  // 搗蛋小妖
                    { id: 860, weight: 10, levelRange: [3348, 3481] },  // 詐唬魔
                    { id: 862, weight: 10, levelRange: [3348, 3481] },  // 堵攔熊
                    { id: 863, weight: 10, levelRange: [3348, 3481] },  // 喵頭目
                    { id: 864, weight: 10, levelRange: [3348, 3481] },  // 魔靈珊瑚
                    { id: 865, weight: 10, levelRange: [3348, 3481] },  // 蔥遊兵
                    { id: 861, weight: 8, levelRange: [3348, 3481] },   // 長毛巨魔
                ]
            },
            {
                id: 'galar_route9',
                name: '9號道路',
                description: '冠之雪原的入口地帶',
                levelRange: [3482, 3615],
                pokemon: [
                    { id: 872, weight: 15, levelRange: [3482, 3615] },  // 雪吞蟲
                    { id: 866, weight: 12, levelRange: [3482, 3615] },  // 踏冰人偶
                    { id: 867, weight: 12, levelRange: [3482, 3615] },  // 死神板
                    { id: 868, weight: 12, levelRange: [3482, 3615] },  // 小仙奶
                    { id: 871, weight: 12, levelRange: [3482, 3615] },  // 啪嚓海膽
                    { id: 869, weight: 10, levelRange: [3482, 3615] },  // 霜奶仙
                    { id: 870, weight: 10, levelRange: [3482, 3615] },  // 列陣兵
                ]
            },
            {
                id: 'galar_route10',
                name: '10號道路',
                description: '冠之雪原的冰凍深處',
                levelRange: [3616, 3749],
                pokemon: [
                    { id: 878, weight: 15, levelRange: [3616, 3749] },  // 銅象
                    { id: 873, weight: 12, levelRange: [3616, 3749] },  // 雪絨蛾
                    { id: 876, weight: 12, levelRange: [3616, 3749] },  // 愛管侍
                    { id: 877, weight: 12, levelRange: [3616, 3749] },  // 莫魯貝可
                    { id: 875, weight: 10, levelRange: [3616, 3749] },  // 冰砌鵝
                    { id: 879, weight: 10, levelRange: [3616, 3749] },  // 大王銅象
                    { id: 874, weight: 8, levelRange: [3616, 3749] },   // 巨石丁
                ]
            },
            {
                id: 'galar_route11',
                name: '11號道路',
                description: '伽勒爾的化石遺蹟地帶',
                levelRange: [3750, 3883],
                pokemon: [
                    { id: 885, weight: 15, levelRange: [3750, 3883] },  // 多龍梅西亞
                    { id: 880, weight: 12, levelRange: [3750, 3883] },  // 雷鳥龍
                    { id: 881, weight: 12, levelRange: [3750, 3883] },  // 雷鳥海獸
                    { id: 882, weight: 12, levelRange: [3750, 3883] },  // 鰓魚龍
                    { id: 883, weight: 12, levelRange: [3750, 3883] },  // 鰓魚海獸
                    { id: 884, weight: 8, levelRange: [3750, 3883] },   // 鋁鋼龍
                ]
            },
            {
                id: 'galar_route12',
                name: '12號道路',
                description: '能量塔周邊的龍之巢穴',
                levelRange: [3884, 4017],
                pokemon: [
                    { id: 886, weight: 12, levelRange: [3884, 4017] },  // 多龍奇
                    { id: 891, weight: 12, levelRange: [3884, 4017] },  // 熊徒弟
                    { id: 887, weight: 10, levelRange: [3884, 4017] },  // 多龍巴魯託
                    { id: 894, weight: 10, levelRange: [4016, 4017] },  // 雷吉艾勒奇
                    { id: 895, weight: 8, levelRange: [4016, 4017] },   // 雷吉鐸拉戈
                ]
            },
            {
                id: 'galar_route13',
                name: '13號道路',
                description: '鎧之孤島的修煉道場',
                levelRange: [4018, 4151],
                pokemon: [
                    { id: 892, weight: 15, levelRange: [4018, 4151] },  // 武道熊師
                    { id: 893, weight: 15, levelRange: [4018, 4151] },  // 薩戮德
                    { id: 896, weight: 10, levelRange: [4018, 4151] },  // 雪暴馬
                    { id: 897, weight: 8, levelRange: [4117, 4151] },   // 靈幽馬
                    { id: 889, weight: 3, levelRange: [4150, 4151] },   // 藏瑪然特
                    
                ]
            },
            {
                id: 'galar_route14',
                name: '14號道路',
                description: '洗翠地區的古老遺蹟',
                levelRange: [4152, 4285],
                pokemon: [
                    { id: 899, weight: 15, levelRange: [4152, 4285] },  // 詭角鹿
                    { id: 900, weight: 15, levelRange: [4152, 4285] },  // 劈斧螳螂
                    { id: 902, weight: 12, levelRange: [4152, 4285] },  // 幽尾玄魚
                    { id: 903, weight: 12, levelRange: [4152, 4285] },  // 大狃拉
                    { id: 904, weight: 12, levelRange: [4152, 4285] },  // 萬針魚
                    { id: 888, weight: 3, levelRange: [4284, 4285] },   // 蒼響
                ]
            },
            {
                id: 'galar_route15',
                name: '15號道路',
                description: '洗翠之巔——傳說降臨之地',
                levelRange: [4286, 4419],
                pokemon: [
                    { id: 901, weight: 20, levelRange: [4286, 4419] },  // 月月熊
                    { id: 902, weight: 20, levelRange: [4286, 4419] },  // 幽尾玄魚
                    { id: 905, weight: 10, levelRange: [4385, 4419] },   // 眷戀雲
                    { id: 898, weight: 5, levelRange: [4418, 4419] },   // 蕾冠王
                    { id: 890, weight: 1, levelRange: [4418, 4419] },   // 無極汰那
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
                levelRange: [4420, 4753],
                pokemon: [
                    { id: 906, weight: 12, levelRange: [4420, 4753] },  // 新葉喵
                    { id: 909, weight: 12, levelRange: [4420, 4753] },  // 呆火鱷
                    { id: 912, weight: 12, levelRange: [4420, 4753] },  // 潤水鴨
                    { id: 915, weight: 12, levelRange: [4420, 4586] },  // 愛吃豚
                    { id: 917, weight: 12, levelRange: [4420, 4586] },  // 團珠蛛
                    { id: 919, weight: 12, levelRange: [4420, 4586] },  // 豆蟋蟀
                    { id: 921, weight: 12, levelRange: [4420, 4586] },  // 布撥
                    { id: 924, weight: 8, levelRange: [4420, 4753] },   // 一對鼠
                    { id: 926, weight: 8, levelRange: [4420, 4753] },   // 狗仔包
                ]
            },
            {
                id: 'paldea_route2',
                name: '南部第二區',
                description: '桌臺市東南方的田園地帶',
                levelRange: [4754, 5088],
                pokemon: [
                    { id: 922, weight: 12, levelRange: [4754, 5088] },  // 布土撥
                    { id: 928, weight: 12, levelRange: [4754, 5088] },  // 迷你芙
                    { id: 929, weight: 12, levelRange: [4754, 5088] },  // 奧利紐
                    { id: 918, weight: 10, levelRange: [4754, 5088] },  // 操陷蛛
                    { id: 920, weight: 10, levelRange: [4754, 5088] },  // 烈腿蝗
                    { id: 925, weight: 10, levelRange: [4754, 5088] },  // 一家鼠
                    { id: 927, weight: 10, levelRange: [4754, 5088] },  // 麻花犬
                    { id: 931, weight: 10, levelRange: [4754, 5088] },  // 怒鸚哥
                    { id: 932, weight: 8, levelRange: [4754, 5088] },   // 鹽石寶
                ]
            },
            {
                id: 'paldea_route3',
                name: '西部第一區',
                description: '帕底亞西部的山谷地帶',
                levelRange: [5089, 5422],
                pokemon: [
                    { id: 935, weight: 12, levelRange: [5089, 5422] },  // 炭小侍
                    { id: 938, weight: 12, levelRange: [5089, 5422] },  // 光蚪仔
                    { id: 907, weight: 10, levelRange: [5089, 5422] },  // 蒂蕾喵
                    { id: 910, weight: 10, levelRange: [5089, 5422] },  // 炙燙鱷
                    { id: 913, weight: 10, levelRange: [5089, 5422] },  // 湧躍鴨
                    { id: 916, weight: 10, levelRange: [5089, 5422] },  // 飄香豚
                    { id: 923, weight: 10, levelRange: [5089, 5422] },  // 巴布土撥
                    { id: 930, weight: 10, levelRange: [5089, 5422] },  // 奧利瓦
                    { id: 933, weight: 10, levelRange: [5089, 5422] },  // 鹽石壘
                ]
            },
            {
                id: 'paldea_route4',
                name: '西部第二區',
                description: '帕底亞西部的高原巖區',
                levelRange: [5423, 5757],
                pokemon: [
                    { id: 942, weight: 12, levelRange: [5423, 5757] },  // 偶叫獒
                    { id: 944, weight: 12, levelRange: [5423, 5757] },  // 滋汁鼴
                    { id: 936, weight: 10, levelRange: [5423, 5757] },  // 紅蓮鎧騎
                    { id: 937, weight: 10, levelRange: [5423, 5757] },  // 蒼炎刃鬼
                    { id: 939, weight: 10, levelRange: [5423, 5757] },  // 電肚蛙
                    { id: 940, weight: 10, levelRange: [5423, 5757] },  // 電海燕
                    { id: 934, weight: 8, levelRange: [5423, 5757] },   // 鹽石巨靈
                    { id: 941, weight: 8, levelRange: [5423, 5757] },   // 大電海燕
                    { id: 943, weight: 8, levelRange: [5423, 5757] },   // 獒教父
                ]
            },
            {
                id: 'paldea_route5',
                name: '東部第一區',
                description: '帕底亞東部的沿海區域',
                levelRange: [5758, 6092],
                pokemon: [
                    { id: 948, weight: 12, levelRange: [5758, 6092] },  // 原野水母
                    { id: 945, weight: 10, levelRange: [5758, 6092] },  // 塗標客
                    { id: 946, weight: 10, levelRange: [5758, 6092] },  // 納噬草
                    { id: 947, weight: 10, levelRange: [5758, 6092] },  // 怖納噬草
                    { id: 949, weight: 10, levelRange: [5758, 6092] },  // 陸地水母
                    { id: 950, weight: 10, levelRange: [5758, 6092] },  // 毛崖蟹
                    { id: 908, weight: 8, levelRange: [5758, 6092] },   // 魔幻假面喵
                    { id: 911, weight: 8, levelRange: [5758, 6092] },   // 骨紋巨聲鱷
                    { id: 914, weight: 8, levelRange: [5758, 6092] },   // 狂歡浪舞鴨
                ]
            },
            {
                id: 'paldea_route6',
                name: '東部第二區',
                description: '帕底亞東部的火山地帶',
                levelRange: [6093, 6426],
                pokemon: [
                    { id: 953, weight: 12, levelRange: [6093, 6426] },  // 蟲滾泥
                    { id: 955, weight: 12, levelRange: [6093, 6426] },  // 飄飄雛
                    { id: 957, weight: 12, levelRange: [6093, 6426] },  // 小鍛匠
                    { id: 951, weight: 10, levelRange: [6093, 6426] },  // 熱辣娃
                    { id: 952, weight: 10, levelRange: [6093, 6426] },  // 狠辣椒
                    { id: 954, weight: 10, levelRange: [6093, 6426] },  // 蟲甲聖
                    { id: 958, weight: 10, levelRange: [6093, 6426] },  // 巧鍛匠
                    { id: 956, weight: 8, levelRange: [6093, 6426] },   // 超能豔鴕
                    { id: 959, weight: 8, levelRange: [6093, 6426] },   // 巨鍛匠
                ]
            },
            {
                id: 'paldea_route7',
                name: '北部第一區',
                description: '帕底亞北部的凍土地帶',
                levelRange: [6427, 6761],
                pokemon: [
                    { id: 960, weight: 12, levelRange: [6427, 6761] },  // 海地鼠
                    { id: 963, weight: 12, levelRange: [6427, 6761] },  // 波普海豚
                    { id: 965, weight: 12, levelRange: [6427, 6761] },  // 噗隆隆
                    { id: 961, weight: 10, levelRange: [6427, 6761] },  // 三海地鼠
                    { id: 962, weight: 10, levelRange: [6427, 6761] },  // 下石鳥
                    { id: 967, weight: 10, levelRange: [6427, 6761] },  // 摩托蜥
                    { id: 968, weight: 10, levelRange: [6427, 6761] },  // 拖拖蚓
                    { id: 964, weight: 8, levelRange: [6427, 6761] },   // 海豚俠
                    { id: 966, weight: 8, levelRange: [6427, 6761] },   // 普隆隆姆
                ]
            },
            {
                id: 'paldea_route8',
                name: '北部第二區',
                description: '帕底亞北部的雪山區域',
                levelRange: [6762, 7096],
                pokemon: [
                    { id: 969, weight: 12, levelRange: [6762, 7096] },  // 晶光芽
                    { id: 971, weight: 12, levelRange: [6762, 7096] },  // 墓仔狗
                    { id: 974, weight: 12, levelRange: [6762, 7096] },  // 走鯨
                    { id: 972, weight: 10, levelRange: [6762, 7096] },  // 墓揚犬
                    { id: 973, weight: 10, levelRange: [6762, 7096] },  // 纏紅鶴
                    { id: 976, weight: 10, levelRange: [6762, 7096] },  // 輕身鱈
                    { id: 970, weight: 8, levelRange: [6762, 7096] },   // 晶光花
                    { id: 975, weight: 8, levelRange: [6762, 7096] },   // 浩大鯨
                    { id: 977, weight: 5, levelRange: [6995, 7096] },   // 吃吼霸
                ]
            },
            {
                id: 'paldea_route9',
                name: '帕底亞大坑洞入口',
                description: '帕底亞中央大坑洞的入口區域',
                levelRange: [7097, 7430],
                pokemon: [
                    { id: 996, weight: 12, levelRange: [7097, 7430] },  // 涼脊龍
                    { id: 978, weight: 10, levelRange: [7097, 7430] },  // 米立龍
                    { id: 980, weight: 10, levelRange: [7097, 7430] },  // 土王
                    { id: 981, weight: 10, levelRange: [7097, 7430] },  // 奇麒麟
                    { id: 982, weight: 10, levelRange: [7097, 7430] },  // 土龍節節
                    { id: 999, weight: 10, levelRange: [7097, 7430] },  // 索財靈
                    { id: 979, weight: 8, levelRange: [7097, 7430] },   // 棄世猴
                    { id: 983, weight: 8, levelRange: [7097, 7430] },   // 僕刀將軍
                    { id: 997, weight: 8, levelRange: [7097, 7430] },   // 凍脊龍
                ]
            },
            {
                id: 'paldea_route10',
                name: '帕底亞大坑洞深處',
                description: '大坑洞的深層區域，古來寶可夢出沒',
                levelRange: [7431, 8033],
                pokemon: [
                    { id: 984, weight: 10, levelRange: [7431, 8033] },  // 雄偉牙（古來種）
                    { id: 985, weight: 10, levelRange: [7431, 8033] },  // 吼叫尾（古來種）
                    { id: 986, weight: 10, levelRange: [7431, 8033] },  // 猛惡菇（古來種）
                    { id: 987, weight: 8, levelRange: [7431, 8033] },   // 振翼發（古來種）
                    { id: 988, weight: 8, levelRange: [7431, 8033] },   // 爬地翅（古來種）
                    { id: 989, weight: 8, levelRange: [7431, 8033] },   // 沙鐵皮（古來種）
                    { id: 998, weight: 5, levelRange: [7631, 8033] },   // 戟脊龍
                    { id: 1000, weight: 2, levelRange: [7631, 8033] },  // 賽富豪
                ]
            },
            {
                id: 'paldea_route11',
                name: '零區深處',
                description: '帕底亞大坑洞最深處，未來種悖論寶可夢出沒',
                levelRange: [8034, 8702],
                pokemon: [
                    { id: 990, weight: 10, levelRange: [8034, 8702] },  // 鐵轍跡（未來種）
                    { id: 991, weight: 10, levelRange: [8034, 8702] },  // 鐵包袱（未來種）
                    { id: 992, weight: 10, levelRange: [8034, 8702] },  // 鐵臂膀（未來種）
                    { id: 993, weight: 10, levelRange: [8034, 8702] },  // 鐵脖頸（未來種）
                    { id: 994, weight: 10, levelRange: [8034, 8702] },  // 鐵毒蛾（未來種）
                    { id: 995, weight: 10, levelRange: [8034, 8702] },  // 鐵荊棘（未來種）
                    { id: 1005, weight: 5, levelRange: [8034, 8702] },  // 轟鳴月
                    { id: 1006, weight: 5, levelRange: [8034, 8702] },  // 鐵武者
                ]
            },
            {
                id: 'paldea_route12',
                name: '災厄之域',
                description: '傳說中四災寶可夢封印之地',
                levelRange: [9372, 10041],
                pokemon: [
                    { id: 1001, weight: 10, levelRange: [9372, 10041] },  // 古簡蝸
                    { id: 1002, weight: 10, levelRange: [9372, 10041] },  // 古劍豹
                    { id: 1003, weight: 10, levelRange: [9372, 10041] },  // 古鼎鹿
                    { id: 1004, weight: 10, levelRange: [9372, 10041] },  // 古玉魚
                    { id: 1009, weight: 8, levelRange: [9372, 10041] },   // 波盪水
                    { id: 1010, weight: 8, levelRange: [9372, 10041] },   // 鐵斑葉
                ]
            },
            {
                id: 'paldea_route13',
                name: '藍莓學園',
                description: 'DLC藍莓學園的特訓區域，新夥伴登場',
                levelRange: [10042, 10710],
                pokemon: [
                    { id: 1012, weight: 12, levelRange: [10042, 10710] },  // 斯魔茶
                    { id: 1011, weight: 10, levelRange: [10042, 10710] },  // 裹蜜蟲
                    { id: 1013, weight: 8, levelRange: [10042, 10710] },   // 來悲粗茶
                    { id: 1014, weight: 8, levelRange: [10042, 10710] },   // 夠贊狗
                    { id: 1015, weight: 8, levelRange: [10042, 10710] },   // 願增猿
                    { id: 1016, weight: 8, levelRange: [10042, 10710] },   // 吉雉雞
                    { id: 1017, weight: 8, levelRange: [10042, 10710] },   // 厄詭椪
                    { id: 1018, weight: 5, levelRange: [10042, 10710] },   // 鋁鋼橋龍
                    { id: 1019, weight: 5, levelRange: [10042, 10710] },   // 蜜集大蛇
                ]
            },
            {
                id: 'paldea_route14',
                name: '傳說之路',
                description: '帕底亞的終極區域，隱藏著最強的傳說寶可夢',
                levelRange: [10711, 11380],
                pokemon: [
                    { id: 1020, weight: 8, levelRange: [10711, 11380] },   // 破空焰
                    { id: 1021, weight: 8, levelRange: [10711, 11380] },   // 猛雷鼓
                    { id: 1022, weight: 8, levelRange: [10711, 11380] },   // 鐵磐巖
                    { id: 1023, weight: 8, levelRange: [10711, 11380] },   // 鐵頭殼
                    { id: 1024, weight: 5, levelRange: [10711, 11380] },   // 太樂巴戈斯
                    { id: 1025, weight: 5, levelRange: [10711, 11380] },   // 桃歹郎
                    { id: 1007, weight: 1, levelRange: [11380, 11380] },   // 故勒頓
                    { id: 1008, weight: 1, levelRange: [11380, 11380] },   // 密勒頓
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
                levelRange: [11381, 12704],
                pokemon: [
                    { id: 1026, weight: 12, levelRange: [11381, 12704] },  // Mega妙蛙花
                    { id: 1029, weight: 12, levelRange: [11381, 12704] },  // Mega水箭龜
                    { id: 1027, weight: 10, levelRange: [11381, 12704] },  // Mega噴火龍X
                    { id: 1028, weight: 10, levelRange: [11381, 12704] },  // Mega噴火龍Y
                    { id: 1030, weight: 10, levelRange: [11381, 12704] },  // Mega大針蜂
                    { id: 1031, weight: 10, levelRange: [11381, 12704] },  // Mega大比鳥
                    { id: 1032, weight: 10, levelRange: [11381, 12704] },  // Mega胡地
                    { id: 1033, weight: 10, levelRange: [11381, 12704] },  // Mega呆殼獸
                    { id: 1034, weight: 8, levelRange: [11381, 12704] },   // Mega耿鬼
                    { id: 1035, weight: 8, levelRange: [11381, 12704] },   // Mega袋獸
                ]
            },
            {
                id: 'mega_route2',
                name: 'Mega進化之森',
                description: '暗藏強大Mega力量的森林，關都後期Mega寶可夢出沒',
                levelRange: [12705, 14028],
                pokemon: [
                    { id: 1043, weight: 12, levelRange: [12705, 14028] },  // Mega巨鉗螳螂
                    { id: 1044, weight: 12, levelRange: [12705, 14028] },  // Mega赫拉克羅斯
                    { id: 1036, weight: 10, levelRange: [12705, 14028] },  // Mega大甲
                    { id: 1037, weight: 10, levelRange: [12705, 14028] },  // Mega暴鯉龍
                    { id: 1038, weight: 10, levelRange: [12705, 14028] },  // Mega化石翼龍
                    { id: 1041, weight: 10, levelRange: [12705, 14028] },  // Mega電龍
                    { id: 1042, weight: 10, levelRange: [12705, 14028] },  // Mega大鋼蛇
                    { id: 1045, weight: 10, levelRange: [12705, 14028] },  // Mega黑魯加
                    { id: 1039, weight: 5, levelRange: [13145, 14028] },   // Mega超夢X
                    { id: 1040, weight: 5, levelRange: [13145, 14028] },   // Mega超夢Y
                ]
            },
            {
                id: 'mega_route3',
                name: 'Mega岩漿峽谷',
                description: '城都與豐緣強力Mega寶可夢棲息的灼熱峽谷',
                levelRange: [14029, 15352],
                pokemon: [
                    { id: 1051, weight: 12, levelRange: [14029, 15352] },  // Mega勾魂眼
                    { id: 1052, weight: 12, levelRange: [14029, 15352] },  // Mega大嘴娃
                    { id: 1047, weight: 10, levelRange: [14029, 15352] },  // Mega蜥蜴王
                    { id: 1048, weight: 10, levelRange: [14029, 15352] },  // Mega火焰雞
                    { id: 1049, weight: 10, levelRange: [14029, 15352] },  // Mega巨沼怪
                    { id: 1050, weight: 10, levelRange: [14029, 15352] },  // Mega沙奈朵
                    { id: 1053, weight: 10, levelRange: [14029, 15352] },  // Mega波士可多拉
                    { id: 1054, weight: 10, levelRange: [14029, 15352] },  // Mega恰雷姆
                    { id: 1046, weight: 8, levelRange: [14029, 15352] },   // Mega班基拉斯
                ]
            },
            {
                id: 'mega_route4',
                name: 'Mega暴風海域',
                description: '豐緣Mega後半部隊駐守的狂風暴雨海域',
                levelRange: [15353, 16675],
                pokemon: [
                    { id: 1055, weight: 10, levelRange: [15353, 16675] },  // Mega雷電獸
                    { id: 1056, weight: 10, levelRange: [15353, 16675] },  // Mega巨牙鯊
                    { id: 1057, weight: 10, levelRange: [15353, 16675] },  // Mega噴火駝
                    { id: 1058, weight: 10, levelRange: [15353, 16675] },  // Mega七夕青鳥
                    { id: 1059, weight: 10, levelRange: [15353, 16675] },  // Mega詛咒娃娃
                    { id: 1060, weight: 10, levelRange: [15353, 16675] },  // Mega阿勃梭魯
                    { id: 1061, weight: 10, levelRange: [15353, 16675] },  // Mega冰鬼護
                    { id: 1062, weight: 8, levelRange: [15353, 16675] },   // Mega暴飛龍
                    { id: 1063, weight: 8, levelRange: [15353, 16675] },   // Mega巨金怪
                    { id: 1064, weight: 7, levelRange: [15353, 16675] },   // Mega拉帝亞斯
                ]
            },
            {
                id: 'mega_route5',
                name: 'Mega極光冰原',
                description: '傳說級Mega寶可夢與神奧Mega聚集的極寒之地',
                levelRange: [16676, 17999],
                pokemon: [
                    { id: 1070, weight: 12, levelRange: [16676, 17999] },  // Mega雪暴王
                    { id: 1072, weight: 12, levelRange: [16676, 17999] },  // Mega差不多娃娃
                    { id: 1067, weight: 12, levelRange: [16676, 17999] },  // Mega長耳兔
                    { id: 1071, weight: 10, levelRange: [16676, 17999] },  // Mega艾路雷朵
                    { id: 1068, weight: 8, levelRange: [16676, 17999] },   // Mega烈咬陸鯊
                    { id: 1069, weight: 8, levelRange: [16676, 17999] },   // Mega路卡利歐
                    { id: 1073, weight: 8, levelRange: [16676, 17999] },   // Mega蒂安希
                    { id: 1065, weight: 7, levelRange: [16676, 17999] },   // Mega拉帝歐斯
                    { id: 1066, weight: 3, levelRange: [17558, 17999] },   // Mega裂空座
                ]
            },
        ]
    }
};
