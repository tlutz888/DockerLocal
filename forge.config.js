const fs = require("fs")
const path = require("path")
const homedir = require('os').homedir();

module.exports = {
    "packagerConfig": {},
    "makers": [
      {
        "name": "@electron-forge/maker-squirrel",
        "config": {
          "name": "dockerlocal"
        }
      },
      {
        "name": "@electron-forge/maker-zip",
        "platforms": [
          "darwin"
        ]
      },
      {
        "name": "@electron-forge/maker-deb",
        "config": {}
      },
      {
        "name": "@electron-forge/maker-rpm",
        "config": {}
      }
    ],
    "plugins": [
      [
        "@electron-forge/plugin-webpack",
        {
          "mainConfig": "./webpack.main.config.js",
          "renderer": {
            "config": "./webpack.renderer.config.js",
            "entryPoints": [
              {
                "html": "./src/index.html",
                "js": "./src/app.tsx",
                "name": "main_window"
              }
            ]
          }
        }
      ]
    ],
    "hooks": {
      // creates a folder and stores shell scripts
      // need to revert gitcontroller/execshellscript back to the way it was before now that the shell scripts are accessible
      generateAssets: async () => {
        console.log(homedir)
        fs.mkdirSync(path.join(homedir, 'DockerLocalFiles/scripts'), { recursive: true })
        fs.copyFileSync('./src/scripts/cloneRepo.sh', path.join(homedir, 'DockerLocalFiles/scripts/cloneRepo.sh'))
        fs.copyFileSync('./src/scripts/findDockerfiles.sh', path.join(homedir, 'DockerLocalFiles/scripts/findDockerfiles.sh'))
        fs.copyFileSync('./src/scripts/sshKeyDelete.sh', path.join(homedir, 'DockerLocalFiles/scripts/sshKeyDelete.sh'))
        fs.copyFileSync('./src/scripts/sshKeygen.sh', path.join(homedir, 'DockerLocalFiles/scripts/sshKeygen.sh'))
      }
    }

}