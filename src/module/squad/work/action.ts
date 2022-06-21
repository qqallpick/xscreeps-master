/* 四人小队基本行为 */

import creep from "@/mount/creep";
import { isInArray } from "@/utils";
import { crossConst, leftConst, rightConst, SquadDirection, tactical } from "./constant";
import { getStandPos, SquadGetPosCreep, SquadGetRoomPosition, SquadHealDirection } from "./state";

/* 小队战术动作 斜插 */
export function SquadCross(SquadData:Squad):void{
    for (var cName in SquadData)
    {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue) return
    }
    for (var cName in SquadData)
    {
        if (!Game.creeps[cName]) continue
        Game.creeps[cName].move(SquadDirection[crossConst[SquadData[cName].position]])
        SquadData[cName].position = tactical['cross'][SquadData[cName].position] as '↘' | '↗' | '↖' | '↙'

    }
}

/* 小队战术动作 右转 */
export function SquadRight(SquadData:Squad):void{
    for (var cName in SquadData)
    {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue) return
    }
    for (var cName in SquadData)
    {
        if (!Game.creeps[cName]) continue
        Game.creeps[cName].move(SquadDirection[rightConst[SquadData[cName].position]])
        SquadData[cName].position = tactical['right'][SquadData[cName].position] as '↘' | '↗' | '↖' | '↙'
    }
}

/* 小队战术动作 左转 */
export function SquadLeft(SquadData:Squad):void{
    for (var cName in SquadData)
    {
        if (Game.creeps[cName] && Game.creeps[cName].fatigue) return
    }
    for (var cName in SquadData)
    {
        if (!Game.creeps[cName]) continue
        Game.creeps[cName].move(SquadDirection[leftConst[SquadData[cName].position]])
        SquadData[cName].position = tactical['left'][SquadData[cName].position] as '↘' | '↗' | '↖' | '↙'
    }
}

/* 进入目标房间前使用  治疗爬方向朝向目标房间的入口 */
export function initSquad(thisRoom:string,disRoom:string,SquadData:Squad):void{
    var Healdirection = SquadHealDirection(SquadData)
    if (Healdirection == null)
    {
        return
    }
    else if (Healdirection == '←')
    {
        switch (Game.rooms[thisRoom].findExitTo(disRoom))
        {
            case FIND_EXIT_LEFT:{break;}
            case FIND_EXIT_RIGHT:{SquadCross(SquadData);break}
            case FIND_EXIT_BOTTOM:{SquadLeft(SquadData);break}
            case FIND_EXIT_TOP:{SquadRight(SquadData);break}
        }
    }
    else if (Healdirection == '→')
    {
        switch (Game.rooms[thisRoom].findExitTo(disRoom))
        {
            case FIND_EXIT_LEFT:{SquadCross(SquadData);break;}
            case FIND_EXIT_RIGHT:{break;}
            case FIND_EXIT_BOTTOM:{SquadRight(SquadData);break}
            case FIND_EXIT_TOP:{SquadLeft(SquadData);break}
        }
    }
    else if (Healdirection == '↑')
    {
        switch (Game.rooms[thisRoom].findExitTo(disRoom))
        {
            case FIND_EXIT_LEFT:{SquadLeft(SquadData);break}
            case FIND_EXIT_RIGHT:{SquadRight(SquadData);break}
            case FIND_EXIT_BOTTOM:{SquadCross(SquadData);break}
            case FIND_EXIT_TOP:{break}
        }
    }
    else if (Healdirection == '↓')
    {
        switch (Game.rooms[thisRoom].findExitTo(disRoom))
        {
            case FIND_EXIT_LEFT:{SquadRight(SquadData);break}
            case FIND_EXIT_RIGHT:{SquadLeft(SquadData);break}
            case FIND_EXIT_BOTTOM:{break}
            case FIND_EXIT_TOP:{SquadCross(SquadData);break}
        }
    }
    return
}

/* 根据小队攻击爬的方向和目标方向进行战术动作 使得攻击爬方向朝向目标方向 */
export function SquadAttackOrient(Attackdirection:string,direction_:string,SquadData:Squad):void{
    /* 根据自己的方向进行旋转 */
    if (Attackdirection == '←')
    {
        switch(direction_)
        {
            case '←':{break;}
            case '→':{SquadCross(SquadData);break}
            case '↓':{SquadLeft(SquadData);break}
            case '↑':{SquadRight(SquadData);break}
        }
    }
    else if (Attackdirection == '→')
    {
        switch(direction_)
        {
            case '←':{SquadCross(SquadData);break;}
            case '→':{break;}
            case '↓':{SquadRight(SquadData);break}
            case '↑':{SquadLeft(SquadData);break}
        }
    }
    else if(Attackdirection == '↑')
    {
        switch(direction_)
        {
            case '←':{SquadLeft(SquadData);break}
            case '→':{SquadRight(SquadData);break}
            case '↓':{SquadCross(SquadData);break}
            case '↑':{break}
        }
    }
    else if (Attackdirection == '↓')
    {
        switch(direction_)
        {
            case '←':{SquadRight(SquadData);break}
            case '→':{SquadLeft(SquadData);break}
            case '↓':{break}
            case '↑':{SquadCross(SquadData);break}
        }
    }
}

/* 小队所有队员各就各位 */
export function SquadSteady(SquadData:Squad):void{
    for (var i in SquadData)
    {
        if (!Game.creeps[i]) continue
        var disPos = SquadGetRoomPosition(SquadData,SquadData[i].position)
        /* 用不同的移动方式防止各种bug */
        if (Game.time % 3)Game.creeps[i].moveTo(disPos)
        else Game.creeps[i].goTo(disPos,0)
    }
}

/* 小队寻找旗帜 */
export function SquadColorFlagRange(SquadData:Squad,color:ColorConstant):Flag{
    /* 先寻找小队左上角的坐标 */
    var standedCreep = SquadGetPosCreep(SquadData,'↖')
    if (!standedCreep) return null
    var disFlag = standedCreep.pos.findClosestByRange(FIND_FLAGS,{filter:(flag)=>{
        return flag.color == color
    }})
    if (disFlag) return disFlag
    return null
}

/* 小队寻找某类旗帜  （有问题）*/
// export function SquadNameFlagPath(SquadData:Squad,name:string):Flag{
//     let pos_ = getStandPos(SquadData)
//     if (!pos_) return null
//     let disFlag = pos_.findClosestByPath(FIND_FLAGS,{filter:(flag)=>{
//         return flag.name.indexOf(name) == 0
// }})
// if (disFlag) return disFlag
//     return null
// }

/* 整体小队寻找某类旗帜 临时 */
export function SquadNameFlagPath(SquadData:Squad,name:string):Flag{
    let pos_ = getStandPos(SquadData)
    if (!pos_) return null
    let flag_ = null
    let distance_ = null
    for (let i = pos_.x;i < (pos_.x+2 < 50?pos_.x+2:50);i++)
    LoopB:
    for (let j = pos_.y;j < (pos_.y+2 < 50?pos_.y+2:50);j++)
    {
        let thisPos = new RoomPosition(i,j,pos_.roomName)
        let disFlag = thisPos.findClosestByPath(FIND_FLAGS,{filter:(flag)=>{
            return flag.name.indexOf(name) == 0
        }})
        if (!disFlag) continue LoopB
        if (!flag_)
        {
            flag_ = disFlag
            distance_ = Math.max(Math.abs(thisPos.x - disFlag.pos.x),Math.abs(thisPos.y-disFlag.pos.y)) //存储一下距离
        }
        else
        {
            if (disFlag == flag_) continue LoopB
            else
            {
                // 判定距离
                let thisDistance = Math.max(Math.abs(thisPos.x - disFlag.pos.x),Math.abs(thisPos.y-disFlag.pos.y))
                if (thisDistance < distance_)
                {
                    flag_ = disFlag
                    distance_ = thisDistance
                }
            }
        }
    }
    return flag_
}



export function SquadNameFlagRange(SquadData:Squad,name:string):Flag{
    let pos_ = getStandPos(SquadData)
    if (!pos_) return null
    let disFlag = pos_.findClosestByRange(FIND_FLAGS,{filter:(flag)=>{
        return flag.name.indexOf(name) == 0
}})
if (disFlag) return disFlag
    return null
}

/* 小队行为 */
export function Squadaction(SquadData:Squad):void{
    for (var i in SquadData)
    {
        var creep = Game.creeps[i]
        if (!creep) continue
        /* 治疗类型爬 */
        if (creep.memory.creepType == 'heal')
        {
            /* 寻找小队内血量最少的爬 */
            var woundCreep:Creep
            for (var wc in SquadData)
            {
                if ( Game.creeps[wc] && !woundCreep && Game.creeps[wc].hits < Game.creeps[wc].hitsMax)
                woundCreep = Game.creeps[wc]
                if (Game.creeps[wc] && woundCreep)
                {
                    if (Game.creeps[wc].hits < woundCreep.hits) woundCreep =  Game.creeps[wc]
                }  
            }
            if (woundCreep)
            creep.heal(woundCreep)
            else
            /* 如果奶量都满的,就奶攻击爬 */
            {
                var index = SquadData[i].index
                var disIndex:number
                if (index == 1) disIndex = 0
                else if (index ==3) disIndex = 2
                else disIndex = index
                var disCreep:Creep
                for (var Index in SquadData)
                {
                    if (SquadData[Index].index == disIndex && Game.creeps[Index])
                    disCreep = Game.creeps[Index]
                }
                if (!disCreep) disCreep = creep
                creep.heal(disCreep)
            }
            /* 如果有攻击部件，攻击附近血量最少的爬 */
            if (creep.getActiveBodyparts('ranged_attack') > 0)
            {
                var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3,{filter:(creep_)=>{
                    return !isInArray(Memory.whitesheet,creep_.owner.username) && !creep_.pos.GetStructure('rampart')
                }})
                var enemyCreep:Creep
                if (enemy.length == 0)
                {
                    enemyCreep = enemy[0]
                }
                else if (enemy.length > 1)
                {
                    for (var ec of enemy)
                    {
                        if (!enemyCreep) enemyCreep = ec
                        else
                        {
                            if (ec.hits < enemyCreep.hits)
                            enemyCreep = ec
                        }
                    }
                }
                if (enemyCreep){
                    creep.rangedAttack(enemyCreep)
                }
                else
                    creep.rangedMassAttack()
                if (creep.memory.role == 'x-aio')
                {
                    /* aio操作 暂缺 */
                }
            }
        }
        /* 攻击类型的爬也有可能携带heal部件 */
        else if (creep.memory.creepType == 'attack')
        {
            /* 治疗自己 */
            if (creep.getActiveBodyparts('heal') > 0 && creep.hits < creep.hitsMax)
                creep.heal(creep)
                /* 如果有攻击部件，攻击附近血量最少的爬 */
                if (creep.getActiveBodyparts('ranged_attack') > 0)
                        {
                            var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3,{filter:(creep_)=>{
                                return !isInArray(Memory.whitesheet,creep_.owner.username) && !creep_.pos.GetStructure('rampart')
                            }})
                            var enemyCreep:Creep = null
                            if (enemy.length == 1)
                            {
                                enemyCreep = enemy[0]
                            }
                            else if (enemy.length > 1)
                            {
                                for (var ec of enemy)
                                {
                                    if (!enemyCreep) enemyCreep = ec
                                    else
                                    {
                                        if (ec.hits < enemyCreep.hits)
                                        enemyCreep = ec
                                    }
                                }
                            }
                            if (enemyCreep){
                                
                                creep.rangedAttack(enemyCreep)
                            }
                            else
                                creep.rangedMassAttack()
                        }
                if (creep.getActiveBodyparts('attack') > 0)
                {
                    var enemy = creep.pos.findInRange(FIND_HOSTILE_CREEPS,1,{filter:(creep_)=>{
                        return !isInArray(Memory.whitesheet,creep_.owner.username) && !creep_.pos.GetStructure('rampart')
                    }})
                    if (enemy.length > 0)
                    {
                        creep.attack(enemy[0])
                    }
                    else
                    {
                        let flag = creep.pos.findInRange(FIND_FLAGS,1,{filter:(flag)=>{
                            return flag.name.indexOf('squad_attack') == 0
                            }})
                            if (flag.length > 0)
                            {
                                let stru = flag[0].pos.GetStructureList(['rampart','extension','spawn','constructedWall','lab','nuker','powerSpawn','factory','terminal','storage','observer','extractor','tower'])
                                if (stru.length > 0)
                                {

                                    creep.attack(stru[0])
                                }
                                else
                                {
                                    flag[0].remove()
                                }
                            }
                    }
                }
                if (creep.getActiveBodyparts('work') > 0){
                    let flag = creep.pos.findInRange(FIND_FLAGS,1,{filter:(flag)=>{
                    return flag.name.indexOf('squad_attack') == 0
                    }})
                    if (flag.length > 0)
                    {
                        let stru = flag[0].pos.GetStructureList(['rampart','extension','spawn','constructedWall','lab','nuker','powerSpawn','factory','terminal','storage','observer','extractor','tower'])
                        if (stru.length > 0)
                        {
                            creep.dismantle(stru[0])
                        }
                        else
                        {
                            flag[0].remove()
                        }
                    }
                }
        }
    }
}