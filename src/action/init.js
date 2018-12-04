const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const inquirer = require("inquirer");
const getGitUser = require("../util/git-user");
const consolidate = require("consolidate");
const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

function getAnswers(projectName) {
  const author = getGitUser();
  const question = [
    {
      type: "list",
      message: "Choose your project type",
      default: "DESKTOP project in javascript",
      name: "scaffoldType",
      choices: ["DESKTOP project in javascript", "DESKTOP project in typescript"]
    },
    {
      type: "input",
      message: "Project name",
      default: projectName,
      name: "projectName"
    },
    {
      type: "input",
      message: "Project description",
      default: "A Kos.js project",
      name: "description"
    },
    {
      type: "input",
      message: "Author",
      default: author,
      name: "author"
    },
    // {
    //   type: "confirm",
    //   message: "Would you want use ESLint or TSLint in your project code?",
    //   default: true,
    //   name: "lint"
    // },
    // {
    //   type: "list",
    //   message: "Choose your css preLoader",
    //   default: "less",
    //   name: "cssPreLoader",
    //   choices: ["less(current project)", "sass", "scss", "stylus"]
    // },
    {
      type: "list",
      message: "Do you want to install dependencies using 'npm install' now?",
      default: "npm install",
      name: "install",
      choices: ["npm install", "Install dependencies manually later"]
    }
  ];
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(question)
      .then(function(answers) {
        resolve(answers);
        console.log("\n\n\n");
      })
      .catch(err => reject(err));
  });
}

function downloadTmpl(type, projectPath) {
  let gitPath = "";
  switch (type) {
    case "DESKTOP project in javascript": //
      gitPath = "https://github.com/ali-kos/kos-scaffold-desktop1-javascript.git#for-CLI";
      break;
    case "DESKTOP project in typescript": //
      gitPath = "https://github.com/ali-kos/kos-scaffold-desktop1-typescript.git#for-CLI";
      break;
    default:
      gitPath = "https://github.com/ali-kos/kos-scaffold-desktop1-javascript.git#for-CLI";
  }

  const spinner = ora("Downloading template...");
  return new Promise((resolve, reject) => {
    spinner.start();
    download(`direct:${gitPath}`, projectPath, { clone: true }, function(err) {
      if (err) {
        reject(err);
      }
      // process.stdout.clearLine();
      // process.stdout.cursorTo(0);
      console.log(chalk.cyan("Downloaded.\n"));
      spinner.stop();
      resolve();
    });
  });
}

function renderTmpl(filePath, option) {
  const file = `${option.projectName}/${filePath}`;
  return new Promise((resolve, reject) => {
    consolidate.swig(file, option, function(err, data) {
      if (err) {
        reject(err);
      }
      fs.writeFile(file, data, function(err) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  });
}

async function renderTmpls(option) {
  const tmplOptionPath = `${option.projectName}/tmpl.json`;
  let tmplOption = fs.readFileSync(`${option.projectName}/tmpl.json`);
  tmplOption = tmplOption.toString();
  tmplOption = JSON.parse(tmplOption);
  const tmplPath = tmplOption.tmplpath;
  for (let i = 0; i < tmplPath.length; i++) {
    await renderTmpl(tmplPath[i], option);
  }
  await fs.unlink(tmplOptionPath, function() {});
}

async function init(projectName) {
  const option = await getAnswers(projectName);
  const cwd = process.cwd();
  const projectPath = path.join(cwd, option.projectName);
  await downloadTmpl(option.scaffoldType, projectPath);
  await renderTmpls(option);
  console.log("\n\n");
  console.log("# Installing project dependencies...");
  console.log("# ========================\n");

  process.chdir(projectPath);
  switch (option.install) {
    case "npm install":
      const npmInstall = exec("npm install");
      npmInstall.stdout.on("data", function(data) {
        console.log(data);
      });
      npmInstall.stderr.on("data", function(data) {
        console.log(data);
      });
      npmInstall.on("close", function(code) {
        console.log(code);
      });
      break;
    case "yarn":
      const yarnInstall = exec("yarn");
      yarnInstall.stdout.on("data", function(data) {
        console.log(data);
      });
      yarnInstall.stderr.on("data", function(data) {
        console.log(data);
      });
      yarnInstall.on("close", function(code) {
        console.log(code);
      });
      break;
    default:
  }
}

module.exports = init;
