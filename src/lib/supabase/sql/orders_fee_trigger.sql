-- File: /supabase/sql/orders_fee_trigger.sql
-- Purpose: Fee logic for order status change, incl. ₹20 flat penalty for prepaid rejections
-- HYBRID UPDATE: Fetch TCS dynamically, keep other fees fixed/order-based.
-- GST, RazorpayFee, & Commission Fee (no add columns in fee structures table) are hardcoded.
create or replace function public.apply_fee_logic()
returns trigger
language plpgsql
as $$
declare
    -- Variable to hold the active fee structure (for dynamic TCS)
    active_fees public.fee_structures; 
    
    fee_reason text;
    order_amount numeric := NEW.total_amount; -- Total amount paid by customer
    
    -- Fees that typically go to the platform or third parties.
    platform_fee numeric := 0; -- Retained as 0 (only 20 for penalty)
    gst numeric := 0; -- Retained as 0
    razorpay_fee numeric := 0; -- Retained as 0
    tcs numeric := 0; -- Will be calculated dynamically
    
    -- Fees charged to the customer (values are locked in the NEW order record)
    customer_platform_fee numeric := NEW.customer_platform_fee; -- Flat ₹20 charged to customer - Active
    customer_convenience_fee numeric := NEW.customer_convenience_fee;  -- 3% rounded charged to customer - Active

    -- total_fee will hold the sum of all applicable fees.
    total_fee numeric; 

begin
    -- 1. FETCH THE ACTIVE FEE STRUCTURE
    -- We need this only to get the dynamic TCS percentage.
    SELECT * INTO active_fees 
    FROM public.get_active_fee_structure();

    if active_fees is null then
        RAISE EXCEPTION 'FATAL: No active fee structure found in public.fee_structures.';
    end if;

    -- 2. CALCULATE DYNAMIC TCS FOR STANDARD ORDERS
    -- This calculation replaces the old hardcoded 1% (0.01).
    tcs := ROUND(
        NEW.total_amount * (COALESCE(active_fees.tcs_percent, 0) / 100), 
        2
    );

    -- 3. CALCULATE TOTAL FEE for Delivered/Accepted-Rejected scenarios
    -- platform_fee, gst, and razorpay_fee remain 0 here, matching original logic.
    total_fee := ROUND(
        platform_fee +
        gst +
        razorpay_fee +
        tcs + -- This is now dynamic
        customer_platform_fee +
        customer_convenience_fee,
    2);

    -- ✅ Delivered orders → regular fee logic
    if NEW.accepted_at is not null and NEW.status = 'delivered' then
        fee_reason := 'Order delivered.'; -- Common reason for delivered

        if NEW.payment_method = 'cod' then
            -- For COD, store collected entire amount. They owe the platform its share (DEBIT).
            insert into public.ledger (
                store_id,
                type,
                amount,
                order_id,
                note,
                mode,
                platform_fee,
                gst,
                razorpay_fee,
                tcs,
                customer_platform_fee,
                customer_convenience_fee
            ) values (
                NEW.store_id,
                'DEBIT',
                total_fee, -- This amount is the total fees the store owes the platform
                NEW.id,
                fee_reason || ' (COD Fees Payable to Platform)',
                'auto',
                platform_fee,
                gst,
                razorpay_fee,
                tcs,
                customer_platform_fee,
                customer_convenience_fee
            );

        elsif NEW.payment_method = 'prepaid' then
            -- For Prepaid, platform collected entire amount. Platform owes store its net share (CREDIT).
            insert into public.ledger (
                store_id,
                type,
                amount,
                order_id,
                note,
                mode,
                platform_fee,
                gst,
                razorpay_fee,
                tcs,
                customer_platform_fee,
                customer_convenience_fee
            ) values (
                NEW.store_id,
                'CREDIT', -- Store is credited (platform owes this)
                ROUND(
                    NEW.total_amount - total_fee, -- Total collected by platform minus all fees
                2),
                NEW.id,
                fee_reason || ' (Prepaid Payout from Platform)',
                'auto',
                platform_fee,   
                gst, 
                razorpay_fee,
                tcs,
                customer_platform_fee,
                customer_convenience_fee
            );
        end if; 

    -- ✅ Accepted → Rejected → regular fee (store accepted, then rejected)
    -- This block also uses the dynamically calculated 'tcs' and 'total_fee' from the start.
    elsif NEW.accepted_at is not null and NEW.status = 'rejected' and OLD.status = 'accepted' then
        fee_reason := 'Store accepted and later rejected the order (fees applicable).';
        
        -- All fees are already calculated. platform_fee, gst, razorpay_fee are 0.
        
        insert into public.ledger (
            store_id,
            type,
            amount,
            order_id,
            note,
            mode,
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        ) values (
            NEW.store_id,
            'DEBIT', -- Store is debited for all the fees
            total_fee,
            NEW.id,
            fee_reason,
            'auto',
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        );


    -- ✅ Prepaid Rejected → ₹20 flat penalty (Penalty logic is untouched, hardcoded)
    elsif NEW.status = 'rejected'
        and NEW.payment_method = 'prepaid'
        and (OLD.status is distinct from 'delivered' or OLD.status is null) then
        fee_reason := 'Order was prepaid but rejected by the store. ₹20 penalty applied.';
        
        -- Reset all fee variables to ensure only penalty is applied
        platform_fee := 20; -- This is the penalty
        gst := 0;
        razorpay_fee := 0;
        tcs := 0;
        customer_platform_fee := 0; 
        customer_convenience_fee := 0; 
        total_fee := 20; 

        insert into public.ledger (
            store_id,
            type,
            amount,
            order_id,
            note,
            mode,
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        ) values (
            NEW.store_id,
            'DEBIT',
            total_fee, 
            NEW.id,
            fee_reason,
            'auto',
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        );

    -- ✅ COD Rejected → ₹0 entry (Untouched)
    elsif NEW.status = 'rejected'
        and NEW.payment_method = 'cod'
        and (OLD.status is distinct from 'delivered' or OLD.status is null) then
        fee_reason := 'Order was rejected by store (COD). No penalty applied.';
        
        -- Reset fees for this zero-entry scenario
        platform_fee := 0; 
        gst := 0;
        razorpay_fee := 0;
        tcs := 0;
        customer_platform_fee := 0;
        customer_convenience_fee := 0;
        total_fee := 0; 

        insert into public.ledger (
            store_id,
            type,
            amount,
            order_id,
            note,
            mode,
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        ) values (
            NEW.store_id,
            'DEBIT', 
            total_fee, 
            NEW.id,
            fee_reason,
            'auto',
            platform_fee,
            gst,
            razorpay_fee,
            tcs,
            customer_platform_fee,
            customer_convenience_fee
        );
    end if;

    return NEW;
end;
$$;

-- Refresh trigger
drop trigger if exists trg_apply_fee on public.orders;

create trigger trg_apply_fee
after update on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.apply_fee_logic();
