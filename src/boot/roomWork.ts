import { ResourceDispatch } from "@/module/dispatch/resource"
import { processRoomDataVisual } from "@/module/visual/visual"

export const roomRunner = function (room: Room): void {
    if (!room?.controller?.my) return
    if (!Memory.RoomControlData[room.name]) return  // 非框架控制不运行
    /* 房间核心 */
    room.RoomInit()         // 房间数据初始化

    room.RoomEcosphere()    // 房间状态、布局
    
    room.SpawnMain()        // 常驻爬虫的孵化管理 [不涉及任务相关爬虫的孵化]

    /* 房间运维 */ 
    room.MissionManager()   // 任务管理器

    room.SpawnExecution()   // 孵化爬虫

    room.TowerWork()        // 防御塔工作

    room.StructureMission() // terminal link factory 工作
    
    ResourceDispatch(room)      // 资源调度

    processRoomDataVisual(room)        // 房间可视化

    room.LevelMessageUpdate()        // 房间等级Memory信息更新
}