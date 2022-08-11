// import { RequestShard } from "@/shard/base"
import { hurts, parts } from "@/module/fun/funtion"
import { RequestShard } from "@/module/shard/intershard"
import { canSustain } from "@/module/war/war"
import { closestPotalRoom, getOppositeDirection, isInArray } from "@/utils"

/* 本地寻路移动 */
export default class CreepMoveExtension extends Creep {
    
    // 位置标准化
    public standardizePos(pos:RoomPosition):string|null{
        return `${pos.roomName}/${pos.x}/${pos.y}/${Game.shard.name}`
    }

    // 寻找不允许对穿的爬虫的位置
    public getStandedPos():RoomPosition[]
    {
        var standedCreep = this.room.find(FIND_MY_CREEPS,{filter:(creep)=>{
            return (creep.memory.standed == true || (creep.memory.crossLevel && this.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel))
        }})
        if (standedCreep.length > 0)
        {
            var posList = []
            for (var i of standedCreep)
            {
                posList.push(i.pos)
            }
            return posList
        }
        return []
    }

    // 通用寻路
    public findPath(target:RoomPosition,range:number,ops?:number):string|null{
        /* 全局路线存储 */
        if (!global.routeCache) global.routeCache = {}
        if (!this.memory.moveData) this.memory.moveData = {}
        this.memory.moveData.index = 0
        /* 查找全局中是否已经有预定路线，如果有了就直接返回路线 */
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`
        var route = global.routeCache[routeKey]
        if (route && this.room.name != target.roomName)
        {
            return route
        }
        // 过道路口优先
        let allowedRooms = { [this.pos.roomName]: true ,[target.roomName]:true};
        let swi =false
        if (target.roomName != this.room.name)
        {
            let myroomparsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.room.name)));
            let disRoomparsed = Number((/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(target.roomName)));
            /* 计算距离 如果两个房间之间距离过短就不这样做 */
            let enoughDistance = Math.sqrt(Math.abs(myroomparsed[0]-disRoomparsed[0])**2+Math.abs(myroomparsed[1]-disRoomparsed[1])**2)
            if (enoughDistance > 3.6) swi = true
            if (swi)
            {
                let ret=Game.map.findRoute(this.pos.roomName, target.roomName, {
                    routeCallback(roomName) {
                        // 在全局绕过房间列表的房间 false
                        if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return Infinity
                        let parsed = (/^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName));
                        let isHighway = (Number(parsed[1]) % 10 === 0) ||
                            (Number(parsed[2]) % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            Game.rooms[roomName].controller.my;
                        if (isHighway || isMyRoom) {
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                })
                if (ret != ERR_NO_PATH) {
                    ret.forEach(function (info) {
                        allowedRooms[info.room] = true;
                    });
                }
            }
        }
        /* 路线查找 */
        const result = PathFinder.search(this.pos,{pos:target,range:range},{
            plainCost:2,
            swampCost:4,
            maxRooms: target.roomName == this.room.name ? 1 : 32,
            maxOps: ops ? ops : (target.roomName == this.room.name ? 800 : 8000),
            roomCallback:roomName=>{
                // 在全局绕过房间列表的房间 false
                if (!swi && Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
                if (swi && allowedRooms[roomName] === undefined) {
                    return false;
                }
                // 在爬虫记忆绕过房间列表的房间 false
                const room = Game.rooms[roomName]
                // 没有视野的房间只观察地形
                if (!room) return
                // 有视野的房间
                let costs = new PathFinder.CostMatrix
                // 将道路的cost设置为1，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct=>{
                    if (struct.structureType === STRUCTURE_ROAD)
                    {
                        costs.set(struct.pos.x,struct.pos.y,1)
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER && 
                        (struct.structureType !==STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x,struct.pos.y,0xff)
                })
                room.find(FIND_HOSTILE_STRUCTURES).forEach(stru =>{
                    if (stru.structureType == 'rampart' && stru.isPublic)
                        costs.set(stru.pos.x,stru.pos.y,1)
                })
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons=>{
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                    costs.set(cons.pos.x,cons.pos.y,255)
                })
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    costs.set(creep.pos.x,creep.pos.y,255)
                })
                room.find(FIND_MY_CREEPS).forEach(creep=>{
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                    costs.set(creep.pos.x,creep.pos.y,255)
                    else
                    costs.set(creep.pos.x,creep.pos.y,3)
                })
                return costs
                }
            })
        // 寻路异常返回null
        if (result.path.length <= 0) return null
        // 寻路结果压缩
        route = this.serializeFarPath(result.path)
        if (!result.incomplete) global.routeCache[routeKey] = route
        return route
    }

    // 使用寻路结果移动
    public goByPath():CreepMoveReturnCode | ERR_NO_PATH | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET{
        if (!this.memory.moveData) return ERR_NO_PATH
        const index = this.memory.moveData.index
        // 移动索引超过数组上限代表到达目的地
        if (index >= this.memory.moveData.path.length)
        {
            delete this.memory.moveData.path
            return OK
        }
        // 获取方向，进行移动
        const direction = <DirectionConstant>Number(this.memory.moveData.path[index])
        const goResult = this.go(direction)
        // 移动成功，更新下次移动索引
        if (goResult == OK) this.memory.moveData.index ++
        return goResult

    }

    // 通用移动 (配合findPath 和 goByPath)
    public goTo(target:RoomPosition,range:number = 1,ops?:number):CreepMoveReturnCode | ERR_NO_PATH | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET{
        //  var a = Game.cpu.getUsed()
        if (this.fatigue) return ERR_TIRED;
        if (this.memory.moveData == undefined) this.memory.moveData = {}
        if (target.roomName != this.room.name)
        {
            Game.map.visual.line(this.pos, target,{color: '#ffffff', lineStyle: 'dashed'});
            Game.map.visual.text(`${this.memory.MissionData?this.memory.MissionData.name:null}|${this.name}`, this.pos, {color: '#ffffff', fontSize: 5});
        }
        // 确认目标没有变化，如果变化了就重新规划路线
        const targetPosTag = this.standardizePos(target)
        if (targetPosTag !== this.memory.moveData.targetPos)
        {
            this.memory.moveData.targetPos = targetPosTag
            this.memory.moveData.path = this.findPath(target,range,ops?ops:null)
        }
        // 确认缓存有没有被清除
        if (!this.memory.moveData.path)
        {
            this.memory.moveData.path = this.findPath(target,range,ops?ops:null)
        }
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path)
        {
            delete this.memory.moveData.path
            return OK
        }
        // 使用缓存进行移动
        const goResult = this.goByPath()
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET){
            delete this.memory.moveData
        }
        else if (goResult != OK && goResult != ERR_TIRED)
        {
            this.say(`异常码：${goResult}`)
        }
        // var b = Game.cpu.getUsed()
        // this.say(`${b-a}`)
        return goResult
    }
    
    // 请求对穿 按照对穿等级划分 等级高的可以任意对穿等级低的，等级低的无法请求等级高的对穿，等级相等则不影响
    public requestCross(direction:DirectionConstant):OK | ERR_BUSY | ERR_NOT_FOUND{
        if (!this.memory.crossLevel) this.memory.crossLevel = 10    // 10为默认对穿等级
        // 获取目标方向一格的位置
        const fontPos = this.pos.directionToPos(direction)
        // 在出口、边界
        if (!fontPos) return ERR_NOT_FOUND
        const fontCreep = (fontPos.lookFor(LOOK_CREEPS)[0] || fontPos.lookFor(LOOK_POWER_CREEPS)[0]) as Creep | PowerCreep
        if (!fontCreep) return ERR_NOT_FOUND
        if (fontCreep.owner.username != this.owner.username) return
        this.say("对")
        if (fontCreep.manageCross(getOppositeDirection(direction),this.memory.crossLevel)) this.move(direction)
        return OK
    }

    // 处理对穿
    public manageCross(direction:DirectionConstant,crossLevel:number):boolean{
        if (!this.memory.crossLevel) this.memory.crossLevel = 10
        if (!this.memory) return true
        if (this.memory.standed || this.memory.crossLevel > crossLevel){
            if (!(Game.time % 5)) this.say('穿')
            return false
        }
        // 同意对穿
        this.say('好')
        this.move(direction)
        return true
    }

    // 单位移动 (goByPath中的移动基本函数)
    public go(direction: DirectionConstant): CreepMoveReturnCode | ERR_INVALID_TARGET{
        const moveResult = this.move(direction)
        if (moveResult != OK) return moveResult
        // 如果ok的话，有可能撞上东西了或者一切正常
        const currentPos = `${this.pos.x}/${this.pos.y}`
        if (this.memory.prePos && currentPos == this.memory.prePos)
        {
            // 这个时候确定在原点驻留了
            const crossResult = this.memory.disableCross ? ERR_BUSY : this.requestCross(direction)
            if (crossResult != OK)
            {
                delete this.memory.moveData
                return ERR_INVALID_TARGET
            }
        }
        this.memory.prePos = currentPos
        return OK
    }

    /* 压缩路径 */
    public serializeFarPath(positions:RoomPosition[]):string{
        if (positions.length == 0) return ''
        // 确保路径里第一个位置是自己当前的位置
        if (!positions[0].isEqualTo(this.pos)) positions.splice(0,0,this.pos)

        return positions.map((pos, index) => {
            // 最后一个位置就不用再移动
            if (index >= positions.length - 1) return null
            // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
            if (pos.roomName != positions[index + 1].roomName) return null
            // 获取到下个位置的方向
            return pos.getDirectionTo(positions[index + 1])
        }).join('')
    }

    // 跨shard移动
    public arriveTo(target:RoomPosition,range:number,shard:shardName = Game.shard.name as shardName,shardData?:shardRoomData[]):void{
        if (!this.memory.targetShard) this.memory.targetShard = shard
        if (!shardData || shardData == [])
        {
            if (shard == Game.shard.name)
            {
                this.goTo(target,range)
            }
            else
            {
                if (!this.memory.protalRoom)
                // 寻找最近的十字路口房间
                {
                    if (Game.flags[`${this.memory.belong}/portal`])
                    {
                        this.memory.protalRoom = Game.flags[`${this.memory.belong}/portal`].room.name
                    }
                    else
                    {
                        this.memory.protalRoom = closestPotalRoom(this.memory.belong,target.roomName)
                    }
                }
                if (!this.memory.protalRoom || this.memory.protalRoom == null) return
                if (this.room.name != this.memory.protalRoom)
                {
                    this.goTo(new RoomPosition(25,25,this.memory.protalRoom),20)
                }
                else
                {
                    /* 寻找星门 */
                    var portal = this.room.find(FIND_STRUCTURES,{filter:(structure)=>{
                        return structure.structureType == STRUCTURE_PORTAL 
                    }}) as StructurePortal[]
                    if (portal.length <= 0) return
                    var thisportal:StructurePortal
                    for (var i of portal)
                    {
                        var porType = i.destination as {shard?:string, room?:string, roomName?:string}
                        if (porType.shard == shard )
                        thisportal = i
                    }
                    if (!thisportal) return
                    if (!this.pos.isNearTo(thisportal)) this.goTo(thisportal.pos,1)
                    else
                    {
                        /* moveData里的shardmemory */
                        /* 靠近后等待信息传送 */
                        var RequestData = {
                            relateShard:shard,
                            sourceShard:Game.shard.name as shardName,
                            type:1,
                            data:{id:this.name,MemoryData:this.memory}
                        }
                        if(RequestShard(RequestData))
                        {
                            this.moveTo(thisportal)
                        }
                    }
                }
            }
        }
        else
        {
            /* 存在shardData则说明爬虫可能需要跨越多个shard */
            if (!this.memory.shardAffirm)
            {
                let data =  []
                for (let data_ of shardData)
                {
                    data.push({shardName:data_.shard,roomName:data_.roomName,x:data_.x,y:data_.y,affirm:false})
                }
                this.memory.shardAffirm = data
            }
            if (this.memory.shardAffirm == [])
            {
                this.say("shardAffirm赋予错误!")
                return
            }
            // 更新目的shardRoom
            for (var sr of this.memory.shardAffirm)
            {
                if (sr.disRoomName == this.pos.roomName && sr.disShardName == Game.shard.name)
                {
                    sr.affirm = true
                    break
                }
            }
            // 确定下一个目的shardRoom
            let nextShardRoom:shardRoomData = null
            for (var nr of this.memory.shardAffirm)
            {
                if (!nr.affirm)
                {
                    nextShardRoom = {shard:nr.shardName,roomName:nr.roomName,x:nr.x,y:nr.y}
                    break
                }
            }
            // 到达目标shard
            if (!nextShardRoom && Game.shard.name == this.memory.targetShard)
            {
                this.goTo(target,range)
                return
            }
            // 没到达
            if (!nextShardRoom)
            {
                this.say('找不到nextShardRoom')
                return
            }
            if (this.room.name != nextShardRoom.roomName)
            {
                this.goTo(new RoomPosition(25,25,nextShardRoom.roomName),20)
            }
            else
            {
                /* 寻找星门 */
                var portal = this.room.find(FIND_STRUCTURES,{filter:(structure)=>{
                    return structure.structureType == STRUCTURE_PORTAL 
                }}) as StructurePortal[]
                if (portal.length <= 0) return
                var thisportal:StructurePortal
                LoopA:
                for (var i of portal)
                {
                    var porType = i.destination as {shard?:string, room?:string, roomName?:string}
                    if ( i.pos.x ==nextShardRoom.x && i.pos.y == nextShardRoom.y )
                    {
                        /* 更新一下shardaffirm的disRoomName信息 */
                        LoopB:
                        for (var sr of this.memory.shardAffirm)
                        {
                            if (sr.roomName == this.pos.roomName && sr.shardName == Game.shard.name)
                            {
                                sr.disRoomName = porType.room
                                nextShardRoom.disShardName = porType.shard as shardName
                                sr.disShardName = porType.shard as shardName
                                break LoopB
                            }
                        }
                        thisportal = i
                        break LoopA
                    }
                }
                if (!thisportal) {console.log("找不到thisportal");return}
                if (!this.pos.isNearTo(thisportal)) this.goTo(thisportal.pos,1)
                else
                {
                    /* moveData里的shardmemory */
                    /* 靠近后等待信息传送 */
                    var RequestData = {
                        relateShard:nextShardRoom.disShardName,
                        sourceShard:Game.shard.name as shardName,
                        type:1,
                        data:{id:this.name,MemoryData:this.memory}
                    }
                    if (RequestData.relateShard)
                    {
                        if(RequestShard(RequestData))
                        {
                            this.moveTo(thisportal)
                        }
                    }
                    else
                    {
                        /* 说明可能是本地星门 */
                        this.moveTo(thisportal)
                        for (var nnr of this.memory.shardAffirm)    // 更新affirm
                        {
                            if (!nnr.affirm)
                            {
                                nnr.affirm = true
                                break
                            }
                        }
                    }
                }
            }
        }
    }

    // 多次跨shard affirm更新模块
    public updateShardAffirm():void{
        if (this.memory.shardAffirm)
        for (var sr of this.memory.shardAffirm)
        {
            if (sr.disRoomName == this.pos.roomName && sr.shardName == Game.shard.name)
            {
                sr.affirm = true
                return
            }
        }
    }

    // 主动防御寻路
    public findPath_defend(target:RoomPosition,range:number):string|null{
        /* 全局路线存储 */
        if (!global.routeCache) global.routeCache = {}
        if (!this.memory.moveData) this.memory.moveData = {}
        this.memory.moveData.index = 0
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`
        /* 路线查找 */
        const result = PathFinder.search(this.pos,{pos:target,range:range},{
            plainCost:3,
            swampCost:10,
            maxOps:600,
            roomCallback:roomName=>{
                // 在全局绕过房间列表的房间 false
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
                // 在爬虫记忆绕过房间列表的房间 false
                if (this.memory.bypassRooms && this.memory.bypassRooms.includes(roomName)) return false
                const room = Game.rooms[roomName]
                // 没有视野的房间只观察地形
                if (!room) return
                // 有视野的房间
                let costs = new PathFinder.CostMatrix
                /* 设置主动防御范围 */
                if (room.name == this.memory.belong)
                {
                    /* 将房间边界设置为255 */
                    for (var x=0;x<50;x++)
                    for (var y=0;y<50;y++)
                    {
                        if (isInArray([0,49],x) || isInArray([0,49],y))
                        {
                            costs.set(x,y,255)
                        }
                    }
                }
                // 将rampart设置为 1 
                room.find(FIND_MY_STRUCTURES).forEach(struct=>{
                    if (struct.structureType === STRUCTURE_RAMPART)
                    {
                        costs.set(struct.pos.x,struct.pos.y,1)
                    }
                })
                // 将道路的cost设置为2，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct=>{
                    if (struct.structureType === STRUCTURE_ROAD)
                    {
                        costs.set(struct.pos.x,struct.pos.y,2)
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER && 
                        (struct.structureType !==STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x,struct.pos.y,255)
                })
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons=>{
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                    costs.set(cons.pos.x,cons.pos.y,255)
                })
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    if (parts(creep,'ranged_attack') && hurts(creep)['ranged_attack'] > 1000)
                    {
                        for (var i = creep.pos.x-3;i<creep.pos.x+4;i++)
                        for (var j = creep.pos.y-3;j<creep.pos.y+4;j++)
                        if (i>0 && i< 49 && j>0 && j<49)
                        {
                            var nearpos = new RoomPosition(i,j,creep.room.name)
                            if(!nearpos.GetStructure('rampart'))
                            costs.set(i,j,20)
                        }
                    }
                })
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    costs.set(creep.pos.x,creep.pos.y,255)
                })
                room.find(FIND_MY_CREEPS).forEach(creep=>{
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                    costs.set(creep.pos.x,creep.pos.y,255)
                    else
                    costs.set(creep.pos.x,creep.pos.y,3)
                })              
                return costs
                }
            })
        // 寻路异常返回null
        if (result.path.length <= 0) return null
        // 寻路结果压缩
        var route = this.serializeFarPath(result.path)
        if (!result.incomplete) global.routeCache[routeKey] = route
        return route

    }
    /* 主动防御移动 */
    public goTo_defend(target:RoomPosition,range:number = 1):CreepMoveReturnCode | ERR_NO_PATH | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET{
        var a = Game.cpu.getUsed()
        if (this.memory.moveData == undefined) this.memory.moveData = {}
        // 确认目标没有变化，如果变化了就重新规划路线
        this.memory.moveData.path = this.findPath_defend(target,range)
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path)
        {
            delete this.memory.moveData.path
            return OK
        }
        // 使用缓存进行移动
        const goResult = this.goByPath()
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET){
            delete this.memory.moveData
        }
        else if (goResult != OK && goResult != ERR_TIRED)
        {
            this.say(`异常码：${goResult}`)
        }
        var b = Game.cpu.getUsed()
        //this.say(`b-a`)
        return goResult
    }

    // 逃离寻路
    public Flee(target:RoomPosition,range:number):void{
        let path = PathFinder.search(this.pos,{pos:target,range:range},{
            plainCost:2,
            swampCost:20,
            maxOps:600,
            flee:true,
            roomCallback:roomName=>{
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
                // 在爬虫记忆绕过房间列表的房间 false
                const room = Game.rooms[roomName]
                // 没有视野的房间只观察地形
                if (!room) return
                // 有视野的房间
                let costs = new PathFinder.CostMatrix
                // 将道路的cost设置为1，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct=>{
                    if (struct.structureType === STRUCTURE_ROAD)
                    {
                        costs.set(struct.pos.x,struct.pos.y,1)
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER && 
                        (struct.structureType !==STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x,struct.pos.y,0xff)
                })
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons=>{
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                    costs.set(cons.pos.x,cons.pos.y,255)
                })
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    costs.set(creep.pos.x,creep.pos.y,255)
                })
                room.find(FIND_MY_CREEPS).forEach(creep=>{
                    if ((creep.memory.crossLevel && creep.memory.crossLevel > this.memory.crossLevel) || creep.memory.standed)
                    costs.set(creep.pos.x,creep.pos.y,255)
                    else
                    costs.set(creep.pos.x,creep.pos.y,3)
                })
                return costs
                }
        })
        var direction = this.pos.getDirectionTo(path.path[0])
        if (!direction)return
        this.move(direction)
    }

    // 一体机寻路
    public findPath_aio(target:RoomPosition,range:number):string|null{
        /* 全局路线存储 */
        if (!global.routeCache) global.routeCache = {}
        if (!this.memory.moveData) this.memory.moveData = {}
        this.memory.moveData.index = 0
        const routeKey = `${this.standardizePos(this.pos)} ${this.standardizePos(target)}`
        /* 路线查找 */
        const result = PathFinder.search(this.pos,{pos:target,range:range},{
            plainCost:2,
            swampCost:20,
            maxOps:600,
            roomCallback:roomName=>{
                // 在全局绕过房间列表的房间 false
                if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
                // 在爬虫记忆绕过房间列表的房间 false
                if (this.memory.bypassRooms && this.memory.bypassRooms.includes(roomName)) return false
                const room = Game.rooms[roomName]
                // 没有视野的房间只观察地形
                if (!room) return
                // 有视野的房间
                let costs = new PathFinder.CostMatrix
                /* 设置主动防御范围 */
                if (room.name == this.memory.belong)
                {
                    /* 将房间边界设置为255 */
                    for (var x=0;x<50;x++)
                    for (var y=0;y<50;y++)
                    {
                        if (isInArray([0,49],x) || isInArray([0,49],y))
                        {
                            costs.set(x,y,255)
                        }
                    }
                }
                // 将道路的cost设置为2，无法行走的建筑设置为255
                room.find(FIND_STRUCTURES).forEach(struct=>{
                    if (struct.structureType === STRUCTURE_ROAD)
                    {
                        costs.set(struct.pos.x,struct.pos.y,2)
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER && 
                        (struct.structureType !==STRUCTURE_RAMPART || !struct.my))
                        costs.set(struct.pos.x,struct.pos.y,255)
                })
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons=>{
                    if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                    costs.set(cons.pos.x,cons.pos.y,255)
                })
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    if (parts(creep,'attack'))
                    {
                        for (var i = creep.pos.x-3;i<creep.pos.x+4;i++)
                        for (var j = creep.pos.y-3;j<creep.pos.y+4;j++)
                        if (i>0 && i< 49 && j>0 && j<49)
                        {
                            var nearpos = new RoomPosition(i,j,creep.room.name)
                            costs.set(i,j,16)
                        }
                    }
                    else if (parts(creep,'ranged_attack'))
                    {
                        for (var i = creep.pos.x-3;i<creep.pos.x+4;i++)
                        for (var j = creep.pos.y-3;j<creep.pos.y+4;j++)
                        if (i>0 && i< 49 && j>0 && j<49)
                        {
                            var nearpos = new RoomPosition(i,j,creep.room.name)
                            costs.set(i,j,15)
                        }
                    }
                })
                /* 防止撞到其他虫子造成堵虫 */
                room.find(FIND_HOSTILE_CREEPS).forEach(creep=>{
                    costs.set(creep.pos.x,creep.pos.y,255)
                })
                room.find(FIND_MY_CREEPS).forEach(creep=>{
                    costs.set(creep.pos.x,creep.pos.y,255)
                })              
                return costs
                }
            })
        // 寻路异常返回null
        if (result.path.length <= 0) return null
        // 寻路结果压缩
        var route = this.serializeFarPath(result.path)
        if (!result.incomplete) global.routeCache[routeKey] = route
        return route
    }

    /* 一体机移动 */
    public goTo_aio(target:RoomPosition,range:number = 1):CreepMoveReturnCode | ERR_NO_PATH | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET{
        if (this.memory.moveData == undefined) this.memory.moveData = {}
        // 确认目标没有变化，如果变化了就重新规划路线
        this.memory.moveData.path = this.findPath_aio(target,range)
        // 还为空的话就是没有找到路径
        if (!this.memory.moveData.path)
        {
            delete this.memory.moveData.path
            return OK
        }
        // 使用缓存进行移动
        const goResult = this.goByPath()
        // 如果发生撞停或者参数异常，说明缓存可能存在问题，移除缓存
        if (goResult === ERR_INVALID_TARGET){
            delete this.memory.moveData
        }
        else if (goResult != OK && goResult != ERR_TIRED)
        {
            this.say(`异常码：${goResult}`)
        }
        var b = Game.cpu.getUsed()
        return goResult
    }
}