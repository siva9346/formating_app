import { listMenuItems } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const items = await listMenuItems();
  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Extracted Menu</h1>
          <p className="text-sm opacity-80">{items.length} item{items.length === 1 ? "" : "s"} found</p>
        </div>
        <a href="/" className="text-sm underline">Upload another file</a>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-80">No items yet. Upload a .txt file on the home page.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-black/10 dark:border-white/15 p-4">
              <div className="font-medium text-lg mb-1">{item.dish_name}</div>
              {item.category ? (
                <div className="text-xs mb-2 opacity-70">Category: {item.category}</div>
              ) : null}
              {item.ingredients && item.ingredients.length ? (
                <div className="text-sm mb-2">
                  <span className="opacity-70">Ingredients: </span>
                  <span>{item.ingredients.join(", ")}</span>
                </div>
              ) : null}
              {item.price ? (
                <div className="text-sm"><span className="opacity-70">Price: </span>{item.price}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

