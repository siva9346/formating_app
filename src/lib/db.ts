import { sql } from "@vercel/postgres";

export type MenuItemRow = {
  id: number;
  dish_name: string;
  category: string | null;
  ingredients: string[] | null;
  price: string | null;
  created_at: string;
};

export async function ensureSchema(): Promise<void> {
  // Create table if it doesn't exist and enforce unique dish_name for deduplication
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      dish_name TEXT NOT NULL,
      category TEXT,
      ingredients TEXT[] ,
      price TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_dish UNIQUE (dish_name)
    );
  `;
}

export async function insertMenuItems(items: Array<{
  dish_name: string;
  category: string | null;
  ingredients: string[] | null;
  price: string | null;
}>): Promise<void> {
  if (!items.length) return;

  // Upsert by dish_name to deduplicate
  for (const item of items) {
    const ingredientsParam: any = item.ingredients; // allow pg driver to serialize arrays
    await sql`
      INSERT INTO menu_items (dish_name, category, ingredients, price)
      VALUES (
        ${item.dish_name},
        ${item.category},
        ${ingredientsParam},
        ${item.price}
      )
      ON CONFLICT (dish_name) DO UPDATE SET
        category = EXCLUDED.category,
        ingredients = EXCLUDED.ingredients,
        price = EXCLUDED.price;
    `;
  }
}

export async function listMenuItems(): Promise<MenuItemRow[]> {
  const { rows } = await sql<MenuItemRow>`
    SELECT id, dish_name, category, ingredients, price, created_at
    FROM menu_items
    ORDER BY created_at DESC, id DESC
  `;
  return rows;
}

