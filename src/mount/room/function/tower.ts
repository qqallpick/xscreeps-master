import { isInArray } from "@/utils";

/* 房间原型拓展   --方法  --防御塔 */
export default class RoomFunctionTowerExtension extends Room {
    public TowerWork(): void {
        if (this.memory.state == 'peace') {
            if (Game.flags[`${this.name}/repair`]) {
                var towers = this.find(FIND_MY_STRUCTURES, {
                    filter: (stru) => {
                        return stru.structureType == 'tower' && stru.id != this.memory.StructureIdData.NtowerID
                    }
                }) as StructureTower[]
                var ramparts = this.getListHitsleast(['rampart', 'constructedWall'], 3)
                for (var t of towers) if (t.store.getUsedCapacity('energy') > 400) t.repair(ramparts)
            }
            this.TowerRepairList()
            if (!global.Repairlist[this.name]) global.Repairlist[this.name] = []
            if (global.Repairlist[this.name].length > 0) {
                let Ntower: StructureTower = null
                if (this.memory.StructureIdData.NtowerID) { Ntower = Game.getObjectById(this.memory.StructureIdData.NtowerID) as StructureTower }
                if (!Ntower) { delete this.memory.StructureIdData.NtowerID; return; }
                let Repairdata = Game.getObjectById(global.Repairlist[this.name][0]) as StructureTower
                if (!Repairdata) {
                    global.Repairlist[this.name].shift()
                    return
                }
                if (Repairdata.hits >= Repairdata.hitsMax) {
                    global.Repairlist[this.name].shift()
                    return
                }
                Ntower.repair(Repairdata)
                // if ((Game.time - global.Gtime[this.name]) % 5 == 0) {
                //     /* 寻找路，修路 */
                //     var repairRoad = Ntower.room.find(FIND_STRUCTURES, {
                //         filter: (stru) => {
                //             return (stru.structureType == 'road' || stru.structureType == 'container') && stru.hits / stru.hitsMax < 0.8
                //         }
                //     })
                //     if (repairRoad.length > 0) {
                //         if (repairRoad) Ntower.repair(repairRoad[0])
                //     }
                // }
            }
        }
        else if (this, this.memory.state == 'war') {
            if (Game.flags[`${this.name}/stop`]) return
            if (this.memory.switch.AutoDefend) {
                return
            }
            /* 没有主动防御下的防御塔逻辑 */
            let enemys = this.find(FIND_HOSTILE_CREEPS, {
                filter: (creep) => {
                    return !isInArray(Memory.whitesheet, creep.owner.username)
                }
            })
            if (!this.memory.StructureIdData.AtowerID) this.memory.StructureIdData.AtowerID = []
            if (enemys.length <= 0) return
            else if (enemys.length == 1) {
                for (let c of this.memory.StructureIdData.AtowerID) {
                    let thisTower = Game.getObjectById(c) as StructureTower
                    if (!thisTower) {
                        let index = this.memory.StructureIdData.AtowerID.indexOf(c); this.memory.StructureIdData.AtowerID.splice(index, 1); continue
                    }
                    thisTower.attack(enemys[0])
                }
            }
            else if (enemys.length > 1) {
                for (let c of this.memory.StructureIdData.AtowerID) {
                    let thisTower = Game.getObjectById(c) as StructureTower
                    if (!thisTower) {
                        let index = this.memory.StructureIdData.AtowerID.indexOf(c); this.memory.StructureIdData.AtowerID.splice(index, 1); continue
                    }
                    if (Game.time % 2)
                        thisTower.attack(enemys[0])
                    else
                        thisTower.attack(enemys[1])
                }
            }
        }
    }

    public TowerRepairList(): void {
        if ((Game.time - global.Gtime[this.name]) % 20 != 0) { return }
        global.Repairlist[this.name] = []
        var repairRoad = this.find(FIND_STRUCTURES, {
            filter: (stru) => {
                return (stru.structureType == 'road' || stru.structureType == 'container') && stru.hits / stru.hitsMax < 0.8
            }
        })
        if (repairRoad.length > 0) {
            for (let i in repairRoad) {
                let repairRoad_ = repairRoad[i] as Structure
                global.Repairlist[this.name].push(repairRoad_.id)
            }
        }
    }
}