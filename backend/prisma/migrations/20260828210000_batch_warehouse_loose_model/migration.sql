-- Add WAREHOUSE to BatchStatus (must be committed before use in a follow-up migration).
ALTER TYPE "BatchStatus" ADD VALUE IF NOT EXISTS 'WAREHOUSE';
