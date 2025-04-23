-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateFormat" TEXT DEFAULT 'MM/DD/YYYY',
    "language" TEXT DEFAULT 'en',
    "theme" TEXT DEFAULT 'light',
    "animations" BOOLEAN DEFAULT true,
    "compactMode" BOOLEAN DEFAULT false,
    "emailNotifications" BOOLEAN DEFAULT true,
    "transactionAlerts" BOOLEAN DEFAULT true,
    "budgetAlerts" BOOLEAN DEFAULT true,
    "weeklyReport" BOOLEAN DEFAULT true,
    "currency" TEXT DEFAULT 'USD',
    "decimalPlaces" INTEGER DEFAULT 2,
    "financialMonthStart" INTEGER DEFAULT 1,
    "defaultTaxRate" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
