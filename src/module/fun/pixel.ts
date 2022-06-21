import { AppLifecycleCallbacks } from "../framework/types"

export function pixel():void{
    if (!Game.cpu.generatePixel) return
    if (Game.cpu.bucket >= 10000)
    {
        if (!Memory.StopPixel)
            Game.cpu.generatePixel()
    }
}

export const pixelManager:AppLifecycleCallbacks = {
    tickEnd:pixel
}