-- CreateTable Customer
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- One row per user that placed orders (copy credentials for continuity)
INSERT INTO "Customer" ("email", "password", "name", "phone", "createdAt", "updatedAt")
SELECT DISTINCT ON (u."id") u."email", u."password", u."name", NULL, u."createdAt", u."updatedAt"
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Order" o WHERE o."userId" = u."id")
ORDER BY u."id";

ALTER TABLE "Order" ADD COLUMN "customerId" INTEGER;

UPDATE "Order" o
SET "customerId" = c."id"
FROM "Customer" c
INNER JOIN "User" u ON u."email" = c."email"
WHERE o."userId" = u."id";

ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";
ALTER TABLE "Order" DROP COLUMN "userId";
ALTER TABLE "Order" ALTER COLUMN "customerId" SET NOT NULL;

ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Role: USER -> STAFF
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'STAFF');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE WHEN "role"::text = 'USER' THEN 'STAFF'::"Role_new" ELSE 'ADMIN'::"Role_new" END
);
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF'::"Role";
