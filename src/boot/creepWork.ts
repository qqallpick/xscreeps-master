import { RoleData, RoleLevelData } from "@/constant/SpawnConstant"
import { CalculateEnergy, colors, GenerateAbility } from "@/utils"

export const creepRunner = function (creep: Creep): void {
  if (creep.spawning)
  {
    /* 爬虫出生角色可视化 */
    creep.room.visual.text(`${creep.memory.role}`,creep.pos.x,creep.pos.y,{color: '#ffffff', font:0.5,align:'center',stroke:'#ff9900'})
  }
  /* 跨shard找回记忆 */
  if (!creep.memory.role)
  {
    var InshardMemory = global.intershardData
    if (InshardMemory['creep'][creep.name])
    {
        creep.memory = InshardMemory['creep'][creep.name].MemoryData
        InshardMemory.creep[creep.name].state = 1
    }
    return
  }
  if (!RoleData[creep.memory.role]) return
  // 自适应体型生产的爬虫执行恢复体型的相关逻辑
  if (!global.Adaption[creep.memory.belong] && creep.memory.adaption && creep.store.getUsedCapacity()==0 )
  {
    let room = Game.rooms[creep.memory.belong]
    if (!room) return
    let bodyData = RoleLevelData[creep.memory.role][room.controller.level].bodypart
    let allSpawnenergy = CalculateEnergy(GenerateAbility(bodyData[0],bodyData[1],bodyData[2],bodyData[3],bodyData[4],bodyData[5],bodyData[6],bodyData[7],))
    if (bodyData && room.energyAvailable >= allSpawnenergy && room.memory.SpawnList && room.memory.SpawnList.length <= 0)
    {
      creep.suicide()
      global.Adaption[creep.memory.belong] = true
    }
    /* adaption爬虫执行自S */
  }
  /* 非任务类型爬虫 */
  if (RoleData[creep.memory.role].fun)
  {
    RoleData[creep.memory.role].fun(creep)
  }
  /* 任务类型爬虫 */
  else
  {
    creep.ManageMisson()
  }
}
