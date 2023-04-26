/**
 * Created by Emmanuel Ravrat on 04/09/2022.
 */
import {readdir} from 'fs/promises'
// import shell from 'shelljs'
import path from 'path'
import {fileURLToPath} from 'url'
//https://sebhastian.com/nodejs-fork/
import childProcess from 'child_process'


//chemin complet du présent fichier
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// console.log(__dirname)
const trackFolderNameProject = 'trackadoc'
let spotFolderName

//Je remonte l'arborescence de façon à découvrir le nom du dossier qui contient le dossier "trackadoc". Ce dossier sera le dossier SPOT
const   r = async (path) => {
    // console.log(`path :: ${path}`)

    let pathToParentFolder
    let arrayForPath =  path.split(`\\`)
    //on supprime le répertoire courant du chemin
    let currentFolder = arrayForPath.pop()
    pathToParentFolder = arrayForPath.join('\\')
    //on récupère le nom du dossier parent
    let parentNameFolder = arrayForPath.pop()

    const files = await readdir(path, {withFileTypes: true});
    files.forEach((dirent) => {
        if(dirent.isDirectory() && dirent.name === trackFolderNameProject){
            spotFolderName = currentFolder
            // console.log(`spot folder name ${spotFolderName}`)
            return
        }
    })

    if(spotFolderName === undefined && parentNameFolder !== undefined){
        await r(pathToParentFolder)
    }
}

try {
    await r(__dirname)

} catch (err) {
    console.error(err);
}


const regex = new RegExp(`(.*)\\\\${spotFolderName}(.*)`)
// console.log(regex)
let found = __dirname.match(regex)
// console.log(`found`,found)

let pathToBootmainFile = `${found[1]}/${spotFolderName}/${trackFolderNameProject}/bootmain.js`

let args = [
    __dirname, //pathToCurrentDocument
    `${found[1]}`, //pathToSpotFolder without spot folder name
    `${found[2]}`, // pathFromSpotFolder without spot folder name
    `${spotFolderName}`, // spot folder name

]
// console.log(`args avant : `,args)

const child = childProcess.fork(pathToBootmainFile, args)

child.on("close", function (code) {
    // console.log("child process exited with code " + code);
    process.exit(code)
});