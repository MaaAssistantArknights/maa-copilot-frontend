const envvarBoolean = (value: string): boolean => {
  console.log('envvarBoolean', value)
  if (value === undefined) {
    return false
  }
  return value === 'true'
}

export const envUseProductionApi = envvarBoolean(
  import.meta.env.VITE_USE_PRODUCTION_API,
)
