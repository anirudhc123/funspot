CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "suspendedUntil" TIMESTAMP(3);

ALTER TABLE "Profile"
ADD COLUMN "coverImage" TEXT,
ADD COLUMN "website" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "privacy" TEXT NOT NULL DEFAULT 'public';

ALTER TABLE "RefreshToken"
ADD COLUMN "sessionId" TEXT;

CREATE UNIQUE INDEX "RefreshToken_sessionId_key" ON "RefreshToken"("sessionId");

ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_sessionId_fkey"
FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
