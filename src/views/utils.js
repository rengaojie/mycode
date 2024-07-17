const customHeaderRow = (column, index) => {
    return {
        class: "header-row",
    };
};
const rowClassName = (record, index) => {
    if (index % 2 === 1) {
        return "default-row double-row";
    }
    return "default-row";
};
let legendList = [
    {
        name: '运行',
        color: '#63C242'
    },
    {
        name: '停止',
        color: '#B6C6E0'
    },
   /* {
        name: '异常',
        color: '#D79C10'
    },
    {
        name: '报警',
        color: '#A51919'
    }*/
]

export {
    customHeaderRow,
    rowClassName,
    legendList
}