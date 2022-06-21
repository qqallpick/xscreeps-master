// 轮子 非自创
import { AppLifecycleCallbacks } from '../framework/types';
import { drawByConfig } from './common'
export function layoutVisual(): void {
    for (let name of ['LayoutVisual']) {
        let flag = Game.flags[name];
        if (flag) {
            drawByConfig(flag.name);
        }
    }

}

export const layoutVisualMoudle:AppLifecycleCallbacks = {
    tickEnd:layoutVisual
}