/**
 * *************** 此文件代码无需理解,只需会用即可 ***************
 */
import { RoleData, RoleLevelData } from "@/constant/SpawnConstant"
import { adaption_body, CalculateEnergy, compare, GenerateAbility } from "@/utils"

/* 房间原型拓展   --内核  --房间孵化 */
export default class RoomCoreSpawnExtension extends Room {

    /* 孵化总函数 */
    public SpawnMain(): void {
        this.SpawnConfigInit()
        this.SpawnConfigModify()
        this.SpawnManager()
        this.Economy()
    }

    /* 爬虫孵化配置初始化 */
    public SpawnConfigInit(): void {
        if (!this.memory.SpawnConfig) this.memory.SpawnConfig = {}
        /* 初始化 */
        for (let role in RoleData) {
            if (RoleData[role].init && !this.memory.SpawnConfig[role]) {
                this.memory.SpawnConfig[role] = {
                    num: 0,
                    must: RoleData[role].must,
                    adaption: RoleData[role].adaption,
                }
                if (RoleData[role].level) {
                    this.memory.SpawnConfig[role].level = RoleData[role].level
                }
            }
        }
    }

    /* 爬虫孵化配置二次加工 【随房间控制等级的变化而变化】 */
    public SpawnConfigModify(): void {
        /* 身体部件信息二次加工 */
        for (let role in RoleLevelData) {
            if (RoleLevelData[role][this.controller.level])
                global.CreepBodyData[this.name][role] = RoleLevelData[role][this.controller.level].bodypart
        }
        /* 数量信息二次加工 */
        if (this.controller.level != this.memory.originLevel)
            for (let role in this.memory.SpawnConfig) {
                var role_ = this.memory.SpawnConfig[role]
                if (!role_.manual && RoleLevelData[role] && RoleLevelData[role][this.controller.level]) {
                    role_.num = RoleLevelData[role][this.controller.level].num
                }
            }
    }

    /* 常驻爬虫孵化管理器 (任务爬虫是另外一个孵化函数) */
    public SpawnManager(): void {
        LoopA:
        for (let role in this.memory.SpawnConfig) {
            var role_ = this.memory.SpawnConfig[role]
            // 战争状态下爬虫停止生产
            if (this.memory.state == 'war') { if (!role_.must) continue LoopA }
            /* 固定 补员型 */
            let roleNum = global.CreepNumData[this.name][role]
            if (roleNum === undefined) roleNum = 0
            if (roleNum == 0 && role_.misson)       // 任务类型的就删了
            {
                delete this.memory.SpawnConfig[role]
                continue
            }
            if (this.memory.SpawnConfig[role] && (!roleNum || roleNum < this.memory.SpawnConfig[role].num)) {
                /* 计算SpawnList里相关role的个数 */
                let num_ = this.SpawnListRoleNum(role)
                if (num_ + roleNum < this.memory.SpawnConfig[role].num) {
                    /* 开始添加一个孵化任务进孵化队列 */
                    if (global.CreepBodyData[this.name][role])
                        this.AddSpawnList(role, global.CreepBodyData[this.name][role], role_.level ? role_.level : 10, RoleData[role].mem)
                    else
                        this.AddSpawnList(role, RoleData[role].ability, role_.level ? role_.level : 10, RoleData[role].mem)
                }
            }

        }
    }

    /* 孵化函数 */
    public SpawnExecution(): void {
        // 没有孵化任务就return
        if (!this.memory.SpawnList || this.memory.SpawnList.length <= 0) return
        // 如果没有spawn就return
        if (!this.memory.StructureIdData.spawn || this.memory.StructureIdData.spawn.length <= 0) return
        for (let sID of this.memory.StructureIdData.spawn as string[]) {
            let thisSpawn = Game.getObjectById(sID) as StructureSpawn
            if (!thisSpawn) {
                /* 没有该spawn说明spawn已经被摧毁或者被拆除了，删除structureData里的数据 */
                var spawnMemoryList = this.memory.StructureIdData.spawn as string[]
                var index = spawnMemoryList.indexOf(sID)
                spawnMemoryList.splice(index, 1)
                continue
            }
            // 正在孵化就跳过该spawn
            if (thisSpawn.spawning) continue

            var spawnlist = this.memory.SpawnList
            if (spawnlist.length <= 0) return
            let roleName = spawnlist[0].role
            let mem = spawnlist[0].memory
            let bd = spawnlist[0].body
            let body = GenerateAbility(bd[0], bd[1], bd[2], bd[3], bd[4], bd[5], bd[6], bd[7])
            // 如果global有该爬虫的部件信息，优先用global的数据 global.SpecialBodyData  次优先级
            if (global.SpecialBodyData[this.name][roleName]) {
                body = global.SpecialBodyData[this.name][roleName]
            }
            if (mem && mem.msb && mem.taskRB)       // 任务爬虫特殊体型处于最高优先级
            {
                if (global.MSB[mem.taskRB] && global.MSB[mem.taskRB][roleName])
                    body = global.MSB[mem.taskRB][roleName]
            }
            /* 对爬虫数据进行自适应 */
            let allEnergyCapacity = this.energyCapacityAvailable
            if (allEnergyCapacity < CalculateEnergy(body)) adaption_body(body, allEnergyCapacity)
            /* 对具备自适应属性的爬虫进行自适应 */
            let allEnergy = this.energyAvailable
            let adaption = false
            if (this.memory.SpawnConfig[roleName] && this.memory.SpawnConfig[roleName].adaption && allEnergy < CalculateEnergy(body)) {
                if (!global.CreepNumData[this.name][roleName]) {
                    adaption_body(body, allEnergy)
                    adaption = true
                }

            }
            // 名称整理
            let mark = RoleData[roleName].mark ? RoleData[roleName].mark : "#"
            let timestr = Game.time.toString().substr(Game.time.toString().length - 4)
            let randomStr = Math.random().toString(36).substr(3)
            // 记忆整理
            let bodyData: BoostData = {}
            for (var b of body) {
                if (!bodyData[b]) bodyData[b] = {}
            }
            var thisMem = {
                role: roleName,
                belong: this.name,
                shard: Game.shard.name,
                boostData: bodyData,
                working: false,
                adaption: false
            }
            if (adaption) thisMem.adaption = true   // 代表该爬虫是被自适应过孵化的，如果能量充足应该重新孵化
            // 额外记忆添加
            if (mem) {
                for (var i in mem) {
                    thisMem[i] = mem[i]
                }
            }
            let name: string = null
            if (["superbitch", "ExtraDim", "Monero"].includes(thisSpawn.owner.username)) {
                let int32 = Math.pow(2, 32)
                let randomId = () => _.padLeft(Math.ceil(Math.random() * int32).toString(16).toLocaleUpperCase(), 8, "0")
                let processName = function () {
                    return `${mark}0x` + randomId()
                }
                name = processName()
            }
            else {
                name = `${timestr}_${randomStr}`
            }
            let result = thisSpawn.spawnCreep(body, name, { memory: thisMem })
            if (result == OK) {
                // console.log("即将删除：",spawnlist[0].role,",spawnID:",thisSpawn.id)
                spawnlist.splice(0, 1)   // 孵化成功，删除该孵化数据
                if (global.SpecialBodyData[this.name][roleName]) delete global.SpecialBodyData[this.name][roleName] // 删除特殊体型数据
            }
            return
        }
        /* 说明所有spawn都繁忙或当前能量不适合孵化该creep */
        return
    }

    /* 【功能函数】添加孵化任务 */
    public AddSpawnList(role: string, body: number[], level: number, mem?: SpawnMemory): void {
        let spawnMisson: SpawnList = { role: role, body: body, level: level }
        if (mem) spawnMisson.memory = mem
        this.memory.SpawnList.push(spawnMisson)
        // 根据优先级排序
        this.memory.SpawnList.sort(compare('level'))
    }

    /* 【功能函数】查看孵化队列角色数目 */
    public SpawnListRoleNum(role: string): number {
        if (!this.memory.SpawnList) return 0
        let num_ = 0
        for (var obj of this.memory.SpawnList) if (obj.role == role) num_ += 1
        return num_
    }

    /* 【功能函数】数量孵化 */
    public NumSpawn(role: string, num: number, level?: number): boolean {
        if (!this.memory.SpawnConfig[role]) this.memory.SpawnConfig[role] = { num: num, level: level }
        if (this.memory.SpawnConfig[role].misson) { console.log("任务角色！不能进行数量孵化！角色为", role); return false }
        this.memory.SpawnConfig[role].num = num
        if (level) this.memory.SpawnConfig[role].level = level
        if (!this.memory.SpawnConfig[role].level) { let level_ = RoleData[role].level ? RoleData[role].level : 10; this.memory.SpawnConfig[role].level = level_ }
        return true
    }

    /* 【功能函数】单次孵化 */
    public SingleSpawn(role: string, level?: number, mem?: SpawnMemory): boolean {
        let body_ = RoleData[role].ability
        if (global.CreepBodyData[this.name][role]) body_ = global.CreepBodyData[this.name][role]
        let level_ = level ? level : 10
        this.AddSpawnList(role, body_, level_, mem)
        return true
    }

    /* 经济模式特殊处理 */
    public Economy(): void {
        if (this.controller.level == 8 && this.memory.economy) {
            if (this.controller.ticksToDowngrade < 180000)
                this.memory.SpawnConfig['upgrade'].num = 1
            else
                this.memory.SpawnConfig['upgrade'].num = 0
        }
    }
}