-- Add trade_currency to trade table to specify the currency in which the trade was executed

ALTER TABLE trade
ADD COLUMN trade_currency VARCHAR(3);
