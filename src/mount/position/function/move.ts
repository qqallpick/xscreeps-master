/* 位置原型拓展   --方法  --移动 */
export default class PositionFunctionMoveExtension extends RoomPosition {
    /* 获取当前位置目标方向的pos对象 */
    public directionToPos(direction: DirectionConstant) : RoomPosition | undefined
    {
        let targetX = this.x
        let targetY = this.y
        if (direction !== LEFT && direction !== RIGHT) {
            if (direction > LEFT || direction < RIGHT) targetY --
            else targetY ++
        }
        if (direction !== TOP && direction !== BOTTOM) {
            if (direction < BOTTOM) targetX ++
            else targetX --
        }
        if (targetX < 0 || targetY > 49 || targetX > 49 || targetY < 0) return undefined
        else
            return new RoomPosition(targetX,targetY,this.roomName)
    }
}