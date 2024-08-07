export function compareTimestamp(timestamp) {
    const now = Date.now();
    const difference = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;

    if (difference < minute) {
        return '一分钟内';
    } else if (difference < hour) {
        const minutes = Math.floor(difference / minute);
        return `${minutes} 分钟前更新`;
    } else if (difference < day) {
        const hours = Math.floor(difference / hour);
        return `${hours} 小时前更新`;
    } else if (difference < month) {
        const days = Math.floor(difference / day);
        return `${days} 天前更新`;
    } else if (difference < 3 * month) {
        const months = Math.floor(difference / month);
        return `${months} 个月前更新`;
    } else {
        return null;
    }
}