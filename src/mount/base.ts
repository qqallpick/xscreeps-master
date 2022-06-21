/* 此文件存放有关mount的基础函数 */

/**
 * name: 对象原型拓展
 * eg: asignPrototype(Creep,CreepMove)
 */
export const assignPrototype = function(obj1: {[key: string]: any}, obj2: {[key: string]: any})
{
    Object.getOwnPropertyNames(obj2.prototype).forEach(key => {
        if (key.includes('Getter')) {
            Object.defineProperty(obj1.prototype, key.split('Getter')[0], {
                get: obj2.prototype[key],
                enumerable: false,
                configurable: true
            })
        }
        else obj1.prototype[key] = obj2.prototype[key]
    })
}