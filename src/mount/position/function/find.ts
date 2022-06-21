import { filter_structure, isInArray, LeastHit} from "@/utils"
/* 位置原型拓展   --方法  --寻找 */
export default class PositionFunctionFindExtension extends RoomPosition {
    /* 获取指定范围内，指定列表类型建筑 范围 模式 0 代表无筛选，1代表hit受损的 2代表hit最小 */
    public  getRangedStructure(sr:StructureConstant[],range:number,mode:number):Structure[] |undefined | Structure{
        let resultstructure:Structure[]
        switch(mode){
            case 0:{
                // 无筛选
                resultstructure = this.findInRange(FIND_STRUCTURES,range,{filter:(structure)=>{
                    return filter_structure(structure,sr)
                }})
                return resultstructure
            }
            case 1:{
                // 筛选hit
                resultstructure = this.findInRange(FIND_STRUCTURES,range,{filter:(structure)=>{
                    return filter_structure(structure,sr) && structure.hits <structure.hitsMax
                }})
                return resultstructure
            }
            case 2:{
                resultstructure = this.findInRange(FIND_STRUCTURES,range,{filter:(structure)=>{
                    return filter_structure(structure,sr) && structure.hits <structure.hitsMax
                }})
                var s_l = LeastHit(resultstructure,2)
                return s_l
            }
            default:{
                return undefined
            }
        }
    }

    /* 获取距离最近的指定列表里类型建筑 0 代表无筛选，1代表hit受损 */
    public  getClosestStructure(sr:StructureConstant[],mode:number):Structure | undefined
    {
        let resultstructure:Structure
        switch(mode){
            case 0:{
                // 无筛选
                resultstructure = this.findClosestByRange(FIND_STRUCTURES,{filter:(structure)=>{
                    return filter_structure(structure,sr)
                }})
                return resultstructure
            }
            case 1:{
                // 筛选hit
                resultstructure = this.findClosestByRange(FIND_STRUCTURES,{filter:(structure)=>{
                    return filter_structure(structure,sr) && structure.hits <structure.hitsMax
                }})
                return resultstructure
            }
            default:{
                return undefined
            }
        }
    }
    
    /* 获取最近的store能量有空的spawn或扩展 */
    public getClosestStore():StructureExtension | StructureSpawn | StructureLab | undefined{
        return this.findClosestByPath(FIND_STRUCTURES,{filter:(structure:StructureExtension |StructureSpawn)=>{
            return filter_structure(structure,[STRUCTURE_EXTENSION,STRUCTURE_SPAWN,STRUCTURE_LAB]) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }}) as StructureExtension | StructureSpawn  | undefined
    }
    
    /* 获取资源矿点周围能开link的地方 */
    public getSourceLinkVoid():RoomPosition[]
    {
        var result:RoomPosition[] = []
        var source_void = this.getSourceVoid()
        for (var x of source_void)
        {
            var link_void = x.getSourceVoid()
            if (link_void)
            for (var y of link_void)
            {
                if (!isInArray(result,y)) result.push(y)
            }
        }
        var result2:RoomPosition[] = []
        for (var i of result)
        {
            if (i.lookFor(LOOK_STRUCTURES).length == 0 && !i.isNearTo(this))
            {
                result2.push(i)
            }
        } 
        if (result2)
            return result2
        //return result 
    }

    /* 获取矿点周围的开采空位 */
    public getSourceVoid():RoomPosition[]
        {
            var result:RoomPosition[] = []
            var terrain = new Room.Terrain(this.roomName)
            var xs = [this.x-1,this.x,this.x+1]
            var ys = [this.y-1,this.y,this.y+1]
            xs.forEach(
                x=>ys.forEach(
                    y=>{
                        if (terrain.get(x,y) != TERRAIN_MASK_WALL)
                        {
                            result.push(new RoomPosition(x,y,this.roomName))
                        }
                    }
                )
            )
            return result
    }

        /* 获取该位置上指定类型建筑 */
    public GetStructure(stru:StructureConstant):Structure{
        var lis = this.lookFor(LOOK_STRUCTURES)
        if (lis.length <= 0) return null
        for (var i of lis)
        {
            if (i.structureType == stru)
                return i
        }
        return null
    }
    /* 获取该位置上指定类型建筑列表 */
    public GetStructureList(stru:StructureConstant[]):StructureStorage[]{
        var lis = this.lookFor(LOOK_STRUCTURES)
        if (lis.length <= 0) return []
        var result:Structure[] = []
        for (var i of lis)
        {
            if (isInArray(stru,i.structureType))
                result.push(i)
        }
        return result as StructureStorage[]
    }
    /* 获取该位置上有store的ruin */
    public GetRuin():Ruin{
        var lis = this.lookFor(LOOK_RUINS)
        if (lis.length <= 0) return null
        for (var i of lis)
        {
            if (i.store && Object.keys(i.store).length > 0)
            return i
        }
        return null
    }
    /* 寻找两个点之间的路线 */
    public FindPath(target:RoomPosition,range:number):RoomPosition[]{
                /* 全局路线存储 */
                if (!global.routeCache) global.routeCache = {}
                /* 路线查找 */
                const result = PathFinder.search(this,{pos:target,range:range},{
                    plainCost:2,
                    swampCost:10,
                    maxOps:8000,
                    roomCallback:roomName=>{
                        // 在全局绕过房间列表的房间 false
                        if (Memory.bypassRooms && Memory.bypassRooms.includes(roomName)) return false
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
                                (struct.structureType !==STRUCTURE_RAMPART || (!struct.my)))
                                costs.set(struct.pos.x,struct.pos.y,0xff)
                        })
                        room.find(FIND_MY_CONSTRUCTION_SITES).forEach(cons=>{
                            if (cons.structureType != 'road' && cons.structureType != 'rampart' && cons.structureType != 'container')
                            costs.set(cons.pos.x,cons.pos.y,255)
                        })
                        return costs
                        }
                    })
                // 寻路异常返回null
                if (result.path.length <= 0) return null
                // 寻路结果压缩
                return result.path
    }

    /* 获取该位置n格内的敌对爬虫 */
    public FindRangeCreep(num:number):Creep[]{
        let creep_ = this.findInRange(FIND_CREEPS,num,{filter:(creep)=>{
            return !isInArray(Memory.whitesheet,creep.owner.username)
        }})
        if (creep_.length > 0) return creep_
        return []
    }

    /* 防御塔数据叠加 */
    public AddTowerRangeData(target:StructureTower,tempData:ARH):void{
        let xR = Math.abs(this.x - target.pos.x)
        let yR = Math.abs(this.y - target.pos.y)
        let distance = Math.max(xR,yR)
        let attackNum:number;let repairNum:number;let healNum:number
        if (distance <= 5)
        {
            attackNum = 600;repairNum = 800;healNum = 400
        }
        else if (distance >= 20)
        {
            attackNum = 150;repairNum = 200;healNum = 100
        }
        else
        {
            /* 根据距离计算 */
            attackNum = 600 - (distance-5)*30
            repairNum = 800 - (distance-5)*40
            healNum = 400 - (distance-5)*20
        }
        tempData.attack += attackNum
        tempData.heal += healNum
        tempData.repair += repairNum
    }
}