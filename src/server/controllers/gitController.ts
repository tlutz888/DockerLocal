export { };

import { Request, Response, NextFunction } from "express";
import { Repo } from '../../types/types';
import { app } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
const homedir: string = require('os').homedir();




// import helper function to execute shell scripts
const execShellCommand = require("./helpers/shellHelper");

const gitController: any = {};

/**
 * @middleware  Clone Github repositor(y/ies) using an SSH connection
 * @desc    Clones git repository from github. Expects repository info to be in res.locals.
 */
gitController.cloneRepo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const { repos, projectName }: { repos: Repo[]; projectName: string } = res.locals;
  const shellDirectory = path.join(homedir, 'DockerLocalFiles/scripts/sshKeygen.sh');
  // const directory = `${app.getPath('home')}/Library/Application\ Support/`;
  console.log('starting clonerepos ***')

  // make an array of promises to clone all selected repos
  const promises = await repos.map(async (currentRepo: { repoOwner: string; repoName: string }) => {
    const repoOwner = currentRepo.repoOwner;
    const repoName = currentRepo.repoName;

    if (!(repoOwner || repoName)) {
      return next({
        log: `Error caught in gitContoller.cloneRepo: Missing repoOwner: ${repoOwner} or name ${repoName}`,
        msg: { err: 'gitContoller.cloneRepo: ERROR: Check server logs for more details' }
      });
    }
    console.log('shell script = ' , `${shellDirectory} ${repoOwner} ${repoName} ${projectName}`)
    // shell script clones github repo using SSH connection
    const myShellScript = await execShellCommand(`sh ${shellDirectory} ${repoOwner} ${repoName} ${projectName}`);
    // console.log(myShellScript)
    // myShellScript.stdout.on('data', (data: string) => {
    //   const output = data;
    //   console.log(output)

    //   // checking for shell script error message output caused by lack of dockerfile inside active Project
    //   if (output === "missing repository with Dockerfile\n") {
    //     return next({
    //       log: `ERROR caught in dockerController.getFilePaths SHELL SCRIPT:`,
    //       msg: { err: 'dockerContoller.getFilePaths: ERROR: Check server logs for details' }
    //     });
    //   }

    //   // console.log('cloning repo', data)

    //   return myShellScript;
    // });
  })
  console.log(promises)
  console.log('before promise.all')

  const myShellScript = await execShellCommand(`sh ${shellDirectory} ${res.locals.repos[0].repoOwner} ${res.locals.repos[0].repoName} ${res.locals.projectName}`);

  // execute cloning ALL repos
  // await Promise.all(promises)
  //   .then(() => next())
  //   .catch(
  //     err => next({
  //       log: `Error in shell scripts cloning repos in gitController.cloneRepo: ${err}`,
  //       msg: {
  //         err: 'gitContoller.cloneRepo: ERROR: Check server logs for more details'
  //       }
  //     })
  //   )

  return next();
};

module.exports = gitController;
