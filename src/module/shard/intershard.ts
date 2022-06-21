/**
 * 重构跨shard模块
 * {
 *     creep:           // 存储跨shard爬虫memory
 *      {
 *          ...
 *          creep1:          // 爬虫名称
 *          {
 *              MemoryData:{}, 
 *              state: 0/1  // 状态码：0代表还未传输、1代表已经传输
 *              delay:200 超时倒计时   // 超过200tick将自动删除,所有爬虫数据均是如此
 *          },
 *          ...
 *      },
 *      misson:        // 存储跨shard任务memory
 *      {
 *          ...
 *          Cskfvde23nf34:   // 任务ID
 *          {
 *              MemoryData:{},
 *              state: 0/1  // 状态码：0代表还未传输、1代表已经传输
 *              delay:10000  // 超过10000tick将自动删除
 *          }
 *          ...
 *      },
 *      command:
 *      [
 *          ...
 *          {
 *              name: 指令名称
 *              data: 指令参数
 *          },
 *          ...
 *      ]
 *      shardName: shard3    // 所在shard
 *      hall:               // 沟通大厅
 *      {
 *          shard2:
 *          {
 *              ...
 *          },
 *          ...
 *          shard1:
 *          {
 *              state: 0 //状态码: 0代表无请求、1代表请求发送、2代表发送成功、3代表接受成功
 *              data: {} // 爬虫/任务/指令的数据
 *              type: 1  // 类型：1代表爬虫数据、2代表任务数据、3代表指令
 *              delay: 200     // 超时倒计时
 *              memorydelay: 99999  //记忆超时 (可选)
 *          }
 *      }
 * }
 *   
 */
import { isInArray } from "@/utils"
import { AppLifecycleCallbacks } from "../framework/types"

/**
 * 跨shard初始化
 */
export function InitShard():void{
    let Data = JSON.parse(InterShardMemory.getLocal()) || {}
    global.intershardData = Data
    if (Object.keys(Data).length != 5 || !Data['creep'] || !Data['mission'] || !Data['command'] || !Data['hall'])
    {
        let initdata = {'creep':{},'mission':{},'command':[],'shardName':Game.shard.name,'hall':{}}
        let thisShardList = _.difference(['shard0','shard1','shard2','shard3'],[Game.shard.name])
        for (let littleshard of thisShardList) initdata['hall'][littleshard] = {}
        console.log('已经初始化',Game.shard.name,'的InterShardMemory!')
        global.intershardData = initdata
        return
    }
}

/**
 * 跨shard记忆缓存清理
 */
export function CleanShard():void{
    var Data = global.intershardData
    /* 爬虫记忆缓存清理 */
    for (var cData in Data['creep'])
    {
        Data['creep'][cData].delay -= 1
        if (Data['creep'][cData].delay <= 0)        // 超时则删除
        {
            delete  Data['creep'][cData]
            continue
        }
        if (Data['creep'][cData].state == 1)        // 已传输则删除
        {
            delete  Data['creep'][cData]
            continue
        }
    }
    /* 任务缓存清理 */
    for (var mData in Data['mission'])
    {
        if (Data['mission'][mData].delay < 99999)
        Data['mission'][mData].delay -= 1
        if (Data['mission'][mData].delay <= 0)        // 超时则删除
        {
            delete  Data['mission'][mData]
            continue
        }
        if (Data['mission'][mData].state == 1)        // 已传输则删除
        {
            delete  Data['mission'][mData]
            continue
        }
    }
    /* 指令缓存清理 */
    if (Data['command'])
    for (var com of Data['command'])
    {
        if (com.done)           // done代表指令完成
        {
            let index = Data['command'].indexOf(com)
            Data['command'].splice(index,1)
        }
    }
}

/**
 * 发起跨shard请求
 */
export function RequestShard(req:RequestData):boolean{
    if (Game.shard.name == req.relateShard) return true     // 跨同shard的星门
    var Data = global.intershardData
    if (Data['hall'][req.relateShard] && isInArray([1, 2, 3], Data['hall'][req.relateShard].state) && Game.time < Data['hall'][req.relateShard].time + 50) return false // 超时或者有其他事务
    Data['hall'][req.relateShard] = {
        state:1,
        relateShard:req.relateShard,
        sourceShard:req.sourceShard,
        type:req.type,
        data:req.data,
        delay:100,
    }
    return true
}

/**
 *  获取其他shard的InterShardMemory中对应本shard的信息
 * @param shardName shard名
 * @returns 其他shard的数据
 */
export function UpdateShardHallData(shardName:shardName):any{
    if (shardName == Game.shard.name) return null
    var Data = JSON.parse(InterShardMemory.getRemote(shardName)) || {}
    if (Object.keys(Data).length != 5 || !Data['creep'] || !Data['mission'] || !Data['command'] || !Data['hall']) 
        return null    // 说明该shard不存在InterShardMemory
    if (!Data['hall'][Game.shard.name]) return null
    return Data['hall'][Game.shard.name]
}

/**
 * 响应其他shard请求，并将请求拷贝到自己记忆里
 */
export function ResponseShard():void{
    let Data = global.intershardData
    for (var o_shard of _.difference(['shard0','shard1','shard2','shard3'],[Game.shard.name]))
    {
        var comData = UpdateShardHallData(o_shard as shardName)
        if (comData === null) continue
        if (comData.state != 1) continue
        Data['hall'][o_shard]=  {
            state: 2,
            relateShard:comData.relateShard,
            sourceShard:comData.sourceShard,
            type:comData.type,
            data:comData.data,
            delay:100,
        }
        if (comData.type == 1)
        {
            Data['creep'][comData.data['id']] = {MemoryData:comData.data['MemoryData'],delay:(comData.memorydelay?comData.memorydelay:100),state:0}
        }
        else if (comData.type == 2)
        {
            Data['mission'][comData.data['id']] = {MemoryData:comData.data['MemoryData'],delay:(comData.memorydelay?comData.memorydelay:5000),state:0}
        }
        else if (comData.type == 3)
        {
            if (!comData.data.name) continue
            // 如果没有相同指令，则添加
            let name = comData.data.name
            for (let lcom of Data['command']) if (lcom.name == name) continue
            /**
             *  命令类型comData.data的数据格式
             *  comData
             * {
             *  ...
             *  data:{
             *      name:xxxx,
             *      data:{...}
             *  }
             * }
             */
            Data['command'].push({name:comData.data.name,done:false,data:comData.data.data})
        }
    }
}

/**
 *  确认已经收到信息
 */
export function ConfirmShard():void{
    var Data = global.intershardData
    for (var o_shard of _.difference(['shard0','shard1','shard2','shard3'],[Game.shard.name]))
    {
        if (!Data['hall'][o_shard] || _.isEmpty(Data['hall'][o_shard])) continue
        var comData = UpdateShardHallData(o_shard as shardName)
        if (comData === null) continue
        if (comData.state != 2) continue
        else if (comData.state == 2)
        {
            Data['hall'][o_shard].state = 3
            delete Data['hall'][o_shard].data
        }
    }
}

/**
 * 删除shard无关信息
 */
export function DeleteShard():void{
    var Data = global.intershardData
    for (var o_shard of _.difference(['shard0','shard1','shard2','shard3'],[Game.shard.name]))
    {
        if (!Data['hall'][o_shard] || _.isEmpty(Data['hall'][o_shard]) || Data['hall'][o_shard].state == 1) continue

        var RemoteData = JSON.parse(InterShardMemory.getRemote(o_shard))|| {}
        if (RemoteData['hall'][Game.shard.name].state == 3)
        {
            if (Game.shard.name == 'shard3') console.log(1)
            Data['hall'][o_shard] = {}
        }
        if (_.isEmpty(RemoteData['hall'][Game.shard.name]))
        {
            if (Game.shard.name == 'shard3') console.log(1)
            Data['hall'][o_shard] = {}
        }
    }
}

/**
 * 跨shard管理器
 */
export const InterShardManager = function() :void {
    if (!Game.cpu.generatePixel) return
    InitShard()
    CleanShard()
    ResponseShard()
    ConfirmShard()
    DeleteShard()
    // InterShardMemory.setLocal(JSON.stringify(global.intershardData))
}

/* 保存跨shard信息 */
export const SaveShardMessage = function() : void{
    if (!Game.cpu.generatePixel) return
    let Data = JSON.parse(InterShardMemory.getLocal()) || {}
    InterShardMemory.setLocal(JSON.stringify(global.intershardData?global.intershardData:Data))
    delete global.intershardData    // 删除global数据
}

export const crossShardAppPlugin: AppLifecycleCallbacks = {
    tickStart: InterShardManager,
    tickEnd: SaveShardMessage
}