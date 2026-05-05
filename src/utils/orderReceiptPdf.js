import PDFDocument from 'pdfkit';
import { orderStatusLabelEs } from './orderStatusLabel.js';

function stripAccents(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\x00-\x7F]/g, (c) => c);
}

function moneyGtq(amount) {
  const n = Number(amount);
  return `Q ${n.toFixed(2)}`;
}

/**
 * Genera un PDF tipo ticket con datos de empresa y lineas de la orden.
 * @param {{ order: object, company: object, brandName: string }} params
 * @returns {Promise<Buffer>}
 */
export function buildOrderReceiptPdf({ order, company, brandName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 48 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const w = doc.page.width - 96;
    let y = 48;

    const line = (text, opts = {}) => {
      const t = stripAccents(text);
      doc.fontSize(opts.size || 9).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(t, 48, y, { width: w, align: opts.align || 'left' });
      y += opts.leading || 12;
    };

    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(stripAccents(brandName || 'Tienda'), 48, y, { width: w, align: 'center' });
    y += 16;

    line(company.companyLegalName || '', { size: 8, align: 'center' });
    line(company.companyAddress || '', { size: 7, align: 'center' });
    line(`Tel: ${company.companyPhone || ''}  Email: ${company.companyEmail || ''}`, { size: 7, align: 'center' });
    line(company.companyTaxId || '', { size: 7, align: 'center', bold: true });
    y += 6;
    doc.moveTo(48, y).lineTo(48 + w, y).stroke('#cccccc');
    y += 10;

    line('TICKET DE COMPRA', { size: 10, bold: true, align: 'center' });
    y += 4;
    line(`Orden #${order.id}`, { size: 9, align: 'center' });
    line(`Fecha: ${new Date(order.createdAt).toLocaleString('es-GT')}`, { size: 8, align: 'center' });
    line(`Estado: ${orderStatusLabelEs(order.status)}`, { size: 8, align: 'center', bold: true });
    y += 8;

    doc.moveTo(48, y).lineTo(48 + w, y).stroke('#cccccc');
    y += 10;

    line('Cliente', { size: 9, bold: true });
    line(order.deliveryName, { size: 8 });
    line(order.deliveryPhone, { size: 8 });
    line(order.deliveryAddress, { size: 8 });
    line(`${order.deliveryCity}${order.deliveryNit ? `  NIT: ${order.deliveryNit}` : ''}`, { size: 8 });
    y += 6;

    line('Pago', { size: 9, bold: true });
    line(order.paymentMethod, { size: 8 });
    y += 8;

    doc.moveTo(48, y).lineTo(48 + w, y).stroke('#cccccc');
    y += 10;

    line('Detalle', { size: 9, bold: true });
    y += 4;
    for (const it of order.items || []) {
      const name = it.product?.name || 'Producto';
      const qty = it.quantity;
      const unit = Number(it.unitPrice);
      const sub = unit * qty;
      line(`${stripAccents(name)}`, { size: 8, bold: true });
      line(`  ${qty} x ${moneyGtq(unit)} = ${moneyGtq(sub)}`, { size: 8 });
      y += 2;
    }

    y += 6;
    doc.moveTo(48, y).lineTo(48 + w, y).stroke('#333333');
    y += 10;

    line(`TOTAL: ${moneyGtq(order.total)}`, { size: 11, bold: true, align: 'right' });
    y += 8;
    line('IVA incluido donde aplique.', { size: 7, align: 'center' });
    y += 12;
    line('Gracias por su compra.', { size: 8, align: 'center' });

    doc.end();
  });
}
