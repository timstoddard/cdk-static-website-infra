export const hasMissingEnvVar = (vars: Array<string | undefined>) => {
  let foundMissingVar = false
  for (const envVar of vars) {
    if (!envVar) {
      console.log(`Missing required env variable: ${envVar}`)
      foundMissingVar = true
      break
    }
  }
  return foundMissingVar
}
