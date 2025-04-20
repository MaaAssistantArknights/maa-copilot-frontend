// for client side validations against common typos this is effective and efficient.
// let the server do the validation further and, if an email cannot be sent,
// a sufficient error message is far better than tied-to-RFC validation on client side.
export const REGEX_EMAIL = /^\S+@\S+\.\S+$/
// 开头和结尾不能为空格，但是中间允许有空格
export const REGEX_USERNAME = /^\S.{2,22}\S$/
