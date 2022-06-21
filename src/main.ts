import { createApp } from './module/framework'
import { memoryInit } from './module/global/init'
import {createGlobalExtension} from '@/mount'
import {roomRunner} from '@/boot/roomWork'
import {creepRunner} from '@/boot/creepWork'
import { powerCreepRunner } from './boot/powercreepWork'
import { creepRecycleAndStatistic } from './module/global/statistic'
import { pixelManager } from './module/fun/pixel'
import { ResourceDispatchDelayManager } from './module/dispatch/resource'
import {layoutVisualMoudle} from './module/layoutVisual'
import { squadWarMoudle } from './module/squad/squad'
import { statMoudle } from './module/stat/stat'
import { towerDataVisual } from './module/visual/visual'
import { crossShardAppPlugin } from './module/shard/intershard'
/**
 * 主运行函数
 */
 const app = createApp({ roomRunner,creepRunner,powerCreepRunner})

 app.on(memoryInit)        // 记忆初始化

 app.on(createGlobalExtension())    // 原型拓展挂载

 app.on(crossShardAppPlugin)        // 跨shard相关

 app.on(creepRecycleAndStatistic)   // 爬虫记忆回收及数目统计

 app.on(squadWarMoudle)             // 四人小队战斗框架
 
 app.on(ResourceDispatchDelayManager) // 资源调度超时管理器

 app.on(pixelManager)                 // 搓像素

 app.on(layoutVisualMoudle)           // 房间布局可视化

 app.on(towerDataVisual)              // 防御塔数据可视化

 app.on(statMoudle)           //  数据统计模块

 export const loop = app.run
 