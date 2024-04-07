import { spawn } from 'child_process'
import { BufferList } from 'bl'

/**
 * Based on `await-spawn` https://github.com/ralphtheninja/await-spawn/blob/master/index.js
 * @param command command to run in child process
 * @param args there are 20 definitions of spawn() in `@types/node` with varying options/args params, use whichever suits your use case best
 * @returns
 */
export const awaitSpawn = (command: string, args: string[], options?: any) => {
  const coalescedOptions = {
    ...options,
    // enable pipes between parent and child processes stdin/stdout
    stdio: ['inherit', 'pipe', 'inherit'],
    // use the shell to enable TTY
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: true,
    },
  }
  const child = spawn(command, args, coalescedOptions)

  const stdout = new BufferList()
  const stderr = new BufferList()

  // handle stdout
  if (child.stdout) {
    child.stdout.on('data', (data) => {
      console.log(data.toString())
      stdout.append(data)
    })
  }

  // handle stderr
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      console.log(data.toString())
      stderr.append(data)
    })
  }

  const promise = new Promise((resolve, reject) => {
    child.on('error', reject)

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        const error = new Error(`child exited with code ${code}`)
        const errorOutput = {
          error,
          stdout,
          stderr,
        }
        reject(errorOutput)
      }
    })
  })

  return promise
}
