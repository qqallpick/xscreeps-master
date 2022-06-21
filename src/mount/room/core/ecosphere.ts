import { devPlanConstant } from "@/constant/PlanConstant"
import { Colorful, isInArray } from "@/utils"

/* 房间原型拓展   --内核  --房间生态 */
export default class RoomCoreEcosphereExtension extends Room {
    /* 房间生态主函数 */
    public RoomEcosphere():void {
        this.RoomState()        // 房间状态监测
        this.RoomPlan()         // 房间布局及自动修复
    }
    
    /* 自动布局 */
    public RoomPlan():void {
        // 没有中心点不进行自动布局
        let centerList = Memory.RoomControlData[this.name].center
        if (!centerList || centerList.length < 2) return
        let level = this.controller.level
        if (level > this.memory.originLevel)
        {
            let LayOutPlan = Memory.RoomControlData[this.name].arrange
            switch (LayOutPlan)
            {
                case 'man':{break;}
                case 'dev':{this.RoomRuleLayout(level,devPlanConstant);break;}
            }
            /* link */
            if (level == 5)                 // 5级1个source的Link
            {
                let sourceIDs = this.memory.StructureIdData.source
                if (sourceIDs.length <= 0) return
                let source = Game.getObjectById(sourceIDs[0]) as Source
                let points = source.pos.getSourceLinkVoid()
                if (points.length <= 0) return
                LoopA:
                for (var i of points)
                {
                    if(i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0)
                    {
                        i.createConstructionSite(STRUCTURE_LINK)
                        break LoopA
                    }
                }
            }
            else if (level == 6)        // 6级出控制器Link 便于冲级
            {
                let controller = this.controller
                let points = controller.pos.getSourceLinkVoid()
                if (points.length <= 0) return
                LoopA:
                for (let i of points)
                {
                    if(i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0)
                    {
                        i.createConstructionSite(STRUCTURE_LINK)
                        break LoopA
                    }
                }
            }
            else if (level == 7)        // 7级出source的Link
            {
                let sourceIDs = this.memory.StructureIdData.source
                if (sourceIDs.length <= 1) return
                let source = Game.getObjectById(sourceIDs[1]) as Source
                let points = source.pos.getSourceLinkVoid()
                if (points.length <= 0) return
                LoopA:
                for (var i of points)
                {
                    if(i.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && i.lookFor(LOOK_STRUCTURES).length <= 0)
                    {
                        i.createConstructionSite(STRUCTURE_LINK)
                        break LoopA
                    }
                }
            }
        }
        /* 自动重建 */
        if (Game.shard.name == 'shard3'){if (Game.time % 25) return}
        else{if (Game.time % 5) return}
        if (this.memory.state == 'peace')
        {
            /* cpu过少就不进行自动重建 */
            if (Game.cpu.bucket < 4000) return
            /* 仅仅在和平情况下才会打开自动重建 */
            // 寻找所有属于我的建筑的数量 -1是去除controller 包含所有非控制器的我方建筑、我方建筑工地、该房间内的道路，container
            let currentNum = this.find(FIND_MY_STRUCTURES).length + this.find(FIND_MY_CONSTRUCTION_SITES).length + this.find(FIND_STRUCTURES,{filter:(structure)=>{return structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD}}).length - 1
            if(!this.memory.structureNum) this.memory.structureNum = 0
            this.memory.structureNum = this.getDistributionNum()
            if (currentNum > this.memory.structureNum)
            {
                this.addStructureMemory()
                console.log(`房间${this.name} 更新distribution记忆! 检测到建筑:${currentNum}, memory中建筑数量:${this.memory.structureNum}`)
            }
            else if (currentNum === this.memory.structureNum)
            {
                return
            }
            else
            {
                console.log(this.name,`房间${this.name} 检测出缺损  检测到建筑:${currentNum}, memory中建筑数量:${this.memory.structureNum}`)
                /* 运行修补函数 */
                this.repatchDistribution()
            }
        }
        else if (this.memory.state == 'war')
        {
            /* 战争状态 */
            // 仅检测城墙、spawn、仓库、终端、实验室的数量，检测到缺损就自动开启安全模式
            let currentNum = this.find(FIND_MY_STRUCTURES,{filter:(structure)=>{
                return isInArray(['rampart','spawn','storage','terminal','lab','extension'],structure.structureType)
            }}).length
            currentNum += this.find(FIND_MY_CONSTRUCTION_SITES,{filter:(cons)=>{
                return isInArray(['rampart','spawn','storage','terminal','lab','extension'],cons.structureType)
            }}).length
            let memoryNum = 0
            console.log('currentNum:',currentNum)
            for (var index in this.memory.distribution)
            {
                if (isInArray(['rampart','spawn','storage','terminal','lab','extension'],index))
                {
                    memoryNum += this.memory.distribution[index].length
                }
            }
            console.log("memoryNum:",memoryNum)
            if (currentNum < memoryNum)
            {
                /* 说明出问题了 */
                if (Game.cpu.generatePixel)     // 私服
                this.controller.activateSafeMode()
            }
        }

    }

    /* 房间状态 */
    public RoomState():void {
        // 每10tick观察一次房间状态，如果发现敌人，房间状态变为war，否则为peace
        if (Game.time % 10 == 0)
        {
            // 安全模式下和平模式
            if (this.controller.safeMode)
            {
                this.memory.state = 'peace'
                return
            }
            var enemy = this.find(FIND_HOSTILE_CREEPS,{filter:(creep)=>{
                return !isInArray(Memory.whitesheet,creep.owner.username)
            }})
            var enemyPowerCreep = this.find(FIND_HOSTILE_POWER_CREEPS,{filter:(creep)=>{
                return !isInArray(Memory.whitesheet,creep.owner.username)
            }})
            if (enemy[0] || enemyPowerCreep[0]) this.memory.state = 'war'
            else this.memory.state = 'peace'
        }
    }
    
    /* 房间自动布局 */
    public RoomRuleLayout(level:number,map:BluePrint):void{
        let center_point:RoomPosition  = null
        let centerList = Memory.RoomControlData[this.name].center
        center_point = new RoomPosition(centerList[0],centerList[1],this.name)
        for (let obj of map)
        {
            if (level >= obj.level)
            {
                let new_point = new RoomPosition(center_point.x+obj.x,center_point.y+obj.y,this.name)
                // 忽略越界位置
                if (new_point.x >= 49 || new_point.x <= 0 || new_point.y >= 49 || new_point.y <= 0) continue
                // 墙壁不建造东西
                if (new_point.lookFor(LOOK_TERRAIN)[0] == 'wall') continue
                let posOcp:boolean = false
                let new_point_structures = new_point.lookFor(LOOK_STRUCTURES)
                if (new_point_structures.length > 0)
                for (let j of new_point_structures)
                {if(j.structureType != 'rampart') posOcp = true}
                if (new_point && new_point.lookFor(LOOK_CONSTRUCTION_SITES).length <= 0 && !posOcp)
                {
                    let result = new_point.createConstructionSite(obj.structureType)
                    if (result != 0)
                    {
                        let str = Colorful(`房间${this.name}创建工地${obj.structureType}失败! 位置: x=${obj.x}|y=${obj.y}`,'orange',false)
                        console.log(str)
                    }
                    else
                    {
                        let str = Colorful(`房间${this.name}创建工地${obj.structureType}成功! 位置: x=${obj.x}|y=${obj.y}`,'green',false)
                        console.log(str)
                    }
                }
            }
            else return // 不遍历无关建筑
        }
    }

    /* 获取房间memory中distribution总数量 */
    public getDistributionNum():number{
        if (!this.memory.distribution) return 0
        let result = 0
        for (var i of Object.keys(this.memory.distribution))
        {
            result += this.memory.distribution[i].length
        }
        return result
    }
    
    /* 遍历该房间内所有的可以建造、维修的construction site 或者 structure，将其添加进该房间的memory中 */
    public addStructureMemory():void{
        if (!this.memory.distribution) this.memory.distribution = { }
        // 获取所有的结构和工地
        var construction = []
        var all_my_structure = this.find(FIND_MY_STRUCTURES,{filter:(structure)=>{
            return structure.structureType != STRUCTURE_CONTROLLER
        }})
        var all_spawn = this.find(FIND_MY_SPAWNS)
        for (var i of all_my_structure) construction.push(i)
        for (var n of all_spawn) construction.push(n)
        var all_road = this.find(FIND_STRUCTURES,{filter:(structure)=>{
            return structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER
        }})
        for (var j of all_road) construction.push(j)
        var all_construct = this.find(FIND_CONSTRUCTION_SITES,{filter:(structure)=>{
            return structure.structureType != STRUCTURE_WALL
        }})
        for (var m of all_construct) construction.push(m)
        for (var index of construction)
        {
            if (!this.memory.distribution[index.structureType]) this.memory.distribution[index.structureType] = []
            if (!isInArray(this.memory.distribution[index.structureType],`${index.pos.x}/${index.pos.y}`))
            this.memory.distribution[index.structureType].push(`${index.pos.x}/${index.pos.y}`)
        }
    }

    /* 修补函数，根据记忆将缺损的建筑进行自动工地规划 */
    public repatchDistribution():void{
        if (!this.memory.distribution) return
        for (var key_ of Object.keys(this.memory.distribution))
        {
            // key_ : road/spawn/storage....
            for (var po of this.memory.distribution[key_])
            {
                var thisPos = this.unzip(po)
                if (thisPos)
                {
                    if (key_ != 'spawn')
                    {
                        if (thisPos.createConstructionSite(key_ as BuildableStructureConstant) == 0 )
                        {
                            console.log(`自动修复成功，其建筑为${key_}，位置为${thisPos.x},${thisPos.y}`)
                        }
                    }
                    else
                    {
                        thisPos.createConstructionSite(STRUCTURE_SPAWN)
                    }
                }
            }
        }
        
    }

    // 解压房间内字符串获取pos对象
    public unzip(str:string):RoomPosition | undefined{
        var info = str.split('/')
        return info.length == 2? new RoomPosition(Number(info[0]),Number(info[1]),this.name):undefined
    }

    /* 解绑函数，删除memory中指定的数据 */
    public unbindMemory(mold:BuildableStructureConstant,x:number,y:number):void{
        var thisPosition:RoomPosition = new RoomPosition(x,y,this.name)
        if (thisPosition.lookFor(LOOK_STRUCTURES).length ==0 && thisPosition.lookFor(LOOK_CONSTRUCTION_SITES).length == 0)
        {
            console.log(`房间${this.name}的位置x:${thisPosition.x},y:${thisPosition.y}无任何建筑或工地！`)
            return
        }
        var result = []
        for (var i of thisPosition.lookFor(LOOK_STRUCTURES)) result.push(i)
        for (var j of thisPosition.lookFor(LOOK_CONSTRUCTION_SITES)) result.push(j)
        for (var sample of result)
        {
            if (sample.structureType === mold)
            {
                // 在记忆列表中删除指定的数据，并删除该位置的建筑或工地
                if (!this.memory.distribution[mold]) return
                if (this.memory.distribution[mold].length <= 0) return
                for (var poStr of this.memory.distribution[mold])
                {
                    if (poStr == `${x}/${y}`)
                    {
                        var index = this.memory.distribution[mold].indexOf(poStr)
                        if(index > -1) {
                            this.memory.distribution[mold].splice(index,1);
                        }
                    }
                }
                if(sample.destroy) sample.destroy()
                else if (sample.remove) sample.remove()
                return
                
            }
        }
        console.log(`房间${this.name}的位置x:${thisPosition.x},y:${thisPosition.y}不存在${mold}类型建筑或结构！`)
    }    
}