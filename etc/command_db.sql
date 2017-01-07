CREATE TABLE `system_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `cpu_utilization` decimal(10,2) DEFAULT NULL,
  `system_load` varchar(45) DEFAULT NULL,
  `memory_free` float DEFAULT NULL,
  `memory_used` float DEFAULT NULL,
  `network_utilization` varchar(45) DEFAULT NULL,
  `disk_utilization` varchar(45) DEFAULT NULL,
  `hostname` varchar(45) DEFAULT NULL,
  `log_time` datetime DEFAULT NULL,
  `uptime_p` varchar(45) DEFAULT NULL,
  `uptime_s` varchar(45) DEFAULT NULL,
  `process_number` int(11) DEFAULT NULL,
  `logged_in_users` varchar(255) DEFAULT NULL,
  `logged_in_users_count` int(11) DEFAULT NULL,
  `users_work` text,
  `ip_internal` varchar(15) DEFAULT NULL,
  `ip_external` varchar(15) DEFAULT NULL,
  `extra` text,
  `log_server_time` datetime DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  UNIQUE KEY `log_id_UNIQUE` (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=418609 DEFAULT CHARSET=latin2;

CREATE TABLE `commands` (
  `command_id` int(11) NOT NULL AUTO_INCREMENT,
  `command` text,
  `date_time` datetime DEFAULT NULL,
  `response_date_time` datetime DEFAULT NULL,
  `executed` tinyint(1) NOT NULL DEFAULT '0',
  `response` text,
  `exec_time` datetime DEFAULT NULL,
  `error` tinyint(1) NOT NULL DEFAULT '0',
  `host` varchar(50) DEFAULT NULL,
  `consumed` tinyint(1) NOT NULL DEFAULT '0',
  `to_be_exec` datetime DEFAULT NULL,
  PRIMARY KEY (`command_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin2;

ALTER TABLE `zmp`.`system_log` 
ADD COLUMN `disk_usage` VARCHAR(45) NULL DEFAULT NULL AFTER `log_server_time`;

ALTER TABLE `zmp`.`commands` 
ADD COLUMN `command_consumed_date_time` DATETIME NULL DEFAULT NULL AFTER `to_be_exec`;

ALTER TABLE `zmp`.`commands` 
ADD COLUMN `mongo_id` VARCHAR(24) NULL DEFAULT NULL AFTER `command_consumed_date_time`;
