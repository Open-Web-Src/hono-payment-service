DROP INDEX IF EXISTS `payments_stripe_payment_id_unique`;--> statement-breakpoint
ALTER TABLE `payments` DROP COLUMN `stripe_payment_id`;