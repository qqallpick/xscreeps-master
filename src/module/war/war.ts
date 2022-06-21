import creep from "@/mount/creep"
import { isInArray } from "@/utils"
import { bodypartData } from "../fun/funtion"

/* 战争相关 "基础设施" */

/* -------------------------------战争信息获取及更新区------------------------------------ */
// 获取所有房间内的敌对爬虫
export function getAllEnemy(room:Room):Creep[]
{
    if (!room) return []
    let enemy = room.find(FIND_CREEPS,{filter:(creep)=>{
        return !isInArray(Memory.whitesheet,creep.owner.username)
    }})
    return enemy
}

// 获取所有房间内的旗帜
export function getAllFlag(room:Room):Flag[]{
    if (!room) return []
    let flag = room.find(FIND_FLAGS)
    return flag
}

// 获取所有房间内的建筑 不包含road controller container
export function getAllStructure(room:Room):Structure[]{
    if (!room) return []
    let structues = room.find(FIND_STRUCTURES,{filter:(stru)=>{
        return !isInArray([STRUCTURE_CONTAINER,STRUCTURE_ROAD,STRUCTURE_CONTROLLER],stru.structureType)
    }})
    return structues
}

// 返回分类建筑对象
export function classifyStructure(stru:Structure[]):StructureData{
    if (!stru || stru.length <= 0) return {}
    let result = {}
    for (var i of stru)
    {
        if (!result[i.structureType]) result[i.structureType] = []
        result[i.structureType].push(i)
        
    }
    return result
}

// 获取房间内的防御塔数据
export function getTowerData(room:Room):TowerRangeMapData{
    if (!room) return {}
    let towers = room.find(FIND_STRUCTURES,{filter:(stru)=>{
        return stru.structureType == 'tower'
    }}) as StructureTower[]
    if (towers.length <= 0) return {}
    let terrianData = room.getTerrain()
    let tempData:TowerRangeMapData = {}
    for (let i=0;i<50;i++)
    LoopTerrian:
    for (let j=0;j<50;j++)
    {
        let thisPos = new RoomPosition(i,j,room.name)
        // 0 平原 1 墙壁 2 沼泽
        if (terrianData.get(i,j) == 1)
        continue LoopTerrian
        let tempNum:ARH = {attack:0,heal:0,repair:0}
        for (var t of towers)
        {
            // 伤害计算叠加
            thisPos.AddTowerRangeData(t,tempNum)
        }
        tempData[`${thisPos.x}/${thisPos.y}`] = tempNum
    }
    return tempData
}

/* 更新敌对爬虫列表 每tick更新1次 */
export function warUpdateEnemy(room:Room):void{
    if (!room) return
    if (!global.warData.enemy)global.warData.enemy = {}
    if (!global.warData.enemy[room.name]) global.warData.enemy[room.name] = {time:Game.time,data:getAllEnemy(room)}
    if (Game.time == global.warData.enemy[room.name].time) return // 跳过
    else    // 说明数据过时了，更新数据
    {
        global.warData.enemy[room.name].time = Game.time
        global.warData.enemy[room.name].data = getAllEnemy(room)
    }
}

/* 更新建筑物列表 将建筑物分类 每tick更新1次*/
export function warUpdateStructure(room:Room):void{
    if (!room) return
    if (!global.warData.structure)global.warData.structure = {}
    if (!global.warData.structure[room.name]) global.warData.structure[room.name] = {time:Game.time,data:classifyStructure(getAllStructure(room))}
    if (Game.time == global.warData.structure[room.name].time) return // 跳过
    else    // 说明数据过时了，更新数据
    {
        global.warData.structure[room.name].time = Game.time
        global.warData.structure[room.name].data = classifyStructure(getAllStructure(room))
    }
}

/* 更新旗帜列表 每tick更新1次 */
export function warUpdateFlag(room:Room):void{
    if (!room) return
    if (!global.warData.flag)global.warData.flag = {}
    if (!global.warData.flag[room.name]) global.warData.flag[room.name] = {time:Game.time,data:getAllFlag(room)}
    if (Game.time == global.warData.flag[room.name].time) return // 跳过
    else    // 说明数据过时了，更新数据
    {
        global.warData.flag[room.name].time = Game.time
        global.warData.flag[room.name].data = getAllFlag(room)
    }
}

/* 更新塔伤数据  非每tick刷新 检测到建筑物中tower数量变化才会进行更新 */
export function warUpdateTowerData(room:Room):void{
    if (!room) return
    if (!global.warData.tower)global.warData.tower = {}
    if (!global.warData.tower[room.name])global.warData.tower[room.name] = {count:0,data:{}}
    if (!global.warData.structure || !global.warData.structure[room.name]) return
    if (!global.warData.structure[room.name].data || !global.warData.structure[room.name].data['tower']) return
    let length = global.warData.structure[room.name].data['tower'].length
    if (length != global.warData.tower[room.name].count)
    {
        global.warData.tower[room.name].count = length
        global.warData.tower[room.name].data = getTowerData(room)
    }
    return
}

/**
 * 战争信息初始化及更新
 * 所有参与战争的爬虫，在进入目标房间后，应该运行该函数
 * */
export function warDataInit(room:Room):void{
    if (!global.warData) global.warData = {}
    warUpdateEnemy(room)
    warUpdateStructure(room)
    warUpdateFlag(room)
    warUpdateTowerData(room)
}

/* -------------------------------战争信息二次加工区------------------------------------ */

/* 寻找离自己最近的爬虫 path attck为true会搜寻带有攻击部件的爬虫 ram为true会搜寻所在位置没有rampart的爬虫 */
export function PathClosestCreep(pos:RoomPosition,creeps:Creep[],attack?:boolean,ram?:boolean):Creep | null{
    if (!pos) return null
    return pos.findClosestByPath(creeps,{filter:(creep)=>{
        return (attack?(creep.getActiveBodyparts('attack') || creep.getActiveBodyparts('ranged_attack')):true) &&
        (ram?!creep.pos.GetStructure('rampart'):true) &&
        !creep.my
    }})
}

/* 寻找离自己最近的爬虫 range attck为true会搜寻带有攻击部件的爬虫 ram为true会搜寻所在位置没有rampart的爬虫 */
export function RangeClosestCreep(pos:RoomPosition,creeps:Creep[],attack?:boolean,ram?:boolean):Creep | null{
    if (!pos) return null
    return pos.findClosestByRange(creeps,{filter:(creep)=>{
        return (attack?(creep.getActiveBodyparts('attack') || creep.getActiveBodyparts('ranged_attack')):1 )&& 
        (ram?!creep.pos.GetStructure('rampart'):1) &&
        !creep.my
    }})
}

/* 寻找范围内的爬虫 */
export function RangeCreep(pos:RoomPosition,creeps:Creep[],range:number,attack?:boolean,ram?:boolean):Creep[]{
    if (!pos) return []
    return pos.findInRange(creeps,range,{filter:(creep)=>{
        return (attack?(creep.getActiveBodyparts('attack') > 0 || creep.getActiveBodyparts('ranged_attack') > 0):true )&& 
        (ram?!creep.pos.GetStructure('rampart'):true) && 
        !creep.my
    }})
}

/* 寻找离自己最近的旗帜 path name代表旗帜开始的字符 attack为true代表除去旗帜附近range格有攻击性爬虫的旗帜 */
export function pathClosestFlag(pos:RoomPosition,flags:Flag[],name:string,attack?:boolean,range?:number):Flag | null{
    if (!pos) return null
    if (attack)
    {
        if (!Game.rooms[pos.roomName]) return null
        if(global.warData.enemy[pos.roomName].time != Game.time) return null
        let creeps = global.warData.enemy[pos.roomName].data
        return pos.findClosestByPath(flags,{filter:(flag)=>{
            return flag.pos.roomName == pos.roomName && flag.name.indexOf(name) == 0 && RangeCreep(flag.pos,creeps,range?range:3,true).length <= 0
        }})
    }
    return pos.findClosestByPath(flags,{filter:(flag)=>{
        return flag.pos.roomName == pos.roomName && flag.name.indexOf(name) == 0
    }})
}

/* 寻找离自己最近的建筑 path wall true代表排除wall rampart true代表排除rampart  attack代表不靠近攻击爬虫的 */
export function pathClosestStructure(pos:RoomPosition,wall?:boolean,ram?:boolean,attack?:boolean,range?:number):Structure{
    if (!pos) return null
    if (!Game.rooms[pos.roomName]) return null
    if (!attack)
    {
        let structures = Game.rooms[pos.roomName].find(FIND_STRUCTURES,{filter:(stru)=>{
            return !isInArray(["road","container",'controller'],stru.structureType) && 
            (wall?stru.structureType != "constructedWall":true) && 
            (ram?(stru.structureType != "rampart" || !stru.pos.GetStructure('rampart')):true)
        }})
        return pos.findClosestByPath(structures)
    }
    else
    {
        if(global.warData.enemy[pos.roomName].time != Game.time) return null
        let creeps = global.warData.enemy[pos.roomName].data
        let structures = Game.rooms[pos.roomName].find(FIND_STRUCTURES,{filter:(stru)=>{
            return !isInArray(["road","container",'controller'],stru.structureType) && 
            (wall?stru.structureType != "constructedWall":true) && 
            (ram?(stru.structureType != "rampart" || !stru.pos.GetStructure('rampart')):true)
        }})
        let result =  pos.findClosestByPath(structures,{filter:(stru)=>{
            return RangeCreep(stru.pos,creeps,range?range:5,true).length <= 0
        }})
        return result
    }
}

/* 判断是否抵抗的住爬虫的攻击<只适用于单个爬虫>  敌方爬虫 自己的爬虫 防御塔数据(敌方)  返回true代表不会破防*/
export function canSustain(creeps:Creep[],mycreep:Creep,towerData?:number):boolean{
    let bodyData = bodypartData(mycreep)
    let toughNum = mycreep.getActiveBodyparts('tough')
    let toughBoostType = null
    if (creeps.length <=0) return true
    for (var i of mycreep.body) // 确定boost类型
    {
        if (i.type == 'tough')
        {
            if (!i.boost) {toughBoostType = null;break}
            else if (i.boost == 'GO')  {toughBoostType = 'GO';break}
            else if (i.boost == 'GHO2')  {toughBoostType = 'GHO2';break}
            else if (i.boost == 'XGHO2')  {toughBoostType = 'XGHO2';break}
        }
    }
    let myhealData = bodyData['heal']
    let hurtData = 0
    // 计算敌方伤害 hurtData是总伤害
    for (var c of creeps)
    {
        if (c.name == mycreep.name) continue
        let enData = bodypartData(c)
        let hurt = enData['attack']
        if (enData['ranged_attack'] > hurt) hurt = enData['ranged_attack']
        hurtData += hurt
    }
    if (towerData) hurtData += towerData
    // mycreep.say(`${hurtData}`)
    // 判断总伤害能否破防
    if (toughNum <= 0)
    {
        if(hurtData > myhealData) return false
    }
    else
    {
        if(!toughBoostType)
        {
            if(hurtData > myhealData) return false
        }
        else if (toughBoostType == 'GO')
        {
            let hurt = hurtData/2
            if (hurt <= toughNum*100)
            {
                if(hurt > myhealData) return false
            }
            else
            {
                let superfluous = (hurt-toughNum*100)*2
                if (hurt+superfluous > myhealData) return false
            }
        }
        else if (toughBoostType == 'GHO2')
        {
            let hurt = hurtData/3
            if (hurt <= toughNum*100)
            {
                if(hurt > myhealData) return false
            }
            else
            {
                let superfluous = (hurt-toughNum*100)*3
                if (hurt+superfluous > myhealData) return false
            }
        }
        else if (toughBoostType == 'XGHO2')
        {
            let hurt = hurtData/4
            if (hurt <= toughNum*100)
            {
                if(hurt > myhealData) return false
            }
            else
            {
                let superfluous = (hurt-toughNum*100)*4
                if (hurt+superfluous > myhealData) return false
            }
        }
    }
    return true
}
