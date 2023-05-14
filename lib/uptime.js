exports.upTime = function(startTime) {
    let currentTime = new Date().getTime();
    let calc = currentTime - startTime;
    let diff = new Date(calc);

    return (diff.getHours() -1) + ':' + diff.getMinutes() + ':' + diff.getSeconds();
}
