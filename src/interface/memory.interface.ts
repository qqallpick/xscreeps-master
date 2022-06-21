/* Memory常用类型及定义 */
interface Memory {
    bypassRooms?:string[]
    whitesheet?:string[]
    ignoreMissonName?:string[]
    marketAdjust?:{[res:string]:number}
    ResourceDispatchData:RDData[]
    outMineData:{[roomName:string]:OutMineData}
    stats :any
    StopPixel :boolean
    VisualLevel: 'blank' | 'low' | 'medium' | 'high'
}

interface RDData{
    sourceRoom:string   // 请求调度资源的房间
    rType:ResourceConstant  // 资源类型
    num:number      // 数量
    delayTick:number        // 超时时间 默认 500 tick
    buy?:boolean        // 超时过后是否会寻求购买
    mtype?:"order" | "deal" // 是deal还是创建订单  energy默认order  其他资源默认deal
    // 自动处理
    dealRoom?:string    // 如果有房间deal了，就添加上这个房间的名称
    conditionTick?:number   // 默认 10 tick， 10 tick 后所有房间都没有接单 直接市场购买
}

/* 外矿信息 存储所有外矿的信息 */
interface OutMineData{
    road:string[]       // 外矿房间的路位置数据 ['12/24/E49S43','34/12/E49S43',....,'23/43/E49S42']
    startpoint:string  // 外矿起始点 12/23/E49W43
    minepoint:{pos:string,bind:{harvest?:string,car?:string}}[]// 矿点位置，矿点绑定爬虫信息
    car?:boolean   // 是否派运输爬 默认不派出
    mineType?:'normal' | 'center'   // 外矿类型
}