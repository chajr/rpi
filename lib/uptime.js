exports.upTime = function (startTime) {
    var currentTime = new Date().getTime();
    var calc = currentTime - startTime;
    var diff = new Date(calc);

    return (diff.getHours() -1) + ':' + diff.getMinutes() + ':' + diff.getSeconds();
};
