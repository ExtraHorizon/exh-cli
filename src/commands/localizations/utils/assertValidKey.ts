/**
 * Check if the key can be compatible with the localizations service.
 *
 * The dot notation in the keys commonly used with the format i18next is not supported.
 * @param key The Key to check the compatibility.
 */
export const assertValidKey = (key: string) => {
  const validKeyRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  if (!validKeyRegex.test(key)) {
    throw new Error(`The key ${key} is not valid! Must follow the pattern ${validKeyRegex}!`);
  }
};
