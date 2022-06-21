
/**
 * ------------------------ 以下的是用于创建 HTML Element 时使用的声明 -----------------------------------
 */

// HTML 元素基类
interface ElementDetail {
    // 该元素的 name 属性
    name: string
    // 该元素的前缀（用于 form 中）
    label?: string
    // 每个基础元素都要有这个字段来标志自己描述的那个元素
    type: string
}

type HTMLElementDetail = InputDetail | SelectDetail

// 输入框
interface InputDetail extends ElementDetail {
    // 提示内容
    placeholder?: string
    type: 'input'
}

// 下拉框
interface SelectDetail extends ElementDetail {
    // 选项
    options: {
        // 选项值
        value: string | number
        // 选项显示内容
        label: string
    }[]
    type: 'select'
}

// 按钮
interface ButtonDetail {
    // 按钮显示文本
    content: string
    // 按钮会执行的命令（可以访问游戏对象）
    command: string
}

/**
 * 绘制帮助时需要的模块信息
 */
interface ModuleDescribe {
    // 模块名
    name: string
    // 模块介绍
    describe: string
    // 该模块的 api 列表
    api: FunctionDescribe[]
}

// 函数介绍构造函数的参数对象
interface FunctionDescribe {
    // 该函数的用法
    title: string
    // 参数介绍
    describe?: string
    // 该函数的参数列表
    params?: {
        // 参数名
        name: string
        // 参数介绍
        desc: string
    }[]
    // 函数名
    functionName: string
    // 是否为直接执行类型：不需要使用 () 就可以执行的命令
    commandType?: boolean
}
