import { useParams, Link } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { Department, DEPARTMENTS } from "@/types/inventory";
import { ArrowLeft, Package, AlertTriangle, ArrowLeftRight, TrendingUp, TrendingDown, Zap, Droplets, HardHat, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

const DEPT_META: Record<Department, { icon: typeof Zap; color: string; chartColor: string }> = {
  Electrical: { icon: Zap, color: "text-info", chartColor: "hsl(217, 91%, 60%)" },
  Plumbing: { icon: Droplets, color: "text-success", chartColor: "hsl(142, 71%, 45%)" },
  "General Construction": { icon: HardHat, color: "text-primary", chartColor: "hsl(36, 95%, 50%)" },
  Landscaping: { icon: Leaf, color: "text-green-600", chartColor: "hsl(120, 61%, 50%)" },
};

const SLUG_TO_DEPT: Record<string, Department> = {
  electrical: "Electrical",
  plumbing: "Plumbing",
  "general-construction": "General Construction",
  landscaping: "Landscaping",
};

export function deptToSlug(dept: Department): string {
  return dept.toLowerCase().replace(/\s+/g, "-");
}

export default function DepartmentDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const department = SLUG_TO_DEPT[slug || ""] as Department | undefined;
  const { items, transactions } = useInventory();
  const [search, setSearch] = useState("");

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Department not found</p>
        <Button asChild variant="outline"><Link to="/departments">Back to Departments</Link></Button>
      </div>
    );
  }

  const meta = DEPT_META[department];
  const Icon = meta.icon;

  const deptItems = items.filter((i) => i.department === department);
  const deptTx = transactions.filter((t) => t.department === department);
  const lowStockItems = deptItems.filter((i) => i.quantity <= i.minThreshold);
  const totalStock = deptItems.reduce((s, i) => s + i.quantity, 0);
  const stockInTx = deptTx.filter((t) => t.type === "Stock In");
  const stockOutTx = deptTx.filter((t) => t.type === "Stock Out");

  const filteredItems = deptItems.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.specification.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data: stock per item (top 8)
  const itemChartData = [...deptItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map((i) => ({ name: i.name.length > 18 ? i.name.slice(0, 18) + "…" : i.name, quantity: i.quantity, threshold: i.minThreshold }));

  // Stock status pie
  const statusData = [
    { name: "Adequate", value: deptItems.filter((i) => i.quantity > i.minThreshold).length, color: "hsl(142, 71%, 45%)" },
    { name: "Low Stock", value: lowStockItems.length, color: "hsl(0, 72%, 51%)" },
  ].filter((d) => d.value > 0);

  const stats = [
    { label: "Total Items", value: deptItems.length, icon: Package, accent: meta.color },
    { label: "Total Stock", value: totalStock.toLocaleString(), icon: TrendingUp, accent: meta.color },
    { label: "Low Stock", value: lowStockItems.length, icon: AlertTriangle, accent: "text-destructive" },
    { label: "Transactions", value: deptTx.length, icon: ArrowLeftRight, accent: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0">
          <Link to="/departments"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg bg-muted ${meta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{department}</h1>
            <p className="text-sm text-muted-foreground">Department Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-muted ${s.accent}`}>
              <s.icon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 stat-card">
          <h3 className="text-sm font-semibold mb-4">Stock Levels by Item</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={itemChartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
              />
              <Bar dataKey="quantity" fill={meta.chartColor} radius={[0, 6, 6, 0]} name="Stock" />
              <Bar dataKey="threshold" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} opacity={0.3} name="Min Threshold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card flex flex-col">
          <h3 className="text-sm font-semibold mb-4">Stock Health</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4">
            {statusData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <div className="stat-card border-destructive/20">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Low Stock Alerts ({lowStockItems.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.specification.slice(0, 40)}…</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="low-stock-badge">{item.quantity} left</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Min: {item.minThreshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">All Items</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Item</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Quantity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Specification</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium">{item.name}</td>
                    <td className="py-2.5 px-4">
                      <span className={isLow ? "text-destructive font-semibold" : ""}>{item.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ {item.minThreshold}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      {isLow ? (
                        <span className="low-stock-badge">Low Stock</span>
                      ) : (
                        <span className="bg-success/10 text-success text-xs font-semibold px-2 py-0.5 rounded-full">OK</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate hidden md:table-cell">{item.specification}</td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden lg:table-cell">{item.dateAdded}</td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span className="text-muted-foreground">Stock In: <strong className="text-foreground">{stockInTx.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            <span className="text-muted-foreground">Stock Out: <strong className="text-foreground">{stockOutTx.length}</strong></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Item</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Qty</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">By</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {deptTx.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2 px-2 text-muted-foreground">{tx.date}</td>
                  <td className="py-2 px-2 font-medium">{tx.itemName}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      tx.type === "Stock In" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}>{tx.type}</span>
                  </td>
                  <td className="py-2 px-2">{tx.quantity}</td>
                  <td className="py-2 px-2 text-muted-foreground hidden sm:table-cell">{tx.user}</td>
                  <td className="py-2 px-2 text-muted-foreground hidden md:table-cell">{tx.notes || "—"}</td>
                </tr>
              ))}
              {deptTx.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
