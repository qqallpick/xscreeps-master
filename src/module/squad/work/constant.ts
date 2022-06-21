/* 常量文件 */

/**
 * 
 * 爬虫位置用箭头表示，左上的爬虫：↖, 右上的爬虫：↗, 依此类推...
 * 
 */

/* RoomPosition相对位置文字映射 (相对左上角的爬的位置 [x,y]) */
export const SquadPos = {
    '↖':[0,0],
    '↗':[1,0],
    '↙':[0,1],
    '↘':[1,1]
}

/* move常量文字映射 */
export const SquadDirection = {
    '↖':8,
    '↗':2,
    '↙':6,
    '↘':4,
    '↓':5,
    '↑':1,
    '←':7,
    '→':3
}

/* 房间出口方向文字-常量映射 */
export const identifyDirectionConst = {
    '↑':FIND_EXIT_TOP,
    '↓':FIND_EXIT_BOTTOM,
    '←':FIND_EXIT_LEFT,
    '→':FIND_EXIT_RIGHT
}

/* 爬虫执行战术动作后的记忆更改常量 以cross战术动作举例，原来左上爬虫的记忆为↖，交叉后更改为↘ */
export const tactical = {
    cross: { '↖': '↘', '↗': '↙', '↙': '↗', '↘': '↖' },
    right: { '↖': '↗', '↗': '↘', '↘': '↙', '↙': '↖' },
    left: { '↗': '↖', '↘': '↗', '↙': '↘', '↖': '↙' },
}

/* 顺时针旋转(右转)移动常量  爬虫位置：爬虫移动方向 */
export const rightConst = {
    '↖':'→',
    '↗':'↓',
    '↙':'↑',
    '↘':'←'
}

/* 逆时针旋转(左转)移动常量 爬虫位置：爬虫移动方向 */
export const leftConst = {
    '↖':'↓',
    '↗':'←',
    '↙':'→',
    '↘':'↑'
}

/* 交叉移动常量 爬虫位置：爬虫移动方向 */
export const crossConst = {
    '↖': '↘',
    '↗': '↙', 
    '↙': '↗', 
    '↘': '↖'
}