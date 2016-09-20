SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `actor` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `icons`;

CREATE TABLE `icons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `fontClass` varchar(255) DEFAULT NULL,
  `tags` varchar(2000) DEFAULT NULL,
  `code` int(11) DEFAULT NULL,
  `path` varchar(5000) NOT NULL,
  `createTime` datetime NOT NULL,
  `applyTime` datetime DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT '0',
  `oldId` int(11) DEFAULT NULL,
  `newId` int(11) DEFAULT NULL,
  `uploader` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uploader` (`uploader`),
  CONSTRAINT `icons_ibfk_1` FOREIGN KEY (`uploader`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `repositories`;

CREATE TABLE `repositories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) NOT NULL,
  `notice` varchar(255) DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  `admin` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `alias` (`alias`),
  UNIQUE KEY `repositories_name_unique` (`name`),
  UNIQUE KEY `repositories_alias_unique` (`alias`),
  KEY `admin` (`admin`),
  CONSTRAINT `repositories_ibfk_1` FOREIGN KEY (`admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `projects`;

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `info` varchar(255) DEFAULT NULL,
  `public` tinyint(1) DEFAULT '0',
  `baseline` tinyint(1) DEFAULT '0',
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `projects_name_unique` (`name`),
  KEY `owner` (`owner`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `repoVersions`;

CREATE TABLE `repoVersions` (
  `repositoryId` int(11) NOT NULL DEFAULT '0',
  `version` int(11) NOT NULL,
  `iconId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`repositoryId`,`version`,`iconId`),
  KEY `iconId` (`iconId`),
  CONSTRAINT `repoVersions_ibfk_1` FOREIGN KEY (`repositoryId`) REFERENCES `repositories` (`id`),
  CONSTRAINT `repoVersions_ibfk_2` FOREIGN KEY (`iconId`) REFERENCES `icons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='大库与图标对应关系表';

DROP TABLE IF EXISTS `logs`;

CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `scope` varchar(255) DEFAULT NULL,
  `loggerId` int(11) DEFAULT NULL,
  `operation` varchar(5000) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `operator` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `operator` (`operator`),
  KEY `loggerId_scope_index` (`loggerId`,`scope`) USING BTREE,
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`operator`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `projectVersions`;

CREATE TABLE `projectVersions` (
  `projectId` int(11) NOT NULL DEFAULT '0',
  `version` int(11) NOT NULL,
  `iconId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`projectId`,`version`,`iconId`),
  KEY `iconId` (`iconId`),
  CONSTRAINT `projectVersions_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  CONSTRAINT `projectVersions_ibfk_2` FOREIGN KEY (`iconId`) REFERENCES `icons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='项目与图标对应关系表';

DROP TABLE IF EXISTS `userLogs`;

CREATE TABLE `userLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unread` tinyint(1) DEFAULT '1',
  `userId` int(11) DEFAULT NULL,
  `logId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userLogs_logId_userId_unique` (`userId`,`logId`),
  KEY `logId` (`logId`),
  CONSTRAINT `userLogs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userLogs_ibfk_2` FOREIGN KEY (`logId`) REFERENCES `logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户通知信息表';

DROP TABLE IF EXISTS `userProjects`;

CREATE TABLE `userProjects` (
  `projectId` int(11) NOT NULL DEFAULT '0',
  `userId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`projectId`,`userId`),
  KEY `userId` (`userId`),
  CONSTRAINT `userProjects_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userProjects_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;