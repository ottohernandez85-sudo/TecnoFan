-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "companyAddress" TEXT DEFAULT 'Zona 10, Ciudad de Guatemala',
ADD COLUMN     "companyEmail" TEXT DEFAULT 'ventas@tecnofan.demo',
ADD COLUMN     "companyLegalName" TEXT DEFAULT 'Tecnofan Guatemala S.A.',
ADD COLUMN     "companyPhone" TEXT DEFAULT '+502 3000-0000',
ADD COLUMN     "companyTaxId" TEXT DEFAULT 'NIT 1234567-8';
