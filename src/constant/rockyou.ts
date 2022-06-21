/* 签名常量 */
export const signConstant = [
    '太阳可维修，月亮可更换，星星不好包退换。',
    '火车飞驰去往远方，两边黄灿灿的庄稼徐徐退后，我离家一百里又一百里。',
    '一杯杰克·威尔斯，我请。',
    '不要走进那温顺的良夜。',
    '是继续走下去，还是停止在现在？',
    '噩梦并不受逻辑的控制，而且如果噩梦能够解释，反会失去原有的趣味，因为噩梦和恐惧的艺术是相互对立的。',
    '谁都不希望原地踏步，困在过去。他们想要改变，他们，还有这个世界。可改变个屁，“全新的交互方式，全新的高果糖糖浆，还带不同的水果口味"',
    '夜之城没有活着的传奇！',
    '我们的征途是星辰大海！',
    '世界属于三体！',
    '无名小卒，还是名扬天下？',
    '致命错误......',
    'mofeng: 来丶二次元。',
    'mofeng: 👴的时间非常值钱',
    'QiroNT: 这个屎山代码是怎么运行起来.jpg',
    '6g3y: can you respawn?',
    'somygame: 麻了',
    'sokranotes: 63 is watching you',
    'RayAidas: 我tm直接unclaim',
    'xuyd: this is a little unfriendly!',
    'hoho: hoho'
    
]

export function randomRange(lowerValue,upperValue):number{
    let total=upperValue-lowerValue+1
    return Math.floor(Math.random()*total+lowerValue)
}

export function randomSign():string{
    let length = signConstant.length
    let index = randomRange(0,length-1)
    if (index < 0) index = 0
    if(index >= signConstant.length) index = signConstant.length -1
    return signConstant[index]
}