-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
