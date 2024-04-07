export const logCommand = (command: string) => {
  console.log(`> ${command}`)
}

export const logSpawnCommand = (command: string, args: string[]) => {
  const fullCommand = `${command} ${args.join(' ')}`
  logCommand(fullCommand)
}

export const logHeader = (text: string) => {
  console.log(`\n*** ${text} ***`)
}
