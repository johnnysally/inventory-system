import { useUsers } from "@/hooks/useUsers";
import { Shield, User, Plus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UsersPage() {
  const { users, loading } = useUsers();

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading users...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Total: {users.length} users in system</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground">No users found in the system</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="stat-card">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  {user.role === "Admin" ? (
                    <Shield className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    <p className="truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.role === "Admin" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                    }`}>
                      {user.role}
                    </span>
                    {user.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        Since {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
