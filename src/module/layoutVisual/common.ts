import { isInArray } from '@/utils'
import dev from './dev'
import RoomVisual from './RoomVisual'
export const drawByConfig = function (str: string) {

    let data: any
    let xx: number
    let yy: number
    if (str == 'LayoutVisual') {
        xx = -25;
        yy = -25;
        data = dev;
    }
    let flag = Game.flags[str];
    if (!flag) {
        return;
    }
    let roomName = flag.pos.roomName;
    let terrian = new Room.Terrain(roomName)
    let rv = new RoomVisual(roomName)
    //    let poss = data.buildings['extension']['pos'];

    for (let type in data.buildings) {
        let poss = data.buildings[type]['pos'];

        for (let pos of poss) {
            let x = pos.x + xx + flag.pos.x;
            let y = pos.y + yy + flag.pos.y;
            try {
                if (terrian.get(x,y) != TERRAIN_MASK_WALL)
                rv.structure(x, y, type)
            } catch (e) {
                log('err:' + x + "," + y + ',' + type)
                throw e;
            }
        }

    }
    // 墙
    let pos = flag.pos
    for (let i = pos.x-9;i<pos.x+10;i++)
    for (let j = pos.y-9;j<pos.y+10;j++)
    {
        if (!isInArray([0,1,48,49],i) && !isInArray([0,1,48,49],j) && (Math.abs(i-pos.x)==9 || Math.abs(j-pos.y)==9)  && terrian.get(i,j) != TERRAIN_MASK_WALL)
            rv.structure(i,j,STRUCTURE_RAMPART)
    }
    rv.connRoads();

}

export function log(str: string, color: string = 'white') {
    console.log(`<span style="color:${color}">${str}</span>`)
}