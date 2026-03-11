import { useInventory } from "@/hooks/useInventory";
import { DEPARTMENTS, Department } from "@/types/inventory";
import { Link } from "react-router-dom";
import { Zap, Droplets, HardHat, AlertTriangle, ArrowRight, Package, TrendingUp, Leaf } from "lucide-react";
import { deptToSlug } from "./DepartmentDashboard";

const DEPT_ICONS: Record<Department, typeof Zap> = {
  Electrical: Zap,
  Plumbing: Droplets,
  "General Construction": HardHat,
  Landscaping: Leaf,
};

const DEPT_STYLES: Record<Department, string> = {
  Electrical: "text-info",
  Plumbing: "text-success",
  "General Construction": "text-primary",
  Landscaping: "text-green-600",
};

const DEPT_BG: Record<Department, string> = {
  Electrical: "bg-info/5 border-info/20 hover:border-info/40",
  Plumbing: "bg-success/5 border-success/20 hover:border-success/40",
  "General Construction": "bg-primary/5 border-primary/20 hover:border-primary/40",
  Landscaping: "bg-green-500/5 border-green-500/20 hover:border-green-500/40",
};

export default function Departments() {
  const { items, transactions } = useInventory();

  const deptStats = (dept: Department) => {
    const di = items.filter((i) => i.department === dept);
    const tx = transactions.filter((t) => t.department === dept);
    return {
      count: di.length,
      stock: di.reduce((s, i) => s + i.quantity, 0),
      low: di.filter((i) => i.quantity <= i.minThreshold).length,
      transactions: tx.length,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a department to view its dedicated dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map((dept) => {
          const Icon = DEPT_ICONS[dept];
          const stats = deptStats(dept);
          return (
            <Link
              key={dept}
              to={`/departments/${deptToSlug(dept)}`}
              className={`block rounded-xl border p-6 transition-all duration-200 hover:shadow-md ${DEPT_BG[dept]}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-card ${DEPT_STYLES[dept]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{dept}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xl font-bold">{stats.count}</p>
                    <p className="text-xs text-muted-foreground">Items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-xl font-bold">{stats.stock.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-3.5 w-3.5 ${stats.low > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-xl font-bold ${stats.low > 0 ? "text-destructive" : ""}`}>{stats.low}</p>
                    <p className="text-xs text-muted-foreground">Low Stock</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 flex items-center justify-center text-muted-foreground text-xs font-bold">TX</div>
                  <div>
                    <p className="text-xl font-bold">{stats.transactions}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
