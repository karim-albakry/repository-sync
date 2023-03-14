const { Bitbucket } = require('bitbucket')
const subProcess = require('child_process')
const fs = require('fs')
const { default: simpleGit } = require('simple-git')
const express = require('express')
const app = express()
const { Octokit, App } = require("octokit")

const bitbucket_user = 'kalbakry'
const bitbucket_pass = 'ATBBkd9UgmKqPZHAHw32jCGYRDY53C9D29B8'
const github_token = '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'

const bb_clientOptions = {
    baseUrl: 'https://api.bitbucket.org/2.0',
    auth: {
        username: bitbucket_user,
        password: bitbucket_pass,
    },
}

const bitbucket = new Bitbucket(bb_clientOptions)
const git = simpleGit();
const octokit = new Octokit({
    auth: github_token
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

function ReadReposFile(fileName) {
    let repos
    const stream = fs.readFileSync("./" + fileName, 'utf8')
    repos = JSON.parse(stream)
    return repos
}

async function Main() {
    const repos = ReadReposFile("reposlist.json")
    for (const repo of repos) {
        repo.slug = "things-service"
        const repo_location = `repos/${repo.slug}`
        const source_url = `https://${bitbucket_user}:${bitbucket_pass}@bitbucket.org/iotblueSaaS/${repo.slug}`
        const dastination_url = `git@github.com:karim-albakry/${repo.slug}.git`

        // Clone the repo and put it into the repo directory and clone it fro bitbucket.
        await git.clone(source_url, repo_location, ['--mirror'])
        // Go to the cloned repo folder.
        subProcess.exec(`cd ${__dirname}/${repo_location}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            // Creates the repo on github.
            octokit.request('POST /user/repos', {
                name: repo.slug,
                'private': true,
                homepage: 'https://github.com',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
        })
        subProcess.exec(`cd ${__dirname}/${repo_location} && git remote set-url --push origin ${dastination_url} && git push --mirror`, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(stdout)
        })
    }
}

Main()