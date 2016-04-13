CREATE TABLE `commands` (
  `command_id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `command` TEXT NULL COMMENT '',
  `date_time` DATETIME NULL COMMENT '',
  `response_date_time` DATETIME NULL COMMENT '',
  `executed` TINYINT(1) NULL DEFAULT 0 COMMENT '',
  `response` TEXT NULL COMMENT '',
  `exec_time` DATETIME NULL COMMENT '',
  `error` TINYINT(1) NULL DEFAULT 0 COMMENT '',
  `host` VARCHAR(50) NULL COMMENT '',
  `consumed` TINYINT(1) NULL DEFAULT 0 COMMENT '',
  PRIMARY KEY (`command_id`)  COMMENT '');