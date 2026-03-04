import { useInventory } from "@/hooks/useInventory";
import { DEPARTMENTS } from "@/types/inventory";
import { Package, AlertTriangle, Building2, ArrowLeftRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DEPT_COLORS = ["hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(36, 95%, 50%)"];

export default function Dashboard() {
  const { items, transactions } = useInventory();

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const lowStockItems = items.filter((i) => i.quantity <= i.minThreshold);

  const deptData = DEPARTMENTS.map((dept, idx) => {
    const deptItems = items.filter((i) => i.department === dept);
    return {
      name: dept === "General Construction" ? "Gen. Const." : dept,
      fullName: dept,
      items: deptItems.length,
      stock: deptItems.reduce((s, i) => s + i.quantity, 0),
      color: DEPT_COLORS[idx],
    };
  });

  const stats = [
    { label: "Total Stock", value: totalItems.toLocaleString(), icon: Package, accent: "text-primary" },
    { label: "Low Stock Items", value: lowStockItems.length, icon: AlertTriangle, accent: "text-destructive" },
    { label: "Departments", value: DEPARTMENTS.length, icon: Building2, accent: "text-info" },
    { label: "Transactions", value: transactions.length, icon: ArrowLeftRight, accent: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your inventory operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`p-2.5 rounded-lg bg-muted ${s.accent}`}>
              <s.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4">Stock by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                {deptData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="text-sm font-semibold mb-4">Items Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="items"
              >
                {deptData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value: number, _name: string, props: any) => [
                  `${value} items`,
                  props.payload.fullName,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {deptData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="stat-card border-destructive/20">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.department}</p>
                </div>
                <div className="text-right">
                  <span className="low-stock-badge">{item.quantity} left</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Min: {item.minThreshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stat-card">
        <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Item</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Qty</th>
                <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="py-2 px-2 text-muted-foreground">{tx.date}</td>
                  <td className="py-2 px-2 font-medium">{tx.itemName}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      tx.type === "Stock In"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2 px-2">{tx.quantity}</td>
                  <td className="py-2 px-2 text-muted-foreground">{tx.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
