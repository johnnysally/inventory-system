import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Edit2, Trash2, Eye, EyeOff, Mail, User as UserIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff";
  createdAt: string;
}

export default function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Staff" as "Admin" | "Staff",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is the developer
  if (user?.email !== "dev@admincapella") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md stat-card text-center">
          <div className="inline-flex h-14 w-14 rounded-full bg-destructive/10 items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Only the developer user can manage users. Please contact your system administrator.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error: any) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
      password: "",
      confirmPassword: "",
      role: selectedUser.role,
    });
    setErrors({});
    setShowPassword(false);
    setIsEditDialogOpen(true);
  };

  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editForm.name.trim()) newErrors.name = "Name is required";
    if (!editForm.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) newErrors.email = "Invalid email format";
    if (editForm.password && editForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateEditForm() || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };

      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const response = await api.put(
        `/users/${selectedUser.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(users.map((u) => (u.id === selectedUser.id ? response.data : u)));
      setIsEditDialogOpen(false);
      toast.success(`User "${response.data.name}" updated successfully`);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || "Failed to update user";
      setErrors({ submit: errorMsg });
      toast.error(errorMsg);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      toast.success(`User "${selectedUser.name}" deleted successfully`);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || "Failed to delete user";
      toast.error(errorMsg);
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit user credentials and delete users</p>
        </div>
        <Button onClick={() => navigate("/register-user")} variant="default">
          + Register New User
        </Button>
      </div>

      {isLoading ? (
        <div className="stat-card flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="stat-card flex flex-col items-center justify-center py-12">
          <UserIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="stat-card flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{u.role}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(u)}
                  className="w-10 h-10 p-0"
                  title="Edit user"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDeleteDialog(u)}
                  className="w-10 h-10 p-0 text-destructive hover:text-destructive"
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user credentials and role</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}

            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => {
                  setEditForm((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value as "Admin" | "Staff" }))}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">Staff Member</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-3">Change Password (Optional)</div>

              <div>
                <Label htmlFor="edit-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave empty to keep current password"
                    value={editForm.password}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, password: e.target.value }));
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              {editForm.password && (
                <div>
                  <Label htmlFor="edit-confirm-password">Confirm Password</Label>
                  <Input
                    id="edit-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={editForm.confirmPassword}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} className="gap-2">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name}</span> ({selectedUser?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
