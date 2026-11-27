-- 1. Libera 'camarao' e 'litro' nas constraints existentes
ALTER TABLE public.sales
  DROP CONSTRAINT IF EXISTS sales_category_check,
  DROP CONSTRAINT IF EXISTS sales_unit_check;

ALTER TABLE public.sales
  ADD CONSTRAINT sales_category_check
    CHECK (category IN ('ostra', 'caranguejo', 'peixe', 'marisco', 'sururu', 'camarao', 'outros')),
  ADD CONSTRAINT sales_unit_check
    CHECK (unit IN ('dz', 'kg', 'litro'));

-- 2. Adiciona campo opcional para o nome do produto quando category = 'outros'
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS custom_product text;
