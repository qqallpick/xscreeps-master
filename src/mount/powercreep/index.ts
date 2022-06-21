import { assignPrototype } from "../base"
import PowerCreepMoveExtension from './move/move'
import PowerCreepMissonBase from "./misson/base"
import PowerCreepFunctionExtension from "./function"
import PowerCreepMissonAction from "./misson/action"

// 定义好挂载顺序
const plugins = [
    PowerCreepMoveExtension,
    PowerCreepMissonBase,
    PowerCreepFunctionExtension,
    PowerCreepMissonAction,
    ]

/**
* 依次挂载所有的拓展
*/
export default () => plugins.forEach(plugin => assignPrototype(PowerCreep, plugin))