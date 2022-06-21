/* power操作常量 */

import { isInArray } from "@/utils"

export const OptCost = {
    PWR_GENERATE_OPS: 0,
    PWR_OPERATE_SPAWN: 100,
    PWR_OPERATE_TOWER: 10,
    PWR_OPERATE_STORAGE: 100,
    PWR_OPERATE_LAB: 10,
    PWR_OPERATE_EXTENSION: 2,
    PWR_OPERATE_OBSERVER: 10,
    PWR_OPERATE_TERMINAL: 100,
    PWR_DISRUPT_SPAWN: 10,
    PWR_DISRUPT_TOWER: 10,
    PWR_DISRUPT_SOURCE: 100,
    PWR_SHIELD: 0,
    PWR_REGEN_SOURCE: 0,
    PWR_REGEN_MINERAL: 0,
    PWR_DISRUPT_TERMINAL: 50,
    PWR_OPERATE_POWER: 200,
    PWR_FORTIFY: 5,
    PWR_OPERATE_CONTROLLER: 200,
    PWR_OPERATE_FACTORY: 100,
}

// queen类型buff是否加持
export function isOPWR(stru:Structure):boolean{
    if (!stru.effects || stru.effects.length <= 0) return false
    else
    {
        if (stru.structureType == 'tower')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_TOWER))
                return false
        }
        else if (stru.structureType == 'spawn')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_SPAWN))
                return false
        }
        else if (stru.structureType == 'extension')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_EXTENSION))
            return false
        }
        else if (stru.structureType == 'terminal')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_TERMINAL))
            return false
        }
        else if (stru.structureType == 'storage')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_STORAGE))
            return false
        }
        else if (stru.structureType == 'factory')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_FACTORY))
            return false
        }
        else if (stru.structureType == 'lab')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_LAB))
            return false
        }
        else if (stru.structureType == 'powerSpawn')
        {
            if (!isInArray(getAllEffects(stru),PWR_OPERATE_POWER))
            return false
        }
    }
    return true
}

export function getAllEffects(stru:Structure):PowerConstant[]{
    if (!stru.effects || stru.effects.length <= 0) return []
    var eff_list = []
    for (var effect_ of stru.effects)
    {
        eff_list.push(effect_.effect)
    }
    return eff_list
}