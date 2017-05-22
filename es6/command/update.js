import q from 'q';
import fs from 'fs';
import path from 'path';
import walkSync from 'walk-sync';
import FSTree from 'fs-tree-diff';
import chalk from 'chalk';
import inquirer from 'inquirer';
import {exec} from 'child_process';
import GitHub from 'github-api';

import {wget, log, npmPreInstall, buildProject, diffFileO2O, loading } from './utils';

const TYPE_MAP = {
    unlink: {
        color: 'red',
        text: '文件删除'
    },
    rmdir: {
        color: 'red',
        text: '目录删除'
    },
    mkdir: {
        color: 'green',
        text: '目录新增'
    },
    create: {
        color: 'green',
        text: '文件新增'
    },
    change: {
        color: 'cyan',
        text: '文件改动'
    }
};

async function validateProject(src) {
    try {
        const stat = await q.nfcall(fs.stat, src);
        if (!stat.isDirectory()) {
            throw new Error();
        }
    } catch (err) {
        throw new Error('当前目录下不存在 src 路径，请确保在 yicon 项目路径下运行此命令');
    }
}

export default async() => {
    const cwd = process.cwd();
    await validateProject(path.join(cwd, 'src'));
    const gh = new GitHub();
    let version = require(path.join(cwd, 'package.json')).version;
    const questions = [
        {
            type: 'input',
            name: 'version',
            message: '输入当前版本号:',
            default: version
        }
    ];
    const answers = await inquirer.prompt(questions);
    version = 'v' + answers.version;
    const loader = loading('升级预处理');
    gh.getRepo('YMFE', 'yicon').compareBranches(version, 'deploy', (err, ret) => {
        const tasks = ret.files.filter((item) => item.status !== 'added' && item.filename[0] !== '.').map((item) => diffFileO2O(item, version));
        Promise.all(tasks).then((data) => {
            data = data.filter((data) => !!data);
            loader.close();
            if (data.length) {
                log.dim('发现本地改动与升级改动冲突，文件列表如下:');
                data.forEach((file) => {
                    file.item.ban = true;
                    log.warn('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                    log.warn(`文件: ${file.item.filename}`);
                    log.info('本地改动: ');
                    file.diffs.forEach((diff) => {
                        if (diff.added) {
                            log.add(diff.value.slice(0, diff.value.length -1));
                        } else if (diff.removed) {
                            log.remove(diff.value.slice(0, diff.value.length -1));
                        }
                    });
                    log.info('升级改动: ');
                    const lines = file.item.patch.replace(/\@\@([^\"]+)\@\@/g, (a, b) => {
                        log.dim(a);
                        return '';
                    });
                    lines.split('\n').forEach((line) => {
                        switch (line[0]) {
                            case '+':
                                console.log(chalk.green(line));
                                break;
                            case '-':
                                console.log(chalk.red(line));
                                break;
                            default:
                                console.log(chalk.cyan(line));
                        };
                    });
                    log.warn('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
                    console.log();
                });
            } else {

            }
            console.log('可以替换的文件:')
            console.log(ret.files.filter((file) => !file.ban).map((file) => file.filename).join('\n'));
        }).catch((e) => {
            log.error('预处理失败! Error: ', e);
        })
    });
}
