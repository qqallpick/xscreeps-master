import room from "@/mount/room"
import { Colorful, isInArray } from "@/utils"
import { result } from "lodash"
import { allResource, roomResource } from "../control/local/resource"
import { getStore } from "../control/local/store"


/* 与资源相关的 */
export default {
    resource:{
        all():string{
            allResource()
            return `[resource] 全局资源统计完毕!`
        },
        room(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[resource] 不存在房间${roomName}`
            roomResource(roomName)
            return `[resource] 房间${roomName}资源统计完毕!`
        },
        com():string{
            let result = '压缩商品资源:\n'
            result += 'battery(wn) utrium_bar(U) lemergium_bar(L) keanium_bar(K) zynthium_bar(Z) \n'
            result += 'ghodium_melt(G) oxidant(O) reductant(H) purifier(X)\n'
            result += '基础商品资源:\n'
            result += 'wire cell alloy condensate composite crystal liquid\n'
            result += Colorful('机械商品:\n','#f8a505',true)
            result += Colorful('tube fixtures frame hydraulics machine\n','#f8a505',false)
            result += Colorful('生物商品:\n','#05f817',true)
            result += Colorful('phlegm tissue muscle organoid organism\n','#05f817',false)
            result += Colorful('电子商品:\n','blue',true)
            result += Colorful('switch transistor microchip circuit device\n','blue',false)
            result += Colorful('奥秘商品:\n','#5147ea',true)
            result += Colorful('concentrate extract spirit emanation essence\n','#5147ea',false)
            return result
        }
    },
    store:{
        all():string{
            getStore()
            return `[store] 全局容量信息统计完毕!`
        },
        room(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[store] 不存在房间${roomName}`
            getStore(roomName)
            return `[store] 房间${roomName}容量信息统计完毕!`
        }
    },
    /* 任务输出调试屏蔽 */
    MissionVisual:{
        add(name:string):string{
            if (!isInArray(Memory.ignoreMissonName,name))
                Memory.ignoreMissonName.push(name)
            return `[ignore] 已经将任务${name}添加进输出调试的忽略名单里!`
        },
        remove(name:string):string{
            if (isInArray(Memory.ignoreMissonName,name))
                {
                    var index = Memory.ignoreMissonName.indexOf(name)
                    Memory.ignoreMissonName.splice(index,1)
                    return `[ignore] 已经将任务${name}删除出输出调试的忽略名单里!`
                }
            return `[ignore] 删除 ${name} 出调试输出忽略名单失败!`
            
        },
    },

    /* 房间可视化 */
    panel:{
        switch(roomName:string):string{
            if (!Game.rooms[roomName]) return `[RoomVisual] 房间${roomName}无视野`
            if (!Game.rooms[roomName].controller || !Game.rooms[roomName].controller.my) return `[RoomVisual] 房间${roomName}非受控房间`
            if (Game.rooms[roomName].memory.banVisual) delete Game.rooms[roomName].memory.banVisual
            else Game.rooms[roomName].memory.banVisual = true
            return `[RoomVisual] 房间${roomName}的可视化设置为${Game.rooms[roomName].memory.banVisual?'false':'true'}`
        },
        level(lev:'low'|'medium'|'high'|'blank'):string{
            if (!isInArray(['low','medium','high','blank'],lev)) return `[RoomVisual] 非法参数`
            Memory.VisualLevel = lev
            return `[RoomVisual] 可视化画质设置为${lev}`
        },
    }
}