-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "primaryAreaSqft" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "properties_status_primaryAreaSqft_idx" ON "properties"("status", "primaryAreaSqft");
