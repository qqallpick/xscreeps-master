export default class PowerCreepFunctionExtension extends PowerCreep {
    public workstate(rType:ResourceConstant = RESOURCE_ENERGY):void
    {
        if (!this.memory.working) this.memory.working = false;
        if(this.memory.working && this.store[rType] == 0 ) {
            this.memory.working = false;
        }
        if(!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
        }
    }


    public transfer_(distination:Structure,rType:ResourceConstant = RESOURCE_ENERGY) : void{
        if (this.transfer(distination,rType) == ERR_NOT_IN_RANGE)
        {
            this.goTo(distination.pos,1)
        }
        this.memory.standed = false
    }

    public withdraw_(distination:Structure,rType:ResourceConstant = RESOURCE_ENERGY) : void{
        if (this.withdraw(distination,rType) == ERR_NOT_IN_RANGE)
        {
            this.goTo(distination.pos,1)
        }
        this.memory.standed = false
    }

}