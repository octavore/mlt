#!/usr/bin/env node

import * as program from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { spawnSync } from 'child_process'

let extract = (command: string): string => {
  let packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' })
  let packageJson = JSON.parse(packageJsonData)
  if (!packageJson['configFiles']) {
    console.log('no configFiles in package.json')
    return
  }
  if (!packageJson['configFiles']['_mapping']) {
    console.log('no configFiles._mapping in package.json')
    return
  }
  let filename = packageJson['configFiles']['_mapping'][command]
  if (!filename) {
    console.log(`no mapping for ${command} in package.json`)
    return
  }
  let data = packageJson['configFiles'][filename]
  fs.writeFileSync(filename, JSON.stringify(data, null, 2))
  // todo check if file exists
  return filename
}

let embed = (filename: string, indent: string) => {
  let packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' })
  let packageJson = JSON.parse(packageJsonData)

  let embedData = fs.readFileSync(filename, { encoding: 'utf8' })
  let obj = JSON.parse(embedData)
  let base = path.basename(filename)
  packageJson['configFiles'] = packageJson['configFiles'] || {}
  packageJson['configFiles'][base] = obj
  let data = JSON.stringify(packageJson, null, parseInt(indent))
  fs.writeFileSync('package.json', data)
}

program
  .version('0.1')
  .arguments('<command>')
  .action((command: string) => {
    let args = process.argv.slice(3)
    let commandName = path.basename(command)
    let extractedFile = extract(commandName)
    // todo: add support for node_modules/.bin
    let obj = spawnSync(command, args, { 'stdio': 'inherit' })
    if (obj.error) {
      console.log(obj.error)
    }
    if (extractedFile) {
      fs.unlinkSync(extractedFile)
    }
  })

program.command('set <file>')
  .option('--indent <num_spaces>', 'number of lines to indent JSON', '4')
  .action((file: string, options: any) => {
    if (file === 'package.json') {
      return
    }
    embed(file, options.indent)
    console.log(`added ${file} to package.json`)
  })

program.command('register <command> <file>')
  .option('--indent <num_spaces>', 'number of lines to indent JSON', 4)
  .action((command: string, file: string, options: any) => {
    if (file === 'package.json') {
      return
    }
    let packageJsonData = fs.readFileSync('package.json', { encoding: 'utf8' })
    let packageJson = JSON.parse(packageJsonData)

    packageJson['configFiles'] = packageJson['configFiles'] || {}
    packageJson['configFiles']['_mapping'] = packageJson['configFiles']['_mapping'] || {}
    packageJson['configFiles']['_mapping'][command] = file

    let data = JSON.stringify(packageJson, null, parseInt(options.indent))
    fs.writeFileSync('package.json', data)
  })

program.parse(process.argv)