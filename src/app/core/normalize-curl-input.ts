/** Curly/smart quotes and fullwidth variants from mobile keyboards → ASCII quotes for curl. */
const CURLY_DOUBLE = /[\u201C\u201D\u201E\u201F\u2033\u2036\uFF02\u00AB\u00BB]/g;
const CURLY_SINGLE = /[\u2018\u2019\u201A\u201B\u2032\u2035\uFF07]/g;

export function normalizeCurlQuotes(input: string): string {
  return input.replace(CURLY_DOUBLE, '"').replace(CURLY_SINGLE, "'");
}
