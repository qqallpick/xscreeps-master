import { Colorful } from "@/utils"

/**
 * 创建帮助信息
 * 给帮助的显示添加一点小细节
 * 
 * @param modules 模块的描述
 */
export function createHelp(...modules: ModuleDescribe[]): string {
    return moduleStyle() + apiStyle() + `<div class="module-help">${modules.map(createModule).join('')}</div>`
}

const createModule = function(module: ModuleDescribe): string {
    const functionList = module.api.map(createApiHelp).join('')
    
    const html = `<div class="module-container">
        <div class="module-info">
            <span class="module-title">${Colorful(module.name, 'yellow')}</span>
            <span class="module-describe">${Colorful(module.describe, 'green')}</span>
        </div>
        <div class="module-api-list">${functionList}</div>
    </div>`

    return html.replace(/\n/g, '')
}

/**
 * 绘制单个 api 的帮助元素
 * 
 * @param func api 的描述信息
 * @returns 绘制完成的字符串
 */
const createApiHelp = function(func: FunctionDescribe): string {
    const contents: string[] = []
    // 介绍
    if (func.describe) contents.push(Colorful(func.describe, 'green'))

    // 参数介绍
    if (func.params) contents.push(func.params.map(param => {
        return `  - ${Colorful(param.name, 'blue')}: ${Colorful(param.desc, 'green')}`
    }).map(s => `<div class="api-content-line">${s}</div>`).join(''))

    // 函数示例中的参数
    let paramInFunc = func.params ? func.params.map(param => Colorful(param.name, 'blue')).join(', ') : ''
    // 如果启用了命令模式的话就忽略其参数
    let funcCall = Colorful(func.functionName, 'yellow') + (func.commandType ? '': `(${paramInFunc})`)

    // 函数示例
    contents.push(funcCall)

    const content = contents.map(s => `<div class="api-content-line">${s}</div>`).join('')
    const checkboxId = `${func.functionName}${Game.time}`
    
    // return func.params ? `${title}\n${param}\n${functionName}\n` : `${title}\n${functionName}\n`

    const result = `
    <div class="api-container">
        <label for="${checkboxId}">${func.title} ${Colorful(func.functionName, 'yellow', true)}</label>
        <input id="${checkboxId}" type="checkbox" />
        <div class="api-content">${content}</div>
    </div>
    `

    return result.replace(/\n/g, '')
}

const moduleStyle = function() {
    const style = `
    <style>
    .module-help {
        display: flex;
        flex-flow: column nowrap;
    }
    .module-container {
        padding: 0px 10px 10px 10px;
        display: flex;
        flex-flow: column nowrap;
    }
    .module-info {
        margin: 5px;
        display: flex;
        flex-flow: row nowrap;
        align-items: baseline;
    }
    .module-title {
        font-size: 19px;
        font-weight: bolder;
        margin-left: -15px;
    }
    .module-api-list {
        display: flex;
        flex-flow: row wrap;
    }
    </style>`

    return style.replace(/\n/g, '')
}

const apiStyle = function() {
    const style = `
    <style>
    .api-content-line {
        width: max-content;
        padding-right: 15px;
    }
    .api-container {
        margin: 5px;
        width: 250px;
        background-color: #2b2b2b;
        overflow: hidden;
        display: flex;
        flex-flow: column;
    }

    .api-container label {
        transition: all 0.1s;
        min-width: 300px;
        
    }
    
    /* 隐藏input */
    .api-container input {
        display: none;
    }
    
    .api-container label {
        cursor: pointer;
        display: block;
        padding: 10px;
        background-color: #3b3b3b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .api-container label:hover, label:focus {
        background-color: #525252;
    }
    
    /* 清除所有展开的子菜单的 display */
    .api-container input + .api-content {
        overflow: hidden;
        transition: all 0.1s;
        width: auto;
        max-height: 0px;
        padding: 0px 10px;
    }
    
    /* 当 input 被选中时，给所有展开的子菜单设置样式 */
    .api-container input:checked + .api-content {
        max-height: 200px;
        padding: 10px;
        background-color: #1c1c1c;
        overflow-x: auto;
    }
    </style>`

    return style.replace(/\n/g, '')
}