import { getDistance, isInArray } from "@/utils"

/* 房间原型拓展   --内核  --房间初始化 */
export default class RoomCoreInitExtension extends Room {
    /**
     * 房间初始化主函数
     */
    public RoomInit():void{
        this.RoomMemoryInit()
        this.RoomStructureInit()
        this.RoomSpawnListInit()
    }

    /**
     * 所有RoomMemory的1级key都需要在这里注册
     */
    public RoomMemoryInit():void{
        if (!this.memory.StructureIdData) this.memory.StructureIdData = {}
        if (!this.memory.RoomLabBind) this.memory.RoomLabBind = {}
        if (!this.memory.SpawnConfig) this.memory.SpawnConfig = {}
        if (!this.memory.originLevel) this.memory.originLevel = 0
        if (!this.memory.SpawnList) this.memory.SpawnList = []
        if (!this.memory.state) this.memory.state = 'peace'
        if (!this.memory.CoolDownDic) this.memory.CoolDownDic = {}
        if (!this.memory.Misson) this.memory.Misson = {}
        if (!this.memory.Misson['Structure']) this.memory.Misson['Structure'] = []
        if (!this.memory.Misson['Room']) this.memory.Misson['Room'] = []
        if (!this.memory.Misson['Creep']) this.memory.Misson['Creep'] = []
        if (!this.memory.Misson['PowerCreep']) this.memory.Misson['PowerCreep'] = []
        if (!this.memory.TerminalData) this.memory.TerminalData = {'energy':{num:50000,fill:true}}
        if (!this.memory.market) this.memory.market = {'deal':[],'order':[]}
        if (!global.ResourceLimit[this.name]) global.ResourceLimit[this.name] = {}
        if (!this.memory.ComDispatchData) this.memory.ComDispatchData = {}
        if (!this.memory.switch) this.memory.switch = {}
        if (!this.memory.enemy) this.memory.enemy = {}
        if (!this.memory.productData) this.memory.productData = {level:0,state:'sleep',baseList:{},balanceData:{}}
    }

    /**
     * 定时刷新房间内的建筑，将建筑id储存起来  【已测试】 <能用就行，不想改了QAQ> 
     */
    public RoomStructureInit():void{
        let level = this.controller.level
        let StructureData = this.memory.StructureIdData
        /* Spawn建筑记忆更新 */
        if (!StructureData.spawn) StructureData.spawn = []
        if (level <= 6 && StructureData.spawn.length < 1)
        {
            let ASpawn = this.getStructure('spawn') as StructureSpawn[]
            for (let sp of ASpawn)
            {
                StructureData.spawn.push(sp.id) 
            }
        }
        else if ((level == 7 && StructureData.spawn.length < 2) || (level >= 8 && StructureData.spawn.length < 3))
        {
            if (Game.time % 10 == 0)
            {
                let ASpawn = this.getStructure('spawn') as StructureSpawn[]
                for (let sp of ASpawn)
                {
                    if(!isInArray(StructureData.spawn,sp.id))
                    StructureData.spawn.push(sp.id)
                }
            }
        }
        /* 中心点依赖建筑*/
        if (Memory.RoomControlData[this.name].center.length == 2)
        {
            let centerlist = Memory.RoomControlData[this.name].center
            /* 中央link建筑记忆更新 */
            if (level >= 5 && !StructureData.center_link)
            {
                let position = new RoomPosition(centerlist[0],centerlist[1],this.name)
                let center_links = position.getRangedStructure(['link'],3,0) as StructureLink[]
                if (center_links.length >= 1) StructureData.center_link = center_links[0].id

            }
            /* 近塔记忆更新 (用于维护道路和container的塔) */
            if (!this.memory.StructureIdData.NtowerID && this.controller.level >= 3)
            {
                let position = new RoomPosition(centerlist[0],centerlist[1],this.name)
                var NTower = position.getClosestStructure([STRUCTURE_TOWER],0) as StructureTower
                if (NTower && NTower.my)
                if (getDistance(NTower.pos,position) < 7) this.memory.StructureIdData.NtowerID = NTower.id
            }
        }
        /* 资源矿记忆更新 */
        if (!StructureData.mineralID)
        {
            let Mineral_ = this.find(FIND_MINERALS)
            if (Mineral_.length == 1) this.memory.StructureIdData.mineralID = Mineral_[0].id
        }
        /* 能量矿记忆更新*/
        if (!StructureData.source) StructureData.source = []
        if (StructureData.source.length <= 0)
        {
            let allSource = this.find(FIND_SOURCES)
            let sourceIDs = []
            allSource.forEach(sou=>sourceIDs.push(sou.id))
            StructureData.source = sourceIDs
        }
        /* 升级Link记忆更新 */
        if (!StructureData.source_links) StructureData.source_links = []
        if (level >= 6 && !StructureData.upgrade_link)
        {
            if (Game.time % 20 == 0)
            {
                let upgrade_link = this.controller.pos.getRangedStructure([STRUCTURE_LINK],4,0) as StructureLink[]
                if (upgrade_link.length >= 1)
                for (let ul of upgrade_link)
                {
                    if (!isInArray(StructureData.source_links,ul.id))
                    {
                        StructureData.upgrade_link = ul.id
                        break
                    }
                }
            }
        }
        if (!StructureData.comsume_link)
        {
            StructureData.comsume_link = []
        }
        /* 矿点link记忆更新 */
        if (level == 5)
        {
            if (StructureData.source_links.length <= 0)
            {
                let temp_link_list = []
                for (let sID of StructureData.source)
                {
                    let source_ = Game.getObjectById(sID) as Source
                    let nearlink = source_.pos.getRangedStructure(['link'],2,0) as StructureLink[]
                    LoopLink:
                    for (let l of nearlink)
                    {
                        if (StructureData.upgrade_link && l.id == StructureData.upgrade_link) continue LoopLink
                        temp_link_list.push(l.id)
                    }
                }
                StructureData.source_links = temp_link_list
            }
        }
        if (level == 6)
        {
            if (StructureData.source_links.length < StructureData.source.length)
            {
                let temp_link_list = []
                for (let sID of StructureData.source)
                {
                    let source_ = Game.getObjectById(sID) as Source
                    let nearlink = source_.pos.getRangedStructure(['link'],2,0) as StructureLink[]
                    LoopLink:
                    for (let l of nearlink)
                    {
                        if (StructureData.upgrade_link && l.id == StructureData.upgrade_link) continue LoopLink
                        temp_link_list.push(l.id)
                    }
                }
                StructureData.source_links = temp_link_list
            }
        }
        else if (level >= 7)
        {
            if (StructureData.source_links.length < StructureData.source.length)
            {
                let temp_link_list = []
                for (let sID of StructureData.source)
                {
                    let source_ = Game.getObjectById(sID) as Source
                    let nearlink = source_.pos.getRangedStructure(['link'],2,0) as StructureLink[]
                    LoopLink:
                    for (let l of nearlink)
                    {
                        if (StructureData.upgrade_link && l.id == StructureData.upgrade_link) continue LoopLink
                        temp_link_list.push(l.id)
                    }
                }
                StructureData.source_links = temp_link_list
            }
        }
        /* 仓库记忆更新 */
        if (level >= 4 && !this.memory.StructureIdData.storageID)
        {
            var new_storage = this.storage
            if (new_storage) this.memory.StructureIdData.storageID = new_storage.id
        }
        /* 防御塔记忆更新 */
        if (Game.time % 150 == 0 && this.controller.level >= 3)
        {
            if (!this.memory.StructureIdData.AtowerID) this.memory.StructureIdData.AtowerID = []
            this.memory.StructureIdData.AtowerID as string[]
            var ATowers = this.getStructure(STRUCTURE_TOWER) as StructureTower[]
            if (ATowers.length > this.memory.StructureIdData.AtowerID.length)
            {
                for (var t of ATowers) 
                if (t.my && !isInArray(this.memory.StructureIdData.AtowerID as string[],t.id))
                {
                    var AtowerID = this.memory.StructureIdData.AtowerID as string[]
                    AtowerID.push(t.id)
                }
            }
        }
        /* 终端识别 */
        if (!this.memory.StructureIdData.terminalID && level >= 6)
        {
            var Terminal = this.terminal
            if (Terminal) this.memory.StructureIdData.terminalID = Terminal.id
        }
        /* 提取器识别 */
        if (!this.memory.StructureIdData.extractID && this.controller.level >= 5)
        {
            var extract = this.getStructure(STRUCTURE_EXTRACTOR)
            if (extract.length == 1) this.memory.StructureIdData.extractID = extract[0].id
        }
        /* 实验室识别 */
        if (Game.time % 200 == 0)
        {
            var ALabs = this.getStructure(STRUCTURE_LAB) as StructureLab[]
            if (ALabs.length >= 1)
            {
                if (!this.memory.StructureIdData.labs) this.memory.StructureIdData.labs = []
                for (var llab of ALabs)
                {
                    if (llab.my && !isInArray(this.memory.StructureIdData.labs as string[],llab.id))
                    {
                        var labs = this.memory.StructureIdData.labs as string[]
                        labs.push(llab.id)
                    }
                }
            }
            /* 删除无用lab */
            if (this.memory.StructureIdData.labs)
            {
                for (let labID of this.memory.StructureIdData.labs)
                {
                    let theLab = Game.getObjectById(labID) as StructureLab
                    if (!theLab)
                    {
                        let index = this.memory.StructureIdData.labs.indexOf(labID)
                        this.memory.StructureIdData.labs.splice(index,1)
                    }
                }
            }
            /* 实验室合成数据 需要手动挂载，如果没有实验室合成数据，无法执行合成任务 */
            /* 里面包含自动合成相关的原料lab和产出lab数据 */
            if (!this.memory.StructureIdData.labInspect)
            {
                this.memory.StructureIdData.labInspect = {}
            }
            
        }
        /* 观察器识别 */
        if (!this.memory.StructureIdData.ObserverID && this.controller.level >= 8 )
        {
            var observer_ = this.getStructure(STRUCTURE_OBSERVER)
            if (observer_.length > 0)
            {
                this.memory.StructureIdData.ObserverID = observer_[0].id
            }
        }
        /* PowerSpawn识别 */
        if (!this.memory.StructureIdData.PowerSpawnID && this.controller.level >= 8)
        {
            var powerSpawn = this.getStructure(STRUCTURE_POWER_SPAWN)
            if (powerSpawn.length > 0)
            this.memory.StructureIdData.PowerSpawnID = powerSpawn[0].id
        }
        /* 核弹识别 */
        if (!this.memory.StructureIdData.NukerID && this.controller.level >= 8 )
        {
            var nuke_ = this.getStructure(STRUCTURE_NUKER)
            if (nuke_.length > 0)
            {
                this.memory.StructureIdData.NukerID = nuke_[0].id
            }
        }
        /* 工厂识别 */
        if (!this.memory.StructureIdData.FactoryId && this.controller.level >= 8)
        {
            var factory_ = this.getStructure(STRUCTURE_FACTORY)
            if (factory_.length > 0)
            {
                this.memory.StructureIdData.FactoryId = factory_[0].id
            }
        }
        // harvestData 数据更新
        if (!this.memory.harvestData)
        {
            this.memory.harvestData = {}
            for (let source_ of this.memory.StructureIdData.source)
            {
                this.memory.harvestData[source_] = {}
            }
        }
        if (Game.time % 17 == 0)
        for (let id in this.memory.harvestData)
        {
            if(level < 5)
            {
                if (!this.memory.harvestData[id].containerID)
                {
                    let source = Game.getObjectById(id) as Source
                    let containers = source.pos.findInRange(FIND_STRUCTURES,1,{filter:(stru)=>{return stru.structureType == 'container'}})
                    if (containers.length > 0) this.memory.harvestData[id].containerID = containers[0].id
                }
            }
            else
            {
                let source = Game.getObjectById(id) as Source
                if (!this.memory.harvestData[id].linkID)
                {
                    if (!this.memory.harvestData[id].containerID)
                    {
                        let containers = source.pos.findInRange(FIND_STRUCTURES,1,{filter:(stru)=>{return stru.structureType == 'container'}})
                        if (containers.length > 0) this.memory.harvestData[id].containerID = containers[0].id
                    }
                    let links = source.pos.findInRange(FIND_STRUCTURES,2,{filter:(stru)=>{return stru.structureType == 'link'}})
                    if (links.length > 0) this.memory.harvestData[id].linkID = links[0].id
                }
                else
                {
                    if (this.memory.harvestData[id].containerID)
                    {
                        let container = Game.getObjectById(this.memory.harvestData[id].containerID) as StructureContainer
                        if (container)
                        {
                            this.unbindMemory('container',container.pos.x,container.pos.y)
                            container.destroy()
                        }
                        delete this.memory.harvestData[id].containerID
                    }
                }
            }
        }
    }

    /**
     * 房间孵化队列初始化
     */
    public RoomSpawnListInit():void{
        if (!global.CreepBodyData) global.CreepBodyData = {}
        if (!global.CreepBodyData[this.name]) global.CreepBodyData[this.name] = {}
        if (!global.CreepNumData) global.CreepNumData = {}
        if (!global.CreepNumData[this.name]) global.CreepNumData[this.name] = {}

    }
}