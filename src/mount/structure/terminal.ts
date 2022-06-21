import { avePrice, haveOrder, highestPrice } from "@/module/fun/funtion"
import { Colorful, compare, isInArray } from "@/utils"

// terminal 扩展
export default class terminalExtension extends StructureTerminal {
    public ManageMission():void{
        if (this.room.MissionNum('Creep','急速冲级') > 0) return   // 急速冲级状态下停止terminal功能
        var allmyTask = []
        for (var task of this.room.memory.Misson['Structure'])
        {
            if (!task.structure) continue
            if (isInArray(task.structure,this.id))
            {
                allmyTask.push(task)
            }
        }
        let thisTask = null
        /* 按照优先级排序 */
        if (allmyTask.length >= 1)
            allmyTask.sort(compare('level'))
        thisTask = allmyTask[0]
        if (!thisTask || !isInArray(['资源传送'],thisTask.name))
        {
            /* terminal默认操作*/
            this.ResourceBalance()  // 资源平衡
            this.ResourceMarket()   // 资源买卖
            if (!thisTask) return
        }
        if (thisTask.delayTick < 99995)
            thisTask.processing = true
        switch (thisTask.name){
            case "资源传送":{this.ResourceSend(thisTask);break}
            case "资源购买":{this.ResourceDeal(thisTask);break}
        }
    }

    /**
     * 资源平衡函数,用于平衡房间中资源数量以及资源在terminal和storage中的分布,尤其是能量和原矿
     */
    public ResourceBalance():void{
        this.RsourceMemory()
        // terminal资源平衡
        if ((Game.time - global.Gtime[this.room.name]) % 7) return
        let storage_ = this.room.storage
        if (!storage_) {return}
        for (var i in this.store)
        {
            if (this.room.RoleMissionNum('manage','物流运输') >= 1) return
            let num = this.store[i]     // 数量
            if (!this.room.memory.TerminalData[i] || !this.room.memory.TerminalData[i].num)  // terminalData里没有该数据
            {
                if (storage_.store.getFreeCapacity() < 40000) continue
                let thisTask = this.room.public_Carry({'manage':{num:1,bind:[]}},20,this.room.name,this.pos.x,this.pos.y,this.room.name,storage_.pos.x,storage_.pos.y,i as ResourceConstant,num)
                this.room.AddMission(thisTask)
            }
            else
            {
                if (num > this.room.memory.TerminalData[i].num)
                {
                    if (storage_.store.getFreeCapacity() < 40000) continue
                    let thisTask = this.room.public_Carry({'manage':{num:1,bind:[]}},20,this.room.name,this.pos.x,this.pos.y,this.room.name,storage_.pos.x,storage_.pos.y,i as ResourceConstant,num-this.room.memory.TerminalData[i].num)
                    this.room.AddMission(thisTask)
                }
            }
        }
        for (var i in this.room.memory.TerminalData){
            if (this.room.RoleMissionNum('manage','物流运输') >= 1) return
            if (!this.room.memory.TerminalData[i].fill) continue
            let num = this.store.getUsedCapacity(i as ResourceConstant)
            if (num < this.room.memory.TerminalData[i].num)
            {
                if (this.store.getFreeCapacity() < 5000) continue
                if (i == 'energy')
                {
                    if (storage_.store.getUsedCapacity('energy') <= 20000) continue
                }
                else
                {
                    if ( storage_.store.getUsedCapacity(i as ResourceConstant) <= 0 && storage_.store.getUsedCapacity(i as ResourceConstant) + num < this.room.memory.TerminalData[i].num) continue
                }
                let thisTask = this.room.public_Carry({'manage':{num:1,bind:[]}},20,this.room.name,storage_.pos.x,storage_.pos.y,this.room.name,this.pos.x,this.pos.y,i as ResourceConstant,this.room.memory.TerminalData[i].num - num > 0?this.room.memory.TerminalData[i].num - num:100)
                this.room.AddMission(thisTask)
            }
        }

    }   

    /**
     * 资源记忆更新函数
     * */
    public RsourceMemory():void{
        /* terminal自身资源管理 */
        var terminalData = this.room.memory.TerminalData
        for (var i in terminalData)
        {
            /* 数量小于0就删除数据，节省memory */
            if (terminalData[i].num <= 0) delete terminalData[i]
        }
    }

    /**
     * 资源买卖函数 只买能量、挂单、卖 (不deal买资源)
     */
    public ResourceMarket():void{
        if ((Game.time - global.Gtime[this.room.name]) % 27) return
        // 能量自动购买区 [与MarketData无关] storage内能量小于200000时自动购买
        /* 清理过期订单 */
        if (Object.keys(Game.market.orders).length > 80)
        {
            for (let j in Game.market.orders)
            {
                let order = Game.market.getOrderById(j);
                if (!order.remainingAmount) Game.market.cancelOrder(j);
            }
        }
        let storage_ = this.room.storage
        if (!storage_) {return}
        // 能量购买函数
        let storeNum = storage_.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy')
        // 能量一般少的情况下，下平均价格订单购买能量
        if (storeNum < 250000 && storeNum  >= 100000 )
        {
            if (!Game.cpu.generatePixel)    // 私服
            {
                let list = Game.market.getAllOrders({type: 'sell', resourceType: 'energy'});
                let newOrderList = list.sort(compare('price'))
                if (newOrderList[0])
                {
                    Game.market.deal(newOrderList[0].id,newOrderList[0].amount<50000?newOrderList[0].amount:50000,this.room.name)
                }
                return
            }
            let ave = avePrice('energy',1)
            let thisprice_ = ave * 1.1
            if (!haveOrder(this.room.name,'energy','buy',thisprice_,-0.2))
            {
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: thisprice_ + 0.001,
                    totalAmount: 100000,
                    roomName: this.room.name   
                });
                if (result != OK){console.log("创建能量订单出错,房间",this.room.name)}
                console.log(Colorful(`[普通]房间${this.room.name}创建energy订单,价格:${thisprice_ + 0.001};数量:100000`,'green',true))
            }
        }
        // 能量极少的情况下，下市场合理范围内最高价格订单
        else if (storeNum < 100000)
        {
            if (!Game.cpu.generatePixel)    // 私服
            {
                let list = Game.market.getAllOrders({type: 'sell', resourceType: 'energy'});
                let newOrderList = list.sort(compare('price'))
                if (newOrderList[0])
                {
                    Game.market.deal(newOrderList[0].id,newOrderList[0].amount<50000?newOrderList[0].amount:50000,this.room.name)
                }
                return
            }
            let ave = avePrice('energy',2)
            let highest = highestPrice('energy','buy',ave+6)
            if (!haveOrder(this.room.name,'energy','buy',highest,-0.1))
            {
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: highest + 0.001,
                    totalAmount: 200000,
                    roomName: this.room.name   
                });
                if (result != OK){console.log("创建能量订单出错,房间",this.room.name)}
                console.log(Colorful(`[紧急]房间${this.room.name}创建energy订单,价格:${highest + 0.01};数量:100000`,'green',true))
            }
        }
        /* 仓库资源过于饱和就卖掉能量 超出则不卖(考虑到pc技能间隔) */
        if (storage_.store.getFreeCapacity() < 50000 && storage_.store.getCapacity() >= storage_.store.getUsedCapacity())
        {
            /* 如果仓库饱和(小于200k空间)，而且仓库能量超过400K,就卖能量 */
            if (storage_.store.getUsedCapacity('energy') > 350000)
            {
                if (!this.room.memory.market) this.room.memory.market = {}
                if (!this.room.memory.market['deal']) this.room.memory.market['deal'] = []
                var bR = true
                for (var od of this.room.memory.market['deal'])
                {
                    if (od.rType == 'energy')
                    bR = false
                }
                if (bR){
                    /* 下达自动deal的任务 */
                    this.room.memory.market['deal'].push({rType:'energy',num:100000})
                }
            }
        }
        // 其他类型资源的交易 【考虑到已经有了资源调度模块的存在，这里主要是卖】
        LoopA:
        for (var t in this.room.memory.market)
        {
            // deal类型
            if (t == 'deal')
            {
                if (this.store.getUsedCapacity('energy') < 50000) continue LoopA // terminal空闲资源过少便不会继续
                LoopB:
                for (var i of this.room.memory.market['deal'])
                {
                    if (i.rType != 'energy')
                    {
                        this.room.memory.TerminalData[i.rType] = {num:i.unit?i.unit:5000,fill:true}
                    }
                    /* 数量少了就删除 */
                    if (i.num <= 0)
                    {
                        if (i.rType != 'energy')
                        delete this.room.memory.TerminalData[i.rType]
                        var index = this.room.memory.market['deal'].indexOf(i)
                        this.room.memory.market['deal'].splice(index,1)
                        continue LoopB
                    }
                    if (this.cooldown) continue LoopA   // 冷却模式下进行不了其他deal了
                    let a = 100,b=50000;
                    (COMMODITIES[i.rType] && COMMODITIES[i.rType].level)?a=0:a
                    let price = 0.05
                    if (COMMODITIES[i.rType] && COMMODITIES[i.rType].level) price = 10000
                    if (i.price) price = i.price
                    var orders = Game.market.getAllOrders(order => order.resourceType == i.rType &&
                        price <= order.price && order.type == ORDER_BUY && order.amount > a && order.amount <= b)
                    if (orders.length <= 0) continue LoopB
                    /* 按价格从低到高排列 */
                    var newOrderList = orders.sort(compare('price'))
                    // 倒数第二 没有就倒数第一
                    var thisDealOrder = newOrderList.length > 1?newOrderList[newOrderList.length - 2]:newOrderList[newOrderList.length - 1]
                    if (!thisDealOrder) continue LoopB
                    if (storage_.store.getUsedCapacity(i.rType) <= 0 && this.room.RoleMissionNum('manage','物流运输') <= 0)
                    {
                        if (i.rType != 'energy')
                        delete this.room.memory.TerminalData[i.rType]
                        var index = this.room.memory.market['deal'].indexOf(i)
                        this.room.memory.market['deal'].splice(index,1)
                        continue LoopB
                    }
                    if (thisDealOrder.amount >= this.store.getUsedCapacity(i.rType))
                    {
                        if (i.num > this.store.getUsedCapacity(i.rType))
                        {
                            Game.market.deal(thisDealOrder.id,this.store.getUsedCapacity(i.rType),this.room.name)
                            i.num -= this.store.getUsedCapacity(i.rType)
                        }
                        else
                        {
                            Game.market.deal(thisDealOrder.id,i.num,this.room.name)
                            i.num = 0
                        }
                        break LoopA
                    }
                    else
                    {
                        if (i.num > thisDealOrder.amount)
                        {
                            Game.market.deal(thisDealOrder.id,thisDealOrder.amount,this.room.name)
                            i.num -= thisDealOrder.amount
                        }
                        else
                        {
                            Game.market.deal(thisDealOrder.id,i.num,this.room.name)
                            i.num = 0
                        }
                        break LoopA
                    }
                }
            }
            // order类型
            else if (t == 'order')
            {
                LoopC:
                for (var l of this.room.memory.market['order'])
                {
                    if (l.rType != 'energy')
                    {
                        this.room.memory.TerminalData[l.rType] = {num:l.unit?l.unit:5000,fill:true}
                    }
                    // 查询有无订单
                    if (!l.id)
                    {
                        let myOrder = haveOrder(this.room.name,l.rType,'sell')
                        if (!myOrder)
                        {
                            console.log(Colorful(`[market] 房间${this.room.name}-rType:${l.rType}创建订单!`,'yellow'))
                            // 没有就创建订单
                            let result = Game.market.createOrder({
                                type: ORDER_SELL,
                                resourceType:l.rType,
                                price: l.price,
                                totalAmount: l.num,
                                roomName: this.room.name   
                            });
                            if (result != OK) continue LoopC
                        }
                        LoopO:
                        for (let o in Game.market.orders)
                        {
                            let order = Game.market.getOrderById(o);
                            if (order.remainingAmount <=0) {Game.market.cancelOrder(o);continue LoopO;}
                            if (order.roomName == this.room.name && order.resourceType == l.rType && order.type == 'sell')
                            l.id = o
                        }
                        continue LoopC
                    }
                    else
                    {
                        let order = Game.market.getOrderById(l.id)
                        if (!order || !order.remainingAmount)   // 取消订单信息
                        {
                            if (l.rType != 'energy')
                            delete this.room.memory.TerminalData[l.rType]
                            console.log(Colorful(`[market] 房间${this.room.name}订单ID:${l.id},rType:${l.rType}的删除订单!`,'blue'))
                            var index = this.room.memory.market['order'].indexOf(l)
                            this.room.memory.market['order'].splice(index,1)
                            continue LoopC
                        }
                        // 价格
                        let price = order.price
                        let standprice = l.price
                        // 价格太低或太高都会改变订单价格
                        if (standprice <= price/3 || standprice >= price*3)
                        {
                            Game.market.changeOrderPrice(l.id,l.price)
                            console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`)
                        }
                        // 收到改变价格指令，也会改变订单价格
                        if (l.changePrice)
                        {
                            Game.market.changeOrderPrice(l.id,l.price)
                            console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`)
                            l.changePrice = false
                        }
                    }
                }
            }
        }
    }

    /**
     * 资源传送
     */
    public ResourceSend(task:MissionModel):void{
        if (this.cooldown && this.cooldown > 0) return
        if (!task.Data || !task.Data.disRoom)       // 任务数据有问题
        {
            this.room.DeleteMission(task.id)
            return
        }
        if (!task.state) task.state = 1     // 1状态下，搜集资源
        if (task.state == 1)
        {
            if (Game.time % 10) return  /* 每10tick监测一次 */
            if (task.Data.num <= 0 || task.Data.num == undefined) this.room.DeleteMission(task.id)
            if (this.room.RoleMissionNum('manage','物流运输') > 0) return // manage爬虫有任务时就不管
            // 路费
            var wastage = Game.market.calcTransactionCost(task.Data.num,this.room.name,task.Data.disRoom)
            /* 如果非能量资源且路费不够，发布资源搬运任务，优先寻找storage */
            var storage_ = this.room.storage
            if (!storage_)
            {
                this.room.DeleteMission(task.id)
                return
            }
            // terminal的剩余资源
            var remain = this.store.getFreeCapacity()
            /* 路费判断 */
            if (wastage > this.store.getUsedCapacity('energy'))
            {
                /* 只有在能量富裕的情况下才会允许进入下一阶段 */
                if (storage_ && (storage_.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy') - 5000) > wastage && remain > (wastage-this.store.getUsedCapacity('energy')))
                {
                    /* 下布搬运任务 */
                    var thisTask = this.room.public_Carry({'manage':{num:1,bind:[]}},40,this.room.name,storage_.pos.x,storage_.pos.y,this.room.name,this.pos.x,this.pos.y,'energy',wastage-this.store.getUsedCapacity('energy'))
                    this.room.AddMission(thisTask)
                    return
                }
                /* 条件不满足就自动删除任务 */
                this.room.DeleteMission(task.id)
                return
            }
            console.log('资源传送任务监控中: ###########################\n 房间:',this.room.name,'--->',task.Data.disRoom,' 运送资源：',task.Data.rType)
            console.log('路费:',Colorful(`${wastage}`,'yellow'),'energy  ','终端拥有能量:',Colorful(`${this.store.getUsedCapacity('energy')}`,'yellow'),'energy')
            /* 资源判断 */
            var cargoNum:number = task.Data.rType == 'energy'?this.store.getUsedCapacity(task.Data.rType)-wastage:this.store.getUsedCapacity(task.Data.rType)
            console.log('终端拥有资源量:',Colorful(`${cargoNum}`,'blue'),' 仓库拥有资源量:',storage_.store.getUsedCapacity(task.Data.rType),' 任务所需资源量:',task.Data.num)
            if (task.Data.num > cargoNum)
            {
                if (storage_ && (storage_.store.getUsedCapacity(task.Data.rType) + this.store.getUsedCapacity(task.Data.rType)) >= (task.Data.num - 1600) && remain > task.Data.num-cargoNum)
                {
                    /* 下布搬运任务 */
                    var thisTask = this.room.public_Carry({'manage':{num:1,bind:[]}},40,this.room.name,storage_.pos.x,storage_.pos.y,this.room.name,this.pos.x,this.pos.y,task.Data.rType,task.Data.num-cargoNum)
                    this.room.AddMission(thisTask)
                    return
                }
                /* 条件不满足就自动删除任务 */
                this.room.DeleteMission(task.id)
                return
            }
            /* 都满足条件了就进入状态2 */
            task.state = 2
        }
        else if (task.state == 2)
        {
            let result = this.send(task.Data.rType as ResourceConstant,task.Data.num,task.Data.disRoom as string)
            if (result == -6)   /* 能量不够就重新返回状态1 */
            {
                console.log(Colorful(`房间${this.room.name}发送资源${task.Data.rType}失败!`,'read',true))
                task.state = 1
                return
            }
            else if (result == OK)
            {
                /* 如果传送成功，就删除任务 */
                this.room.DeleteMission(task.id)
                return
            }
        }
    }

    /**
     * 资源购买 (deal)
     */
    public ResourceDeal(task:MissionModel):void{
        if (!Game.cpu.generatePixel) return     // 私服
        if((Game.time - global.Gtime[this.room.name] )% 10) return
        if (this.cooldown || this.store.getUsedCapacity('energy') < 45000) return
        if (!task.Data){this.room.DeleteMission(task.id);return}
        let money = Game.market.credits
        if (money <= 0 || task.Data.num > 50000){this.room.DeleteMission(task.id);return}
        let rType = task.Data.rType
        let num = task.Data.num
        var HistoryList = Game.market.getHistory(rType)
        let HistoryLength = HistoryList.length
        if (HistoryList.length < 3) {console.log(`资源${rType}的订单太少，无法购买!`);return}// 以防特殊情况
        var allNum:number = 0
        for (var iii = HistoryLength-3;iii<HistoryLength;iii++)
        {
            allNum += HistoryList[iii].avgPrice
        }
        var avePrice = allNum/3    // 平均价格 [近3天]
        // 获取该资源的平均价格
        var maxPrice = avePrice + (task.Data.range?task.Data.range:50 )  // 范围
        /* 在市场上寻找 */
        var orders = Game.market.getAllOrders(order => order.resourceType == rType &&
            order.type == ORDER_SELL && order.price <= maxPrice)
        if (orders.length <= 0) return
        /* 寻找价格最低的 */
        var newOrderList = orders.sort(compare('price'))
        for (var ii of newOrderList)
        {
            if (ii.price > maxPrice) return
            if (ii.amount >= num)
            {
                if (Game.market.deal(ii.id,num,this.room.name) == OK)
                {
                    this.room.DeleteMission(task.id)
                    return
                }
                else return
            }
            else
            {
                if(Game.market.deal(ii.id,ii.amount,this.room.name) == OK)
                task.Data.num -= ii.amount
                return
            }
        }
    }
}