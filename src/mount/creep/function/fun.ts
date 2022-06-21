/* 爬虫原型拓展   --功能  --功能 */

import { BoostedPartData } from "@/constant/BoostConstant";
import { isInArray } from "@/utils";


export default class CreepFunctionExtension extends Creep {
    /**
     * 
     * working状态
     */
    public workstate(rType:ResourceConstant = RESOURCE_ENERGY):void
    {
        if (!this.memory.working) this.memory.working = false;
        if(this.memory.working && this.store[rType] == 0 ) {
            this.memory.working = false;
        }
        if(!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
        }
    }

    public harvest_(source_:Source):void{
        if (this.harvest(source_) == ERR_NOT_IN_RANGE)
        {
            this.goTo(source_.pos,1)
            this.memory.standed = false
        }
        else this.memory.standed = true

    }

    public transfer_(distination:Structure,rType:ResourceConstant = RESOURCE_ENERGY) : void{
        if (this.transfer(distination,rType) == ERR_NOT_IN_RANGE)
        {
            this.goTo(distination.pos,1)
        }
    }

    public upgrade_():void{
        if (this.room.controller)
        {
            if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) 
            {
                this.goTo(this.room.controller.pos,1)
                this.memory.standed = false
            }
            else this.memory.standed = true
        }
    }

    // 考虑到建筑和修复有可能造成堵虫，所以解除钉扎状态
    public build_(distination:ConstructionSite) : void {
        if  (this.build(distination) == ERR_NOT_IN_RANGE)
        {
            this.goTo(distination.pos,1)
            this.memory.standed = false
        }
        else
        this.memory.standed = true
    }

    public repair_(distination:Structure) : void {
        if (this.repair(distination) == ERR_NOT_IN_RANGE)
        {
            this.goTo_aio(distination.pos,1)
            this.memory.standed = false
        }
        else
            this.memory.standed = true
    }
    
    public withdraw_(distination:Structure,rType:ResourceConstant = RESOURCE_ENERGY) : void{
        if (this.withdraw(distination,rType) == ERR_NOT_IN_RANGE)
        {
            this.goTo(distination.pos,1)
        }
        this.memory.standed = false
    }

    // 确认是否boost了,并进行相应Boost
    public BoostCheck(boostBody:string[]):boolean{
            for (var body in this.memory.boostData)
            {
                if (!isInArray(boostBody,body)) continue
                if (!this.memory.boostData[body].boosted)
                {
                    var tempID:string
                    var thisRoomMisson = Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id)
                    if (!thisRoomMisson) return false
                    LoopB:
                    for (var j in thisRoomMisson.LabBind)
                    {
                        if (BoostedPartData[thisRoomMisson.LabBind[j]] && body == BoostedPartData[thisRoomMisson.LabBind[j]])
                        {
                            tempID = j
                            break LoopB
                        }
                    }
                    if (!tempID) continue
                    var disLab = Game.getObjectById(tempID)  as StructureLab
                    if (!disLab) continue
                    // 计算body部件
                    let s = 0
                    for (var b of this.body)
                    {
                    if (b.type == body) s++
                    }
                    if (!disLab.mineralType)return false
                    if (thisRoomMisson.LabBind[tempID] != disLab.mineralType) return false
                    if (!this.pos.isNearTo(disLab)) this.goTo(disLab.pos,1)
                    else
                    {
                        for (var i of this.body)
                        {
                            if (i.type == body && i.boost != thisRoomMisson.LabBind[tempID])
                            {disLab.boostCreep(this);return false}
                        }
                        this.memory.boostData[body] = {boosted:true,num:s,type:thisRoomMisson.LabBind[tempID] as ResourceConstant}
                    }
                    return false
                }
            }
            return true
    }

    // 召唤所有房间内的防御塔治疗/攻击 自己/爬虫 [不一定成功]
    public optTower(otype:'heal'|'attack',creep:Creep):void{
        if (this.room.name != this.memory.belong || Game.shard.name != this.memory.shard) return
        for (var i of Game.rooms[this.memory.belong].memory.StructureIdData.AtowerID)
        {
            let tower_ = Game.getObjectById(i) as StructureTower
            if (!tower_) continue
            if (otype == 'heal')
            {
                tower_.heal(creep)
            }
            else
            {
                tower_.attack(creep)
            }
        }
    }

    public isInDefend(creep:Creep):boolean{
        for (var i in Game.rooms[this.memory.belong].memory.enemy)
        {
            for (var id of Game.rooms[this.memory.belong].memory.enemy[i])
            if (creep.id == id) return true
        }
        return false
    }

    // 寻找数组里距离自己最近的爬虫 hurt为true则去除没有攻击部件的爬
    public closestCreep(creep:Creep[],hurt?:boolean):Creep{
        if (creep.length <=0) return null
        let result = creep[0]
        // 计算距离
        for (var i of creep)
        {
            // 距离
            if (hurt)
            {
                if (!i.getActiveBodyparts('attack') && !i.getActiveBodyparts('ranged_attack')) continue
            }
            let distance0 = Math.max(Math.abs(this.pos.x-result.pos.x),Math.abs(this.pos.y-result.pos.y))
            let distance1 = Math.max(Math.abs(this.pos.x-i.pos.x),Math.abs(this.pos.y-i.pos.y))
            if (distance1 < distance0)
            result = i
        }
        return result
    }
}