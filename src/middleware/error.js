export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  console.error(err);
  res.status(status).json({ error: message });
}
