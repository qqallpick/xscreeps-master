/* 展示全局资源相关     轮子-非自己开发! */
import { resourceList, resourceColorMap } from './constant';

type CatteryResource = {
  [key in ResourceConstant]?: number;
};

const addStore = (resource: CatteryResource, store: CatteryResource) => {
  for (const key in store) {
    if (store[key] > 0) resource[key] = (resource[key] || 0) + store[key];
  }
  return resource;
};

export const getCatteryResource = (cattery: Room): CatteryResource => {
  const resource: CatteryResource = {};
  if (cattery.storage) addStore(resource, cattery.storage.store);
  if (cattery.terminal) addStore(resource, cattery.terminal.store);
  return resource;
};

export const uniqueColor = (str: string, resType: ResourceConstant): string => {
  return `<span class='resource-name' style='position: relative; color: ${
    resourceColorMap[resType] || 'inherited'
  }'>${str}</span>`;
};


export const allResource = (): void => {
  const time = Game.cpu.getUsed();
  const myCatteries: Room[] = Object.values(Game.rooms).filter((cattery) => cattery.controller?.my);
  const catteriesResource: { [key in string]: CatteryResource } = {};
  myCatteries.forEach((cattery) => {
    catteriesResource[cattery.name] = getCatteryResource(cattery);
  });

  const allResource = myCatteries.reduce((all, room) => addStore(all, catteriesResource[room.name]), {});

  const addRoomList = (text: string, resType: ResourceConstant): string => {
    let str = text;
    if (allResource[resType]) {
      str += `<div class='resource-room' style='position: absolute; display: none; top: 100%; right: 0; padding: 5px; background: #333; color: #ccc; border: 1px solid #ccc; border-radius: 5px; z-index: 10;'>`;
      for (const key in catteriesResource) {
        if (catteriesResource[key][resType])
          str += `${_.padRight(key, 6)}: ${_.padLeft((catteriesResource[key][resType] || 0).toLocaleString(), 9)}<br/>`;
      }
      str += '</div>';
    }
    return str;
  };

  const addList = (list: ResourceConstant[], color?: string): string => {
    let str = `<div style='position: relative; color: ${color};'>`;
    list.forEach((res) => (str += uniqueColor(_.padLeft(res, 15), res)));
    str += '<br/>';
    list.forEach(
      (res) => (str += uniqueColor(addRoomList(_.padLeft((allResource[res] || 0).toLocaleString(), 15), res), res)),
    );
    str += '<br/></div>';
    return str;
  };

  let str = '<br/>基础资源:<br/>';
  str += addList(resourceList.base);
  str += '<br/>压缩资源:<br/>';
  str += addList(resourceList.bar);
  str += '<br/>商品资源:<br/>';
  str += addList(resourceList.commodityBase);
  str += addList(resourceList.commodityMetal, resourceColorMap[RESOURCE_ZYNTHIUM]);
  str += addList(resourceList.commodityBiomass, resourceColorMap[RESOURCE_LEMERGIUM]);
  str += addList(resourceList.commoditySilicon, resourceColorMap[RESOURCE_UTRIUM]);
  str += addList(resourceList.commodityMist, resourceColorMap[RESOURCE_KEANIUM]);
  str += '<br/>LAB资源:<br/>';
  str += addList(resourceList.boostBase);
  str += addList(resourceList.boostU, resourceColorMap[RESOURCE_UTRIUM]);
  str += addList(resourceList.boostK, resourceColorMap[RESOURCE_KEANIUM]);
  str += addList(resourceList.boostL, resourceColorMap[RESOURCE_LEMERGIUM]);
  str += addList(resourceList.boostZ, resourceColorMap[RESOURCE_ZYNTHIUM]);
  str += addList(resourceList.boostG, resourceColorMap[RESOURCE_GHODIUM_MELT]);
  str += `<script>$('.resource-name').hover(function() { $(this).find('.resource-room').show() }, function() { $(this).find('.resource-room').hide() })</script>`;
  console.log(str);
  console.log(`cpu: ${Game.cpu.getUsed() - time}`);
};

export const roomResource = (roomName:string): void => {
  const time = Game.cpu.getUsed();
  const myCatteries: Room[] = [Game.rooms[roomName]];
  const catteriesResource: { [key in string]: CatteryResource } = {};
  myCatteries.forEach((cattery) => {
    catteriesResource[cattery.name] = getCatteryResource(cattery);
  });

  const allResource = myCatteries.reduce((all, room) => addStore(all, catteriesResource[room.name]), {});

  const addRoomList = (text: string, resType: ResourceConstant): string => {
    let str = text;
    if (allResource[resType]) {
      str += `<div class='resource-room' style='position: absolute; display: none; top: 100%; right: 0; padding: 5px; background: #333; color: #ccc; border: 1px solid #ccc; border-radius: 5px; z-index: 10;'>`;
      for (const key in catteriesResource) {
        if (catteriesResource[key][resType])
          str += `${_.padRight(key, 6)}: ${_.padLeft((catteriesResource[key][resType] || 0).toLocaleString(), 9)}<br/>`;
      }
      str += '</div>';
    }
    return str;
  };

  const addList = (list: ResourceConstant[], color?: string): string => {
    let str = `<div style='position: relative; color: ${color};'>`;
    list.forEach((res) => (str += uniqueColor(_.padLeft(res, 15), res)));
    str += '<br/>';
    list.forEach(
      (res) => (str += uniqueColor(addRoomList(_.padLeft((allResource[res] || 0).toLocaleString(), 15), res), res)),
    );
    str += '<br/></div>';
    return str;
  };

  let str = '<br/>基础资源:<br/>';
  str += addList(resourceList.base);
  str += '<br/>压缩资源:<br/>';
  str += addList(resourceList.bar);
  str += '<br/>商品资源:<br/>';
  str += addList(resourceList.commodityBase);
  str += addList(resourceList.commodityMetal, resourceColorMap[RESOURCE_ZYNTHIUM]);
  str += addList(resourceList.commodityBiomass, resourceColorMap[RESOURCE_LEMERGIUM]);
  str += addList(resourceList.commoditySilicon, resourceColorMap[RESOURCE_UTRIUM]);
  str += addList(resourceList.commodityMist, resourceColorMap[RESOURCE_KEANIUM]);
  str += '<br/>LAB资源:<br/>';
  str += addList(resourceList.boostBase);
  str += addList(resourceList.boostU, resourceColorMap[RESOURCE_UTRIUM]);
  str += addList(resourceList.boostK, resourceColorMap[RESOURCE_KEANIUM]);
  str += addList(resourceList.boostL, resourceColorMap[RESOURCE_LEMERGIUM]);
  str += addList(resourceList.boostZ, resourceColorMap[RESOURCE_ZYNTHIUM]);
  str += addList(resourceList.boostG, resourceColorMap[RESOURCE_GHODIUM_MELT]);
  str += `<script>$('.resource-name').hover(function() { $(this).find('.resource-room').show() }, function() { $(this).find('.resource-room').hide() })</script>`;
  console.log(str);
  console.log(`cpu: ${Game.cpu.getUsed() - time}`);
};
