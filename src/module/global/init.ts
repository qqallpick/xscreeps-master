import { random, slice } from "lodash"
import { AppLifecycleCallbacks } from "../framework/types"

/**
 * Memory初始化
 */
export const MemoryInit = function(): void {
    if(!Memory.whitesheet) Memory.whitesheet = []
    if(!Memory.bypassRooms) Memory.bypassRooms = []
    if (!Memory.ignoreMissonName) Memory.ignoreMissonName = []
    if (!Memory.RoomControlData) Memory.RoomControlData = {}
    if (!Memory.shieldsheet) Memory.shieldsheet = {}
    if (!global.Gtime) global.Gtime = {}
    for (let i in Memory.RoomControlData) if (!global.Gtime[i])global.Gtime[i] = Game.time - random(1,20,false)
    if (!global.SpecialBodyData) global.SpecialBodyData = {}
    for (let i in Memory.RoomControlData) if (!global.SpecialBodyData[i])global.SpecialBodyData[i]={}
    if (!global.intervalData) global.intervalData = {}
    for (let i in global.intervalData) if (!global.intervalData[i])global.intervalData[i]={}
    if (!Memory.marketAdjust)Memory.marketAdjust = {}
    if (!Memory.ResourceDispatchData)Memory.ResourceDispatchData = []
    if (!global.ResourceLimit)global.ResourceLimit = {}
    if (!Memory.outMineData) Memory.outMineData = {}
    if (!global.warData) global.warData = {tower:{},enemy:{},flag:{},structure:{}}
    if (!global.MSB) global.MSB = {}
    if (!Memory.StopPixel) Memory.StopPixel = false
    if(!global.Repairlist)global.Repairlist={}
    global.Adaption = {}
    if (!Memory.VisualLevel) Memory.VisualLevel = 'high'    // 默认最高等级的画质显示
}



export const memoryInit: AppLifecycleCallbacks = {
    tickStart:MemoryInit
}