import { ResourceMapData } from "@/constant/ResourceConstant"
import { isInArray } from "@/utils"
import { AppLifecycleCallbacks } from "../framework/types"

/* 杂物堆 */

// 计算平均价格
export function avePrice(res:ResourceConstant,day:number):number{
    if (day > 14) return 0  // 0
    let allprice = 0
    let history = Game.market.getHistory(res)
    for (var ii=14-day;ii<14;ii++)
    allprice += history[ii].avgPrice
    let avePrice = allprice/day // 平均能量价格
    return avePrice
}

// 判断是否已经有相应order了s
export function gethaveOrder(roomName: string, res: ResourceConstant, mtype: 'sell' | 'buy', nowPrice: number, range?: number): any {
    for (let i in Game.market.orders) {
        let order = Game.market.getOrderById(i);
        if (order.roomName == roomName && order.resourceType == res && order.type == mtype && order.price >= (Number(nowPrice) + Number(range)))
            return order;
    }
    return false
}

// 判断是否已经有相应order了
export function haveOrder(roomName:string,res:ResourceConstant,mtype:'sell'|'buy',nowPrice?:number,range?:number):boolean{
    if (!nowPrice)  //  不考虑价格
    {
        for (let i in Game.market.orders)
        {
            let order = Game.market.getOrderById(i);
            if (order.remainingAmount <=0) {Game.market.cancelOrder(i);continue;}
            if (order.roomName == roomName && order.resourceType == res && order.type == mtype)
            return true
        }
        return false
    }
    else        // 考虑价格区间
    {
        for (let i in Game.market.orders)
        {
            let order = Game.market.getOrderById(i);
            if (order.amount <=0 || !order.active) {Game.market.cancelOrder(i);continue;}
            if (order.roomName == roomName && order.resourceType == res && order.type == mtype && order.price >= (nowPrice+range))
            return true
        }
        return false
    }
}

// 计算一定范围内的最高价格
export function highestPrice(res:ResourceConstant,mtype:'sell'|'buy',mprice?:number):number{
    let allOrder = Game.market.getAllOrders({type: mtype, resourceType: res})
    let highestPrice = 0
    for (var i of allOrder)
    {
        if (i.price > highestPrice)
        {
            if (mprice){
                if (i.price <= mprice) highestPrice = i.price
            }
            else
            {
                highestPrice = i.price
            }
        }
    }
    if (mprice && highestPrice == 0) highestPrice = mprice
    return highestPrice
}

// 识别lab 合成 or 底物  [轮子]
export function RecognizeLab(roomname: string):{raw1:string,raw2:string,com:string[]} {
    var room = Game.rooms[roomname];
    if (!room) return null
    var labs = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } }) as StructureLab[];
    if (labs.length < 3) return null
    var centerLabs: [StructureLab, StructureLab, StructureLab[]] = [, , []];
    var obj = { centerLabs: [], otherLabs: [] };
    for (let i = 0; i < labs.length; i++) {
        let labA = labs[i];
        for (let j = i + 1; j < labs.length; j++) {
            let labB = labs[j]
            let otherLabs = [];
            if (labA.pos.inRangeTo(labB, 5))
                labs.forEach(labC => {
                    if (labC != labA && labC != labB && labA.pos.inRangeTo(labC, 2) && labB.pos.inRangeTo(labC, 2)) {
                        otherLabs.push(labC)
                    }
                });
            if (otherLabs.length > centerLabs[2].length) {
                centerLabs = [labA, labB, otherLabs];
                if (centerLabs[0]) {
                    obj.centerLabs = [centerLabs[0].id, centerLabs[1].id];
                    obj.otherLabs = centerLabs[2].map(e => e.id);
                } else {
                    obj.centerLabs = [];//中央lab
                    obj.otherLabs = [];//剩下lab
                }
            }
        }
    }
    if (obj.centerLabs.length <2 || obj.otherLabs.length <=0 ) return null
    return {raw1:obj.centerLabs[0],raw2:obj.centerLabs[1],com:obj.otherLabs}
}

// 判断是否存在该房间相关资源的调用信息 true 存在 false 不存在
export function checkDispatch(roomName:string,resource:ResourceConstant):boolean {
    for (let i of Memory.ResourceDispatchData)
    {
        if (i.sourceRoom == roomName && i.rType == resource) return true
    }
    return false
}

// 该房间资资源调度数量
export function DispatchNum(roomName:string):number{
    let num = 0
    for (let i of Memory.ResourceDispatchData)
    {
        if (i.sourceRoom == roomName) num ++
    }
    return num
}
// 判断其他房间是否存在往该房间的资源调度
export function checkSend(roomName:string,resource:ResourceConstant):boolean{
    for (let i in Memory.RoomControlData)
    {
        if (!Game.rooms[i] || !Game.rooms[i].memory.Misson || !Game.rooms[i].memory.Misson['Structure']) continue
        for (var t of Game.rooms[i].memory.Misson['Structure'])
        {
            if (t.name == '资源传送' && t.Data.rType == resource && t.Data.disRoom == roomName) return true
        }
    }
    return false
}

// 判断自己房间是否有资源购买任务
export function checkBuy(roomName:string,resource:ResourceConstant):boolean{
    for (var t of Game.rooms[roomName].memory.Misson['Structure'])
    {
        if (t.name == '资源购买' && t.Data.rType == resource) return true
    }
    return false
}

// 判断是否有实验室绑定该种类型资源 true代表有
export function checkLabBindResource(roomName:string,resource:ResourceConstant):boolean{
    let room_ = Game.rooms[roomName]
    if (!room_) return false
    for (var i in room_.memory.RoomLabBind)
    {
        if (room_.memory.RoomLabBind[i].rType == resource) return true
    }
    return false
}

/* 判断目标资源的上级资源是否已经达到要求 */
export function resourceMap(rType:ResourceConstant,disType:ResourceConstant):ResourceConstant[]{
    if (isInArray(['XGH2O','XGHO2','XLH2O','XLHO2','XUH2O','XUHO2','XKH2O','XKHO2','XZH2O','XZHO2'],rType)){console.log("是",rType,' 返回空列表');return []}
    for (var i of ResourceMapData)
    {
        if (i.source == rType && i.dis == disType)
        {
            return i.map as ResourceConstant[]
        }
    }
    console.log("判断目标资源的上级资源是否已经达到要求：resourceMap返回了空列表")
    return []
}

/* 判断爬虫是否是值得防御的目标 */
export function deserveDefend(creep:Creep):boolean{
    for (var b of creep.body)
    {
        if (b.boost && isInArray(['XGHO2','XKHO2','XUHO2','XZH2O'],b.boost))
        {
            return true
        }
    }
    return false
}

/* 判断爬虫是否有某类型部件 */
export function parts(creep:Creep,bo:BodyPartConstant):boolean{
    for (var b of creep.body)
    {
        if (b.type == bo) return true
    }
    return false
}

/* 爬虫攻击部件数据 */
export function hurts(creep:Creep):{[bo:string]:number}{
    var result = {'attack':0,'ranged_attack':0}
    for (var i of creep.body)
    {
        if (i.type == 'attack')
        {
            if (!i.boost) result['attack'] += 30
            else if (i.boost == 'UH') result['attack'] += 60
            else if (i.boost == 'UH2O') result['attack'] += 90
            else if (i.boost == 'XUH2O') result['attack'] += 120
        }
        else if (i.type == 'ranged_attack')
        {
            if (!i.boost) result['ranged_attack'] += 10
            else if (i.boost == 'KO') result['ranged_attack'] += 20
            else if (i.boost == 'KHO2') result['ranged_attack'] += 30
            else if (i.boost == 'XKHO2') result['ranged_attack'] += 40
        }
    }
    return result
}

/* 爬虫攻击数据 */
export function bodypartData(creep:Creep):{[bo:string]:number}{
    var result = {'attack':0,'ranged_attack':0,'heal':0,'tough':0}
    // 其中tough是抵抗的伤害值
    for (var i of creep.body)
    {
        if (i.type == 'heal')
        {
            if (!i.boost) result['heal'] += 12
            else if (i.boost == 'LO') result['heal'] += 24
            else if (i.boost == 'LHO2') result['heal'] += 36
            else if (i.boost == 'XLHO2') result['heal'] += 48
        }
        if (i.type == 'attack')
        {
            if (!i.boost) result['attack'] += 30
            else if (i.boost == 'UH') result['attack'] += 60
            else if (i.boost == 'UH2O') result['attack'] += 90
            else if (i.boost == 'XUH2O') result['attack'] += 120
        }
        else if (i.type == 'ranged_attack')
        {
            if (!i.boost) result['ranged_attack'] += 10
            else if (i.boost == 'KO') result['ranged_attack'] += 20
            else if (i.boost == 'KHO2') result['ranged_attack'] += 30
            else if (i.boost == 'XKHO2') result['ranged_attack'] += 40
        }
        else if (i.type == 'tough')
        {
            if (!i.boost) result['tough'] += 100
            else if (i.boost == 'GO') result['tough'] += 200
            else if (i.boost == 'GHO2') result['tough'] += 300
            else if (i.boost == 'XGHO2') result['tough'] += 400
        }
    }
    return result
}


/* 寻找后一级的爬 */
export function findNextData(creep:Creep):string {
    if (!creep.memory.squad) return null
    for (var i in creep.memory.squad)
    {
        if (creep.memory.squad[i].index - creep.memory.squad[creep.name].index == 1)
        {
            return i
        }
    }
    return null
}

/**
 * 判断房间thisRoom是否可以直接通过出口到达房间disRoom
 * @param thisRoom 当前房间
 * @param disRoom  目标房价
 * @returns boolean
 * 方向常量 ↑:1 →:3 ↓:5 ←:7
 */
export function identifyNext(thisRoom:string,disRoom:string):boolean{
    var thisRoomData = regularRoom(thisRoom)
    var disRoomData = regularRoom(disRoom)
    if (thisRoomData.coor[0]== disRoomData.coor[0] && thisRoomData.coor[1] == disRoomData.coor[1])
    {
        var Xdistanceabs = Math.abs(thisRoomData.num[0]-disRoomData.num[0])
        var Ydistanceabs = Math.abs(thisRoomData.num[1]-disRoomData.num[1])
        if ((Xdistanceabs == 0 && Ydistanceabs == 1) || (Xdistanceabs == 1 && Ydistanceabs == 0) && Game.rooms[thisRoom].findExitTo(disRoom)!= -2  && Game.rooms[thisRoom].findExitTo(disRoom)!= -10)
        {
            /* 已经接近房间了 */
            let result = Game.rooms[thisRoom].findExitTo(disRoom)
            if (isInArray([-2,-10],result)) return false
            else
            {
                let direction:number = null
                /* 判断一个房间相对另一个房间的方向是否和返回的出口方向一致 */
                if (Xdistanceabs == 1)  // x方向相邻
                {
                    let count = thisRoomData.num[0]-disRoomData.num[0]
                    // W区
                    if (thisRoomData.coor[0] == 'W')
                    {
                        switch (count){
                            case 1:{direction = 3;break;}
                            case -1:{direction = 7;break;}
                        }
                    }
                    // E区
                    else if (thisRoomData.coor[0] == 'E')
                    {
                        switch (count){
                            case 1:{direction = 7;break;}
                            case -1:{direction = 3;break;}
                        }
                    }
                }
                else if (Ydistanceabs == 1)       // y方向相邻
                {
                    let count = thisRoomData.num[1]-disRoomData.num[1]
                    // N区
                    if (thisRoomData.coor[1] == 'N')
                    {
                        switch (count){
                            case 1:{direction = 5;break;}
                            case -1:{direction = 1;break;}
                        }
                    }
                    // S区
                    else if (thisRoomData.coor[1] == 'S')
                    {
                        switch (count){
                            case 1:{direction = 1;break;}
                            case -1:{direction = 5;break;}
                        }
                    }
                }
                if (!direction) return false
                else if (direction == result) return true
            }
        }
    }
    return false
}

/**
 * 格式化房间名称信息
 * @param roomName 房间名
 * @returns 一个对象 例: W1N2 -----> {coor:["W","N"], num:[1,2]}
 */
export function regularRoom(roomName:string):{coor:string[],num:number[]}
{
    var roomName =  roomName
    const regRoom = /[A-Z]/g
    const regNum = /\d{1,2}/g
    let Acoord = regRoom.exec(roomName)[0]
    let AcoordNum = parseInt(regNum.exec(roomName)[0])
    let Bcoord = regRoom.exec(roomName)[0]
    let BcoordNum = parseInt(regNum.exec(roomName)[0])
    return {coor:[Acoord,Bcoord],num:[AcoordNum,BcoordNum]}
}

/* 获取相邻房间相对于本房间的方向 */
export function NextRoomDirection(thisRoom:string,disRoom:string):string{
    var thisRoomData = regularRoom(thisRoom)
    var disRoomData = regularRoom(disRoom)
    if (thisRoomData.coor[0]== disRoomData.coor[0] && thisRoomData.coor[1] == disRoomData.coor[1])
    {
        var Xdistanceabs = Math.abs(thisRoomData.num[0]-disRoomData.num[0])
        var Ydistanceabs = Math.abs(thisRoomData.num[1]-disRoomData.num[1])
        if ((Xdistanceabs == 0 && Ydistanceabs == 1) || (Xdistanceabs == 1 && Ydistanceabs == 0) && Game.rooms[thisRoom].findExitTo(disRoom)!= -2  && Game.rooms[thisRoom].findExitTo(disRoom)!= -10)
        {
            /* 已经接近房间了 */
            let direction:string = null
            /* 判断一个房间相对另一个房间的方向是否和返回的出口方向一致 */
            if (Xdistanceabs == 1)  // x方向相邻
            {
                let count = thisRoomData.num[0]-disRoomData.num[0]
                // W区
                if (thisRoomData.coor[0] == 'W')
                {
                    switch (count){
                        case 1:{direction = "→";break;}
                        case -1:{direction = "←";break;}
                    }
                }
                // E区
                else if (thisRoomData.coor[0] == 'E')
                {
                    switch (count){
                        case 1:{direction = "←";break;}
                        case -1:{direction = "→";break;}
                    }
                }
            }
            else if (Ydistanceabs == 1)       // y方向相邻
            {
                let count = thisRoomData.num[1]-disRoomData.num[1]
                // N区
                if (thisRoomData.coor[1] == 'N')
                {
                    switch (count){
                        case 1:{direction = "↓";break;}
                        case -1:{direction = "↑";break;}
                    }
                }
                // S区
                else if (thisRoomData.coor[1] == 'S')
                {
                    switch (count){
                        case 1:{direction = "↑";break;}
                        case -1:{direction = "↓";break;}
                    }
                }
            }
            return direction
        }
    }
    return null
}

/**
 * 判断是否处于房间入口指定格数内
 * @param creep 
 * @returns 
 */
export function RoomInRange(thisPos:RoomPosition,disRoom:string,range:number):boolean{
    let thisroom = thisPos.roomName
    let direction = NextRoomDirection(thisroom,disRoom)
    if (!direction) return false
    if (!range || range <= 0 || range >= 49) return false
    switch (direction){
        case "↑":{
            return thisPos.y <= range?true:false
        }
        case "↓":{
            return thisPos.y >= (49-range)?true:false
        }
        case "←":{
            return thisPos.x <= range?true:false
        }
        case "→":{
            return thisPos.x >= (49-range)?true:false
        }
        default:{
            return false;
        }
    }
}

/* 判断是否可以组队了  需要一个方块的位置都没有墙壁，而且坐标需要 2 -> 47 */
export function identifyGarrison(creep:Creep):boolean{
    if (creep.pos.x > 47 || creep.pos.x < 2 || creep.pos.y > 47 || creep.pos.y < 2) return false
    for (var i = creep.pos.x;i<creep.pos.x+2;i++)
    for (var j=creep.pos.y;j<creep.pos.y+2;j++)
    {
        var thisPos = new RoomPosition(i,j,creep.room.name)
        if (thisPos.lookFor(LOOK_TERRAIN)[0] == 'wall')
        {
            return false
        }
        if (thisPos.GetStructureList(['spawn','constructedWall','rampart','observer','link','nuker','storage','tower','terminal','powerSpawn','extension']).length > 0) return false
    }
    return true
}

/* 寻找前一级的爬 四人小队用 */
export function findFollowData(creep:Creep):string {
    if (!creep.memory.squad) return null
    for (var i in creep.memory.squad)
    {
        if (creep.memory.squad[creep.name].index - creep.memory.squad[i].index == 1)
        {
            return i
        }
    }
    return null
}

/* 没有房间名的字符串解压 例如 14/23 */
export function unzipXandY(str:string):number[] | undefined{
    var info = str.split('/')
    return info.length == 2? [Number(info[0]),Number(info[1])]:undefined
}
