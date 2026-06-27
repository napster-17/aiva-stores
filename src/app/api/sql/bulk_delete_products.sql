--src/app/api/sql/bulk_delete_products.sql
-- Supabase Location: Products- Store Owner/Partner folder
create or replace function bulk_delete_products(ids uuid[])
returns void
language plpgsql
as $$
begin
  -- detach children
  update products
  set parent_product_id = null
  where parent_product_id = any(ids);

  -- delete products first
  delete from products
  where id = any(ids);

  -- cleanup orphan discounts ONLY
  delete from discounts d
  where d.id not in (
    select distinct discount_id from products where discount_id is not null
  );
end;
$$;