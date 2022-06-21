interface Room {
    // fun
    getStructure(sc:StructureConstant):Structure[]
    // Bind_Lab(rTypes:ResourceConstant[]):MissonLabBind | null
    getListHitsleast(sc:StructureConstant[],mode?:number):Structure | undefined
    getTypeStructure(sr:StructureConstant[]):Structure[]
    structureMission(strus:StructureConstant[]):void
    StructureMission():void
    LevelMessageUpdate():void
    // tower
    TowerWork():void

    Update_Lab():void
}

interface RoomMemory {

}