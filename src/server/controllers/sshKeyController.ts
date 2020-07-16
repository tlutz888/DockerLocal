export { };

import { Request, Response, NextFunction } from "express";
import { exec } from 'child_process';
import fetch from 'node-fetch';
const fs = require("fs");
const homedir: string = require('os').homedir();
import * as path from 'path';
import { app } from 'electron'

// import helper function to execute shell scripts
const execShellCommand = require("./helpers/shellHelper");

const sshKeyController: any = {};

/**
 * @middleware  Create SSH key to be used for connection to clone/update github repos
 * @desc    Executes sshKeygen.sh
 */
sshKeyController.createSSHkey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  // shell script adds the github.com domain name to the known_hosts file using the ssh-keyscan command
  // script then clones github repo using SSH connection
  // const shellCommand = "sh src/scripts/sshKeygen.sh";
  const shellCommand = `sh ${path.join(homedir, 'DockerLocalFiles/scripts/sshKeygen.sh')}`;
  const directory = path.join(homedir, 'DockerLocalFiles/scripts/sshKeygen.sh')
  console.log('creating ssh key ', directory)


  const myShellScript = await exec(shellCommand);
  console.log('creating ssh key ')
  
  // myShellScript.stdout.on('data', (data: string) => {
  //   const output = data;
  //   console.log('data:  ', data)

  //   // checking for shell script error message output caused by lack of dockerfile inside active Project
  //   if (output === "missing repository with Dockerfile\n") {
  //     return next({
  //       log: `ERROR caught in dockerController.getFilePaths SHELL SCRIPT:`,
  //       msg: { err: 'dockerContoller.getFilePaths: ERROR: Check server logs for details' }
  //     });
  //   }


    // const shellResult = await execShellCommand(shellCommand)
    //   if (shellResult instanceof Error){
    //     return next({
    //       log: `Error caught in sshKeyController.createSSHkey: execShellCommand produces error: ${shellResult}`,
    //       msg: {err:`sshKeyController.createSSHkey: ERROR: Check server logs for details`},
    //     })
    //   }
    return next();
  // });
}

/**
 * @middleware  Push SSH key to user's github account
 * @desc    Uses a post request to github API
 */
sshKeyController.addSSHkeyToGithub = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken, username } = res.locals;

  console.log('****dirname', app.getAppPath())
  console.log('****dirname', app.getPath('exe'))
  console.log('****dirname', app.getPath('temp'))
  console.log('****dirname', app.getPath('home'))

  console.log("adding ssh to github");
  // const sshKey = fs.readFileSync(path.join(app.getPath('home'), "tmpKeys/dockerKey.pub"), "utf8");
  const sshKey = fs.readFileSync("./tmpKeys/dockerKey.pub", "utf8");
  console.log('finished reading file, sshkey: ', sshKey)

  // create the request body which we will use to create the ssh key on Github
  const reqBody = JSON.stringify({
    title: `${username}@DockerLocal`,
    key: sshKey,
  });

  // send a post request to Github api to add the ssh key to user's keys
  const url = `https://api.github.com/user/keys`;

  const response: any = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-type": "application/json",
    },
    body: reqBody,
  }).catch((err: Error) => next({
    log: `Error caught in sshKeyController.addSSHkeyToGithub: Issue sending post request to Github API: ${err}`,
    msg: { err: 'sshKeyController.addSSHkeyToGithub: ERROR: Check server logs for details' }
  }));
  
  // converts the response body into JSON
  const jsonResponse = await response.json();
  console.log('jsonResponse: ', jsonResponse)

  // save the key id from the response. this will be used to delete the key from Github after we are done using it
  const { id } = jsonResponse;
  res.locals.keyId = id;

  return next();
};

/**
 * @middleware  Deletes public SSH key from user's github account and private/public keys from ./tmpKeys folder
 * @desc    Uses a post request to github API
 */
sshKeyController.deleteSSHkey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('deleting SSH key **** ')
  const { accessToken, keyId } = res.locals;

  const directory = path.join(homedir, 'DockerLocalFiles/scripts/sshKeyDelete.sh')
  const shellCommand = `sh ${directory}`;
  console.log('directory **** ', directory)

  const myShellScript = await exec(shellCommand);
  myShellScript.stdout.on('data', (data: string) => {
    const output = data;

    // checking for shell script error message output caused by lack of dockerfile inside active Project
    if (output === "missing repository with Dockerfile\n") {
      return next({
        log: `ERROR caught in dockerController.getFilePaths SHELL SCRIPT:`,
        msg: { err: 'dockerContoller.getFilePaths: ERROR: Check server logs for details' }
      });
    }


    // await execShellCommand(shellCommand, []);

    const url = `https://api.github.com/user/keys/${keyId}`;
    fetch(url, {
      method: "delete",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() =>  next())
      .catch((err: Error) => next({
        log: `Error caught in sshKeyController.deleteSSHkey: deleting key from github produces error: ${err}`,
        msg: { err: 'sshKeyController.deleteSSHkey: ERROR: Check server logs for details' }
      }));

    
  });
}
module.exports = sshKeyController;
