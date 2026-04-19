-- V20: Comprehensive Finances Seeding for Igor Volkov (Milestone 9)

DO $$
DECLARE
    v_user_id UUID;
    v_branch_id UUID;
    v_makita_id UUID;
    v_nivelir_id UUID;
    v_husqvarna_id UUID;
    v_ladder_id UUID;
    v_dewalt_id UUID;
    
    v_order_id UUID;
    i INT;
    v_date TIMESTAMP;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'igor.volkov@mail.com' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE name ILIKE '%Сокольники%' LIMIT 1;
    
    -- Ensure user/branch are present
    IF v_user_id IS NULL OR v_branch_id IS NULL THEN
        RAISE NOTICE 'Skipping V20: Missing Igor Volkov or Sokolniki branch.';
        RETURN;
    END IF;

    -- Grab specific models, fallback to any if missing to prevent null issues
    SELECT i.id INTO v_makita_id FROM equipment_items i JOIN equipment_models m ON i.model_id = m.id WHERE m.name ILIKE '%Makita%' LIMIT 1;
    SELECT i.id INTO v_nivelir_id FROM equipment_items i JOIN equipment_models m ON i.model_id = m.id WHERE m.name ILIKE '%нивелир%' LIMIT 1;
    SELECT i.id INTO v_husqvarna_id FROM equipment_items i JOIN equipment_models m ON i.model_id = m.id WHERE m.name ILIKE '%Husqvarna%' LIMIT 1;
    SELECT i.id INTO v_ladder_id FROM equipment_items i JOIN equipment_models m ON i.model_id = m.id WHERE m.name ILIKE '%Стремянк%' LIMIT 1;
    SELECT i.id INTO v_dewalt_id FROM equipment_items i JOIN equipment_models m ON i.model_id = m.id WHERE m.name ILIKE '%DeWalt%' LIMIT 1;

    -- Fallbacks
    IF v_makita_id IS NULL THEN SELECT id INTO v_makita_id FROM equipment_items LIMIT 1; END IF;
    IF v_nivelir_id IS NULL THEN SELECT id INTO v_nivelir_id FROM equipment_items LIMIT 1; END IF;
    IF v_husqvarna_id IS NULL THEN SELECT id INTO v_husqvarna_id FROM equipment_items LIMIT 1; END IF;
    IF v_ladder_id IS NULL THEN SELECT id INTO v_ladder_id FROM equipment_items LIMIT 1; END IF;
    IF v_dewalt_id IS NULL THEN SELECT id INTO v_dewalt_id FROM equipment_items LIMIT 1; END IF;

    -- 1. 6 Successful (CLOSED) Orders for "Total Spent"
    -- Varying prices and days ago
    FOR i IN 1..6 LOOP
        v_date := NOW() - (14 - i || ' days')::interval;
        
        INSERT INTO orders (
            id, renter_id, branch_start_id, branch_end_id, status, 
            total_price, created_at, updated_at, actual_end_date, planned_end_date
        ) VALUES (
            gen_random_uuid(), v_user_id, v_branch_id, v_branch_id, 'CLOSED',
            (CASE WHEN i=1 THEN 500 WHEN i=2 THEN 9500 WHEN i=3 THEN 1200 WHEN i=4 THEN 3000 WHEN i=5 THEN 7000 ELSE 15000 END), 
            v_date - interval '2 days', v_date, v_date, v_date
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_items (order_id, item_id)
        VALUES (
            v_order_id, 
            CASE i 
                WHEN 1 THEN v_ladder_id 
                WHEN 2 THEN v_husqvarna_id 
                WHEN 3 THEN v_makita_id 
                WHEN 4 THEN v_dewalt_id 
                WHEN 5 THEN v_nivelir_id 
                ELSE v_husqvarna_id 
            END
        );
    END LOOP;

    -- 2. 2 ISSUED Orders from 2 days ago for "Accrued Debt" dynamic real-time tracking
    v_date := NOW() - interval '2 days';
    FOR i IN 1..2 LOOP
        INSERT INTO orders (
            id, renter_id, branch_start_id, status, 
            total_price, created_at, updated_at, issued_at, planned_end_date
        ) VALUES (
            gen_random_uuid(), v_user_id, v_branch_id, 'ISSUED',
            0, v_date - interval '1 hour', v_date, v_date, NOW() + interval '5 hours'
        ) RETURNING id INTO v_order_id;

        INSERT INTO order_items (order_id, item_id)
        VALUES (v_order_id, CASE WHEN i=1 THEN v_dewalt_id ELSE v_makita_id END);
    END LOOP;

    -- 3. 2 RESERVED Orders for "Reserved Funds"
    FOR i IN 1..2 LOOP
        INSERT INTO orders (
            id, renter_id, branch_start_id, status, 
            total_price, created_at, updated_at, reserved_until
        ) VALUES (
            gen_random_uuid(), v_user_id, v_branch_id, 'RESERVED',
            CASE WHEN i=1 THEN 1200 ELSE 1800 END, 
            NOW() - interval '15 minutes', NOW() - interval '15 minutes', NOW() + interval '4 hours'
        ) RETURNING id INTO v_order_id;

        INSERT INTO order_items (order_id, item_id)
        VALUES (v_order_id, CASE WHEN i=1 THEN v_makita_id ELSE v_nivelir_id END);
    END LOOP;

    -- 4. 1 RETURNED Fine/Damaged Order
    v_date := NOW() - interval '5 days';
    INSERT INTO orders (
        id, renter_id, branch_start_id, branch_end_id, status, 
        total_price, staff_comment, created_at, updated_at, actual_end_date, planned_end_date
    ) VALUES (
        gen_random_uuid(), v_user_id, v_branch_id, v_branch_id, 'RETURNED',
        -- base price ~1000, fine is 30% of MV (e.g., MV 15000 -> 4500). Total = 5500
        5500, 'Корпус помят, требуется замена кожуха', v_date - interval '3 days', v_date, v_date, v_date
    ) RETURNING id INTO v_order_id;

    INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, v_dewalt_id);

    -- Update condition of equipment to DAMAGED
    UPDATE equipment_items SET condition = 'DAMAGED' WHERE id = v_dewalt_id;

END $$;
