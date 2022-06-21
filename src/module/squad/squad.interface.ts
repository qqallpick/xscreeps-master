/* 四人小队相关 */
type arrayType = 'line' | 'squard' | 'free'

/* 存储在全局Memory中，以任务ID为key的小队数据格式 */
interface squadData{
    creepData: Squad  // 爬虫位置、信息
    array:arrayType       // 线性阵列 四方阵列 自由阵列
    sourceRoom:string     // 源房间
    presentRoom?:string  // 目前所在房间
    disRoom:string      // 目标房间
    disShard:string     // 目标shard
    sourceShard:string  // 源shard
    ready?:boolean  // 是否小队已经组队完成
    squardType?:string      // 小队类型 目前包括
    lastAttack?:string          // 上一个被攻击的爬 如果所有爬生命都大于0做治疗预判用
    init?:boolean           // 是否已经初始化方向了
    gather?:boolean         // 是否已经集结了
}
/* 小队爬虫信息数据格式   位置，索引，角色，爬虫类型==> heal or attack */
interface Squad{
    [CreepName:string]:{position:'↘'|'↖'|'↗'|'↙', index:number,role:string,creepType:string}
}

interface Memory{
    squadMemory:{[MissonID:string]:squadData} /* 小队执行Memory载体 */
}

interface RoomMemory{
    squadData:{[id:string]:Squad}
}

interface FlagMemory{
    danger?:boolean
}

interface CreepMemory{
    creepType?:string
}