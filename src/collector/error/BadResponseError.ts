export class NoPathError extends Error {
  constructor() {
    super('Please, provide music directory as a parameter');
  }
}
