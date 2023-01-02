const envvarBoolean = (value: string): boolean => {
  if (value === undefined) {
    return false
  }
  return value === 'true'
}

export const envUseProductionApi = envvarBoolean(
  import.meta.env.VITE_USE_PRODUCTION_API,
)

export const envUseProductionTheresa = envvarBoolean(
  import.meta.env.VITE_USE_PRODUCTION_THERESA,
)
