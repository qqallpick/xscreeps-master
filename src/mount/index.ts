import mountCreep from './creep'
import mountPosition from './position'
import mountRoom from './room'
import mountConsole from './console'
import mountStructure from './structure'
import mountPowerCreep from './powercreep'
import mountHelp from './help'
import { Colorful } from '@/utils'
import { AppLifecycleCallbacks } from '@/module/framework/types'

const initStorage = function () {
    if (!Memory.rooms) Memory.rooms = {}
    else delete Memory.rooms.undefined
}

const mountAll = function () {
    // 存储的兜底工作
    initStorage()

    // 挂载全部拓展
    mountConsole()
    mountPosition()
    mountRoom()
    mountStructure()
    mountCreep()
    mountPowerCreep()
    mountHelp()
    console.log(Colorful('拓展挂载完成','blue',true))
}

export const createGlobalExtension = function (): AppLifecycleCallbacks {
    mountAll()
    return {
        born: () => {}
    }
}