//解决小数运算精度问题
export const operationTwoNumber = (num1, num2, type = 0) => {
    let num_1 = num1.toString().split('.')
    let num_2 = num2.toString().split('.')
    let maxPointLen = 0
    if (num_1.length > 1 && num_2.length > 1 && num_1[1].length >= num_2[1].length) {
        maxPointLen = num_1[1].length
    } else if (num_1.length > 1 && num_2.length > 1 && num_1[1].length < num_2[1].length) {
        maxPointLen = num_2[1].length
    } else {
        if (!type) {
            return num1 + num2
        } else {
            return num1 - num2
        }
    }
    num_1 = num1 * Math.pow(10, maxPointLen)
    num_2 = num2 * Math.pow(10, maxPointLen)
    if (!type) {
        return (num_1 + num_2) / Math.pow(10, maxPointLen)
    } else {
        return (num_1 - num_2) / Math.pow(10, maxPointLen)
    }
}

//判断数组中是否存在空数据
export const emptyInArr = (arr, expObjs) => {
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element instanceof Object) {
            if (Object.keys(element).length === 0) {
                return true;
            }
        }
        if (element instanceof Array) {
            if (element.length === 0) {
                return true;
            }
        }
        if (typeof element === 'string' && !element.trim()) {
            return true;
        }
        if (!element) {
            return true;
        }
    }
    return false;
}

//指定类型，长度获取随机字符串
function randomStr(type, maxlen = 10) {
    //type:str;upper;lower;uppernum;lowernum;num;strnum
    let result = ''
    let strs = ''
    const letters = getLetter()
    switch (type) {
        case 'str':
            strs = [...letters.lower, ...letters.upper];
            break;
        case 'upper':
            strs = [...letters.upper];
            break;
        case 'lower':
            strs = [...letters.lower];
            break;
        case 'uppernum':
            strs = [...letters.upper, ...getNumList(10)];
            break;
        case 'lowernum':
            strs = [...letters.lower, ...getNumList(10)];
            break;
        case 'num':
            strs = [...getNumList(10)];
            break;
        case 'strnum':
            strs = [...letters.lower, ...letters.upper, ...getNumList(10)];
            break;
    }
    for (let i = 0; i < maxlen; i++) {
        result = result + strs[getRandomNum(strs.length)]
    }
    return result;
}

//获取26个大小写字母
function getLetter() {
    let result = {
        lower: [],
        upper: []
    }
    for (let i = 97; i < 97 + 26; i++) {
        result['lower'].push(String.fromCharCode(i))
        result['upper'].push(String.fromCharCode(i - 32))
    }
    return result;
}

//返回一个[0,num)范围内的随机数整数
function getRandomNum(num) {
    return parseInt(Math.random() * num)
}

//返回一个[0,num)范围的数字数组
function getNumList(num) {
    const result = []
    for (let i = 0; i < num; i++) {
        result.push(i)
    }
    return result;
}



export default{
    operationTwoNumber,
    emptyInArr,
    randomStr,
    getLetter,
    getRandomNum,
    getNumList
}