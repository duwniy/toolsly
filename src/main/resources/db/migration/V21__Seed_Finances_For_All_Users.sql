-- V21: Seed Finances Data for Staff user (Alexey Smirnov) and all renters
-- So that Finances page is not empty regardless of who is logged in.

DO $$
DECLARE
    v_alexey_id UUID;
    v_igor_id UUID;
    v_olga_id UUID;
    v_branch_id UUID;
    v_item1 UUID;
    v_item2 UUID;
    v_item3 UUID;
    v_order_id UUID;
    v_date TIMESTAMP;
    i INT;
BEGIN
    SELECT id INTO v_alexey_id FROM users WHERE email = 'alexey.smirnov@toolsly.com' LIMIT 1;
    SELECT id INTO v_igor_id FROM users WHERE email = 'igor.volkov@mail.com' LIMIT 1;
    SELECT id INTO v_olga_id FROM users WHERE email = 'olga.stepanova@mail.com' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE name ILIKE '%Сокольники%' LIMIT 1;

    -- Grab 3 different equipment items
    SELECT id INTO v_item1 FROM equipment_items OFFSET 0 LIMIT 1;
    SELECT id INTO v_item2 FROM equipment_items OFFSET 1 LIMIT 1;
    SELECT id INTO v_item3 FROM equipment_items OFFSET 2 LIMIT 1;
    IF v_item2 IS NULL THEN v_item2 := v_item1; END IF;
    IF v_item3 IS NULL THEN v_item3 := v_item1; END IF;

    IF v_alexey_id IS NULL OR v_branch_id IS NULL OR v_item1 IS NULL THEN
        RAISE NOTICE 'Skipping V21: Missing prerequisite data.';
        RETURN;
    END IF;

    -- ===== ALEXEY (STAFF) finances as a renter =====
    -- 5 CLOSED orders
    FOR i IN 1..5 LOOP
        v_date := NOW() - (12 - i || ' days')::interval;
        INSERT INTO orders (
            id, renter_id, branch_start_id, branch_end_id, status,
            total_price, created_at, updated_at, actual_end_date, planned_end_date
        ) VALUES (
            gen_random_uuid(), v_alexey_id, v_branch_id, v_branch_id, 'CLOSED',
            CASE i WHEN 1 THEN 2500 WHEN 2 THEN 8000 WHEN 3 THEN 1500 WHEN 4 THEN 4200 ELSE 11000 END,
            v_date - interval '2 days', v_date, v_date, v_date
        ) RETURNING id INTO v_order_id;
        INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, CASE WHEN i % 3 = 0 THEN v_item3 WHEN i % 2 = 0 THEN v_item2 ELSE v_item1 END);
    END LOOP;

    -- 1 ISSUED order (2 days ago) for accrued debt
    INSERT INTO orders (
        id, renter_id, branch_start_id, status,
        total_price, created_at, updated_at, issued_at, planned_end_date
    ) VALUES (
        gen_random_uuid(), v_alexey_id, v_branch_id, 'ISSUED',
        0, NOW() - interval '2 days 1 hour', NOW() - interval '2 days', NOW() - interval '2 days', NOW() + interval '3 hours'
    ) RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, v_item2);

    -- 1 RESERVED order for reserved funds
    INSERT INTO orders (
        id, renter_id, branch_start_id, status,
        total_price, created_at, updated_at, reserved_until
    ) VALUES (
        gen_random_uuid(), v_alexey_id, v_branch_id, 'RESERVED',
        3600, NOW() - interval '10 minutes', NOW() - interval '10 minutes', NOW() + interval '3 hours'
    ) RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, v_item3);

    -- 1 RETURNED + DAMAGED order
    v_date := NOW() - interval '4 days';
    INSERT INTO orders (
        id, renter_id, branch_start_id, branch_end_id, status,
        total_price, staff_comment, created_at, updated_at, actual_end_date, planned_end_date
    ) VALUES (
        gen_random_uuid(), v_alexey_id, v_branch_id, v_branch_id, 'RETURNED',
        7200, 'Повреждение корпуса при транспортировке', v_date - interval '3 days', v_date, v_date, v_date
    ) RETURNING id INTO v_order_id;
    INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, v_item1);


    -- ===== OLGA (RENTER) finances =====
    IF v_olga_id IS NOT NULL THEN
        FOR i IN 1..3 LOOP
            v_date := NOW() - (10 - i || ' days')::interval;
            INSERT INTO orders (
                id, renter_id, branch_start_id, branch_end_id, status,
                total_price, created_at, updated_at, actual_end_date, planned_end_date
            ) VALUES (
                gen_random_uuid(), v_olga_id, v_branch_id, v_branch_id, 'CLOSED',
                CASE i WHEN 1 THEN 3300 WHEN 2 THEN 6700 ELSE 1900 END,
                v_date - interval '2 days', v_date, v_date, v_date
            ) RETURNING id INTO v_order_id;
            INSERT INTO order_items (order_id, item_id) VALUES (v_order_id, CASE WHEN i % 2 = 0 THEN v_item2 ELSE v_item1 END);
        END LOOP;
    END IF;

END $$;
