/**
 * 通讯模块基本方法
 */

interface Segment {
    roomName: string,
    service: 'connect' | 'resource' | 'defend',       // 服务类型
    data?: any
}

/**
 * 设置raw记忆段
 * @param id raymemory id
 * @param data 数据
 */
export function setSegment(id: number, data: Segment) {
    RawMemory.segments[id] = JSON.stringify(data)
}

/**
 * 获取指定记忆
 * @returns 数据
 */
export function getForeignSegment(): null | Segment {
    if (RawMemory.foreignSegment && RawMemory.foreignSegment.data) 
    {
        return JSON.parse(RawMemory.foreignSegment.data) as Segment
    }
    else return null
}

/**
 * 使得记忆段公开
 * @param index id
 */
export function setSegmentPublic(index: number):void {
    if (RawMemory.segments[index]?.length) 
    {
        RawMemory.setPublicSegments([index]);
    }
}

/**
 * 初始化记忆片段
 */
export function initSegment(index:number[]) : void{
    RawMemory.setActiveSegments(index);
}

/* 指定为某玩家Mempry片段 */
export function setPlayerSegment(name:string,index:number):void{
    RawMemory.setActiveForeignSegment(name, index);
}



