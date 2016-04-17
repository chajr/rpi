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
