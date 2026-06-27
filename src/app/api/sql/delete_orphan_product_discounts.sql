--src/app/api/sql/delete_orphan_product_discounts.sql: This function and trigger ensure that when a product's discount_id is set to null, the corresponding discount record is deleted from the discounts table, preventing orphaned discount records.
-- Supabase Location: Discounts & offers folder
create or replace function delete_orphan_product_discounts()
returns trigger as $$
begin
  if old.discount_id is not null and new.discount_id is null then
    delete from discounts where id = old.discount_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_delete_orphan_discount
after update on products
for each row
execute function delete_orphan_product_discounts();