-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN "heroBadge" TEXT NOT NULL DEFAULT 'Nueva colección 2024',
ADD COLUMN "heroTitle" TEXT NOT NULL DEFAULT 'Equilibrio ideal: entre aire y diseño',
ADD COLUMN "heroSubtitle" TEXT NOT NULL DEFAULT 'Tonos claros, velocidades suaves y silencio de ingeniería para tu espacio.',
ADD COLUMN "heroSlides" JSONB NOT NULL DEFAULT '[]';
