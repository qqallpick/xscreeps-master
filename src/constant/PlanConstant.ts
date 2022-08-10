/* 图标 */
export const icon = {
    "spawn": "◎",
    "extension": "ⓔ",
    "link": "◈",
    "road": "•",
    "constructedWall": "▓",
    "rampart": "⊙",
    "storage": "▤",
    "tower": "♖",
    "observer": "✧",
    "powerSpawn": "❂",
    "extractor": "⇌",
    "terminal": "✡",
    "lab": "☣",
    "container": "□",
    "nuker": "▲",
    "factory": "☭"
}

/* 图标颜色 */
export const iconColor = {
    "spawn": "cyan",
    "extension": "#0bb118",
    "link": "yellow",
    "road": "#fa6f6f",
    "constructedWall": "#003fff",
    "rampart": "#003fff",
    "storage": "yellow",
    "tower": "cyan",
    "observer": "yellow",
    "powerSpawn": "cyan",
    "extractor": "cyan",
    "terminal": "yellow",
    "lab": "#d500ff",
    "container": "yellow",
    "nuker": "cyan",
    "factory": "yellow"
}

/* dev布局信息 */
export const devPlanConstant:BluePrint = [
    /* 2级规划 */
    {x:-1,y:3,structureType:'extension',level:2},       // extension
    {x:-2,y:3,structureType:'extension',level:2},
    {x:-3,y:3,structureType:'extension',level:2},
    {x:-2,y:4,structureType:'extension',level:2},
    {x:-3,y:4,structureType:'extension',level:2},
    {x:-1,y:2,structureType:'road',level:4},            // road
    {x:1,y:2,structureType:'road',level:4},
    {x:-1,y:1,structureType:'road',level:4},
    {x:-2,y:1,structureType:'road',level:4},
    {x:-3,y:0,structureType:'road',level:4},
    {x:-2,y:-1,structureType:'road',level:4},
    {x:-1,y:-2,structureType:'road',level:4},
    {x:-1,y:-1,structureType:'road',level:4},
    {x:0,y:-3,structureType:'road',level:4},
    {x:1,y:-2,structureType:'road',level:4},
    {x:1,y:-1,structureType:'road',level:4},
    {x:2,y:-1,structureType:'road',level:4},
    {x:3,y:0,structureType:'road',level:4},
    {x:2,y:1,structureType:'road',level:4},
    /* 3级规划 */
    {x:-4,y:3,structureType:'extension',level:3},     // extension
    {x:-4,y:2,structureType:'extension',level:3},
    {x:-3,y:1,structureType:'extension',level:3},
    {x:-3,y:2,structureType:'extension',level:3},
    {x:-3,y:-1,structureType:'extension',level:3},
    {x:-2,y:2,structureType:'tower',level:3},           // tower
    {x:0,y:3,structureType:'road',level:4},             // road
    {x:1,y:1,structureType:'road',level:4},
    {x:-1,y:4,structureType:'road',level:4},
    {x:-2,y:5,structureType:'road',level:4},
    {x:-3,y:5,structureType:'road',level:4},
    {x:-4,y:4,structureType:'road',level:4},
    {x:-5,y:3,structureType:'road',level:4},
    {x:-5,y:2,structureType:'road',level:4},
    {x:-4,y:1,structureType:'road',level:4},
    /* 4级规划 */
    {x:-2,y:-3,structureType:'extension',level:4},    // extension
    {x:-2,y:-4,structureType:'extension',level:4},
    {x:-3,y:-2,structureType:'extension',level:4},
    {x:-3,y:-3,structureType:'extension',level:4},
    {x:-3,y:-4,structureType:'extension',level:4},
    {x:-4,y:0,structureType:'extension',level:4},
    {x:-4,y:-2,structureType:'extension',level:4},
    {x:-4,y:-3,structureType:'extension',level:4},
    {x:-5,y:0,structureType:'extension',level:4},
    {x:-5,y:-1,structureType:'extension',level:4},
    {x:0,y:0,structureType:'storage',level:4},      // storage
    {x:-4,y:-1,structureType:'road',level:4},       // road
    {x:-5,y:-2,structureType:'road',level:4},
    {x:-5,y:-3,structureType:'road',level:4},
    {x:-4,y:-4,structureType:'road',level:4},
    {x:-3,y:-5,structureType:'road',level:4},
    {x:-2,y:-5,structureType:'road',level:4},
    {x:-1,y:-4,structureType:'road',level:4},
    /* 5级规划 */
    {x:-5,y:1,structureType:'extension',level:5},    // extension
    {x:1,y:-3,structureType:'extension',level:5},
    {x:2,y:-3,structureType:'extension',level:5},
    {x:2,y:-4,structureType:'extension',level:5},
    {x:3,y:-3,structureType:'extension',level:5},
    {x:3,y:-4,structureType:'extension',level:5},
    {x:3,y:-2,structureType:'extension',level:5},
    {x:3,y:-1,structureType:'extension',level:5},
    {x:4,y:-2,structureType:'extension',level:5},
    {x:4,y:-3,structureType:'extension',level:5},
    {x:1,y:0,structureType:'link',level:5},         // link && tower
    {x:-2,y:-2,structureType:'tower',level:5},
    {x:1,y:-4,structureType:'road',level:5},            // road
    {x:2,y:-5,structureType:'road',level:5},
    {x:3,y:-5,structureType:'road',level:5},
    {x:4,y:-4,structureType:'road',level:5},
    {x:5,y:-3,structureType:'road',level:5},
    {x:5,y:-2,structureType:'road',level:5},
    {x:4,y:-1,structureType:'road',level:5},
    // 6级规划
    {x:1,y:4,structureType:'road',level:6},     // road
    {x:2,y:3,structureType:'road',level:6},
    {x:3,y:2,structureType:'road',level:6},
    {x:4,y:1,structureType:'road',level:6},
    {x:5,y:1,structureType:'road',level:6},
    {x:6,y:0,structureType:'road',level:6},
    {x:6,y:-1,structureType:'road',level:6},
    {x:3,y:3,structureType:'road',level:6},
    {x:4,y:4,structureType:'road',level:6},
    {x:5,y:5,structureType:'road',level:6},
    {x:4,y:6,structureType:'road',level:6},
    {x:3,y:6,structureType:'road',level:6},
    {x:2,y:6,structureType:'road',level:6},
    {x:1,y:5,structureType:'road',level:6},
    {x:6,y:4,structureType:'road',level:6},
    {x:6,y:3,structureType:'road',level:6},
    {x:6,y:2,structureType:'road',level:6},
    {x:2,y:2,structureType:'terminal',level:6},     // terminal
    {x:-1,y:-3,structureType:'extension',level:6},      // extension
    {x:-1,y:-5,structureType:'extension',level:6},
    {x:1,y:-5,structureType:'extension',level:6},
    {x:0,y:-4,structureType:'extension',level:6},
    {x:4,y:0,structureType:'extension',level:6},
    {x:5,y:0,structureType:'extension',level:6},
    {x:5,y:-1,structureType:'extension',level:6},
    {x:0,y:-5,structureType:'extension',level:6},
    {x:-5,y:4,structureType:'extension',level:6},
    {x:-4,y:5,structureType:'extension',level:6},
    {x:2,y:4,structureType:'lab',level:6},          // lab
    {x:3,y:4,structureType:'lab',level:6},
    {x:3,y:5,structureType:'lab',level:6},
    /* 7级规划 */
    {x:4,y:2,structureType:'lab',level:7},              // lab
    {x:4,y:3,structureType:'lab',level:7},
    {x:5,y:3,structureType:'lab',level:7},  
    {x:2,y:-2,structureType:'tower',level:7},               // tower link
    {x:0,y:-2,structureType:'spawn',level:7},               // spawn
    {x:-3,y:6,structureType:'extension',level:7},    // extension
    {x:-2,y:6,structureType:'extension',level:7},
    {x:0,y:4,structureType:'extension',level:7},
    {x:-1,y:5,structureType:'extension',level:7},
    {x:0,y:5,structureType:'extension',level:7},
    {x:1,y:6,structureType:'extension',level:7},
    {x:-6,y:2,structureType:'extension',level:7},
    {x:-6,y:3,structureType:'extension',level:7},
    {x:-4,y:-5,structureType:'extension',level:7},
    {x:-5,y:-4,structureType:'extension',level:7},
    {x:-1,y:6,structureType:'road',level:7},    // road
    {x:0,y:6,structureType:'road',level:7},
    {x:-6,y:1,structureType:'road',level:7},
    {x:-6,y:0,structureType:'road',level:7},
    {x:-6,y:-1,structureType:'road',level:7},
    {x:1,y:3,structureType:'factory',level:7},    // factory
    /* 8级规划 */
    {x:0,y:-6,structureType:'road',level:8},         // road
    {x:1,y:-6,structureType:'road',level:8},
    {x:-1,y:-6,structureType:'road',level:8},
    {x:5,y:-4,structureType:'extension',level:8},    // extension
    {x:-3,y:-6,structureType:'extension',level:8},
    {x:4,y:-5,structureType:'extension',level:8},
    {x:-2,y:-6,structureType:'extension',level:8},
    {x:-6,y:-2,structureType:'extension',level:8},
    {x:-6,y:-3,structureType:'extension',level:8},
    {x:6,y:-2,structureType:'extension',level:8},
    {x:6,y:-3,structureType:'extension',level:8},
    {x:2,y:-6,structureType:'extension',level:8},
    {x:3,y:-6,structureType:'extension',level:8},
    {x:3,y:1,structureType:STRUCTURE_NUKER,level:8},    // nuker
    {x:6,y:1,structureType:STRUCTURE_OBSERVER,level:8},     // observer
    {x:-2,y:0,structureType:STRUCTURE_SPAWN,level:8},       // spawn
    {x:2,y:0,structureType:STRUCTURE_POWER_SPAWN,level:8},
    {x:0,y:1,structureType:STRUCTURE_TOWER,level:8},        // tower
    {x:0,y:-1,structureType:STRUCTURE_TOWER,level:8},
    {x:-1,y:0,structureType:STRUCTURE_TOWER,level:8},
    {x:2,y:5,structureType:'lab',level:8},      // lab
    {x:4,y:5,structureType:'lab',level:8},
    {x:5,y:2,structureType:'lab',level:8},
    {x:5,y:4,structureType:'lab',level:8},
]

/* hoho布局信息 */
export const hohoPlanConstant:BluePrint = [

]