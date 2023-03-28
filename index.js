'use strict';

import bitbucket_pkg from 'bitbucket'
import childProcess from 'child_process'
import fs from 'fs'
import simpleGit from 'simple-git'
import { Octokit } from 'octokit'
import path from 'path'
import chalk from 'chalk'

const bitbucket_user = ''
const bitbucket_pass = ''
const github_token = ''
const bitbucket_workspace=''
const github_project=''

const bb_clientOptions = {
    baseUrl: 'https://api.bitbucket.org/2.0',
    auth: {
        username: bitbucket_user,
        password: bitbucket_pass,
    },
}
const project_dir = path.resolve()

const { Bitbucket } = bitbucket_pkg
const bitbucket = new Bitbucket(bb_clientOptions)
const git = simpleGit();
const octokit = new Octokit({
    auth: github_token,
})

const project_name = "Cervello - On-Premise"

async function ListAllRepos() {
    let pageNumber = 1;
    let nextPage = null
    let repos = []
    while (nextPage || pageNumber == 1) {
        const { values, page, next } = await (await bitbucket.repositories.list({ workspace: bitbucket_workspace, page: pageNumber })).data
        pageNumber = page + 1
        nextPage = next
        repos = [...repos, ...values]
    }
    return repos
}

async function CreateReposFile(repos, fileName) {
    fs.writeFile(`${fileName}.json`, JSON.stringify(repos), 'utf8', () => { });
}

function GetListFromJsonFile(fileName) {
    const stream = fs.readFileSync("./" + fileName, 'utf8')
    return JSON.parse(stream)
}

function CleanUp(repo_location) {
    const clean_script = `rm -r ${repo_location}`
    childProcess.exec(clean_script, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.bgRed(err))
            process.exit(1)
        }
    })
}

function Migrate(repo, source_url, project_dir, repo_location, destination_url) {
    console.debug(chalk.blue('Cloning repo', repo.slug, '...'))
    git.clone(source_url, repo_location, ['--mirror'])
        .then(() => {
            console.debug(chalk.blue('Creating GitHub repo for', repo.slug, '...'))
            ExecuteCommand(`cd ${project_dir}/${repo_location}`, () => {
                octokit.request('POST /orgs/{org}/repos', {
                    org: github_project,
                    name: repo.slug,
                    'private': repo.is_private,
                    homepage: 'https://github.com',
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }).then(() => {
                    console.debug(chalk.blue('Pushing repo', repo.slug, '...'))
                    ExecuteCommand(`cd ${project_dir}/${repo_location} && git remote set-url --push origin ${destination_url} && git push --mirror`, () => {
                        console.debug(chalk.bgGreen(
                            chalk.bold(repo.slug) +
                            ' migrated!'
                        ));
                        CleanUp(repo_location)
                        fs.appendFileSync('done.txt', `${repo.slug}\n`);
                    })
                }).catch(err => console.error(err))
            })
        }).catch(err => console.error(err))
}

async function Main() {
    try {
        const repos = await ListAllRepos()

        repos
            .filter(({ project }) => project.name === project_name)
            .filter(({ slug }) => Is_Allowed(slug))
            .map(({ slug, is_private }) => {
                console.log(chalk.yellow('Processing', slug, '...'))
                const repo_location = `repos/${slug}`
                const source_url = `https://${bitbucket_user}:${bitbucket_pass}@bitbucket.org/${bitbucket_workspace}/${slug}`
                const destination_url = `https://${github_token}@github.com/${github_project}/${slug}.git`
                Migrate({ slug, is_private }, source_url, project_dir, repo_location, destination_url)
            })

    } catch (err) {
        console.error(chalk.bgRed(err))
        console.debug(err)
    }
}

Main()

async function ExecuteCommand(command, callback) {
    return new Promise((resolve, reject) => {
        childProcess.exec(command, (err) => {
            if (err) {
                console.error(chalk.bgRed(err))
                reject(err)
                return
            }
            callback()
            resolve('success')
        })
    })
}

function Is_Allowed(slug) {
    const isAllowed = GetListFromJsonFile("to-ignore.json").find(element => element === slug) ? false : true
    if (!isAllowed){
        console.error(chalk.bold(chalk.bgCyan(slug,"is ignored")))
    }
    return isAllowed
}
