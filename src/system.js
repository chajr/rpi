var exec = require('sync-exec');
var log = require('../lib/log');
var worker = require('../lib/worker');
var request = require('request');
var config;
var name = 'System worker';

var commands = {
    date: 'date +"%Y-%m-%d %T"',
    cpu_utilization: 'top -bn2 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk \'{print 100 - $1}\' | tail -1', //correct but slow
    memory_free: 'free | grep Mem | awk \'{print $4/$2 * 100.0}\'',
    memory_used: 'free | grep Mem | awk \'{print $3/$2 * 100.0}\'',
    uptime_p: 'uptime -p',
    uptime_s: 'uptime -s',
    system_load: 'cat /proc/loadavg | awk \'{print $1,$2,$3}\'',
    process_number: 'ps -Af --no-headers | wc -l',
    disk_utilization: 'iostat -d /dev/sda | sed -n "4p"', //
    network_utilization: 'ifstat -i eth0 -q 1 1 | tail -1', //
    logged_in_users: 'users',
    logged_in_users_count: 'users | wc -w',
    users_work: 'w -h',
    hostname: 'hostname',
    ip_internal: 'ip route get 8.8.8.8 | awk \'{print $NF; exit}\'',
    ip_external: 'wget http://ipinfo.io/ip -qO -'
};
var data = {};

exports.launch = function (args, appConfig) {
    config = appConfig;

    worker.startWorker(
        collectData,
        config.get('workers.system.worker_time'),
        name
    );
};

function collectData() {
    for (var key in commands) {
        data[key] = exec(commands[key]).stdout;
    }

    var url = config.get('workers.system.data_collector')
        + '?key='
        + config.get('workers.system.security_key');

    request.post(
        url,
        {form: data},
        function (error, response, body) {
            if (error) {
                log.logError(error);
            } else {
                log.logInfo(body);
            }
        }
    );
}
