import { assignPrototype } from "../base"
import frameExtension from './control/frame'
import actionExtension from './control/action'
import staticExtension from './static/static'
import behaviourExtension from "./control/behaviour"

// 定义好挂载顺序
const plugins = [
    frameExtension,
    actionExtension,
    staticExtension,
    behaviourExtension,
    ]

/**
* 依次挂载所有的拓展
*/
export default () => plugins.forEach(plugin => _.assign(global, plugin))
