interface Room {
    // init
    RoomInit():void
    RoomMemoryInit():void
    RoomStructureInit():void
    RoomSpawnListInit():void

    // spawn
    SpawnMain():void
    SpawnConfigInit():void
    SpawnConfigModify():void
    SpawnManager():void
    SpawnExecution():void
    AddSpawnList(role:string,body:number[],level:number,mem?:SpawnMemory):void
    SpawnListRoleNum(role:string):number
    NumSpawn(role:string,num:number,level?:number):boolean
    SingleSpawn(role:string,level?:number,mem?:SpawnMemory):boolean
    Economy():void

    // ecosphere
    RoomEcosphere():void
    RoomPlan():void
    RoomRuleLayout(level:number,map:BluePrint):void
    RoomState():void
    repatchDistribution():void
    unzip(str:string):RoomPosition | undefined
    addStructureMemory():void
    getDistributionNum():number
    unbindMemory(mold:BuildableStructureConstant,x:number,y:number):void
}

interface RoomMemory {
    StructureIdData:any // 存放房间内建筑ID信息
    SpawnConfig:SpawnConfigData // 存放房间孵化配置
    SpawnList:SpawnList[]       // 孵化列表
    originLevel:number          // 房间控制器等级，房间等级变化会跟着变化
    harvestData:harvestData     // 能量矿采集信息
    state:stateType         // 房间状态
    structureNum:number     // 房间内建筑的总数量
    distribution:StructureMemory        // 自动布局
    switch:{[key:string]:any}   // 开关 存放不同任务的一些选项
}

interface harvestData{
    [sourceID:string]:{
        containerID?:string
        linkID?:string
        harvest?:string
        carry?:string
    }
}

interface SpawnConfigData {
    [role:string]:SpawnObjectList
}

interface SpawnObjectList {
    /* 手动设置参数 */      
    num:number,        // 数量 【必备参数】
    must?:boolean,      // 是否无论何时也要孵化
    adaption?:boolean,  // 是否自适应体型
    // interval?:number,       // 孵化间隔时间 【重要参数，会根据是否有这个参数执行对应孵化逻辑，如果interval为0或undefined则代表补员】
    misson?:boolean,        // 是否是任务相关 【非任务新增的spawnMessage数据(RoleData里有init的)都任务无关】
    level?:number           // 孵化优先级
    /* 程序运行参数 */
    // time?:number    // 孵化冷却
    manual?:boolean // 是否被手动控制了，true时num不随等级变化而变化
}

interface SpawnList {
    role:string // 爬虫角色
    body:number[]   // 爬虫身体部件
    memory?:SpawnMemory     // 是否有额外的记忆需要添加
    level:number       // 爬虫孵化优先级
}

interface SpawnMemory {
    [mem:string]:any
}


/**
 * 房间自动布局
 */
interface BluePrintData{
    x:number,   // 相对于中心点x的位置
    y:number,   // 相对于中心点y的位置
    structureType?:BuildableStructureConstant,  // 建筑类型
    level?: number      // 自动布局等级
}
type BluePrint = BluePrintData[]

type stateType = 'peace' | 'war'

interface StructureMemory{
    [Stype:string]:string[]
}