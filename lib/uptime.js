export function upTime(startTime: number) {
    let currentTime: number = new Date().getTime();
    let calc: number = currentTime - startTime;
    let diff: Date = new Date(calc);

    return (diff.getHours() -1) + ':' + diff.getMinutes() + ':' + diff.getSeconds();
}
