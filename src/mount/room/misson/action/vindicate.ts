import { avePrice, haveOrder, highestPrice } from "@/module/fun/funtion";
import { Colorful, GenerateAbility, isInArray } from "@/utils";

/* 房间原型拓展   --行为  --维护任务 */
export default class RoomMissonVindicateExtension extends Room {
    public Task_Repair(mission:MissionModel):void{
        /* 根据level决定任务爬虫体型 */
        let level = mission.Data.level
        if (!level) mission.Data.level = 'T0'
        if (level == 'T2')
        {
            global.MSB[mission.id] ={'repair':GenerateAbility(6,4,10,0,0,0,0,0)}
        }
        else if (level == 'T1')
        {
            global.MSB[mission.id] ={'repair':GenerateAbility(10,10,10,0,0,0,0,0)}
        }
        else if (level == 'T0')
        {
            // 默认配置
        }
        if ((Game.time - global.Gtime[this.name]) % 8) return
        if (mission.LabBind)
        {
            if (!this.Check_Lab(mission,'transport','complex')) return
        }
    }

    /* 急速冲级 */
    public Task_Quick_upgrade(mission:MissionModel):void{
        if (this.controller.level >= 8) {this.DeleteMission(mission.id);console.log(`房间${this.name}等级已到8级，删除任务!`);return}
        if (!this.memory.StructureIdData.terminalID) return
        if (!this.memory.StructureIdData.labs || this.memory.StructureIdData.labs.length <= 0) return
        /* 能量购买 */
        let terminal_ = Game.getObjectById(this.memory.StructureIdData.terminalID) as StructureTerminal
        if (!terminal_) return
        if (!mission.Data.standed) mission.Data.standed = true
        /* 如果terminal附近已经充满了爬虫，则standed为false */
        let creeps = terminal_.pos.findInRange(FIND_MY_CREEPS,1)
        if (creeps.length >= 8) mission.Data.standed= false
        else mission.Data.standed = true
        if(!this.Check_Lab(mission,'transport','complex')) return
        if (Game.time % 40) return
        if (terminal_.store.getUsedCapacity('energy') < 100000 && Game.market.credits >= 1000000)
        {
            let ave = avePrice('energy',2)
            let highest = highestPrice('energy','buy',ave+6)
            if (!haveOrder(this.name,'energy','buy',highest,-0.2))
            {
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: highest + 0.1,
                    totalAmount: 100000,
                    roomName: this.name   
                });
                if (result != OK){console.log("创建能量订单出错,房间",this.name)}
                console.log(Colorful(`[急速冲级]房间${this.name}创建energy订单,价格:${highest + 0.01};数量:100000`,'green',true))
            }
        }
    }

    /* 普通冲级 */
    public Task_Normal_upgrade(mission:MissionModel):void{
        if (this.controller.level >= 8) {this.DeleteMission(mission.id);console.log(`房间${this.name}等级已到8级，删除任务!`);return}
        if (!this.memory.StructureIdData.terminalID) return
        if (!this.memory.StructureIdData.labs || this.memory.StructureIdData.labs.length <= 0) return
        if (mission.LabBind && !this.Check_Lab(mission,'transport','complex'))  return   // boost
    }

    /* 紧急援建 */
    public Task_HelpBuild(mission:MissionModel):void{
        if (!mission.Data.defend)
        {
            global.MSB[mission.id] ={'architect':GenerateAbility(15,24,10,0,0,1,0,0)}
        }
        if ((Game.time - global.Gtime[this.name]) % 9) return
        if (mission.LabBind)
        {
            if(!this.Check_Lab(mission,'transport','complex')) return // 如果目标lab的t3少于 1000 发布搬运任务
        }
        
    }

    /* 资源转移任务 */
    public Task_Resource_transfer(mission:MissionModel):void{
        if ((Game.time-global.Gtime[this.name]) % 50) return
        let storage_ = this.storage
        let terminal_ = this.terminal
        if (!storage_ || !terminal_)
        {
            this.DeleteMission(mission.id)
            return
        }
        if (this.MissionNum('Structure','资源传送') > 0) return //有传送任务就先不执行
        if (storage_.store.getUsedCapacity('energy') < 200000) return   // 仓库资源太少不执行
        // 不限定资源代表除了能量和ops之外所有资源都要转移
        if (!mission.Data.rType)
        {
            for (var i in storage_.store)
            {
                if (isInArray(['energy','ops'],i)) continue
                let missNum = (storage_.store[i] >= 50000)?50000:storage_.store[i]
                let sendTask = this.public_Send(mission.Data.disRoom,i as ResourceConstant,missNum)
                if (this.AddMission(sendTask))
                return
                
            }
            // 代表已经没有资源了
            this.DeleteMission(mission.id)
            return
        }
        else
        {
            let rType = mission.Data.rType as ResourceConstant
            let num = mission.Data.num as number
            if (num <= 0 || storage_.store.getUsedCapacity(rType) <= 0)   // 数量或存量小于0 就删除任务
            {
                this.DeleteMission(mission.id)
                return
            }
            let missNum = (num >= 50000)?50000:num
            if (missNum > storage_.store.getUsedCapacity(rType)) missNum = storage_.store.getUsedCapacity(rType)
            let sendTask = this.public_Send(mission.Data.disRoom,rType,missNum)
            if (sendTask && this.AddMission(sendTask))
            {
                mission.Data.num -= missNum
            }
        }
    }

    /* 扩张援建任务 */
    public Task_Expand(mission:MissionModel):void{
        if (mission.Data.defend)
        {
            global.MSB[mission.id] ={
                'claim':GenerateAbility(0,0,10,0,0,5,1,4),
                'Ebuild':GenerateAbility(10,4,20,0,0,6,0,0),
                'Eupgrade':GenerateAbility(10,4,20,0,0,6,0,0)
            }
        }
    }
}