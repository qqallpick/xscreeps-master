/* 签名常量 */
export const signConstant = [
    'xxx: 哇哇哇哇。',
    'xxx: 噢噢噢噢。'
    
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