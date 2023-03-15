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

async function ListAllRepos() {
    let pageNumber = 1;
    let nextPage = null
    let repos = []
    while (nextPage || pageNumber == 1) {
        const { values, page, next } = await (await bitbucket.repositories.list({ workspace: "iotblueSaaS", page: pageNumber })).data
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

async function Main() {
    try {
        const repos = await GetListFromJsonFile('reposlist.json')
        const ignor = await GetListFromJsonFile('to-ignore.json')
        for (const repo of repos) {
            if (ignor && ignor.length > 0) {
                if (ignor.find(element => element === repo.slug)) {
                    console.log(chalk.bgMagenta(
                        chalk.bold(repo.slug) +
                        ' ignord!'
                    ));
                    continue;
                }
            }

            const repo_location = `repos/${repo.slug}`
            const source_url = `https://${bitbucket_user}:${bitbucket_pass}@bitbucket.org/iotblueSaaS/${repo.slug}`
            const destination_url = `git@github.com:karim-albakry/${repo.slug}.git`
            await Migrate(repo,source_url, project_dir, repo_location, destination_url)
        }
    } catch (err) {
        console.error(chalk.bgRed(err))
        console.debug(err)
    }
}

function CleanUp(repo_location){
    const clean_script = `rm -r ${repo_location}`
    childProcess.exec(clean_script, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.bgRed(err))
            process.exit(1)
        }
    })
}

async function Migrate(repo, source_url, project_dir, repo_location, destination_url){
    await git.clone(source_url, repo_location, ['--mirror'])

    childProcess.exec(`cd ${project_dir}/${repo_location}`, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.bgRed(err))
            process.exit(1)
        }
        // Creates the repo on github.
        octokit.request('POST /user/repos', {
            name: repo.slug,
            'private': repo.is_private,
            homepage: 'https://github.com',
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })
    })

    childProcess.exec(`cd ${project_dir}/${repo_location} && git remote set-url --push origin ${destination_url} && git push --mirror`, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.bgRed(err))
            process.exit(1)
        }
        console.log(chalk.bgGreen(
            chalk.bold(repo.slug) +
            ' migrated!'
        ));
        CleanUp(repo_location)
    })
}

Main()