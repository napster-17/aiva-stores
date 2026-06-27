--src/app/api/sql/bulk_update_products.sql
-- Supabase Location: Products- Store Owner/Partner folder
create or replace function bulk_update_products(input jsonb)
returns void
language plpgsql
as $$
declare
  item jsonb;
  v_discount_id uuid;
  old_discount_id uuid;
begin
  for item in select * from jsonb_array_elements(input)
  loop
    -- fetch old discount
    select discount_id into old_discount_id
    from products
    where id = (item->>'id')::uuid;

    if (item->>'discount_value')::numeric > 0 then
      insert into discounts (
        store_id, code, name, discount_type, discount_value, applies_to
      )
      values (
        (item->>'store_id')::uuid,
        'auto-' || (item->>'id') || '-flat',
        'Flat ₹' || (item->>'discount_value') || ' Off',
        'flat',
        (item->>'discount_value')::numeric,
        'product'
      )
      on conflict (code)
      do update set 
        discount_value = excluded.discount_value,
        name = excluded.name
      returning id into v_discount_id;

      -- update product with new discount
      update products
      set
        price = (item->>'price')::numeric,
        cost_price = (item->>'cost_price')::numeric,
        stock_quantity = (item->>'stock_quantity')::numeric,
        discount_id = v_discount_id
      where id = (item->>'id')::uuid;

    else
      -- FIRST unlink discount (critical fix)
      update products
      set
        price = (item->>'price')::numeric,
        cost_price = (item->>'cost_price')::numeric,
        stock_quantity = (item->>'stock_quantity')::numeric,
        discount_id = null
      where id = (item->>'id')::uuid;

      -- THEN delete old discount safely
      if old_discount_id is not null then
        delete from discounts where id = old_discount_id;
      end if;
    end if;

  end loop;
end;
$$;