import { isInArray } from "@/utils";

/* 房间原型拓展   --任务  --中央运输工任务 */
export default class RoomMissonManageExtension extends Room {
    /* 链接送仓   即中央链接能量转移至仓库 */
    public Task_Clink():void{
        if (( Game.time - global.Gtime[this.name]) % 15) return
        if (!this.memory.StructureIdData.center_link) return
        var center_link = Game.getObjectById(this.memory.StructureIdData.center_link as string) as StructureLink
        if (!center_link) {delete this.memory.StructureIdData.center_link;return}
        var storage_ =  this.storage
        if (!storage_) {return}
        if (storage_.store.getFreeCapacity() <= 10000) return   // storage满了就不挂载任务了
        for (var i of this.memory.Misson['Structure'])
        {
            if (i.name == '链传送能' && isInArray(i.structure,this.memory.StructureIdData.center_link))
            return
        }
        if (center_link.store.getUsedCapacity('energy') >= 400 && this.Check_Carry('manage',center_link.pos,storage_.pos,'energy'))
        {
            var thisTask = this.public_Carry({'manage':{num:1,bind:[]}},20,this.name,center_link.pos.x,center_link.pos.y,this.name,storage_.pos.x,storage_.pos.y,'energy')
            this.AddMission(thisTask)   
        }
    }

}