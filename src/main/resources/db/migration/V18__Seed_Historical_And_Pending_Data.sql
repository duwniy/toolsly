DO $$
DECLARE
    v_user_id UUID;
    v_branch_id UUID;
    v_bosch_item_id UUID;
    v_interskol_item_id UUID;
    v_order_id UUID;
    i INT;
    v_date TIMESTAMP;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'igor.volkov@mail.com' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE name = 'Склад Сокольники' LIMIT 1;
    
    SELECT id INTO v_bosch_item_id FROM equipment_items LIMIT 1;
    SELECT id INTO v_interskol_item_id FROM equipment_items WHERE id != v_bosch_item_id LIMIT 1;

    IF v_interskol_item_id IS NULL THEN
        v_interskol_item_id := v_bosch_item_id;
    END IF;

    IF v_user_id IS NULL OR v_branch_id IS NULL OR v_bosch_item_id IS NULL THEN
        RAISE NOTICE 'Missing prerequisite data (users, branches, or items). Skipping order seed.';
        RETURN;
    END IF;

    -- Insert 15 Historical Orders
    FOR i IN 1..15 LOOP
        v_date := NOW() - (15 - i || ' days')::interval;
        
        INSERT INTO orders (
            id, renter_id, branch_start_id, branch_end_id, status, 
            total_price, created_at, updated_at, actual_end_date, planned_end_date
        ) VALUES (
            gen_random_uuid(), v_user_id, v_branch_id, v_branch_id, 'CLOSED',
            (RANDOM() * 5000 + 1000), v_date - interval '2 days', v_date, v_date, v_date
        ) RETURNING id INTO v_order_id;
        
        -- Insert order items
        INSERT INTO order_items (order_id, item_id)
        VALUES (
            v_order_id, 
            CASE WHEN i % 2 = 0 THEN v_bosch_item_id ELSE v_interskol_item_id END
        );
    END LOOP;

    -- Insert 3 Pending Reservations for Issue Queue
    FOR i IN 1..3 LOOP
        INSERT INTO orders (
            id, renter_id, branch_start_id, status, 
            total_price, created_at, updated_at, reserved_until
        ) VALUES (
            gen_random_uuid(), v_user_id, v_branch_id, 'RESERVED',
            (RANDOM() * 2000 + 500), NOW() - interval '5 minutes', NOW() - interval '5 minutes', NOW() + interval '2 hours'
        ) RETURNING id INTO v_order_id;

        INSERT INTO order_items (order_id, item_id)
        VALUES (
            v_order_id, 
            CASE WHEN i % 2 = 0 THEN v_bosch_item_id ELSE v_interskol_item_id END
        );
    END LOOP;
END $$;
