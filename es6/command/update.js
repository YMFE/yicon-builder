import q from 'q';
import fs from 'fs';
import path from 'path';
import walkSync from 'walk-sync';
import FSTree from 'fs-tree-diff';
import chalk from 'chalk';
import inquirer from 'inquirer';
import tar from 'tar';
import cpr from 'cpr';
import {exec, execSync} from 'child_process';
import GitHub from 'github-api';

import { wget, log, npmPreInstall, buildProject, diffFileO2O, loading, syncVersion } from './utils';

const defaultBranch = 'master';

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

async function downloadSource(branch) {
    const _branch = branch ? branch : defaultBranch;
    const cwd = process.cwd();
    const srcPrev = path.join(cwd, '../.src_prev');
    if (fs.existsSync(srcPrev)) {
        execSync(`rm -rf ${srcPrev}`);
    }
    while (!fs.existsSync(srcPrev)) {
        fs.mkdirSync(srcPrev);
    }
    const sourceUrl = `YMFE/yicon#${_branch}`;
    await wget(sourceUrl, srcPrev);
}

export default async() => {
    const cwd = process.cwd();
    await validateProject(path.join(cwd, 'src'));
    log.warn('进行升级操作前，请备份数据并检查数据库结构是否正确');
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
    // 将本地项目进行打包存储，方便后续回滚等，名字包括当前执行的时间
    const backups = path.join(cwd, '../backups');
    while (!fs.existsSync(backups)) {
        fs.mkdirSync(backups);
    }
    try {
        await tar.c({
            gzip: true,
            cwd,
            file: path.join(backups, `yicon-${new Date()}.tgz`),
        }, [path.join(cwd, '../src')]);
    } catch (e) {
        log.error(e);
        throw new Error('打包压缩本地项目文件出错啦');
        process.exit(1);
    }

    const ret = await gh.getRepo('YMFE', 'yicon').compareBranches(version, defaultBranch);
    const { files } = ret && ret.data || { files: [] };
    const tasks = files.filter((item) => item.status !== 'added' && item.filename[0] !== '.').map((item) => diffFileO2O(item, version));
    let canReplacedFiles = [];
    let data = [];
    try {
        data = await Promise.all(tasks);
        data = data.filter((data) => !!data);
        loader.close();
    } catch(e) {
        log.error('预处理失败! Error: ', e);
        process.exit(1);
    };
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
        log.done('本地改动与升级改动没有冲突，可以直接进行升级');
    }
    canReplacedFiles = files.filter((file) => !file.ban).map((file) => file.filename);
    console.log('可以替换的文件:');
    console.log(canReplacedFiles.join('\n'));

    try {
        const question = [
            {
                type: 'confirm',
                name: 'isRepleace',
                message: '是否对上述文件进行替换?',
                default: true
            }
        ];
        const answer = await inquirer.prompt(question);
        const { isRepleace } = answer;
        if (!isRepleace) {
            console.log('已放弃自动升级替换，请自行进行代码 diff 升级');
            process.exit(1);
        }
        // 替换
        await downloadSource();
        const srcPrev = path.join(cwd, '../.src_prev');
        const src = path.join(cwd, '../src');
        const loadering = loading('自动替换升级');
        const copyTasks = canReplacedFiles.map(file => {
            const srcPrevFile = path.join(srcPrev, file);
            const srcFile = path.join(src, file);
            return cpr(srcPrevFile, srcFile, { overwrite: true });
        });
        await Promise.all(copyTasks);
        loadering.close();
    } catch (e) {
        log.error('自动替换升级失败! Error: ', e);
        process.exit(1);
    }
    // 重新执行 npm install、npm run build
    await npmPreInstall(cwd, path.join(cwd, '../install.log'), false);
    await buildProject(cwd);
    syncVersion(cwd);
}
