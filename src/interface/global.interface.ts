/* 存放全局声明 */
declare module NodeJS {
    interface Global {
        /* 用于判定全局扩展是否已经挂载 */
        Mounted:boolean
        CreepBodyData:{[roomName:string]:{[creepRole:string]:number[]}}    // 每种类型爬虫的体型数据
        SpecialBodyData:{[roomName:string]:{[creepRole:string]:BodyPartConstant[]}}    // 爬虫的特殊体型数据
        CreepNumData:{[roomName:string]:{[creepRole:string]:number}}    // 每种类型爬虫的实际数量
        // 寻路的键值对
        routeCache:{
            // 键为路径的起点和终点 值为压缩后的路径
            [routekey:string]:string
        }
        Gtime:{[roomName:string]:number}
        intervalData:{[roomName:string]:{[creepRole:string]:number}}
        ResourceLimit:resourceLimitData
        warData:any
        MSB:MissonSpecialBody   // 任务特殊体型
        /* 脚本运行总cpu */
        UsedCpu?:number
        /* 100Tick内的平均CPU */
        CpuData?:number[]
        AveCpu?:number
        Repairlist?:{[roomName:string]:string[]}
        Adaption?:any
    }
}

interface globalStrcutureData{
    [structureName:string]:Structure | Structure[]
}


interface resourceLimitData{
    [roomName:string]:{[res in ResourceConstant]?:number}
}


interface warData{
    tower:{[roomName:string]:{count:number,data:TowerRangeMapData}}      // 防御塔伤害数据
    enemy:{[roomName:string]:{time:number,data:Creep[]}}        // 敌方房间爬虫数据
    structure:{[roomName:string]:{time:number,data:StructureData}}    // 敌方房间建筑数据
    flag:{[roomName:string]:{time:number,data:Flag[]}}  // 敌方房间旗帜数据
}

interface TowerRangeMapData{
    [strpos:string]:ARH
}

interface ARH{
    attack:number
    repair:number
    heal:number
}

interface StructureData{
    [strutype:string]:Structure[]
}

/* 任务爬虫特殊体型 */
interface MissonSpecialBody{
    [missionID:string]:{[role:string]:BodyPartConstant[]}
}