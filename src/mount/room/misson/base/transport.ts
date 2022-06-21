/* 房间原型拓展   --任务  --运输工任务 */
export default class RoomMissonTransportExtension extends Room {
    // 虫卵填充任务
    public Spawn_Feed():void{
    /* 每11 tick 观察一次 */
        if (Game.time % 10) return
        if (!this.storage  && !this.terminal) return
        if (this.RoleMissionNum('transport','虫卵填充') < 1)
        {
            let thisPos = new RoomPosition(Memory.RoomControlData[this.name].center[0],Memory.RoomControlData[this.name].center[1],this.name)
            let emptyExtensions = thisPos.findClosestByPath(FIND_MY_STRUCTURES,{filter:(structure)=>{
                return (structure.structureType == 'spawn' || structure.structureType == 'extension') && structure.store.getFreeCapacity('energy') > 0
            }})
            if (emptyExtensions)
            {
            /* 满足条件则触发虫卵填充任务 */
                var thisMisson:MissionModel = {
                name: "虫卵填充",
                range:"Creep",
                delayTick:50,
                cooldownTick:4,
                CreepBind:{'transport':{num:2,bind:[]}},
                Data:{}
                }
                this.AddMission(thisMisson)
            }
        }
    }

    // 防御塔填充任务
    public Tower_Feed():void{
        if (Game.shard.name == 'shard3')
        {
            if (Game.time % 15) return
        }
        else
        {
            if (Game.time % 5) return
        }
        if (!this.storage && !this.terminal) return
        if (!this.memory.StructureIdData.AtowerID) this.memory.StructureIdData.AtowerID = []
        for (let id of this.memory.StructureIdData.AtowerID)
        {
            let tower = Game.getObjectById(id) as StructureTower
            if (!tower)
            {
                let index = this.memory.StructureIdData.AtowerID.indexOf(id)
                this.memory.StructureIdData.AtowerID.splice(index,1)
            }
            if (tower.store.getUsedCapacity('energy') < 500)
            {
                /* 下达搬运任务搬运 */
                let storage_ = this.storage
                let terminal_ = this.terminal
                if (storage_ && storage_.store.getUsedCapacity('energy') > 1000)
                {
                    if (this.RoleMissionNum('transport','物流运输') > 3 ||!this.Check_Carry('transport',storage_.pos,tower.pos,'energy')) continue
                    let thisTask = this.public_Carry({'transport':{num:2,bind:[]}},35,this.name,storage_.pos.x,storage_.pos.y,this.name,tower.pos.x,tower.pos.y,'energy',1000 - tower.store.getUsedCapacity('energy'))
                    this.AddMission(thisTask)
                    return
                }
                else if (terminal_ && terminal_.store.getUsedCapacity('energy') > 1000)
                {
                    if (this.RoleMissionNum('transport','物流运输') > 3 ||!this.Check_Carry('transport',terminal_.pos,tower.pos,'energy')) continue
                    let thisTask = this.public_Carry({'transport':{num:2,bind:[]}},35,this.name,terminal_.pos.x,terminal_.pos.y,this.name,tower.pos.x,tower.pos.y,'energy',1000 - tower.store.getUsedCapacity('energy'))
                    this.AddMission(thisTask)
                    return
                }
            }
        }
    }

    // 实验室能量填充任务 [包含多余物回收]
    public Lab_Feed():void{
        if ((global.Gtime[this.name]- Game.time) % 13) return
        if (!this.storage && !this.terminal) return
        if (!this.memory.StructureIdData.labs || this.memory.StructureIdData.labs.length <= 0)return
        let missionNum = this.RoleMissionNum('transport','物流运输')
        if (missionNum > 3) return
        for (var id of this.memory.StructureIdData.labs)
        {
            var thisLab = Game.getObjectById(id) as StructureLab
            if (!thisLab)
            {
                var index = this.memory.StructureIdData.labs.indexOf(id)
                this.memory.StructureIdData.labs.splice(index,1)
                continue
            }
            if (thisLab.store.getUsedCapacity('energy') <= 800)
            {
                /* 下布搬运命令 */
                let storage_ = this.storage
                let terminal_ = this.terminal
                if (storage_ && storage_.store.getUsedCapacity('energy') >= 2000)
                {
                    if (!this.Check_Carry('transport',storage_.pos,thisLab.pos,'energy'))
                    {continue}
                    var thisTask = this.public_Carry({'transport':{num:1,bind:[]}},25,this.name,storage_.pos.x,storage_.pos.y,this.name,thisLab.pos.x,thisLab.pos.y,'energy',2000 - thisLab.store.getUsedCapacity('energy'))
                    this.AddMission(thisTask)
                    return
                }
                if (terminal_ && terminal_.store.getUsedCapacity('energy') >= 2000)
                {
                    if (!this.Check_Carry('transport',terminal_.pos,thisLab.pos,'energy'))
                    {continue}
                    var thisTask = this.public_Carry({'transport':{num:1,bind:[]}},25,this.name,terminal_.pos.x,terminal_.pos.y,this.name,thisLab.pos.x,thisLab.pos.y,'energy',2000 - thisLab.store.getUsedCapacity('energy'))
                    this.AddMission(thisTask)
                    return
                }
            }
            /* 如果该实验室不在绑定状态却有多余资源 */
            if (!this.memory.RoomLabBind[id] && thisLab.mineralType)
            {
                var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID) as StructureStorage
                if (!storage_) return
                var thisTask = this.public_Carry({'transport':{num:1,bind:[]}},25,this.name,thisLab.pos.x,thisLab.pos.y,this.name,storage_.pos.x,storage_.pos.y,thisLab.mineralType,thisLab.store.getUsedCapacity(thisLab.mineralType))
                this.AddMission(thisTask)
                return
            }
        }
    }

    // 核弹填充任务
    public Nuker_Feed():void{
        if (Game.time % 103) return
        if (this.memory.switch.StopFillNuker) return
        if (!this.memory.StructureIdData.NukerID || !this.memory.StructureIdData.storageID) return
        if (this.RoleMissionNum('transport','物流运输') >= 1) return
        var nuker = Game.getObjectById(this.memory.StructureIdData.NukerID) as StructureNuker
        var storage_ = Game.getObjectById(this.memory.StructureIdData.storageID) as StructureStorage
        if (!nuker) {delete this.memory.StructureIdData.NukerID;return}
        if (!storage_){delete this.memory.StructureIdData.storageID;return}
        if (nuker.store.getUsedCapacity('G') < 5000 && storage_.store.getUsedCapacity('G') >= 5000)
        {
            var thisTask = this.public_Carry({'transport':{num:1,bind:[]}},40,this.name,storage_.pos.x,storage_.pos.y,this.name,nuker.pos.x,nuker.pos.y,'G',5000 - nuker.store.getUsedCapacity('G'))
            this.AddMission(thisTask)
            return
        }
        if (nuker.store.getUsedCapacity('energy') < 300000 && storage_.store.getUsedCapacity('energy') > 130000)
        {
            var thisTask = this.public_Carry({'transport':{num:1,bind:[]}},40,this.name,storage_.pos.x,storage_.pos.y,this.name,nuker.pos.x,nuker.pos.y,'energy',300000 - nuker.store.getUsedCapacity('energy'))
            this.AddMission(thisTask)
            return
        }
    }
}
