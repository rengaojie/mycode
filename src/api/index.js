import httpServer from './http.js'

// 皮带列表
export async function getAllBeltWebList() {
    return httpServer({
        url: `mainPage/getAllBeltWebList`,
        methods: 'post'
    },{})
}

//皮带状态列表 getAllBeltState
export async function getAllBeltState() {
    return httpServer({
        url: `mainPage/getAllBeltState`,
        methods: 'post'
    },{})
}

// getAllBeltSelfWarningState
export async function getAllBeltSelfWarningState() {
    return httpServer({
        url: `mainPage/getAllBeltSelfWarningState`,
        methods: 'post'
    },{})
}

// 闭锁状态
export async function getAllBeltAtresiaState() {
    return httpServer({
        url: `mainPage/getAllBeltAtresiaState`,
        methods: 'post'
    },{})
}

// 摄像头设备告警信息列表
export async function getDeviceWarningList(data) {
    return httpServer({
        url: `mainPage/getDeviceWarningList`,
        methods: 'post'
    },data)
}

// 获取摄像头详情 getDeviceInfo
export async function getDeviceInfo(data) {
    return httpServer({
        url: `mainPage/getDeviceInfo`,
        methods: 'post'
    },data)
}

// 获取摄像头状态 getAllDeviceState
export async function getAllDeviceState(data) {
    return httpServer({
        url: `mainPage/getAllDeviceState`,
        methods: 'post'
    },data)
}

export async function getWarningList(data) {
    return httpServer({
        url: `mainPage/getWarningList`,
        methods: 'post'
    },data)
}
// getAllWarningUnreadCount
export async function getAllWarningUnreadCount() {
    return httpServer({
        url: `mainPage/getAllWarningUnreadCount`,
        methods: 'post'
    },{})
}

// 告警确认
export async function warningConfirm(data) {
    return httpServer({
        url: `mainPage/warningConfirm`,
        methods: 'post'
    },data)
}

// 获取监控列表 getDeviceList
export async function getDeviceList(data={}) {
    return httpServer({
        url: `mainPage/getDeviceList`,
        methods: 'post'
    },data)
}
