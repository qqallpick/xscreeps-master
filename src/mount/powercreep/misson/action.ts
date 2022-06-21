import { isOPWR } from "./constant"

export default class PowerCreepMissonAction extends PowerCreep {
    // 操作仓库
    public handle_pwr_storage():void{
        var storage_ = Game.rooms[this.memory.belong].storage
        if (!storage_) return
        if (isOPWR(storage_))
        {
            Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
            this.memory.MissionData = {}
        }
        if (!this.OpsPrepare()) return
        if (!this.pos.isNearTo(storage_))
        {
            this.goTo(storage_.pos,1)
            return
        }
        else this.usePower(PWR_OPERATE_STORAGE,storage_)
    }

    // 操作tower
    public handle_pwr_tower():void
    {
        if (this.powers[PWR_OPERATE_TOWER] && this.powers[PWR_OPERATE_TOWER].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        if (!this.OpsPrepare()) return
        for (var id of this.memory.MissionData.data.tower)
        {
            var tower_ = Game.getObjectById(id) as StructureTower
            if (!isOPWR(tower_))
            {
                if (!this.pos.isNearTo(tower_))
                {
                    this.goTo(tower_.pos,1)
                }
                else
                {
                    this.usePower(PWR_OPERATE_TOWER,tower_)
                }
                return
            }
        }
    }

    // 操作lab
    public handle_pwr_lab():void{
        if (this.powers[PWR_OPERATE_LAB] && this.powers[PWR_OPERATE_LAB].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        if (!this.OpsPrepare()) return
        for (var id of this.memory.MissionData.Data.lab)
        {
            var lab_ = Game.getObjectById(id) as StructureTower
            if (!isOPWR(lab_))
            {
                if (!this.pos.isNearTo(lab_))
                {
                    this.goTo(lab_.pos,1)
                }
                else
                {
                    this.usePower(PWR_OPERATE_LAB,lab_)
                }
                return
            }
        }
    }

    // 操作拓展
    public handle_pwr_extension():void{
        var storage_ = Game.rooms[this.memory.belong].storage
        if (!storage_) return
        if (this.powers[PWR_OPERATE_EXTENSION] && this.powers[PWR_OPERATE_EXTENSION].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        if (!this.OpsPrepare()) return
        if (!this.pos.inRangeTo(storage_,3))
        {
            this.goTo(storage_.pos,3)
            return
        }
        else this.usePower(PWR_OPERATE_EXTENSION,storage_)
    }

    /* 操作孵化 */
    public handle_pwr_spawn():void{
        if (this.powers[PWR_OPERATE_SPAWN] && this.powers[PWR_OPERATE_SPAWN].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        var spawningSpawn = this.pos.findClosestByRange(FIND_STRUCTURES,{filter:(stru)=>{
            return stru.structureType == 'spawn' 
        }})
        if (!this.OpsPrepare()) return
        if (!this.pos.inRangeTo(spawningSpawn,3))
        {
            this.goTo(spawningSpawn.pos,3)
            return
        }
        else this.usePower(PWR_OPERATE_SPAWN,spawningSpawn)
    }

    /* 操作工厂 */
    public handle_pwr_factory():void{
        var factory_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.FactoryId) as StructureFactory
        if (!factory_) return
        if (this.powers[PWR_OPERATE_FACTORY] && this.powers[PWR_OPERATE_FACTORY].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        if (!this.OpsPrepare()) return
        if (!this.pos.inRangeTo(factory_,3))
        {
            this.goTo(factory_.pos,3)
            return
        }
        else this.usePower(PWR_OPERATE_FACTORY,factory_)
    }

    /* 操作powerspawn */
    public handle_pwr_powerspawn():void{
        var powerspawn_ = Game.getObjectById(Game.rooms[this.memory.belong].memory.StructureIdData.PowerSpawnID) as StructurePowerSpawn
        if (!powerspawn_) return
        if (this.powers[PWR_OPERATE_POWER] && this.powers[PWR_OPERATE_POWER].cooldown)
        {
            if (Game.rooms[this.memory.belong].GainMission(this.memory.MissionData.id))
            {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
            else
            this.memory.MissionData = {}
            return
        }
        if (!this.OpsPrepare()) return
        if (!this.pos.inRangeTo(powerspawn_,3))
        {
            this.goTo(powerspawn_.pos,3)
            return
        }
        else this.usePower(PWR_OPERATE_POWER,powerspawn_)
    }

    /*操作source*/
    public handle_pwr_source(): void {
        let Data = this.memory.MissionData.Data
        var source_ = Game.getObjectById(Data.source_id) as Source;
        if (!source_) return;
        if (source_.effects) {
            if (source_.effects.length > 0) {
                Game.rooms[this.memory.belong].DeleteMission(this.memory.MissionData.id)
                this.memory.MissionData = {}
            }
        }
        if (!this.OpsPrepare()) return
        if (!this.pos.inRangeTo(source_, 2)) {
            this.goTo(source_.pos, 2)
            return
        }
        else {
            this.usePower(PWR_REGEN_SOURCE, source_)
        }
    }
}