import { assignPrototype } from "../base"
import CreepMoveExtension from "./move/move"
import CreepFunctionExtension from "./function/fun"
import CreepMissonBaseExtension from "./misson/base"
import CreepMissonTransportExtension from "./misson/transport"
import CreepMissonActionExtension from "./misson/action"
import CreepMissonMineExtension from "./misson/mine"
import CreepMissonWarExtension from "./misson/war"
// 定义好挂载顺序
const plugins = [
    CreepMoveExtension,
    CreepFunctionExtension,
    CreepMissonBaseExtension,
    CreepMissonTransportExtension,
    CreepMissonActionExtension,
    CreepMissonMineExtension,
    CreepMissonWarExtension,
    ]

/**
* 依次挂载所有的拓展
*/
export default () => plugins.forEach(plugin => assignPrototype(Creep, plugin))