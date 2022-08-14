import { avePrice, haveOrder, gethaveOrder, highestPrice } from "@/module/fun/funtion"
import { Colorful, compare, isInArray } from "@/utils"

// terminal 扩展
export default class terminalExtension extends StructureTerminal {
    public ManageMission(): void {
        if (this.room.MissionNum('Creep', '急速冲级') > 0) return   // 急速冲级状态下停止terminal功能
        if (this.room.controller.level < 6) return //判断controller等级大于6才能运行terminal
        var allmyTask = []
        for (var task of this.room.memory.Misson['Structure']) {
            if (!task.structure) continue
            if (isInArray(task.structure, this.id)) {
                allmyTask.push(task)
            }
        }
        let thisTask = null
        /* 按照优先级排序 */
        if (allmyTask.length >= 1)
            allmyTask.sort(compare('level'))
        thisTask = allmyTask[0]
        if (!thisTask || !isInArray(['资源传送'], thisTask.name)) {
            /* terminal默认操作*/
            this.ResourceBalance()  // 资源平衡
            this.ModifypriceMarket();/*价格调整工具*/
            this.ResourceMarket()   // 资源买卖
            if (!thisTask) return
        }
        if (thisTask.delayTick < 99995)
            thisTask.processing = true
        switch (thisTask.name) {
            case "资源传送": { this.ResourceSend(thisTask); break }
            case "资源购买": { this.ResourceDeal(thisTask); break }
        }
    }

    /**
     * 资源平衡函数,用于平衡房间中资源数量以及资源在terminal和storage中的分布,尤其是能量和原矿
     */
    public ResourceBalance(): void {
        this.RsourceMemory()
        // terminal资源平衡
        if ((Game.time - global.Gtime[this.room.name]) % 13) return
        let storage_ = this.room.storage as StructureStorage
        if (!this.room.storage) { console.log(`找不到global.Stru['${this.room.name}']['storage]!`); return }
        for (var i in this.store) {
            if (this.room.RoleMissionNum('manage', '物流运输') >= 1) return
            let num = this.store[i]     // 数量
            if (!this.room.memory.TerminalData[i] || !this.room.memory.TerminalData[i].num)  // terminalData里没有该数据
            {
                if (storage_.store.getFreeCapacity() < 40000) continue
                let thisTask = this.room.public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, this.pos.x, this.pos.y, this.room.name, storage_.pos.x, storage_.pos.y, i as ResourceConstant, num)
                this.room.AddMission(thisTask)
            }
            else {
                if (num > this.room.memory.TerminalData[i].num) {
                    if (storage_.store.getFreeCapacity() < 40000) continue
                    let thisTask = this.room.public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, this.pos.x, this.pos.y, this.room.name, storage_.pos.x, storage_.pos.y, i as ResourceConstant, num - this.room.memory.TerminalData[i].num)
                    this.room.AddMission(thisTask)
                }
            }
        }
        for (var i in this.room.memory.TerminalData) {
            if (this.room.RoleMissionNum('manage', '物流运输') >= 1) return
            if (!this.room.memory.TerminalData[i].fill) continue
            let num = this.store.getUsedCapacity(i as ResourceConstant)
            if (num < this.room.memory.TerminalData[i].num) {
                if (this.store.getFreeCapacity() < 5000) continue
                if (i == 'energy') {
                    if (storage_.store.getUsedCapacity('energy') <= 20000) continue
                }
                else {
                    if (storage_.store.getUsedCapacity(i as ResourceConstant) <= 0 && storage_.store.getUsedCapacity(i as ResourceConstant) + num < this.room.memory.TerminalData[i].num) continue
                }
                let thisTask = this.room.public_Carry({ 'manage': { num: 1, bind: [] } }, 20, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, i as ResourceConstant, this.room.memory.TerminalData[i].num - num > 0 ? this.room.memory.TerminalData[i].num - num : 100)
                this.room.AddMission(thisTask)
            }
        }

    }

    /**
     * 资源记忆更新函数
     * */
    public RsourceMemory(): void {
        /* terminal自身资源管理 */
        var terminalData = this.room.memory.TerminalData
        for (var i in terminalData) {
            /* 数量小于0就删除数据，节省memory */
            if (terminalData[i].num <= 0) delete terminalData[i]
        }
    }

    /**
     * 负责各种情况下能量不足的市场调度操作
     */
    public EnergyreplenishMarket(): void {

        // 确定当前的能量数量信息
        let storeNum = this.room.storage.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy')
        let Demandlevel = 0;
        let addnumber = 100000;
        if (this.store.getFreeCapacity('energy') < addnumber) {
            addnumber = this.store.getFreeCapacity('energy')
        }

        /*急需进行能量的补充操作*/
        if (storeNum < 100000) { Demandlevel = 1;/*紧急*/ }
        else if (storeNum < 250000) { Demandlevel = 2;/*普通*/ }
        if (Demandlevel > 0) {
            if (!Game.cpu.generatePixel) {
                let dispatchTask: RDData = {
                    sourceRoom: this.room.name,
                    rType: 'energy',
                    num: 50000,
                    delayTick: 300,
                    conditionTick: 20,
                    buy: true,
                    mtype: "deal"
                }
                Memory.ResourceDispatchData.push(dispatchTask)
                // Game.market.deal('62643960d8dac7fd5f21810b', 100000, this.room.name);
                return;
            } else {
                if (Game.market.credits) {
                    if (Game.market.credits < 1000000) return
                }
            }
            /*检索房间内的所有订单，同时进行匹配,*/
            /*取出当前类型的基准价格*/
            let price_ = 0;
            if (this.room.memory.MarketPrice.Dynamicprice) {
                switch (Demandlevel) {
                    case 1:
                        price_ = this.room.memory.MarketPrice.buy.high;
                        break;
                    case 2:
                        price_ = this.room.memory.MarketPrice.buy.low;
                        break;
                }
            }
            if (price_ <= 0) {
                price_ = avePrice('energy', 1) - 0.5;
            }
            price_ = Math.floor(price_ * 1000) / 1000
            /*判定是否有对应价格区间的订单信息*/
            let order_ = gethaveOrder(this.room.name, 'energy', 'buy', price_, -0.5);
            // console.log(this.room.name, JSON.stringify(order_), price_, price_ - 0.5)
            // return;
            if (!order_) {
                // console.log(this.room.name, '发起动态报价')
                let result = Game.market.createOrder({
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: price_,
                    totalAmount: addnumber,
                    roomName: this.room.name
                });
                if (result != OK) {
                    console.log("创建能量订单出错,房间", this.room.name)
                    return
                }
                if (this.room.memory.MarketPrice.order_list.length < 1) { this.room.memory.MarketPrice.order_list = [] }
                this.room.memory.MarketPrice.order_list.push({
                    _time: Game.time,/*后续用于基准校准操作*/
                    Demandlevel: Demandlevel,
                    type: ORDER_BUY,
                    resourceType: 'energy',
                    price: price_,
                    totalAmount: addnumber,
                    roomName: this.room.name,
                    ignore: false
                })
                switch (Demandlevel) {
                    case 1:
                        if (this.room.memory.MarketPrice.buy.high == 0) {
                            this.room.memory.MarketPrice.buy.high = price_
                        }
                        break;
                    case 2:
                        if (this.room.memory.MarketPrice.buy.low == 0) {
                            this.room.memory.MarketPrice.buy.low = price_
                        }
                        break;
                }
                console.log(Colorful(`[补充]房间${this.room.name}创建energy订单,价格:${price_};数量:${addnumber}`, 'green', true))
            }
        }
    }
    public ModifypriceMarket(): void {
        if ((Game.time - global.Gtime[this.room.name]) % 11) return
        /** 
         * 存在订单进行订单检查
         * [普通] 300 tick 减少报价  600 tick 自动涨价
         * [紧急] 200 tick 减少报价  400 tick 自动涨价
         * 订单如果已经完结则自动根据当前价格进行标记下次的报价，本模块只处理实时涨价操作，不处理实时降价操作
         * 操作涨价的订单，需要进行订单重新备份进程，需要其他模块介入帮助进行过期订单的清理操作
         * */

        if (Object.keys(global.Marketorder).length < 1) {
            /*需要对已有的订单进行初始化操作*/
            for (let j in Game.market.orders) {
                let order = Game.market.orders[j] as any;
                if (order.roomName) {
                    if (!global.Marketorder[order.roomName]) { global.Marketorder[order.roomName] = [] }
                    global.Marketorder[order.roomName][order.id] = order
                }
            }
        }
        if (this.room.memory.MarketPrice.order_list.length > 0) {
            for (let j in this.room.memory.MarketPrice.order_list) {
                // console.log(this.room.name, '订单进入检测')
                let order_data = this.room.memory.MarketPrice.order_list[j];
                if (!order_data.order_id) {
                    /*在已有的订单中进行检索操作*/
                    for (let o_i in global.Marketorder[this.room.name]) {
                        let o_d = global.Marketorder[this.room.name][o_i] as any
                        if (order_data._time >= o_d.created && order_data.resourceType == o_d.resourceType && order_data.price == o_d.price && order_data.totalAmount == o_d.totalAmount) {
                            this.room.memory.MarketPrice.order_list[j].order_id = o_d.id; /*寻找到有效订单信息*/
                            this.room.memory.MarketPrice.order_list[j]._time = o_d.created/*复制一级定价参数*/
                            order_data = this.room.memory.MarketPrice.order_list[j];/*重新进行赋值*/
                            break;
                        }
                    }
                }
                /**
                 * 开始进行报价检测，根据类型来判定对应的tick间隔信息
                */
                let up_tick = 500;
                let drop_tick = 300;
                switch (order_data.Demandlevel) {
                    case 1:
                        up_tick = 100;
                        drop_tick = 40;
                        break;
                    case 2:
                        up_tick = 150;
                        drop_tick = 60;
                        break;
                }
                if (!global.Marketorder[this.room.name]) { break; }
                let Gatorder = global.Marketorder[this.room.name][order_data.order_id] as any;
                if (!Gatorder) {
                    /*错误的订单信息，移除当前信息*/
                    console.log(JSON.stringify(global.Marketorder[this.room.name]))
                    console.log(JSON.stringify(this.room.memory.MarketPrice.order_list[j]))
                    console.log(Colorful(`[订单异常]房间${this.room.name}订单异常,异常完结`, 'red', true))
                    delete this.room.memory.MarketPrice.order_list[j];
                    continue;/*当前订单解除*/
                }
                // console.log(JSON.stringify(Gatorder))
                /*检测订单现在的状态信息*/
                let order_time = Game.time - order_data._time;
                if (Gatorder.remainingAmount <= 0) {
                    // console.log(this.room.name, '订单已完结', order_time, drop_tick)
                    /*检查订单是否已经完结，如果完结进行降价检测操作*/
                    let over_price = order_data.price;
                    if (order_time < drop_tick) {
                        // console.log(this.room.name, '订单触发调价')
                        if (!order_data.ignore) {
                            /*非忽略订单。执行价格更新*/
                            let reduceprice = 0.05;
                            if (order_time <= drop_tick / 3) {
                                reduceprice = 0.1
                            } else if (order_time <= drop_tick / 2) {
                                reduceprice = 0.075
                            }
                            order_data.price = (Number(order_data.price) - reduceprice).toFixed(3).toString();
                            console.log(Colorful(`[调价下跌]房间${this.room.name}订单已完结,调价:${order_data.price}已存储`, 'gold', true))
                            switch (order_data.Demandlevel) {
                                case 1:
                                    if (this.room.memory.MarketPrice.buy.high > order_data.price) {
                                        this.room.memory.MarketPrice.buy.high = order_data.price;
                                    }
                                    break;
                                case 2:
                                    if (this.room.memory.MarketPrice.buy.low > order_data.price) {
                                        this.room.memory.MarketPrice.buy.low = order_data.price;
                                    }
                                    break;
                            }
                        }
                    }
                    let end_time = Game.time - Gatorder.created
                    console.log(Colorful(`[订单完结]房间${this.room.name}订单已完结,价格:${over_price},耗时${end_time}`, 'green', true))
                    /*执行降价操作，同时当前订单完结以及关闭*/
                    Game.market.cancelOrder(order_data.order_id);
                    delete this.room.memory.MarketPrice.order_list[j];
                } else {
                    /*订单当前可用检测是否符合操作要求*/
                    if (order_data.ignore && Gatorder.active) {
                        /*重新标记订单有效性*/
                        this.room.memory.MarketPrice.order_list[j].ignore = true;
                        this.room.memory.MarketPrice.order_list[j]._time = Game.time
                        order_data = this.room.memory.MarketPrice.order_list[j];/*重新进行赋值*/
                    }
                    if (!order_data.ignore && !Gatorder.active) {
                        /*忽略当前订单信息*/
                        this.room.memory.MarketPrice.order_list[j].ignore = false;
                        order_data = this.room.memory.MarketPrice.order_list[j];/*重新进行赋值*/
                    }
                    /*进行正常的检测序列*/
                    if (order_time > up_tick) {
                        /*超时额定的间隔-进行涨价处理*/
                        let reduceprice = 0.05;
                        let Salesmargin = (Number(Gatorder.remainingAmount) / Number(order_data.totalAmount))
                        order_data.price = (Number(order_data.price) + reduceprice * Salesmargin).toFixed(3);
                        Game.market.changeOrderPrice(order_data.order_id, order_data.price)/*订单进行价格更新*/
                        this.room.memory.MarketPrice.order_list[j]._time = Game.time - drop_tick/*涨价后价格重新赋值-这个价格被采纳将不会触发降价*/
                        this.room.memory.MarketPrice.order_list[j].price = order_data.price /*价格赋值*/

                        console.log(Colorful(`[调价上涨]房间${this.room.name}调整energy,订单${order_data.order_id},价格:${order_data.price};`, 'yellow', true))
                        switch (order_data.Demandlevel) {
                            case 1:
                                if (this.room.memory.MarketPrice.buy.high < order_data.price) {
                                    this.room.memory.MarketPrice.buy.high = order_data.price;
                                }
                                break;
                            case 2:
                                if (this.room.memory.MarketPrice.buy.low < order_data.price) {
                                    this.room.memory.MarketPrice.buy.low = order_data.price;
                                }
                                break;
                        }
                    }
                }
            }
        }
        // if (this.room.memory.MarketPrice.order_list.length < 1) {
        //     /* 没有标记订单的情况下 清理过期订单 */
        //     for (let j in Game.market.orders) {
        //         let order = Game.market.getOrderById(j);
        //         if (!order.remainingAmount) Game.market.cancelOrder(j);
        //     }
        //     return
        // }
        this.room.memory.MarketPrice.order_list = this.room.memory.MarketPrice.order_list.filter(n => n)
    }
    /**
     * 资源买卖订单价格自助排序
    */
    public ResourceMarketdeal(market_deal, toll: number = 1): { id, amount, price } {
        var orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: market_deal.rType })
        let a = 100, b = 50000;
        (COMMODITIES[market_deal.rType] && COMMODITIES[market_deal.rType].level) ? a = 0 : a
        let price = 0.05
        if (COMMODITIES[market_deal.rType] && COMMODITIES[market_deal.rType].level) price = 10000
        if (market_deal.price) price = market_deal.price
        let order_: any = [];
        for (let orders_data of orders) {
            if (orders_data.price < market_deal.price) continue;/*价格不满足*/
            if (orders_data.amount < a) continue;/*订单数量过少*/
            let cost = Game.market.calcTransactionCost(1000, orders_data.roomName, this.room.name);
            if (cost / 1000 > toll) continue;/*运费过高*/
            let energy_cr = avePrice('energy', 1)
            order_.push({
                id: orders_data.id,
                amount: orders_data.amount,
                price: orders_data.price - energy_cr * (cost / 1000)
            })
        }
        if (order_.length > 0) {
            /*存在有效订单进行排序操作*/
            var newOrderList = order_.sort(compare('price'))
            let OrderData = newOrderList[newOrderList.length - 1];
            // console.log(JSON.stringify(OrderData))
            return OrderData;
        }
        return null
        // var orders = Game.market.getAllOrders(order => order.resourceType == i.rType &&
        //     price <= order.price && order.type == ORDER_BUY && order.amount > a && order.amount <= b)
    }

    /**
     * 资源买卖函数 只买能量、挂单、卖 (不deal买资源)
     */
    public ResourceMarket(): void {
        if ((Game.time - global.Gtime[this.room.name]) % 29) return
        // 能量自动购买区 [与MarketData无关] storage内能量小于200000时自动购买
        /* 清理过期订单 */
        // if (Object.keys(Game.market.orders).length > 80) {
        //     for (let j in Game.market.orders) {
        //         let order = Game.market.getOrderById(j);
        //         if (!order.remainingAmount) Game.market.cancelOrder(j);
        //     }
        // }
        if (!this.room.storage) { console.log(`['${this.room.name}]不存在storage!`); return }
        let storage_ = this.room.storage
        this.EnergyreplenishMarket();/*动态报价工具*/
        /* 仓库资源过于饱和就卖掉能量 超出则不卖(考虑到pc技能间隔) */
        if (storage_.store.getFreeCapacity() < 50000 && storage_.store.getCapacity() >= storage_.store.getUsedCapacity() && this.room.controller.level >= 8) {
            /* 如果仓库饱和(小于200k空间)，而且仓库能量超过400K,就卖能量 */
            if (storage_.store.getUsedCapacity('energy') > 350000) {
                if (!this.room.memory.market) this.room.memory.market = {}
                if (!this.room.memory.market['deal']) this.room.memory.market['deal'] = []
                var bR = true
                for (var od of this.room.memory.market['deal']) {
                    if (od.rType == 'energy')
                        bR = false
                }
                if (bR) {
                    /* 下达自动deal的任务 */
                    this.room.memory.market['deal'].push({ rType: 'energy', num: 100000, mTyep: 'sell' })
                }
            }
        }
        // 其他类型资源的交易 【考虑到已经有了资源调度模块的存在，这里主要是卖】

        for (var t in this.room.memory.market) {
            // deal类型
            if (t == 'deal') {
                if (this.cooldown) continue    // 冷却模式下进行不了其他deal了
                if (this.store.getUsedCapacity('energy') < 50000) continue  // terminal空闲资源过少便不会继续
                for (var i of this.room.memory.market['deal']) {
                    if (i.mTyep == 'buy') { continue/*deal资源购买不在此处处理*/ }
                    if (i.rType != 'energy') {
                        this.room.memory.TerminalData[i.rType] = { num: i.unit ? i.unit : 5000, fill: true }
                    }
                    if (this.store.getUsedCapacity(i.rType) < 100 && i.num >= 100) continue // terminal空闲资源过少便不会继续
                    if (storage_.store.getUsedCapacity(i.rType) <= 0 && this.room.RoleMissionNum('manage', '物流运输') <= 0) {
                        if (i.rType != 'energy') delete this.room.memory.TerminalData[i.rType]
                        var index = this.room.memory.market['deal'].indexOf(i)
                        this.room.memory.market['deal'].splice(index, 1)
                        continue
                    }
                    /* 数量少了就删除 */
                    if (i.num <= 0) {
                        if (i.rType != 'energy')
                            delete this.room.memory.TerminalData[i.rType]
                        var index = this.room.memory.market['deal'].indexOf(i)
                        this.room.memory.market['deal'].splice(index, 1)
                        continue
                    }
                    let Marketdeal = this.ResourceMarketdeal(i);
                    if (!Marketdeal) continue;
                    let _market_x = 1;
                    if (i.rType == 'energy') {
                        _market_x = 0.5
                    }
                    let _mex_market_number = Math.trunc(this.store.getUsedCapacity(i.rType) * _market_x)
                    if (Marketdeal.amount >= _mex_market_number) {
                        let _market_state = Game.market.deal(Marketdeal.id, _mex_market_number, this.room.name)
                        i.num -= _mex_market_number
                        break
                    }
                    else {
                        let _market_state = Game.market.deal(Marketdeal.id, Marketdeal.amount, this.room.name)
                        i.num -= Marketdeal.amount
                        break
                    }
                }
            }
            // order类型
            else if (t == 'order') {
                for (var l of this.room.memory.market['order']) {
                    if (!l.mTyep) { continue/*无方向定义订单终止*/ }
                    if (l.rType != 'energy' && l.mTyep == 'sell') {
                        this.room.memory.TerminalData[l.rType] = { num: l.unit ? l.unit : 5000, fill: true }
                    }
                    // 查询有无订单
                    if (!l.id) {
                        let myOrder = haveOrder(this.room.name, l.rType, l.mTyep as 'sell' | 'buy')
                        if (!myOrder) {
                            console.log(Colorful(`[market] 房间${this.room.name}-rType:${l.rType}创建订单!`, 'yellow'))
                            // 没有就创建订单
                            var price = 0;
                            if (l.price) {
                                price = l.price;
                            } else {
                                price = avePrice(l.rType, 1);
                            }
                            // let price_ave = avePrice(l.rType, 1)
                            let result = Game.market.createOrder({
                                type: l.mTyep as 'sell' || 'buy',
                                resourceType: l.rType,
                                price: price,
                                totalAmount: l.unit ? l.unit : 5000,
                                roomName: this.room.name
                            });
                            // console.log(result)
                            switch (result) {
                                case OK:
                                    l.num -= l.unit ? l.unit : 5000;
                                    break;
                                default:
                                    continue
                                    break;
                            }
                        }
                        for (let o in Game.market.orders) {
                            let order = Game.market.getOrderById(o);
                            if (order.roomName == this.room.name && order.resourceType == l.rType && order.type == l.mTyep)
                                l.id = o
                        }
                        continue
                    }
                    else {
                        let order = Game.market.getOrderById(l.id)
                        if (((!order || !order.remainingAmount) && l.num < 1) || !order)   // 取消订单信息
                        {
                            if (l.rType != 'energy')
                                delete this.room.memory.TerminalData[l.rType]
                            console.log(Colorful(`[market] 房间${this.room.name}订单ID:${l.id},rType:${l.rType}的删除订单!`, 'blue'))
                            var index = this.room.memory.market['order'].indexOf(l)
                            this.room.memory.market['order'].splice(index, 1)
                            Game.market.cancelOrder(l.id)
                            continue
                        }
                        let _add_number = l.unit ? l.unit : 5000;
                        if (_add_number > l.num) {
                            _add_number = l.num
                        }
                        if (order && (order.remainingAmount < _add_number) && l.num > 0) {
                            let add_order_number = _add_number;
                            if (order.remainingAmount) {
                                add_order_number = _add_number - order.remainingAmount;
                            }
                            /*操作补充订单*/
                            let result = Game.market.extendOrder(l.id, add_order_number)
                            if (result == OK) {
                                l.num -= add_order_number;
                                console.log(Colorful(`[market] 房间${this.room.name}-rType:${l.rType}补充订单 ${add_order_number}!`, 'yellow'))
                                continue
                            } else {
                                console.log(Colorful(`[market] 房间${this.room.name}订单ID:${l.id},rType:${l.rType}补充订单失败!`, 'blue'))
                            }
                        }
                        // 价格
                        if (order) {
                            let price = order.price
                            let standprice = l.price
                            // 价格太低或太高都会改变订单价格
                            if (standprice <= price / 3 || standprice >= price * 3) {
                                Game.market.changeOrderPrice(l.id, l.price)
                                console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`)
                            }
                            // 收到改变价格指令，也会改变订单价格
                            if (l.changePrice) {
                                Game.market.changeOrderPrice(l.id, l.price)
                                console.log(`[market] 房间${this.room.name}改变订单ID:${l.id},type:${l.rType}的价格为${l.price}`)
                                l.changePrice = false
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 资源传送
     */
    public ResourceSend(task: MissionModel): void {
        if (this.cooldown && this.cooldown > 0) return
        if (!task.Data || !task.Data.disRoom)       // 任务数据有问题
        {
            this.room.DeleteMission(task.id)
            return
        }
        if (!task.state) task.state = 1     // 1状态下，搜集资源
        if (task.state == 1) {
            if (Game.time % 10) return  /* 每10tick监测一次 */
            if (task.Data.num <= 0 || task.Data.num == undefined) this.room.DeleteMission(task.id)
            if (this.room.RoleMissionNum('manage', '物流运输') > 0) return // manage爬虫有任务时就不管
            // 路费
            var wastage = Game.market.calcTransactionCost(task.Data.num, this.room.name, task.Data.disRoom)
            /* 如果非能量资源且路费不够，发布资源搬运任务，优先寻找storage */
            var storage_ = this.room.storage as StructureStorage
            // terminal的剩余资源
            var remain = this.store.getFreeCapacity()
            /* 路费判断 */
            if (wastage > this.store.getUsedCapacity('energy')) {
                /* 只有在能量富裕的情况下才会允许进入下一阶段 */
                if (storage_ && (storage_.store.getUsedCapacity('energy') + this.store.getUsedCapacity('energy') - 5000) > wastage && remain > (wastage - this.store.getUsedCapacity('energy'))) {
                    /* 下布搬运任务 */
                    var thisTask = this.room.public_Carry({ 'manage': { num: 1, bind: [] } }, 40, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, 'energy', wastage - this.store.getUsedCapacity('energy'))
                    this.room.AddMission(thisTask)
                    return
                }
                /* 条件不满足就自动删除任务 */
                this.room.DeleteMission(task.id)
                return
            }
            console.log('资源传送任务监控中: ###########################\n 房间:', this.room.name, '--->', task.Data.disRoom, ' 运送资源：', task.Data.rType)
            console.log('路费:', Colorful(`${wastage}`, 'yellow'), 'energy  ', '终端拥有能量:', Colorful(`${this.store.getUsedCapacity('energy')}`, 'yellow'), 'energy')
            /* 资源判断 */
            var cargoNum: number = task.Data.rType == 'energy' ? this.store.getUsedCapacity(task.Data.rType) - wastage : this.store.getUsedCapacity(task.Data.rType)
            console.log('终端拥有资源量:', Colorful(`${cargoNum}`, 'blue'), ' 仓库拥有资源量:', storage_.store.getUsedCapacity(task.Data.rType), ' 任务所需资源量:', task.Data.num)
            if (task.Data.num > cargoNum) {
                if (storage_ && (storage_.store.getUsedCapacity(task.Data.rType) + this.store.getUsedCapacity(task.Data.rType)) >= (task.Data.num - 1600) && remain > task.Data.num - cargoNum) {
                    /* 下布搬运任务 */
                    var thisTask = this.room.public_Carry({ 'manage': { num: 1, bind: [] } }, 40, this.room.name, storage_.pos.x, storage_.pos.y, this.room.name, this.pos.x, this.pos.y, task.Data.rType, task.Data.num - cargoNum)
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
        else if (task.state == 2) {
            let result = this.send(task.Data.rType as ResourceConstant, task.Data.num, task.Data.disRoom as string)
            if (result == -6)   /* 能量不够就重新返回状态1 */ {
                console.log(Colorful(`房间${this.room.name}发送资源${task.Data.rType}失败!`, 'read', true))
                task.state = 1
                return
            }
            else if (result == OK) {
                /* 如果传送成功，就删除任务 */
                this.room.DeleteMission(task.id)
                return
            }
        }
    }

    /**
     * 资源购买 (deal)
     */
    public ResourceDeal(task: MissionModel): void {
        if ((Game.time - global.Gtime[this.room.name]) % 10) return
        if (this.cooldown || this.store.getUsedCapacity('energy') < 45000) return
        if (!task.Data) { this.room.DeleteMission(task.id); return }
        let money = Game.market.credits
        if (money <= 0 || task.Data.num > 50000) { this.room.DeleteMission(task.id); return }
        let rType = task.Data.rType
        let num = task.Data.num
        var HistoryList = Game.market.getHistory(rType)
        let HistoryLength = HistoryList.length
        if (HistoryList.length < 3 && Game.cpu.generatePixel) { console.log(`资源${rType}的订单太少，无法购买!`); this.room.DeleteMission(task.id); return }// 以防特殊情况
        var allNum: number = 0
        for (var iii = HistoryLength - 3; iii < HistoryLength; iii++) {
            if (HistoryList[iii]) { allNum += HistoryList[iii].avgPrice }
        }
        var avePrice = allNum / 3    // 平均价格 [近3天]
        // 获取该资源的平均价格
        var maxPrice = avePrice + (task.Data.range ? task.Data.range : 50)  // 范围
        maxPrice = maxPrice < 1 ? 1 : maxPrice;
        if (task.Data.maxPrice) { maxPrice = maxPrice > task.Data.maxPrice ? task.Data.maxPrice : maxPrice }
        // console.log(rType, '最大价格', maxPrice, task.Data.maxPrice)
        /* 在市场上寻找 */
        var orders = Game.market.getAllOrders(order => order.resourceType == rType &&
            order.type == ORDER_SELL && order.price <= maxPrice)
        if (orders.length <= 0) return
        /* 寻找价格最低的 */
        var newOrderList = orders.sort(compare('price'))
        for (var ii of newOrderList) {
            if (ii.price > maxPrice) return
            if (ii.amount >= num) {
                if (Game.market.deal(ii.id, num, this.room.name) == OK) {
                    this.room.DeleteMission(task.id)
                    return
                }
                else return
            }
            else {
                if (Game.market.deal(ii.id, ii.amount, this.room.name) == OK)
                    task.Data.num -= ii.amount
                return
            }
        }
    }
}