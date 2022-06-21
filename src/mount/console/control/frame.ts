import { resourceComDispatch } from "@/constant/ResourceConstant"
import { RecognizeLab } from "@/module/fun/funtion"
import { Colorful, isInArray } from "@/utils"
import { object } from "lodash"

export default {
    /* 绕过房间api */
    bypass: {
    
    /* 添加要绕过的房间 */
    add(roomNames: string):string {
        if (!Memory.bypassRooms) Memory.bypassRooms = []

        // 确保新增的房间名不会重复
        Memory.bypassRooms = _.uniq([ ...Memory.bypassRooms, roomNames])
        return `[bypass]已添加绕过房间 \n ${this.show()}`
    },

    show():string{
        if (!Memory.bypassRooms || Memory.bypassRooms.length <= 0) return '[bypass]当前无绕过房间'
        return `[bypass]当前绕过房间列表：${Memory.bypassRooms.join(' ')}`
    },
    clean():string{
        Memory.bypassRooms = []
        return `[bypass]已清空绕过房间列表，当前列表：${Memory.bypassRooms.join(' ')}`
    },
    remove(roomNames: string):string {
        if (!Memory.bypassRooms) Memory.bypassRooms = []
        if (roomNames.length <= 0) delete Memory.bypassRooms
        else Memory.bypassRooms = _.difference(Memory.bypassRooms,[roomNames])
        return `[bypass]已移除绕过房间${roomNames}`
    }
    },
    /* 白名单api */
    whitesheet:{
        add(username:string):string{
            if (!Memory.whitesheet) Memory.whitesheet = []
            Memory.whitesheet = _.uniq([...Memory.whitesheet,username])
            return `[whitesheet]已添加用户${username}进白名单！\n${this.show()}`
        },
        show():string{
            if (!Memory.whitesheet || Memory.whitesheet.length <= 0) return "[whitesheet]当前白名单为空！"
            return `[whitesheet]白名单列表：${Memory.whitesheet.join(' ')}`
        },
        clean():string{
            Memory.whitesheet = []
            return '[whitesheet]当前白名单已清空'
        },
        remove(username:string):string{
            // if (! (username in Memory.whitesheet)) return `[whitesheet]白名单里没有玩家“${username}”`
            if (!Memory.whitesheet) Memory.whitesheet = []
            if (Memory.whitesheet.length <= 0) delete Memory.whitesheet
            else Memory.whitesheet = _.difference(Memory.whitesheet,[username])
            return `[whitesheet]已移除${username}出白名单`
        }
    },
    frame:
    {
        // 添加控制某房间 [添加了房间才会运行代码]
        add(roomName:string,plan:'man'|'dev',x:number,y:number):string
        {
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[frame] 不存在房间${roomName}`
            Memory.RoomControlData[roomName] = {arrange:plan,center:[x,y]}
            return `[frame] 房间${roomName}加入房间控制列表，布局${plan}，中心点[${x},${y}]`
        },
        // 移除本代码对某房间的控制
        remove(roomName):string
        {
            delete Memory.RoomControlData[roomName]
            return `[frame] 删除房间${roomName}出房间控制列表`
        },
        // 删除某房间的建筑
        del(roomName:string,x:number,y:number,mold:BuildableStructureConstant):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[frame] 未找到房间${roomName},请确认房间!`
            var thisPosition:RoomPosition = new RoomPosition(x,y,roomName)
            if (thisPosition.GetStructure(mold))
                {myRoom.unbindMemory(mold,x,y);return `[frame] 房间${roomName}已经执行delStructure命令!`}
            else
            {
                let cons = thisPosition.lookFor(LOOK_CONSTRUCTION_SITES)
                if (cons.length > 0 && cons[0].structureType == mold)
                {
                    myRoom.unbindMemory(mold,x,y);return `[frame] 房间${roomName}已经执行delStructure命令!`
                }
            }
            return `[frame] 房间${roomName}未找到相应建筑!`
        },
        // 查询任务
        task(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[frame] 未找到房间${roomName},请确认房间!`
            let result = `[frame] 房间${roomName}任务数据如下:\n`
            for (var rangeName in myRoom.memory.Misson)
            {
                if (Object.keys(myRoom.memory.Misson[rangeName]).length <=0)
                {
                    result += `不存在${rangeName}类任务\n`
                }
                else
                {
                    result += `------------[${rangeName}]-------------\n`
                    for (var i of myRoom.memory.Misson[rangeName])
                    {
                        result += `${i.name} | 超时:${i.delayTick}, ID:${i.id}, `
                        if (i.Data)
                        {
                            if (i.Data.disRoom) result += `目标房间:${i.Data.disRoom}, `
                            if (i.Data.rType) result += `rType:${i.Data.rType}, `
                            if (i.Data.num) result += `num:${i.Data.num}, `
                        }
                        result += `\n`
                    }
                }
            }
            return result
        },
        // 经济模式 （不再升级）
        economy(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[frame] 未找到房间${roomName},请确认房间!`
            myRoom.memory.economy = !myRoom.memory.economy
            if (!myRoom.memory.economy){
                myRoom.memory.SpawnConfig['upgrade'].num = 1
            }
            return `[frame] 房间${roomName}的economy选项改为${myRoom.memory.economy}`
        }
    },
    spawn:
    {
        num(roomName:string,role:string,num:number):string{
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[spawn] 不存在房间${roomName}`
            let roleConfig = thisRoom.memory.SpawnConfig[role]
            if (roleConfig)
            {
                roleConfig.num = num
                return `[spawn] 房间${roomName}的${role}数量信息修改为${num}`
            }
            return `[spawn] 房间${roomName}的${role}数量信息修改失败`
        },
        // 修改某任务爬虫绑定数据的num
        Mnum(roomName:string,id:string,role:string,num:number):string{
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[spawn] 不存在房间${roomName}`
            let misson = thisRoom.GainMission(id)
            if (misson && misson.CreepBind[role])
            {
                misson.CreepBind[role].num = num
                return `[spawn] 任务${id}的${role}数量信息修改为${num}`
            }
            return `[spawn] 任务${id}的${role}数量信息修改失败`
        },
        // 只对任务爬虫的定时孵化有效
        restart(roomName:string,id:string):string{
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[spawn] 不存在房间${roomName}`
            let misson = thisRoom.GainMission(id)
            if (misson)
            {
                delete misson.Data.intervalTime
                return `[spawn] 任务${misson.name}<id:${id}>孵化信息已经初始化!`
            }
            return `[spawn] 找不到id为${id}的任务!`
        }
    },
    link:{
        comsume(roomName:string,id:string):string{
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[link] 不存在房间${roomName}`
            if (isInArray(thisRoom.memory.StructureIdData.source_links,id)) return `[link] id错误，不能为source_link`
            if (id == thisRoom.memory.StructureIdData.center_link || id == thisRoom.memory.StructureIdData.upgrade_link) return `[link] id错误，不能为center_link/upgrade_link`
            if (!isInArray(thisRoom.memory.StructureIdData.comsume_link,id))thisRoom.memory.StructureIdData.comsume_link.push(id)
            return Colorful(`[link] 房间${roomName} id为${id}的link已加入comsume_link列表中`,'green',true)
        }
    },
    debug:{
        ResourceDispatch(roomName:string,rType:ResourceConstant,num:number,mtype:"deal"|"order",buy:boolean = false):string{
            let dispatchTask:RDData = {
                sourceRoom:roomName,
                rType:rType,
                num:num,
                delayTick:300,
                conditionTick:20,
                buy:buy,
                mtype:mtype
            }
            Memory.ResourceDispatchData.push(dispatchTask)
            return `[debug] 资源调度任务发布,房间${roomName},资源类型${rType},数量${num},支持购买:${buy},默认超时300T`
        },
        ResourceBuy(roomName:string,rType:ResourceConstant,num:number,range:number,max:number = 35):string{
            let thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[link] 不存在房间${roomName}`
            let task = thisRoom.public_Buy(rType,num,range,max)
            if (task && thisRoom.AddMission(task))
            return Colorful(`[debug] 资源购买任务发布,房间${roomName},资源类型${rType},数量${num},价格范围${range},最高价格${max}`,'blue')
            return Colorful(`[debug] 房间${roomName}资源购买任务发布失败!`,'yellow')
        }
    },
    dispatch:{
        limit(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[dispatch] 未找到房间${roomName},请确认房间!`
            let result = `[dispatch] 房间${roomName}的ResourceLimit信息如下:\n`
            let data = global.ResourceLimit[roomName]
            if (Object.keys(data).length <=0) return `[dispatch] 房间${roomName}没有ResourceLimit信息!`
            for (var i of Object.keys(data))
                result += `[${i}] : ${data[i]}\n`
            return result
        }
    },
}