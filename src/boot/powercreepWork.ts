export const powerCreepRunner = function (pc: PowerCreep): void {
    if (pc && pc.ticksToLive)
        pc.ManageMisson()
}