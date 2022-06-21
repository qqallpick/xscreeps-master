import { resourceComDispatch } from "@/constant/ResourceConstant"
import { avePrice, haveOrder, highestPrice, RecognizeLab } from "@/module/fun/funtion"
import { Colorful, compare, isInArray, unzipPosition, zipPosition } from "@/utils"
import { result } from "lodash"
export default {
    /* 终端行为 */
    terminal:{
        // 默认最多8个传送任务
        send(roomName:string,disRoom:string,rType:ResourceConstant,num:number):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[terminal] 不存在房间${roomName}`
            var thisTask = thisRoom.public_Send(disRoom,rType,num)
            /* 查看资源是否足够 */
            var terminal_ = Game.getObjectById(thisRoom.memory.StructureIdData.terminalID) as StructureTerminal
            var storage_ = Game.getObjectById(thisRoom.memory.StructureIdData.storageID) as StructureStorage
            if (!terminal_ || !storage_) 
            {delete thisRoom.memory.StructureIdData.terminalID;delete thisRoom.memory.StructureIdData.storageID;return Colorful( `[terminal] 房间${roomName}不存在终端/仓房或记忆未更新！`,'red',true)}
            /* 查询其他资源传送任务中是否有一样的资源 */
            var Num = 0
            if (!thisRoom.memory.Misson['Structure']) thisRoom.memory.Misson['Structure'] = []
            for (var tM of thisRoom.memory.Misson['Structure'])
            {
                if (tM.name == '资源传送' && tM.Data.rType == rType)    Num += tM.Data.num
            }
            /* 计算资源是否满足 */
            if (terminal_.store.getUsedCapacity(rType) + storage_.store.getUsedCapacity(rType) - Num < num)
            return Colorful(`[terminal] 房间${roomName} 资源${rType} 数量总合少于 ${num}，传送任务挂载失败！`,'yellow',true)
            /* 计算路费 */
            var cost = Game.market.calcTransactionCost(num,roomName,disRoom)
            if (terminal_.store.getUsedCapacity('energy') + storage_.store.getUsedCapacity('energy') < cost || cost > 150000)
            return Colorful(`[terminal] 房间${roomName}-->${disRoom}资源${rType}所需路费少于 ${cost}或大于150000，传送任务挂载失败！`,'yellow',true)
            if(thisRoom.AddMission(thisTask))
                return Colorful(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送挂载成功！数量：${num}；路费：${cost}`,'green',true)
            return Colorful(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送 不明原因挂载失败！`,'red',true)
        },
        Csend(roomName:string,disRoom:string,rType:ResourceConstant):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[terminal] 不存在房间${roomName}`
            for (var tM of thisRoom.memory.Misson['Structure'])
            {
                if (tM.name == '资源传送' && tM.Data.rType == rType && tM.Data.disRoom == disRoom)
                {
                    if (thisRoom.DeleteMission(tM.id))return Colorful(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送任务删除成功!`,'blue',true)
                }
            }
            return Colorful(`[terminal] 房间${roomName}-->${disRoom}资源${rType}传送 不明原因删除失败！`,'red',true)
        },
        /* 查看目前房间/全局的资源传送任务 */
        show(roomName?:string):string{
            var roomList:string[] = []
            if (roomName) roomList = [roomName]
            else
            {
                if (!Memory.RoomControlData) Memory.RoomControlData = {}
                for (var rN in Memory.RoomControlData)
                {
                    roomList.push(rN)
                }
            }
            if (roomList.length <= 0) return `[terminal] 未发现房间！`
            for (var rN of roomList)
            {
                if (!Game.rooms[rN]) return `[terminal] 不存在房间${rN}！`
            }
            var str = ''
            for (var rN of roomList)
            {
                if (!Game.rooms[rN].memory.Misson['Structure']) Game.rooms[rN].memory.Misson['Structure'] = []
                if (Game.rooms[rN].MissionNum('Structure','资源传送') <= 0) continue
                str += '房间 ' + Colorful(`${rN}`,'yellow',true) + '：\n'
                for (var m of Game.rooms[rN].memory.Misson['Structure'])
                {
                    if (m.name == '资源传送')
                    {
                        str += '    '+`-->${m.Data.disRoom} | 资源：${m.Data.rType} | 数量：` + m.Data.num + ' \n'
                    }
                }
            }
            if (str == '') return `[terminal] 未发现资源传送任务！`
            return str
        },
    },

    /* 全局资源传送 */
    give:{
        set(roomName:string,rType:ResourceConstant,num:number,pass?:boolean):string{
            if (num > 200000) return `[give] 资源数量太多!不能挂载全局资源传送任务!`
            if (!Game.rooms[roomName] && !pass)
            {
                // 不是自己房间需要确认
                return `[give] 未授权的传送命令,目标房间非自己房间!`
            }
            for (var i of Memory.ResourceDispatchData)
            {
                if (i.sourceRoom == roomName && i.rType == rType)
                    return `[give] 已经存在全局资源传送任务了!`
            }
            let dispatchTask:RDData = {
                sourceRoom:roomName,
                rType:rType,
                num:num,
                delayTick:1500,
                conditionTick:500,
                buy:false,
                mtype:'deal'    // 可以删了
            }
            Memory.ResourceDispatchData.push(dispatchTask)
            return `[give] 全局资源传送任务发布,房间${roomName},资源类型${rType},数量${num}`
        },
        remove(roomName:string,rType:ResourceConstant):string{
            for (var i of Memory.ResourceDispatchData)
            {
                if (i.sourceRoom == roomName && i.rType == rType)
                {
                    let index = Memory.ResourceDispatchData.indexOf(i)
                    Memory.ResourceDispatchData.splice(index,1)
                    return `[give] 成功删除房间${roomName}[${rType}]全局资源传送任务!`
                }
            }
            return `[give] 未发现房间${roomName}[${rType}]全局资源传送任务!`
        }
    },

    /* 物流 */
    logistic:{
        send(roomName:string,disRoom:string,rType?:ResourceConstant,num?:number):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[logistic] 不存在房间${roomName}`
            let thisTask = thisRoom.public_resource_transfer(disRoom,rType?rType:null,num?num:null)
            if (thisTask && thisRoom.AddMission(thisTask))
                return Colorful(`[logistic] 房间${roomName} --> ${disRoom}资源转移任务已经下达，资源类型:${rType?rType:"所有资源"} | 数量:${num?num:"所有"}`,'green')
            return Colorful(`[logistic] 房间${roomName} --> ${disRoom}资源转移任务已经下达失败!`,'red')
        },
        Csend(roomName:string,disRoom:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[logistic] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '资源转移' && thisRoom.DeleteMission(i.id))
                return Colorful(`[logistic] 房间${roomName} --(${i.Data.rType})--> ${disRoom}资源转移任务删除成功!`,'green')
            }
            return Colorful(`[logistic] 房间${roomName} --> ${disRoom}资源转移任务删除失败!`,'red')
        },
        // 查询所有房间的资源转移相关的物流信息
        show():string{
            let result = `[logisitic] 资源转移物流信息:\n`
            for (var i in Memory.RoomControlData)
            {
                if (Game.rooms[i] && Game.rooms[i].controller && Game.rooms[i].controller.my)
                {
                    let room_ = Game.rooms[i]
                    let task = room_.MissionName('Room','资源转移')
                    if (task)
                    {
                        result += `${room_.name}->${task.Data.disRoom}: 资源类型:${task.Data.rType?task.Data.rType:"所有资源"},数量:${task.Data.num?task.Data.num:'所有'}\n`
                    }
                }
            }
            if (result ==  `[logisitic] 资源转移物流信息:\n`) return `[logisitic] 未发现资源转移物流信息`
            return result
        },
    },
    /* 外矿 */
    mine:{
        // 采集外矿
        harvest(roomName:string,x:number,y:number,disRoom:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[mine] 不存在房间${roomName}`
            var thisTask = thisRoom.public_OutMine(roomName,x,y,disRoom)
            thisTask.maxTime = 8
            if(thisRoom.AddMission(thisTask)) return `[mine] ${roomName} -> ${disRoom} 的外矿任务挂载成功！`
            return `[mine] ${roomName} -> ${disRoom} 的外矿任务挂载失败！`
        },
        // 取消采集
        Charvest(roomName:string,disRoom:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[mine] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Creep'])
            {
                if (i.name == '外矿开采' && i.Data.disRoom == disRoom)
                {
                    if (thisRoom.DeleteMission(i.id))
                    {
                        if (Memory.outMineData[disRoom]) delete Memory.outMineData[disRoom]
                        return `[mine] ${roomName} -> ${disRoom} 的外矿任务删除成功！`
                    }
                }
            }
            return `[mine] ${roomName} -> ${disRoom} 的外矿任务删除失败！`
        },
        // 更新外矿road信息
        road(roomName:string):string{
            if (!Game.rooms[roomName]) return `[mine] 不存在相应视野`
            let roads = Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(stru)=>{
                return stru.structureType == 'road'
            }})
            let cons = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES,{filter:(cons)=>{
                return cons.structureType == 'road'
            }})
            // 去除road记忆
            for (var i of Memory.outMineData[roomName].road)
            {
                let pos_ = unzipPosition(i) as RoomPosition
                if (pos_.roomName== roomName &&  !pos_.GetStructure('road'))
                {
                    let index = Memory.outMineData[roomName].road.indexOf(i)
                    Memory.outMineData[roomName].road.splice(index,1)
                }
            }
            let posList = []
            for (let r of roads) posList.push(zipPosition(r.pos))
            for (let c of cons) posList.push(zipPosition(c.pos))
            for (let p of posList)
            {
                if (!isInArray(Memory.outMineData[roomName].road,p))
                Memory.outMineData[roomName].road.push(p)
            }
            return `[mine] 已经更新房间${roomName}的外矿信息!`
        },
    },

    /* 市场 */
    market:{
        // 交易订单
        deal(roomName:string,id:string,amount:number):number{
            return Game.market.deal(id, amount, roomName);
        },
        // 查询订单
        look(rType:ResourceConstant,marType:"buy"|"sell"):string
        {
            var HistoryList = Game.market.getHistory(rType)
            var allNum:number = 0
            for (var ii of HistoryList)
            {
                allNum += ii.avgPrice
            }
            var avePrice = allNum / HistoryList.length
            var list = Game.market.getAllOrders({type: marType, resourceType: rType});
            /* 按照价格从上到下 */
            var newList = list.sort(compare('price'))
            var result = `当前市场上资源${rType}的${marType}订单如下:\n`
            if (isInArray(['pixel','access_key','cpu_unlock'],rType))
            {
                for (var i of list)
                {
                    result += `\tID:${i.id} 数量:${i.amount} 价格:${i.price} 坐标:${i.roomName} \n`
                }
                return result
            }
            for (var i of newList)
            {
                var priceColor = 'green'
                var roomColor = 'green'
                if (i.price > avePrice && i.price - avePrice > 10) priceColor = 'red'
                if (i.price > avePrice && i.price - avePrice <= 10) priceColor = 'yellow'
                if (i.price <= avePrice) priceColor = 'green'
                LoopB:
                for (var roomName in Memory.RoomControlData)
                {
                    var cost = Game.market.calcTransactionCost(1000,roomName as string,i.roomName)
                    if (cost >= 7000) {roomColor = 'red';break LoopB}
                    else if (cost < 700 && cost >= 500) {roomColor = 'yellow';break LoopB}
                    roomColor = 'green'
                }
                result += `\tID:${i.id} ` + `数量:${i.amount} 价格:`+ Colorful(`${i.price}`,priceColor?priceColor:'blue',true) +` 坐标: ` + Colorful(`${i.roomName}`,roomColor?roomColor:'blue',true) + ' \n'
            }
            return result
        },
        // 下买订单
        buy(roomName:string,rType:ResourceConstant,price:number,amount:number):string{
            var result = Game.market.createOrder({
                type: 'buy' ,
                resourceType: rType,
                price: price,
                totalAmount: amount,
                roomName: roomName   
            });
            if (result == OK) return `[market] ` + Colorful(`买资源${rType}的订单下达成功！ 数量为${amount},价格为${price}`,'blue',true)
            else return `[market] ` + Colorful(`买资源${rType}的订单出现错误，不能下达！`,'red',true)
        },
        // 查询平均价格
        ave(rType:ResourceConstant,day:number=1):string{
            return `[market] 资源${rType}在近${day}天内的平均价格为${ avePrice(rType,day)}`
        },
        // 查询是否有订单
        have(roomName:string,res:ResourceConstant,mtype:"sell"|'buy',p:number=null,r:number=null):string{
            let result = haveOrder(roomName,res,mtype,p,r) 
            if (p)
            return `[market] 房间:${roomName};资源:${res};类型:${mtype}[价格:${p+r}以上]的单子--->${result?"有":"没有"}`
            else
            return `[market] 房间:${roomName};资源:${res};类型:${mtype}的单子--->${result?"有":"没有"}`
        },
        // 查询市场上的最高价格
        highest(rType:ResourceConstant,mtype:'sell'|'buy',mprice:number=0):string{
            let result = highestPrice(rType,mtype,mprice)
            if (mprice)
            return `[market] 资源:${rType};类型:${mtype} 最高价格${result}[低于${mprice}]`
            else
            return `[market] 资源:${rType};类型:${mtype} 最高价格${result}`
        },
        // 卖资源
        sell(roomName:string,rType:ResourceConstant,mType:'deal'|'order',num:number,price?:number,unit:number = 2000):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[support] 不存在房间${roomName}`
            if (!thisRoom.memory.market) thisRoom.memory.market = {}
            if (mType == 'order')
            {
                if (!thisRoom.memory.market['order']) thisRoom.memory.market['order'] = []
                var bR = true
                for (var od of thisRoom.memory.market['order'])
                {
                    if (od.rType == rType)
                    bR = false
                }
                if (bR){
                    thisRoom.memory.market['order'].push({rType:rType,num:num,unit:unit,price:price})
                    return `[market] 房间${roomName}成功下达order的资源卖出指令,type:sell,rType:${rType},num:${num},unit:${unit},price:${price}`
                }
                else return `[market] 房间${roomName}已经存在${rType}的sell订单了`
            }
            else if (mType == 'deal')
            {
                if (!thisRoom.memory.market['deal']) thisRoom.memory.market['deal'] = []
                var bR = true
                for (var od of thisRoom.memory.market['deal'])
                {
                    if (od.rType == rType)
                    bR = false
                }
                if (bR){
                    thisRoom.memory.market['deal'].push({rType:rType,num:num,price:price,unit:unit})
                    return `[market] 房间${roomName}成功下达deal的资源卖出指令,type:sell,rType:${rType},num:${num},price:${price},unit:${unit}`
                }
                else return `[market] 房间${roomName}已经存在${rType}的sell订单了`
            }
        },
        // 查询正在卖的资源
        query(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[support] 不存在房间${roomName}`
            let result = `[market] 目前房间${roomName}存在如下资源卖出订单:\n`
            for (var mtype in thisRoom.memory.market)
            for (var i of thisRoom.memory.market[mtype])
            result += `[${mtype}] 资源:${i.rType} 数量:${i.num}\n`
            return result
        },
        // 取消卖资源
        cancel(roomName:string,mtype:'order'|'deal',rType:ResourceConstant):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[support] 不存在房间${roomName}`
            for (let i of thisRoom.memory.market[mtype])
            {
                if (i.rType == rType)
                {
                    if (mtype == 'order')
                    {
                        if (i.rType != 'energy')
                        delete thisRoom.memory.TerminalData[i.rType]
                        let order = Game.market.getOrderById(i.id)
                        if (order) Game.market.cancelOrder(order.id)
                        var index = thisRoom.memory.market['order'].indexOf(i)
                        thisRoom.memory.market['order'].splice(index,1)
                        return Colorful(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置成功`,'blue')
                    }
                    else
                    {
                        if (i.rType != 'energy')
                        delete thisRoom.memory.TerminalData[i.rType]
                        var index = thisRoom.memory.market['deal'].indexOf(i)
                        thisRoom.memory.market['deal'].splice(index,1)
                        return Colorful(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置成功`,'blue')
                    }
                }
            }
            return Colorful(`[market] 房间${roomName}取消资源[${rType}----${mtype}]卖出配置失败`,'red')
        },
    },

    /* lab */
    lab:{
        // 初始化lab
        init(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[lab] 未找到房间${roomName},请确认房间!`
            /* 初始化 原先配置清零 */
            myRoom.memory.StructureIdData.labInspect=  {}
            let result = RecognizeLab(roomName)
            if (result == null) return `[lab] 房间${roomName}初始化合成lab信息失败!`
            myRoom.memory.StructureIdData.labInspect['raw1'] = result.raw1
            myRoom.memory.StructureIdData.labInspect['raw2'] = result.raw2
            myRoom.memory.StructureIdData.labInspect['com'] = result.com
            let str = ''
            str += `[lab] 房间${roomName}初始化lab信息成功!\n`
            str += `底物lab:\n${result.raw1}\n${result.raw2}\n`
            str += "合成lab:\n"
            for (let i of result.com) str += `${i}\n`
            return str
        },
        // 挂载具体合成任务
        compound(roomName:string,res:ResourceConstant,num:number):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[lab] 未找到房间${roomName},请确认房间`
            var thisTask = myRoom.public_Compound(num,res)
            if (thisTask === null) return `[lab] 挂载合成任务失败!`
            if (myRoom.AddMission(thisTask))
            return `[lab] 房间${roomName}合成${res}任务挂载成功! ${thisTask.Data.raw1} + ${thisTask.Data.raw2} = ${res}`
            else
            return `[lab] 房间${roomName}挂载合成任务失败!`
        },
        // 取消具体合成任务
        Ccompound(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[lab] 未找到房间${roomName},请确认房间`
            for (var i of myRoom.memory.Misson['Room'])
            {
                if (i.name == '资源合成')
                {
                    if (myRoom.DeleteMission(i.id)) return  `[lab] 房间${roomName}合成任务删除成功!`
                }
            }
            return Colorful(`[lab] 房间${roomName}删除合成任务失败!`,'red')
        },
        // lab合成规划 (自动执行具体合成任务 无需挂载)
        dispatch(roomName:string,res:ResourceConstant,num:number):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[lab] 未找到房间${roomName},请确认房间!`
            if (!resourceComDispatch[res]) return `不存在资源${res}!`
            if (Object.keys(myRoom.memory.ComDispatchData).length > 0) return `[lab] 房间${roomName} 已经存在资源合成调度数据`
            myRoom.memory.ComDispatchData = {}
            for (var i of resourceComDispatch[res])
            {
                myRoom.memory.ComDispatchData[i] = {res:i,dispatch_num:num}
            }
            return `[lab] 已经修改房间${roomName}的合成规划数据，为${resourceComDispatch[res]}，数量：${num}`
        },
        // 取消lab合成规划
        Cdispatch(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[lab] 未找到房间${roomName},请确认房间!`
            myRoom.memory.ComDispatchData = {}
            return `[lab] 已经修改房间${roomName}的合成规划数据，为{}.本房见现已无资源合成调度`
        },
    },

    /* power */
    power:{
        // 开始、停止升级gpl
        switch(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[power] 未找到房间${roomName},请确认房间!`
            if (!myRoom.memory.switch.StartPower) myRoom.memory.switch.StartPower = true
            else myRoom.memory.switch.StartPower = false
            return `[power] 房间${roomName}的power升级已经设置为${myRoom.memory.switch.StartPower}`
        },
        // 节省能量和Power的模式
        save(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[power] 未找到房间${roomName},请确认房间!`
            if (!myRoom.memory.switch.SavePower) myRoom.memory.switch.SavePower = true
            else myRoom.memory.switch.SavePower = false
            return `[power] 房间${roomName}的power升级的SavePower选项已经设置为${myRoom.memory.switch.SavePower}`
        },
        // 限制pc的技能
        option(roomName:string,stru:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[power] 未找到房间${roomName},请确认房间!`
            let switch_:string
            switch (stru){
                case 'storage':{switch_ = 'StopEnhanceStorage';break;}
                case 'tower':{switch_ = 'StopEnhanceTower';break;}
                case 'lab':{switch_ = 'StopEnhanceLab';break;}
                case 'extension':{switch_ = 'StopEnhanceExtension';break;}
                case 'spawn':{switch_ = 'StopEnhanceSpawn';break;}
                case 'factory':{switch_ = 'StopEnhanceFactory';break;}
                case 'powerspawn':{switch_ = 'StopEnhancePowerSpawn';break;}
                default :{return `[power] stru数据错误!`}
            }
            if (!myRoom.memory.switch[switch_]){
                myRoom.memory.switch[switch_] = true
                return `[power] 房间${roomName}的${switch_}选项调整为true! 将不执行对应的power操作`
            }
            else
            {
                delete myRoom.memory.switch[switch_]
                return `[power] 房间${roomName}的${switch_}选项调整为false! 将执行对应的power操作`
            }
        },
        // 输出pc的技能限制清单
        show(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[power] 未找到房间${roomName},请确认房间!`
            let list = [
                'StopEnhanceStorage',
                'StopEnhanceTower',
                'StopEnhanceLab',
                'StopEnhanceExtension',
                'StopEnhanceFactory',
                'StopEnhancePowerSpawn'
            ]
            let result = `[power] 房间${roomName}的power操作开关:\n`
            for (var i of list)
            {
                if (myRoom.memory.switch[i])result += Colorful(`${i}:true\n`,'red',true)
                else result += Colorful(`${i}:false\n`,'green',true)
            }
            return result
        },
        // 创建pc
        create(roomName:string,pcType:'queen'):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[power] 未找到房间${roomName},请确认房间!`
            if (!['queen'].includes(pcType)) return `[power] 不存在该类型pc!`
            if (Game.powerCreeps[`${roomName}/${pcType}/${Game.shard.name}`])
            return `[power] 已经存在名为${roomName}/${pcType}/${Game.shard.name}的pc了! `
            let result
            if (pcType == 'queen')
                result = PowerCreep.create(`${roomName}/${pcType}/${Game.shard.name}`, POWER_CLASS.OPERATOR);
            if (result == 0)
            {
                return `[power] 房间${roomName}成功创建${pcType}类型pc!`
            }
            else return `[power] 创建失败,错误码:${result}`
        },
        // 删除pc
        del(name:string,pass?:boolean):string{
            if (!Game.powerCreeps[name]) return `[power] 不存在名称为${name}的pc!`
            if (!pass) return `[power] 未确认,验证不通过!`
            Game.powerCreeps[name].delete()
            return `[power] 名称为${name}的pc已经删除! 如非测试模式,可能未立即删除!请等候24小时!`
        }
    },

    /* 过道行为 */
    cross:{
        // 初始化过道任务
        init(roomName:string,relateRoom:string[]):string{
            relateRoom =  relateRoom // ['start'].concat(relateRoom)
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            if (thisRoom.controller.level < 8) return `[cross] 房间${roomName}控制器等级不足！`
            var thisTask:MissionModel = {
                name:"过道采集",
                range:'Room',
                delayTick:99999,
                Data:{
                    power:false,
                    deposit:false,
                    relateRooms:relateRoom
                }
            }
            if (thisRoom.AddMission(thisTask)) return `[cross] 房间${roomName}初始化过道采集任务成功！ 房间：${relateRoom}`
            else return `[cross] 房间${roomName}初始化过道采集任务失败！请检查房间内是否已经存在该任务！`
        },
        switch(roomName):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            thisRoom.memory.switch.StopCross = !thisRoom.memory.switch.StopCross
            if (thisRoom.memory.switch.StopCross)
            return `[cross] 房间${roomName}关闭过道!`
            return `[cross] 房间${roomName}开启过道!`
        },
        // active power
        power(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    i.Data.power = !i.Data.power
                    if (i.Data.power)
                    return Colorful(`[cross] 房间${roomName}过道采集任务的power属性已经更改为${i.Data.power}`,'blue')
                    else
                    return Colorful(`[cross] 房间${roomName}过道采集任务的power属性已经更改为${i.Data.power}`,'yellow')
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务power属性失败！请检查房间内是否已经存在该任务！`
        },
        deposit(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    i.Data.deposit = !i.Data.deposit
                    if (i.Data.deposit)
                    return Colorful(`[cross] 房间${roomName}过道采集任务的deposit属性已经更改为${i.Data.deposit}`,'blue')
                    else
                    return Colorful(`[cross] 房间${roomName}过道采集任务的deposit属性已经更改为${i.Data.deposit}`,'yellow')
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务deposit属性失败！请检查房间内是否已经存在该任务！`
        },
        room(roomName:string,roomData:string[]):string{
            roomData = roomData
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    i.Data.relateRooms =roomData
                    return `[cross] 房间${roomName}过道采集任务的房间已经更改为${roomData}`
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务deposit属性失败！请检查房间内是否已经存在该任务！`
        },
        /* 删除某个房间 */
        remove(roomName:string,delRoomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    /* 进行删除 */
                    for (var j of i.Data.relateRooms)
                    {
                        if (j == delRoomName)
                        {
                            var list = i.Data.relateRooms as string[]
                            var index = list.indexOf(j)
                            list.splice(index,1)
                            return `[cross] 房间${roomName}的过道采集清单里已经删除房间${j}！ 现有房间列表为${i.Data.relateRooms}`
                        }
                    }
                    return `[cross] 房间${roomName}过道采集任务的房间清单未找到房间${delRoomName}`
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务房间清单失败！请检查房间内是否已经存在该任务！`
        },
        /* 增加某个房间 */
        add(roomName:string,addRoomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    /* 进行删除 */
                    if (isInArray(i.Data.relateRooms,addRoomName))
                        return `[cross] 房间${roomName}过道采集任务的房间清单已经存在房间${addRoomName}`
                    else
                    {
                        i.Data.relateRooms.push(addRoomName)
                        return `[cross] 房间${roomName}过道采集任务的房间清单已经添加房间${addRoomName}！以下为房间清单：${i.Data.relateRooms}`
                    }
                }
            }
            return `[cross] 房间${roomName}更改过道采集任务房间清单失败！请检查房间内是否已经存在该任务！`
        },
        /* 删除某个具体power任务 */
        delpower(roomName:string,disRoom:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Creep'])
            {
                if (i.name == 'power采集' && i.Data.room == disRoom)
                {
                    if(thisRoom.DeleteMission(i.id))
                        return `[cross] 删除${roomName}-->${disRoom}的power采集任务成功！`
                    else
                        return `[cross] 删除${roomName}-->${disRoom}的power采集任务失败！`
                }
            }
            return `[cross] 未找到${roomName}-->${disRoom}的power采集任务`
        },
        // 输出过道详细信息
        show(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            var str = ''
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    str += `[cross] 房间${roomName}的过道采集任务详情配置如下：\n`
                    str += `     房间：${i.Data.relateRooms}\n`
                    str += `     power:${i.Data.power}\n`
                    str += `     deposit:${i.Data.deposit}\n`
                    str += `     目前存在如下任务：`
                    /* 寻找目前存在的过道采集任务 */
                    for (var j of thisRoom.memory.Misson['Creep'])
                    {
                        if (j.name == 'power采集') str += `power采集任务 ${roomName}-->${j.Data.room}  state:${j.Data.state}\n`
                        if (j.name == 'deposit采集') str += `deposit采集任务 ${roomName}-->${j.Data.room}  state:${j.Data.state}\n`
                    }
                    return str
                }
            }
            return `[cross] 房间${roomName}展示过道采集任务失败！请检查房间内是否已经存在该任务！`
        },
        /* 取消过道采集开关 */
        cancel(roomName:string):string{
            var thisRoom = Game.rooms[roomName]
            if (!thisRoom) return `[cross] 不存在房间${roomName}`
            for (var i of thisRoom.memory.Misson['Room'])
            {
                if (i.name == '过道采集')
                {
                    thisRoom.DeleteMission(i.id)
                    return `[cross] 房间${roomName}已经取消过道采集任务！`
                }
            }
            return `[cross] 房间${roomName}取消过道采集任务失败！请检查房间内是否已经存在该任务！`
        },
    },

    /* 工厂行为 */
    factory:{
        // 启动、关闭工厂
        switch(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            if (!myRoom.memory.switch.StopFactory) myRoom.memory.switch.StopFactory = true
            else myRoom.memory.switch.StopFactory = false
            if (myRoom.memory.switch.StopFactory) return `[factory] 房间${roomName}的工厂加工已经停止!`
            return `[factory] 房间${roomName}的工厂加工已经启动!`
        },
        // 输出工厂状态
        show(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            if (myRoom.memory.switch.StopFactory) return `[factory] 房间${roomName}工厂停工中`
            let result = `[factory] 房间${roomName}的工厂加工信息如下:\n`
            result += `工厂等级:${myRoom.memory.productData.level}\n`
            result += `工厂状态:${myRoom.memory.productData.state}\n`
            result += `商品解压:\n`
            for (var i in myRoom.memory.productData.unzip)
            {
                result += `\t${i}:${myRoom.memory.productData.unzip[i].num}\n`
            }
            result += `基本加工资源列表:\n`
            for (var i in myRoom.memory.productData.baseList)
            {
                result += `\t${i}:${myRoom.memory.productData.baseList[i].num}\n`
            }
            result += `流水线商品:${myRoom.memory.productData.flowCom}\n`
            if (myRoom.memory.productData.producing)
            result += `正在合成的资源:${myRoom.memory.productData.producing.com?myRoom.memory.productData.producing.com:'无'},数量：${myRoom.memory.productData.producing.num?myRoom.memory.productData.producing.num:'无'}\n`
            return result
        },
        // 初始化等级
        level(roomName:string):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            if (!Game.powerCreeps[`${myRoom.name}/queen/${Game.shard.name}`]) return `[factory] ${myRoom.name}此房间无pc请先孵化pc!`
            myRoom.enhance_factory();
            return `[factory] 房间${roomName}发布pc确定工厂等级任务成功!`
        },
        // 添加工厂基本物资合成清单
        add(roomName:string,cType:CommodityConstant,num:number):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            return factory_.add(cType,num)
        },
        // 删除工厂基本物资合成
        remove(roomName:string,cType:CommodityConstant):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            return factory_.remove(cType)
        },
        // 设置工厂流水线生产物资
        set(roomName:string,cType:CommodityConstant):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            return factory_.set(cType)
        },
        // 取消工厂流水线生产物资
        del(roomName:string,cType:CommodityConstant):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            return factory_.del(cType)
        },
        unzip(roomName:string,cType:CommodityConstant,num:number):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            if (myRoom.memory.productData.unzip[cType]) return Colorful(`[factory] 房间${roomName}已经存在${cType}的解压缩任务!`,'red',true) 
            myRoom.memory.productData.unzip[cType] = {num:num}
            return Colorful(`[factory] 房间${roomName}已经设置${cType}的解压缩任务，数量:${num}!`,'blue',true) 
        },
        Cunzip(roomName:string,cType:CommodityConstant):string{
            var myRoom = Game.rooms[roomName]
            if (!myRoom) return `[factory] 未找到房间${roomName},请确认房间!`
            let factory_ = Game.getObjectById(myRoom.memory.StructureIdData.FactoryId) as StructureFactory
            if (!factory_) return Colorful(`[factory] 未找到房间${roomName}的工厂!`,'red',true)
            if (!myRoom.memory.productData.unzip[cType]) return Colorful(`[factory] 房间${roomName}不存在${cType}的解压缩任务!`,'red',true) 
            delete myRoom.memory.productData.unzip[cType]
            return Colorful(`[factory] 房间${roomName} ${cType}的解压缩任务已经删除!`,'blue',true) 
        }
    },

    pixel():string{
        Memory.StopPixel = !Memory.StopPixel
        return `[pixel] 自动搓像素改为${!Memory.StopPixel}`
    }
}