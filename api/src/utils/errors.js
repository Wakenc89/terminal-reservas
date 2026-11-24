export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
// Express 4 no captura errores async: este envoltorio los pasa al manejador central
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
