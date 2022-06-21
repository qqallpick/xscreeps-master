import { Colorful, colorful, createConst } from '@/utils'
import { createHelp } from './help'

/**
 * 全局拓展的别名
 * 使用别名来方便在控制台执行方法
 * 
 * @property {string} alias 别名
 * @property {function} exec 执行别名时触发的操作
 */
export default [
    // 常用的资源常量
    {
        alias: 'help',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'green', true)),
                '\n',
                '使用前请详细阅读如下规则:',
                '1.使用frame.add时,如果布局为man,房间的中心点需要两格内有1个link和1个tower(如果刚开局，以后有就行了).',
                '2.如果布局为dev,中心点在你第一个spawn往上两格.',
                '3.能力越大责任越大，不要使用该框架欺负萌新!',
                '4.急速冲级代码不了解使用方法不要使用,否则有宕机风险!',
                '5.本框架攻击模块具备各类型攻击代码及多次跨shard打击能力(超时空军团),除非自保,否则不要滥用!',
                '6.不保证该代码没有Bug,遇到bug欢迎QQ群里找Mikebraton交流报告.',
                '\n',
                Colorful('如果同意请控制台输入  manual', 'yellow', true),
            ].join('\n')
        }
    },
    // manual
    {
        alias: 'manual',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                `\n`,
                createHelp(
                    {
                        name: '《帮助手册及使用指南》',
                        describe: '各类型手册请在这里查找',
                        api: [
                            {
                                title: '全局命令手册',
                                commandType: true,
                                describe: '与房间无关的命令手册',
                                functionName: 'manual_global'
                            },
                            {
                                title: '框架控制手册',
                                commandType: true,
                                describe: '房间控制相关的命令手册 【重要】',
                                functionName: 'manual_room'
                            },
                            {
                                title: '爬虫行为手册',
                                commandType: true,
                                describe: '涉及爬虫的具体行为相关的任务,比如战争、搬运等',
                                functionName: 'manual_creep'
                            },
                            {
                                title: '统计相关手册',
                                commandType: true,
                                describe: '统计房间的资源、cpu等及可视化等相关的命令手册',
                                functionName: 'manual_stat'
                            },
                            {
                                title: '旗帜使用手册',
                                commandType: true,
                                describe: '列举所有任务中可能有用的旗帜',
                                functionName: 'manual_flag'
                            },
                        ]
                    },
                )
            ].join('\n')
        }
    },
    // global
    {
        alias: 'manual_global',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                createHelp(
                    {
                        name: '名单相关',
                        describe: '全局名单',
                        api: [
                            {
                                title: '添加绕过房间:',
                                describe: '例: bypass.add("W1N1","W1N2")',
                                params: [
                                    { name: 'roomName', desc: '绕过的房间列表' },
                                ],
                                functionName: 'bypass.add'
                            },
                            {
                                title: '查看绕过房间:',
                                describe: '例: bypass.show()',
                                functionName: 'bypass.show'
                            },
                            {
                                title: '清空绕过房间:',
                                describe: '例: bypass.clean()',
                                functionName: 'bypass.clean'
                            },
                            {
                                title: '移除绕过房间:',
                                describe: '例: bypass.remove("W1N1","W1N2")',
                                params: [
                                    { name: 'roomName', desc: '移除的房间列表' },
                                ],
                                functionName: 'bypass.remove'
                            },
                            {
                                title: '添加白名单:',
                                describe: '例: whitesheet.add("")',
                                params: [
                                    { name: 'username', desc: '添加的用户名' },
                                ],
                                functionName: 'whitesheet.add'
                            },
                            {
                                title: '查看白名单:',
                                describe: '例: whitesheet.show()',
                                functionName: 'whitesheet.show'
                            },
                            {
                                title: '清空白名单:',
                                describe: '例: whitesheet.clean()',
                                functionName: 'whitesheet.clean'
                            },
                            {
                                title: '移除白名单:',
                                describe: '例: whitesheet.remove("")',
                                params: [
                                    { name: 'username', desc: '移除的用户名' },
                                ],
                                functionName: 'whitesheet.remove'
                            },
                            {
                                title: '忽略控制台任务输出:',
                                params: [
                                    { name: 'name', desc: '任务名字' },
                                ],
                                functionName: 'MissionVisual.add'
                            },
                            {
                                title: '恢复控制台任务输出:',
                                params: [
                                    { name: 'name', desc: '任务名字' },
                                ],
                                functionName: 'MissionVisual.remove'
                            },
                            {
                                title: '开启/关闭自动搓像素(默认开启):',
                                functionName: 'pixel'
                            },
                            {
                                title: '设置全局房间可视化面板画质:',
                                params: [
                                    { name: 'level', desc: '画质 low/medium/high/blank' },
                                ],
                                functionName: 'panel.level'
                            },
                            {
                                title: '开/关具体房间的可视化面板:',
                                params: [
                                    { name: 'name', desc: '房间' },
                                ],
                                functionName: 'panel.switch'
                            },
                        ]
                    },
                    {
                        name: '行为相关',
                        describe: '全局行为',
                        api: [
                            {
                                title: '全局资源传送:',
                                describe: '无需指定自己房间名,传送资源到目标房间',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'res', desc: '目标资源类型' },
                                    { name: 'num', desc: '目标资源数量' },
                                    { name: 'pass', desc: '非自己房间需要为true作为验证' },
                                ],
                                functionName: 'give.set'
                            },
                            {
                                title: '取消全局资源传送:',
                                describe: '还需要配合terminal.Csend来取消已经纳入规划的传送任务',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'res', desc: '目标资源类型' },
                                ],
                                functionName: 'give.remove'
                            },
                        ]
                    },

                )
            ].join('\n')
        }
    },
    // room
    {
        alias: 'manual_room',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                createHelp(
                    // 框架控制
                    {
                        name: '房间控制、监控相关',
                        describe: '* 涉及房间管理、控制的命令',
                        api: [
                            {
                                title: '添加控制房间:',
                                describe: '例: frame.add("W1N1","man",14,23)',
                                params: [
                                    { name: 'roomName', desc: '想控制的房间' },
                                    { name: 'plan', desc: '布局 man: 手动布局 dev:一种中心布局(参考superbitch)' },
                                    { name: 'x', desc: '中心点的x坐标 注意:dev布局中心点请详见输入help' },
                                    { name: 'y', desc: '中心点的y坐标 中心点选取请慎重,详见help' },
                                ],
                                functionName: 'frame.add'
                            },
                            {
                                title: '删除控制房间:',
                                describe: '例: frame.remove("W1N1") 还需手动unclaim房间',
                                params: [
                                    { name: 'roomName', desc: '想删除控制的房间' },
                                ],
                                functionName: 'frame.remove'
                            },
                            {
                                title: '房间内建筑拆除:',
                                describe: '例: frame.del("W1N1",12,23,"road") 千万不能手动拆自己房间内除了wall之外的任何建筑',
                                params: [
                                    { name: 'roomName', desc: '我所控制的房间' },
                                    { name: 'x', desc: '要拆除的建筑x坐标' },
                                    { name: 'y', desc: '要拆除的建筑y坐标' },
                                    { name: 'structureType', desc: '要拆除的建筑类型' },
                                ],
                                functionName: 'frame.del'
                            },
                            {
                                title: '房间进入经济模式:',
                                describe: '例: frame.economy("W1N1") 8级房能用,进入经济模式后,不会一直升级,节省能量和cpu',
                                params: [
                                    { name: 'roomName', desc: '我所控制的房间' },
                                ],
                                functionName: 'frame.economy'
                            },
                            {
                                title: '查询房间内当前存在的任务:',
                                describe: '例: frame.task("W1N1") ',
                                params: [
                                    { name: 'roomName', desc: '我所控制的房间' },
                                ],
                                functionName: 'frame.task'
                            },
                        ]
                    },
                    // 日常维护
                    {
                        name: '日常维护相关',
                        describe: '* 例如爬虫数量的调整、任务的手动删除等',
                        api: [
                            {
                                title: '常驻爬虫数量调整:',
                                describe: '只适用于upgrade harvest carry transport manage build类型爬虫;例:spawn.num("W1N1","carry",1)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'role', desc: '爬虫角色类型' },
                                    { name: 'num', desc: '爬虫数量' },
                                ],
                                functionName: 'spawn.num'
                            },
                            {
                                title: '任务爬虫数量调整:',
                                describe: '适用于任务类型爬虫的数量调整;例:spawn.Mnum("W1N1","C-85ednh1ib439985674","aio",1)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'id', desc: '任务id' },
                                    { name: 'role', desc: '爬虫角色类型' },
                                    { name: 'num', desc: '爬虫数量' },
                                ],
                                functionName: 'spawn.Mnum'
                            },
                            {
                                title: '定时孵化任务孵化配置一键还原:',
                                describe: '修改定时信息,立刻重新孵化;例:spawn.restart("W1N1","C-85ednh1ib439985674")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'id', desc: '任务id' },
                                ],
                                functionName: 'spawn.restart'
                            },
                            {
                                title: '资源转移:【推荐】',
                                describe: '从房间A传资源(或所有)到房间B(需要有终端和仓库) 例:logistic.send("W1N1","W1N2","GH2O",20000)',
                                params: [
                                    { name: 'roomName', desc: '源房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'rType(可选)', desc: '资源类型【不选表示除energy和ops外所有资源】' },
                                    { name: 'num(可选)', desc: '资源数量【不限制数量】，不选表示全部数量' },
                                ],
                                functionName: 'logistic.send'
                            },
                            {
                                title: '取消资源转移:',
                                describe: '取消从房间A传资源到房间B(需要有终端和仓库) 例:logistic.Csend("W1N1","W1N2")',
                                params: [
                                    { name: 'roomName', desc: '源房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                ],
                                functionName: 'logistic.Csend'
                            },
                            {
                                title: '资源转移信息查询:',
                                describe: '例:logistic.show()',
                                params: [
                                ],
                                functionName: 'logistic.show'
                            },
                            {
                                title: '资源传送:【不推荐】',
                                describe: '从房间A传资源到房间B(需要有终端和仓库) 例:terminal.send("W1N1","W1N2","GH2O",20000)',
                                params: [
                                    { name: 'roomName', desc: '源房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'num', desc: '资源数量【不能高于150000】' },
                                ],
                                functionName: 'terminal.send'
                            },
                            {
                                title: '取消资源传送:',
                                describe: '取消从房间A传资源到房间B(需要有终端和仓库) 例:terminal.Csend("W1N1","W1N2","GH2O")',
                                params: [
                                    { name: 'roomName', desc: '源房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'rType', desc: '资源类型' },
                                ],
                                functionName: 'terminal.Csend'
                            },
                            {
                                title: '查看现在所有的资源传送情况:',
                                describe: '从房间A传资源到房间B(需要有终端和仓库) 例:terminal.show()',
                                functionName: 'terminal.show'
                            },
                            {
                                title: '注册消费link:',
                                describe: '让中央link自动向某link传送能量 例:link.comsume("W1N1","6204890bedf59067e60b4df3")',
                                params: [
                                    { name: 'roomName', desc: '房间' },
                                    { name: 'linkID', desc: 'link的ID' }, ,
                                ],
                                functionName: 'link.comsume'
                            },
                            {
                                title: '删除具体任务:',
                                describe: '例:Game.rooms["xxxx"].DeleteMission("C-85ednh1ib439985674")',
                                params: [
                                    { name: 'missionID', desc: '任务Id' }, ,
                                ],
                                functionName: 'Game.rooms["xxxx"].DeleteMission'
                            },
                        ]
                    },
                    // 市场行为
                    {
                        name: '市场行为相关',
                        describe: '与市场有关的各类命令',
                        api: [
                            {
                                title: '成交某订单:',
                                describe: '使用deal 例: market.deal("W1N1","624297baf8094abe1c16a8b8",10000)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'orderID', desc: '单子的id' },
                                    { name: 'num', desc: '数量' },
                                ],
                                functionName: 'market.deal'
                            },
                            {
                                title: '查询市场上的订单:',
                                describe: '查询市场上的订单 例: market.look("GH2O","sell")',
                                params: [
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'mtype', desc: '交易类型: buy | sell' },
                                ],
                                functionName: 'market.look'
                            },
                            {
                                title: '下单买某类型资源:',
                                describe: '例: market.buy("w1n1","GH2O",35,20000)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'price', desc: '价格' },
                                    { name: 'num', desc: '数量' },
                                ],
                                functionName: 'market.buy'
                            },
                            {
                                title: '查询某类型资源的近n天的平均价格:',
                                describe: '例: market.ave("GH2O",7)',
                                params: [
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'day', desc: '天数' },
                                ],
                                functionName: 'market.ave'
                            },
                            {
                                title: '查询市场上某类型资源的最高价格:',
                                describe: '例: market.highest("GH2O","sell",100)',
                                params: [
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'mtype', desc: '交易类型: buy | sell' },
                                    { name: 'limit', desc: '(可选) 价格上限' },
                                ],
                                functionName: 'market.highest'
                            },
                            {
                                title: '卖资源:',
                                describe: '例: market.sell("W1N1","L","deal",5000)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'rType', desc: '资源类型' },
                                    { name: 'mtype', desc: '交易类型: deal | order' },
                                    { name: 'num', desc: '想卖掉的数量' },
                                    { name: 'price', desc: '(可选) 对于deal来说的最低价格' },
                                    { name: 'unit', desc: '(可选) 资源平衡数量' },
                                ],
                                functionName: 'market.sell'
                            },
                            {
                                title: '查询某房间正在卖的资源:',
                                describe: '例: market.query("W1N1")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                ],
                                functionName: 'market.query'
                            },
                            {
                                title: '取消某类型资源的卖出任务:',
                                describe: '例: market.cancel("W1N1","deal","GH2O")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'mtype', desc: '交易类型: deal | order' },
                                    { name: 'rType', desc: '资源类型' },
                                ],
                                functionName: 'market.cancel'
                            },
                        ]
                    },
                    // 日常行为
                    {
                        name: '日常行为',
                        describe: '房间一些日常行为的控制',
                        api:
                            [
                                // lab                       
                                {
                                    title: 'lab初始化 (新造的lab必须初始化):',
                                    describe: '例: lab.init("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'lab.init'
                                },
                                {
                                    title: '化合物合成【不建议】:',
                                    describe: '例: lab.compound("W1N1","OH",1000)',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'type', desc: '资源类型' },
                                        { name: 'num', desc: '资源数量' },
                                    ],
                                    functionName: 'lab.compound'
                                },
                                {
                                    title: '取消化合物合成:',
                                    describe: '例: lab.Ccompound("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },

                                    ],
                                    functionName: 'lab.Ccompound'
                                },
                                {
                                    title: '合成自动规划【建议】:',
                                    describe: '自动合成低级化合物,规划合成 例: lab.dispatch("W1N1","XKHO2",1000)',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'type', desc: '资源类型' },
                                        { name: 'num', desc: '资源数量' },
                                    ],
                                    functionName: 'lab.dispatch'
                                },
                                {
                                    title: '取消资源合成规划:',
                                    describe: '取消资源合成规划,配合lab.Ccompound使用 例: lab.Cdispatch("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '目标房间' },
                                    ],
                                    functionName: 'lab.Cdispatch'
                                },
                                // power
                                {
                                    title: '启动/关闭 GPL升级:',
                                    describe: '例:power.switch("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'power.switch'
                                },
                                {
                                    title: 'GPL升级节省能量模式:',
                                    describe: '例:power.save("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'power.save'
                                },
                                {
                                    title: '限制/激活 PC技能:',
                                    describe: '只适用于queen类爬虫 例:power.option("W1N1","factory")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'structure', desc: '建筑类型' },
                                    ],
                                    functionName: 'power.option'
                                },
                                {
                                    title: '输出PC技能限制/激活信息:',
                                    describe: '只适用于queen类爬虫 例:power.show("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'power.show'
                                },
                                {
                                    title: '创建pc:',
                                    describe: ' 例:power.create("W1N1","queen")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'role', desc: 'pc角色名' },
                                    ],
                                    functionName: 'power.create'
                                },
                                {
                                    title: '删除pc:',
                                    describe: ' 例:power.del("W1N1/queen/shard3")',
                                    params: [
                                        { name: 'name', desc: 'pc名' },
                                    ],
                                    functionName: 'power.del'
                                },
                                // factory
                                {
                                    title: '工厂等级初始化:',
                                    describe: '如果工厂有pc,并且有工厂等级,需要初始化工厂等级',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'factory.level'
                                },
                                {
                                    title: '启动/关闭 工厂:',
                                    describe: '默认开启',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'factory.switch'
                                },
                                {
                                    title: '添加工厂基本商品生产列表:',
                                    describe: '基本商品生产列表 例: factory.add("W1N1","utrium_bar",10000)',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'rType', desc: '商品类型' },
                                        { name: 'num', desc: '数量' },
                                    ],
                                    functionName: 'factory.add'
                                },
                                {
                                    title: '删除工厂基本商品生产:',
                                    describe: ' 例: factory.remove("W1N1","utrium_bar")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'rType', desc: '商品类型' },
                                    ],
                                    functionName: 'factory.remove'
                                },
                                {
                                    title: '设置工厂流水线商品:',
                                    describe: '只能是流水线商品 例: factory.set("W1N1","machine") ',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'rType', desc: '商品类型' },
                                    ],
                                    functionName: 'factory.set'
                                },
                                {
                                    title: '删除工厂流水线商品:',
                                    describe: '例: factory.del("W1N1","machine")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'factory.del'
                                },
                                {
                                    title: '添加解压商品:',
                                    describe: '添加解压商品列表 例: factory.unzip("W1N1","utrium_bar",10000)',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'rType', desc: '商品类型' },
                                        { name: 'num', desc: '数量' },
                                    ],
                                    functionName: 'factory.unzip'
                                },
                                {
                                    title: '删除解压商品任务:',
                                    describe: ' 例: factory.Cunzip("W1N1","utrium_bar")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'rType', desc: '商品类型' },
                                    ],
                                    functionName: 'factory.Cunzip'
                                },

                                {
                                    title: '输出工厂目前工作状态:',
                                    describe: '例: factory.show("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'factory.show'
                                },
                                // cross
                                {
                                    title: '初始化过道采集任务(此前未初始化必须初始化):',
                                    describe: '例: cross.init("W1N1",["W1N0","W2N0","W3N0"])',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'realteRooms', desc: '想采集的过道房间列表' },
                                    ],
                                    functionName: 'cross.init'
                                },
                                {
                                    title: '增加过道房间:',
                                    describe: '例: cross.add("W1N1","W4N0")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.add'
                                },
                                {
                                    title: '开启/关闭过道:',
                                    describe: '例: cross.switch("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.switch'
                                },
                                {
                                    title: '删除过道房间:',
                                    describe: '例: cross.remove("W1N1","W4N0")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.remove'
                                },
                                {
                                    title: '开启/关闭 power采集:',
                                    describe: '例: cross.power("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.power'
                                },
                                {
                                    title: '开启/关闭 deposit采集:',
                                    describe: '例: cross.deposit("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.deposit'
                                },
                                {
                                    title: '展示过道采集情况:',
                                    describe: '例: cross.show("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.show'
                                },
                                {
                                    title: '取消过道采集任务:',
                                    describe: '例: cross.cancel("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'cross.cancel'
                                },
                                // outmine
                                {
                                    title: '外矿采集:',
                                    describe: '例: mine.harvest("W1N1",14,23,"W1N2")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'X', desc: '自己房间内采集起始点的x坐标(用于自动造路)' },
                                        { name: 'Y', desc: '自己房间内采集起始点的y坐标(用于自动造路)' },
                                        { name: 'disRoom', desc: '目标房间名' },
                                    ],
                                    functionName: 'mine.harvest'
                                },
                                {
                                    title: '取消外矿采集:',
                                    describe: '例: mine.Charvest("W1N1","W1N2")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'disRoom', desc: '目标房间名' },
                                    ],
                                    functionName: 'mine.Charvest'
                                },
                                // nuke
                                {
                                    title: '核弹发射:',
                                    describe: '例: nuke.launch("W1N1","W1N2",12,34)',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                        { name: 'disRoom', desc: '目标房间名' },
                                        { name: 'X', desc: '核弹着弹点x坐标' },
                                        { name: 'Y', desc: '核弹着弹点y坐标' },
                                    ],
                                    functionName: 'nuke.launch'
                                },
                                {
                                    title: '开/关核弹自动填充:',
                                    describe: '例: nuke.switch("W1N1")',
                                    params: [
                                        { name: 'roomName', desc: '房间名' },
                                    ],
                                    functionName: 'nuke.switch'
                                },
                            ]
                    },
                )
            ].join('\n')
        }
    },
    // creep
    {
        alias: 'manual_creep',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                createHelp(
                    {
                        name: '日常行为',
                        describe: '日常升级、刷墙等命令',
                        api: [
                            {
                                title: '刷墙:',
                                describe: '例: repair.set("W1N1","global",1,"LH","T0")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'type', desc: '刷墙类型 global(全局刷墙) | special(只刷旗子下的墙)' },
                                    { name: 'num', desc: '刷墙爬数量' },
                                    { name: 'boost', desc: 'boost类型 null | LH | LH2O | XLH2O' },
                                    { name: 'level', desc: '体型 T0 | T1 | T2 越高体型越小' },
                                ],
                                functionName: 'repair.set'
                            },
                            {
                                title: '取消刷墙:',
                                describe: '例: repair.remove("W1N1","global")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'type', desc: '刷墙类型 global(全局刷墙) | special(只刷旗子下的墙)' },
                                ],
                                functionName: 'repair.remove'
                            },
                            {
                                title: '扩张:',
                                describe: '例: expand.set("W1N1","W2N2","shard3",2,1,false)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'num', desc: '援建/升级爬数量' },
                                    { name: 'Cnum', desc: 'claim爬数量 默认1' },
                                    { name: 'defend', desc: '是否需要一定防御能力' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'expand.set'
                            },
                            {
                                title: '取消扩张:',
                                describe: '例: expand.Cset("W1N1","W2N2","shard3")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                ],
                                functionName: 'expand.remove'
                            },
                            {
                                title: '急速冲级:',
                                describe: '例: upgrade.quick("W1N1",5,"GH2O")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'num', desc: '冲级爬数量' },
                                    { name: 'boost', desc: 'boost类型 null | GH | GH2O | XGH2O' },
                                ],
                                functionName: 'upgrade.quick'
                            },
                            {
                                title: '取消急速冲级:',
                                describe: '例: upgrade.Cquick("W1N1")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                ],
                                functionName: 'upgrade.Cquick'
                            },
                            {
                                title: '普通冲级:',
                                describe: '例: upgrade.normal("W1N1",2,"GH2O")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'num', desc: '冲级爬数量' },
                                    { name: 'boost', desc: 'boost类型 null | GH | GH2O | XGH2O' },
                                ],
                                functionName: 'upgrade.normal'
                            },
                            {
                                title: '取消普通冲级:',
                                describe: '例: upgrade.Cnormal("W1N1")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                ],
                                functionName: 'upgrade.Cnormal'
                            },
                            {
                                title: '签名:',
                                describe: '例: scout.sign("W1N1","W2N2","shard3","hello world")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'word', desc: '签名内容' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'scout.sign'
                            },
                            {
                                title: '取消签名:',
                                describe: '例: scout.Csign("W1N1","W2N2","shard3")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'word', desc: '签名内容' },
                                ],
                                functionName: 'scout.Csign'
                            },
                            {
                                title: '指定资源搬运:',
                                describe: '例: carry.special("W1N1","energy","Flag1","Flag2",2,100000))',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'rType', desc: '搬运的资源类型' },
                                    { name: 'souP', desc: '抽取资源的建筑的位置的旗帜' },
                                    { name: 'disP', desc: '存放资源的建筑位置的旗帜' },
                                    { name: 'num', desc: '搬运爬数量' },
                                    { name: 'resourcenum', desc: '搬运的资源数量' },
                                ],
                                functionName: 'carry.special'
                            },
                            {
                                title: '所有类型资源搬运(掠夺):',
                                describe: '例: carry.all("W1N1","Flag1","Flag2",3))',
                                params: [
                                    { name: 'roomName', desc: '房间名' }, ,
                                    { name: 'souP', desc: '抽取资源的建筑的位置的旗帜' },
                                    { name: 'disP', desc: '存放资源的建筑位置的旗帜' },
                                    { name: 'num', desc: '搬运爬数量' },
                                ],
                                functionName: 'carry.all'
                            },
                            {
                                title: '取消资源搬运任务:',
                                describe: '例: carry.cancel("W1N1")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                ],
                                functionName: 'carry.cancel'
                            },
                            {
                                title: '紧急援建:',
                                describe: '例: support.build("W1N1","W2N2","shard3",1,1000)',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'num', desc: '爬虫数量' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'defend', desc: '(boolean) 是否需要一定防御能力 默认 false' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'support.build'
                            },
                            {
                                title: '取消紧急援建:',
                                describe: '例: support.build("W1N1","W2N2","shard3")',
                                params: [
                                    { name: 'roomName', desc: '房间名' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                ],
                                functionName: 'support.Cbuild'
                            },
                        ]
                    },
                    {
                        name: '战争行为',
                        describe: '战争相关的命令',
                        api: [
                            {
                                title: '一体机:',
                                describe: '例: war.aio("W1N1","W1N12","shard3",1,1000,true,"T1")',
                                params: [
                                    { name: 'roomName', desc: '所在房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'num', desc: '爬虫数量' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'boost', desc: '是否boost' },
                                    { name: 'bodyLevel', desc: 'T0 | T1 | T2 越高防御力越弱,攻击力越强' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.aio'
                            },
                            {
                                title: '取消一体机:',
                                describe: '例: war.Caio("W1N1","W1N12","shard3")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                ],
                                functionName: 'war.Caio'
                            },
                            {
                                title: '双人小队:',
                                describe: '例: war.double("W1N1","W1N12","shard3","attack",1,1000)',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '双人小队类型: attack:红球 |dismantle:黄球' },
                                    { name: 'num', desc: '爬虫数量' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.double'
                            },
                            {
                                title: '取消双人小队:',
                                describe: '例: war.Cdouble("W1N1","W1N12","shard3","attack")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '双人小队类型: attack:红球 |dismantle:黄球' },
                                ],
                                functionName: 'war.Cdouble'
                            },
                            {
                                title: '四人小队:',
                                describe: '例: war.squad("W1N1","W1N12","shard3","D",1000)',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '四人小队类型: D:黄|A:红|R:蓝|DR|DA|RA|Aio:一体机' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.squad'
                            },
                            {
                                title: '取消四人小队:',
                                describe: '例: war.Csquad("W1N1","W1N12","shard3","D")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '四人小队类型: D:黄|A:红|R:蓝|DR|DA|RA|Aio:一体机' },
                                ],
                                functionName: 'war.Csquad'
                            },
                            {
                                title: '拆家大黄:',
                                describe: '例: war.dismantle("W1N1","W1N12","shard3",1,1000,true)',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'num', desc: '爬虫数量' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'boost', desc: '是否boost' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.dismantle'
                            },
                            {
                                title: '取消拆家大黄:',
                                describe: '例: war.Cdismantle("W1N1","W1N12","shard3")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                ],
                                functionName: 'war.Cdismantle'
                            },
                            {
                                title: '攻击控制器:',
                                describe: '例: war.control("W1N1","W1N12","shard3",1000)',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.control'
                            },
                            {
                                title: '取消攻击控制器:',
                                describe: '例: war.Ccontrol("W1N1","W1N12","shard3")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                ],
                                functionName: 'war.Ccontrol'
                            },
                            {
                                title: '紧急支援:',
                                describe: '例: war.support("W1N1","W1N12","shard3","aio",1,1000,true)',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '紧急支援类型: double:双人小队 |aio:一体机' },
                                    { name: 'num', desc: '爬虫数量' },
                                    { name: 'interval', desc: '出爬时间间隔' },
                                    { name: 'boost', desc: '是否boost(只会aio有效)' },
                                    { name: 'shardData(可选)', desc: '多次跨shard参数' },
                                ],
                                functionName: 'war.support'
                            },
                            {
                                title: '取消紧急支援:',
                                describe: '例: war.Csupport("W1N1","W1N12","shard3","double")',
                                params: [
                                    { name: 'roomName', desc: '目标房间' },
                                    { name: 'disRoom', desc: '目标房间' },
                                    { name: 'shard', desc: '目标房间所在shard' },
                                    { name: 'type', desc: '紧急支援类型: double:双人小队 |aio:一体机' },
                                ],
                                functionName: 'war.Csupport'
                            },
                        ]
                    },

                )
            ].join('\n')
        }
    },
    // stat
    {
        alias: 'manual_stat',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                createHelp(
                    {
                        name: '统计相关',
                        describe: '全局资源、储量统计',
                        api: [
                            {
                                title: '全局资源统计:',
                                describe: '全局资源数量统计',
                                functionName: 'resource.all'
                            },
                            {
                                title: '商品资源名称打印:',
                                describe: '商品资源名称打印',
                                functionName: 'resource.com'
                            },
                            {
                                title: '全局储量统计:',
                                describe: '全局储量统计',
                                functionName: 'store.all'
                            },
                        ]
                    },
                )
            ].join('\n')
        }
    },
    {
        alias: 'manual_flag',
        exec: function (): string {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                `\n    ${colorful('superbitch bot', 'yellow', true)}`,
                '这里列出一些可能用到的旗帜及其作用 统一规定xx为任何字符串 [xx]为房间名',
                '旗帜名: [xx]/repair 房间内所有防御塔参与维修',
                '旗帜名: [xx]/stop 房间内所有防御塔停止攻击',
                '旗帜名: dismantle_xx 大黄拆迁指定旗帜下建筑',
                '旗帜名: aio_xx 一体机拆迁指定旗帜下建筑',
                '旗帜名: squad_attack_xx 四人小队攻击指定旗帜下建筑',
                '旗帜名: double_attack_xx attack双人小队拆迁指定旗帜下建筑',
                '旗帜名: double_dismantle_xx dismantle双人小队拆迁指定旗帜下建筑',
                '旗帜名: support_aio_xx 紧急支援一体机前往指定旗帜',
                '旗帜名: support_double_xx 紧急支援双人小队拆迁指定旗帜下建筑',
                '旗帜名: reapair_xx special维修爬维修指定旗帜下墙体',
                '旗帜名: withdraw_xx紧急援助爬从该旗帜下的建筑提取能量',
                '旗帜名: [紧急援助爬所属房间]/HB/harvest 紧急援助爬从该旗帜下的房间的矿点采集能量',
                '旗帜名: LayoutVisual 插在任意房间可以显示dev自动布局',
                '旗帜名: TowerVisualAttack 插在距离自己8级房最近房间或有视野房间 显示该房间防御塔伤害信息',
                '旗帜名: TowerVisualHeal 插在距离自己8级房最近房间或有视野房间 显示该房间防御塔治疗信息',
                '旗帜名: TowerVisualRepair 插在距离自己8级房最近房间或有视野房间 显示该房间防御塔维修信息',
            ].join('\n')
        }
    },
]

/**
 * 帮助文档中的标题
 */
const projectTitle = [
    String.raw`控制台帮助指令库`,
    String.raw`按照提示输入指令`,
]