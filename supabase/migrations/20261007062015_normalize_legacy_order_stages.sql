-- Align legacy UI labels with the existing database order-state machine.
UPDATE public.orders SET status=CASE status
    WHEN 'Approved' THEN 'Confirmed'
    WHEN 'Ready QC' THEN 'Ready'
    WHEN 'Ready to Dispatch' THEN 'Ready'
    ELSE status END
WHERE status IN ('Approved','Ready QC','Ready to Dispatch');
