-- Migration to update RequestCategory enum
-- Step 1: Update existing values to new ones

-- Map old categories to new categories
UPDATE "Request" SET category = 'FOOD_GROCERIES' WHERE category = 'FOOD';
UPDATE "Request" SET category = 'RENT_HOUSING' WHERE category = 'RENT';
UPDATE "Request" SET category = 'UTILITIES' WHERE category = 'BILLS';
UPDATE "Request" SET category = 'FAMILY_EMERGENCY' WHERE category = 'FAMILY_SUPPORT';
UPDATE "Request" SET category = 'MEDICAL_BILLS' WHERE category = 'MEDICAL';
UPDATE "Request" SET category = 'TUITION_FEES' WHERE category = 'EDUCATION';
UPDATE "Request" SET category = 'JOB_ASSISTANCE' WHERE category = 'JOB_ASSISTANCE';

-- Now the enum can be safely altered since no old values are in use
