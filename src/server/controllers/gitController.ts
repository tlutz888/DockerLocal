export {};

import { Request, Response, NextFunction } from "express";
import { Repo } from '../../types/types';
import { app } from 'electron';
import * as path from 'path';


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
) => {
  console.log("request");

  const { repos, projectName }: {repos: Repo[]; projectName: string} = res.locals;
  const shellCommand = "./src/scripts/cloneRepo.sh";
  const directory = `${app.getPath('home')}/Library/Application\ Support/`;
  console.log('route ****** ', directory)

  // make an array of promises to clone all selected repos
  const promises = repos.map(async (currentRepo) => {
    const repoOwner = currentRepo.repoOwner;
    const repoName = currentRepo.repoName;

    //     // shell script clones github repo using SSH connection
    const shellResp = await execShellCommand(shellCommand, [
      repoOwner,
      repoName,
      projectName,
      directory
    ]);
    console.log("Finished Cloning Repo");
    return shellResp;
  });

  const shellResp = await Promise.all(promises);
  console.log(shellResp);

  console.log("Finished cloning all repos");

  return next();
};

module.exports = gitController;
