import structure from "@/mount/structure"
import { filter_structure, GenerateAbility, generateID, isInArray, unzipPosition, zipPosition } from "@/utils"
import { filter } from "lodash"

/* 爬虫原型拓展   --任务  --任务行为 */
export default class CreepMissonActionExtension extends Creep {
    // 刷墙
    public handle_repair():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        let mission = Game.rooms[this.memory.belong].GainMission(id)
        if (!id) return
        let storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID) as StructureStorage
        this.workstate('energy')
        /* boost检查 */
        if (mission.LabBind)
        {
            if (!storage_) return   // 如果是boost的，没有仓库就不刷了
            // 需要boost检查，必要情况下可以不检查 
            let boo = false
            for (var ids in mission.LabBind)
            {
                var lab_ = Game.getObjectById(ids) as StructureLab
                if (!lab_ || !lab_.mineralType  ||  lab_.store.getUsedCapacity(lab_.mineralType) < 500)
                boo =true
            }
            if (!boo)
            {
                if (!this.BoostCheck(['work'])) return
            }
        }
        if (Game.rooms[this.memory.belong] && Game.rooms[this.memory.belong].memory.state == 'war')
        {
            if (this.hitsMax - this.hits > 500) this.optTower('heal',this)
        }
        if (mission.Data.RepairType == 'global')
        {
            if (this.memory.working)
            {
                if (this.memory.targetID)
                {
                    this.say("墙")
                    var target_ = Game.getObjectById(this.memory.targetID) as StructureRampart
                    if (!target_) {delete this.memory.targetID;return}
                    this.repair_(target_)
                    if (!this.pos.GetStructure('rampart'))
                    {
                        let hostileCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS,3,{filter:(creep)=>{
                            return creep.getActiveBodyparts('ranged_attack') > 0
                        }})
                        if (hostileCreep.length > 0) this.Flee(hostileCreep[0].pos,4)
                    }
                }
                else
                {
                    var leastRam = this.room.getListHitsleast([STRUCTURE_RAMPART,STRUCTURE_WALL],3)
                    if (!leastRam) return
                    this.memory.targetID = leastRam.id
                }
                delete this.memory.containerID
            }
            else
            {
                /* 寻找hits最小的墙 */
                var leastRam = this.room.getListHitsleast([STRUCTURE_RAMPART,STRUCTURE_WALL],3)
                if (!leastRam) return
                this.memory.targetID = leastRam.id
                if (!this.memory.containerID)
                {
                    var tank = this.pos.findClosestByPath(FIND_MY_STRUCTURES,{filter:(stru)=>{
                        return stru.structureType == 'storage' || 
                        (stru.structureType=='link' && isInArray(Game.rooms[this.memory.belong].memory.StructureIdData.comsume_link,stru.id) && stru.store.getUsedCapacity('energy') > this.store.getCapacity())
                    }})
                    if (tank) this.memory.containerID = tank.id
                    else {
                            let closestStore = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{return (stru.structureType == 'container' || stru.structureType == 'tower') && stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity()}})
                            if (closestStore)this.withdraw_(closestStore,'energy')
                            return
                    }
                    
                }
                let tank_ = Game.getObjectById(this.memory.containerID) as StructureStorage
                this.withdraw_(tank_,'energy')
            }
        }
        else if (mission.Data.RepairType == 'nuker')
        {
            // 没有仓库和终端就不防了
            if (!storage_){return;}
            // 核弹防御
            /* 防核函数  测试成功！*/
            if (!Game.rooms[this.memory.belong].memory.nukeData) return
            if (Object.keys(Game.rooms[this.memory.belong].memory.nukeData.damage).length <= 0)
            {
                Game.rooms[this.memory.belong].DeleteMission(id)
                return
            }
            /* 优先修spawn和terminal */
            if (!this.memory.targetID)
            {
                for (var dmgPoint in Game.rooms[this.memory.belong].memory.nukeData.damage)
                {
                    if (Game.rooms[this.memory.belong].memory.nukeData.damage[dmgPoint] <= 0) continue
                    var position_ = unzipPosition(dmgPoint)
                    if (!position_.GetStructure('rampart'))
                    {
                        position_.createConstructionSite('rampart')
                        if (!this.memory.working) this.withdraw_(storage_,'energy')
                        else this.build_(position_.lookFor(LOOK_CONSTRUCTION_SITES)[0])
                        return
                    }
                    this.memory.targetID = position_.GetStructure('rampart').id
                    return
                }
                if(!Game.rooms[this.memory.belong].DeleteMission(id)) this.memory.MissionData = {}
                return
            }
            else
            {
                if (!this.memory.working)
                {
                    this.memory.standed = false
                    this.withdraw_(storage_,'energy')
                }
                else
                {
                    this.memory.standed = false
                    if (this.memory.crossLevel > 10) this.memory.crossLevel = 10 - Math.ceil(Math.random()*10)
                    var wall_ = Game.getObjectById(this.memory.targetID) as StructureRampart
                    var strPos = zipPosition(wall_.pos)
                    if (!wall_ || wall_.hits >= Game.rooms[this.memory.belong].memory.nukeData.damage[strPos] + Game.rooms[this.memory.belong].memory.nukeData.rampart[strPos] + 500000)
                    {
                        delete this.memory.targetID
                        Game.rooms[this.memory.belong].memory.nukeData.damage[strPos] = 0
                        Game.rooms[this.memory.belong].memory.nukeData.rampart[strPos] = 0
                        return
                    }
                    this.repair_(wall_)
                    if (!this.pos.GetStructure('rampart'))
                    {
                        let hostileCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS,3,{filter:(creep)=>{
                            return creep.getActiveBodyparts('ranged_attack') > 0
                        }})
                        if (hostileCreep.length > 0) this.Flee(hostileCreep[0].pos,4)
                    }
                    
                }
                return
            }
        }
        else if (mission.Data.RepairType == 'special')
        {
            if (this.memory.working)
            {
                if (this.memory.targetID)
                {
                    this.say("墙")
                    var target_ = Game.getObjectById(this.memory.targetID) as StructureRampart
                    if (!target_) {delete this.memory.targetID;return}
                    this.repair_(target_)
                    if (!this.pos.GetStructure('rampart'))
                    {
                        let hostileCreep = this.pos.findInRange(FIND_HOSTILE_CREEPS,3,{filter:(creep)=>{
                            return creep.getActiveBodyparts('ranged_attack') > 0
                        }})
                        if (hostileCreep.length > 0) this.Flee(hostileCreep[0].pos,4)
                    }
                }
                else
                {
                    var leastRam = this.room.getListHitsleast([STRUCTURE_RAMPART,STRUCTURE_WALL],3)
                    if (!leastRam) return
                    this.memory.targetID = leastRam.id
                }
                delete this.memory.containerID
            }
            else
            {
                /* 寻找插了旗子的hits最小的墙 */
                var flags = this.room.find(FIND_FLAGS,{filter:(flag)=>{
                    return flag.name.indexOf('repair') == 0
                }})
                if (flags.length <= 0) return
                let disWall = null
                for (var f of flags)
                {
                    let fwall = f.pos.GetStructureList(['rampart','constructedWall'])[0]
                    if (!fwall) f.remove()
                    else
                    {
                        if (!disWall || fwall.hits < disWall.hits) disWall = fwall
                    }
                }
                if (!disWall)
                {
                    // 没有旗子就删除任务
                    Game.rooms[this.memory.belong].DeleteMission(id)
                    return
                }
                this.memory.targetID = disWall.id
                if (!this.memory.containerID)
                {
                    var tank = this.pos.findClosestByPath(FIND_MY_STRUCTURES,{filter:(stru)=>{
                        return stru.structureType == 'storage' || 
                        (stru.structureType=='link' && isInArray(Game.rooms[this.memory.belong].memory.StructureIdData.comsume_link,stru.id) && stru.store.getUsedCapacity('energy') > this.store.getCapacity())
                    }})
                    if (tank) this.memory.containerID = tank.id
                    else {
                            let closestStore = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{return (stru.structureType == 'container' || stru.structureType == 'tower') && stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity()}})
                            if (closestStore)this.withdraw_(closestStore,'energy')
                            return
                    }
                    
                }
                let tank_ = Game.getObjectById(this.memory.containerID) as StructureStorage
                this.withdraw_(tank_,'energy')
            }
        }
    }

    // C计划
    public handle_planC():void{
        let mission = this.memory.MissionData
        // if (Game.rooms[mission.Data.disRoom] && !Game.rooms[mission.Data.disRoom].controller.safeMode) Game.rooms[mission.Data.disRoom].controller.activateSafeMode()
        if (this.memory.role == 'cclaim')
        {
            if (this.room.name != mission.Data.disRoom || Game.shard.name != mission.Data.shard)
            {
                this.arriveTo(new RoomPosition(25,25,mission.Data.disRoom),20,mission.Data.shard)
                return
            }
            else
            {
                if (!this.pos.isNearTo(this.room.controller))
                this.goTo(this.room.controller.pos,1)
                else
                {
                    if(!this.room.controller.owner)this.claimController(this.room.controller)
                    this.signController(this.room.controller,'better to rua BB cat at home!')
                }
            }
        }
        else
        {
            this.workstate('energy')
            if (this.room.name == this.memory.belong && !this.memory.working)
            {
                let store = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{
                    return (stru.structureType == 'container' ||
                    stru.structureType == 'tower' ||
                    stru.structureType == 'storage')&& stru.store.getUsedCapacity('energy') >= this.store.getFreeCapacity()}})
                if (store)
                {
                    this.withdraw_(store,'energy')
                }
                return
            }
            if (!Game.rooms[mission.Data.disRoom])
            {
                this.goTo(new RoomPosition(25,25,mission.Data.disRoom),20)
                return
            }
            if (Game.rooms[mission.Data.disRoom].controller.level >= 2)
            {
                global.SpecialBodyData[this.memory.belong]['cupgrade'] = GenerateAbility(1,1,1,0,0,0,0,0)
            }
            if (this.memory.working)
            {
                if (this.room.name != mission.Data.disRoom)
                {
                    this.goTo(Game.rooms[mission.Data.disRoom].controller.pos,1)
                    return
                }
                let cons = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
                if (cons) this.build_(cons)
                else {this.upgrade_();this.say("cupgrade")}
            }
            else
            {
                let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                if (source) this.harvest_(source)
            }
        }
    }

    // 扩张援建
    public handle_expand():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        if (this.getActiveBodyparts('heal') && this.hits < this.hitsMax) this.heal(this)
        if (this.room.name != missionData.Data.disRoom || Game.shard.name != missionData.Data.shard)
        {
            this.arriveTo(new RoomPosition(24,24,missionData.Data.disRoom),10,missionData.Data.shard,missionData.Data.shardData?missionData.Data.shardData:null)
            return
        }
        if (!this.memory.arrived && Game.flags[`${this.memory.belong}/expand`] && Game.flags[`${this.memory.belong}/expand`].pos.roomName == this.room.name)
        {
            if (!this.pos.isEqualTo(Game.flags[`${this.memory.belong}/expand`])) this.goTo(Game.flags[`${this.memory.belong}/expand`].pos,0)
            else this.memory.arrived = true
            return
        }
        this.workstate('energy')
        if (this.memory.role == 'claim')
        {
            if (!this.pos.isNearTo(Game.rooms[missionData.Data.disRoom].controller))
            this.goTo(Game.rooms[missionData.Data.disRoom].controller.pos,1)
            else
            {
                this.claimController(Game.rooms[missionData.Data.disRoom].controller)
                this.say("claim")
            }
            if (missionData.Data.shard == this.memory.shard)
            {
                if (Game.rooms[missionData.Data.disRoom].controller.level && Game.rooms[missionData.Data.disRoom].controller.owner)
                {
                    let mission = Game.rooms[this.memory.belong].GainMission(id)
                    if (!mission) return
                    mission.CreepBind[this.memory.role].num = 0
                }
            }
        }
        else if (this.memory.role == 'Ebuild')
        {
            if (this.memory.working)
            {
                /* 优先遭建筑 */
                let cons = this.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
                if (cons)
                {
                    this.build_(cons)
                    return
                }
                let roads = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{
                    return (stru.structureType == 'road' || stru.structureType == 'container') && stru.hits < stru.hitsMax
                }})
                if (roads)
                {
                    this.repair_(roads)
                    return
                }
                let tower = this.pos.findClosestByPath(FIND_MY_STRUCTURES,{filter:(stru)=>{
                    return stru.structureType == 'tower' && stru.store.getFreeCapacity('energy') > 0
                }})
                if (tower)
                {
                    this.transfer_(tower,'energy')
                    return
                }
                let store = this.pos.getClosestStore()
                if (store)
                {
                    this.transfer_(store,'energy')
                    return
                }
                this.upgrade_()

            }
            else
            { 
                if (this.store.getUsedCapacity('energy') / (this.ticksToLive + 50) > 10) this.memory.working = true
                // 以withdraw开头的旗帜  例如： withdraw_0
                let withdrawFlag = this.pos.findClosestByPath(FIND_FLAGS,{filter:(flag)=>{
                    return flag.name.indexOf('withdraw') == 0
                }})
                if (withdrawFlag)
                {
                    let tank_ = withdrawFlag.pos.GetStructureList(['storage','terminal','container','tower'])
                    if (tank_.length > 0) {this.withdraw_(tank_[0],'energy');return}
                }
                let harvestFlag = Game.flags[`${this.memory.belong}/HB/harvest`]
                if (harvestFlag)
                {
                    if (this.hits < this.hitsMax)
                    {
                        this.heal(this)
                    }
                    if (this.room.name != harvestFlag.pos.roomName)
                    {
                        this.goTo(harvestFlag.pos,1)
                    }
                    else
                    {
                        let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                        if (source) {this.harvest_(source)}
                    }
                    return
                }
                let resources = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,{filter:(res)=>{
                    return res.amount > 200 && res.resourceType == 'energy'
                }})
                if (resources)
                {
                    if (!this.pos.isNearTo(resources)) this.goTo(resources.pos,1)
                    else this.pickup(resources)
                    return
                }
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
                if (source) this.harvest_(source)
            }
        }
        else if (this.memory.role == 'Eupgrade')
        {
            if (this.memory.working)
            {
                this.say("upgrade")
                this.upgrade_()
            }
            else
            {
                // 以withdraw开头的旗帜  例如： withdraw_0
                let withdrawFlag = this.pos.findClosestByPath(FIND_FLAGS,{filter:(flag)=>{
                    return flag.name.indexOf('withdraw') == 0
                }})
                if (withdrawFlag)
                {
                    let tank_ = withdrawFlag.pos.GetStructureList(['storage','terminal','container','tower'])
                    if (tank_.length > 0) {this.withdraw_(tank_[0],'energy');return}
                }
                let harvestFlag = Game.flags[`${this.memory.belong}/HB/harvest`]
                if (harvestFlag)
                {
                    if (this.hits < this.hitsMax)
                    {
                        this.heal(this)
                    }
                    if (this.room.name != harvestFlag.pos.roomName)
                    {
                        this.goTo(harvestFlag.pos,1)
                    }
                    else
                    {
                        let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                        if (source) {this.harvest_(source)}
                    }
                    return
                }
                let resources = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,{filter:(res)=>{
                    return res.amount > 200 && res.resourceType == 'energy'
                }})
                if (resources)
                {
                    if (!this.pos.isNearTo(resources)) this.goTo(resources.pos,1)
                    else this.pickup(resources)
                    return
                }
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
                if (source) this.harvest_(source)
            }
        }
    }

    // 急速冲级
    public handle_quickRush():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        let mission = Game.rooms[this.memory.belong].GainMission(id)
        if (!mission) return
        // boost检查
        if (mission.LabBind && !this.BoostCheck(['work'])) return
        this.workstate('energy')
        var terminal_ = Game.rooms[this.memory.belong].terminal
        if (!terminal_){this.say("找不到terminal!");return}
        if (this.memory.working)
        {
            this.upgrade_()
            if (this.store.getUsedCapacity('energy') < 35 && terminal_.pos.isNearTo(this) )
            this.withdraw_(terminal_,'energy')
        }
        else
        {
            this.withdraw_(terminal_,'energy')
        }
        this.memory.standed = mission.Data.standed
    }

    // 普通冲级
    public handle_normalRush():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        let mission = Game.rooms[this.memory.belong].GainMission(id)
        if (!mission) return
        var link_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.upgrade_link) as StructureLink
        if (!link_){this.say("找不到冲级link!");return}
        // boost检查
        if (mission.LabBind && !this.BoostCheck(['work'])) return
        this.workstate('energy')
        if (this.memory.working)
        {
            this.upgrade_()
            if (this.store.getUsedCapacity('energy') < 35 && link_.pos.isNearTo(this) )
            this.withdraw_(link_,'energy')
        }
        else
        {
            this.withdraw_(link_,'energy')
        }
    }
    
    // 紧急援建
    public handle_helpBuild():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        let data = missionData.Data
        if (!missionData) return
        if (this.room.name == this.memory.belong && Game.shard.name == this.memory.shard)
        {
            if (!this.BoostCheck(['move','work','heal','tough','carry'])) return
            if (this.store.getUsedCapacity('energy') <= 0)
            {
                let stroge_ = Game.rooms[this.memory.belong].storage
                if (stroge_)
                {
                    this.withdraw_(stroge_,'energy')
                    return
                }
            }
        }
        if ((this.room.name != data.disRoom || Game.shard.name != data.shard) && !this.memory.swith)
        {
            this.heal(this)
            this.arriveTo(new RoomPosition(24,24,data.disRoom),23,data.shard,data.shardData?data.shardData:null)
        }
        else
        {
            
            this.memory.swith = true
            let runFlag = this.pos.findClosestByRange(FIND_FLAGS,{filter:(flag)=>{
                return flag.color == COLOR_BLUE
            }})
            if (runFlag)
            {
                this.goTo(runFlag.pos,0)
                return
            }
            this.workstate('energy')
            if (this.memory.working)
            {
                if (this.room.name != data.disRoom){this.arriveTo(new RoomPosition(24,24,data.disRoom),23,data.shard);return}
                if (this.hits < this.hitsMax)
                {
                    this.heal(this)
                }
                if (this.room.name != data.disRoom){this.goTo(new RoomPosition(24,24,data.disRoom),23);return}
                if (Game.flags[`${this.memory.belong}/first_build`])
                {
                    let fcon = Game.flags[`${this.memory.belong}/first_build`].pos.lookFor(LOOK_CONSTRUCTION_SITES)
                    if (fcon.length > 0)
                    {
                        this.build_(fcon[0])
                    }
                    else
                    {
                        Game.flags[`${this.memory.belong}/first_build`].remove()
                    }
                    return
                }
                let cons = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
                if (cons) {this.build_(cons);return}
                let store = this.pos.findClosestByPath(FIND_STRUCTURES,{filter:(stru)=>{
                    return (stru.structureType == 'extension' || stru.structureType == 'spawn') && stru.store.getFreeCapacity('energy') > 0
                }})
                if (store)
                {
                    this.transfer_(store,'energy')
                    return
                }
                let tower = this.pos.findClosestByPath(FIND_STRUCTURES,{filter:(stru)=>{
                    return stru.structureType == 'tower' && stru.store.getFreeCapacity('energy') > 0
                }})
                if (tower)
                {
                    this.transfer_(tower,'energy')
                    return
                }
            }
            else
            {
                // 以withdraw开头的旗帜  例如： withdraw_0
                let withdrawFlag = this.pos.findClosestByPath(FIND_FLAGS,{filter:(flag)=>{
                    return flag.name.indexOf('withdraw') == 0
                }})
                if (withdrawFlag)
                {
                    let tank_ = withdrawFlag.pos.GetStructureList(['storage','terminal','container','tower'])
                    if (tank_.length > 0) {this.withdraw_(tank_[0],'energy');return}
                }
                let harvestFlag = Game.flags[`${this.memory.belong}/HB/harvest`]
                if (harvestFlag)
                {
                    if (this.hits < this.hitsMax)
                    {
                        this.heal(this)
                    }
                    if (this.room.name != harvestFlag.pos.roomName)
                    {
                        this.goTo(harvestFlag.pos,1)
                    }
                    else
                    {
                        let source = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE)
                        if (source) {this.harvest_(source)}
                    }
                    return
                }
                let resources = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,{filter:(res)=>{
                    return res.amount > 200 && res.resourceType == 'energy'
                }})
                if (resources)
                {
                    if (!this.pos.isNearTo(resources)) this.goTo(resources.pos,1)
                    else this.pickup(resources)
                    return
                }
                let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)
                if (source) this.harvest_(source)
            }
        }
    }

    // 房间签名
    public handle_sign():void{
        let missionData = this.memory.MissionData
        let id = missionData.id
        let data = missionData.Data
        if (!missionData) return
        if (this.room.name != data.disRoom || Game.shard.name != data.shard)
        {
            this.arriveTo(new RoomPosition(24,24,data.disRoom),23,data.shard,data.shardData?data.shardData:null)
            
        }
        else
        {
            let control = this.room.controller
            if (control)
            {
                if (!this.pos.isNearTo(control)) this.goTo(control.pos,1)
                else {this.signController(control,data.str)}
                if (control.sign == data.str)
                {
                    Game.rooms[this.memory.belong].DeleteMission(id)
                }
            }
        }
    }

    /* 原矿开采任务处理 */
    public handle_mineral():void{
        var extractor = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.extractID) as StructureExtractor
        if (!extractor) return
        var container:StructureContainer
        if (!this.memory.containerID)
        {
            var con = extractor.pos.findInRange(FIND_STRUCTURES,1,{filter:(stru)=>{
                return stru.structureType == 'container'
            }}) as StructureContainer[]
            if (con.length >0) this.memory.containerID = con[0].id
            return
        }
        else{
            container = Game.getObjectById(this.memory.containerID) as StructureContainer
            if (!container) return
            /* container杂志清理 */
            if (container.store && container.store.getUsedCapacity() > 0 && this.pos.isEqualTo(container))
            {
                for (var i in container.store)
                {
                    this.withdraw(container,i as ResourceConstant)
                }
            }
            if (!this.memory.working) this.memory.working = false
            if (this.memory.working && this.store.getFreeCapacity() == this.store.getCapacity()) this.memory.working = false
            if (!this.memory.working && this.store.getFreeCapacity() == 0) this.memory.working = true
            if (this.memory.working)
            {
                //var storage_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.storageID) as StructureStorage
                var storage_ = Game.rooms[this.memory.belong].storage as StructureStorage
                if (!storage_) return
                if (!this.pos.isNearTo(storage_)) this.goTo(storage_.pos,1)
                else
                {
                    for (var i in this.store)
                    {
                        this.transfer(storage_,i as ResourceConstant)
                        return
                    }
                }
            }
            else
            {
                if (!this.pos.isEqualTo(container.pos)) {this.goTo(container.pos,0);return}
                else
                {
                    if (this.ticksToLive < 15) this.suicide()
                    var mineral = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.mineralID) as Mineral
                    if (!mineral.mineralAmount)
                    {
                        Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                        this.suicide()
                        return
                    }
                    if (!extractor.cooldown) this.harvest(mineral)
                }
            }
        }
    }
}