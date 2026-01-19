import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Shield, MoreHorizontal, Search, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/i18n/LanguageContext';
import HRLayout from '@/components/layout/HRLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'hr' });

  // Edit user state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState('hr');

  // Confirm action states
  const [userToToggle, setUserToToggle] = useState<any>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<any>(null);


  const { data: users, isLoading } = useQuery({
    queryKey: ['hr-users'],
    queryFn: async () => {
      // Fetch hr_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('hr_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user_roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Join profiles with roles manually
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.user_id) || []
      }));

      return usersWithRoles;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
      toast({
        title: t('common', 'success'),
        description: 'User created successfully!',
      });
      setIsDialogOpen(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'hr' });
    },
    onError: (error: Error) => {
      toast({
        title: t('common', 'error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'hr' | 'admin' }) => {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
      toast({
        title: t('common', 'success'),
        description: 'User role updated successfully!',
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common', 'error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle user active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('hr_profiles')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-users'] });
      toast({
        title: t('common', 'success'),
        description: 'User status updated!',
      });
      setUserToToggle(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common', 'error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reset password mutation (sends reset email)
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t('common', 'success'),
        description: 'Password reset email sent!',
      });
      setUserToResetPassword(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common', 'error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditRole(user.user_roles?.[0]?.role || 'hr');
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users?.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-playfair font-bold text-foreground">
              {t('nav', 'users')}
            </h1>
            <p className="text-muted-foreground">Manage HR and Admin users</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => createUserMutation.mutate()}>
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t('common', 'search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} bg-muted/50 max-w-sm`}
              />
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>{t('common', 'actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {t('common', 'noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (user.user_roles as any)?.[0]?.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }>
                          <Shield className="w-3 h-3 mr-1" />
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(user.user_roles as any)?.[0]?.role || 'hr'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          user.is_active
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }>
                          {user.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              {t('common', 'edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUserToResetPassword(user)}>
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={user.is_active ? 'text-destructive' : 'text-green-500'}
                              onClick={() => setUserToToggle(user)}
                            >
                              {user.is_active ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Change the role for {editingUser?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => editingUser && updateRoleMutation.mutate({
                  userId: editingUser.user_id,
                  newRole: editRole as 'hr' | 'admin'
                })}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation */}
        <AlertDialog open={!!userToResetPassword} onOpenChange={(open) => !open && setUserToResetPassword(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Send a password reset email to {userToResetPassword?.email}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => userToResetPassword && resetPasswordMutation.mutate(userToResetPassword.email)}
              >
                Send Reset Email
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toggle Active Confirmation */}
        <AlertDialog open={!!userToToggle} onOpenChange={(open) => !open && setUserToToggle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {userToToggle?.is_active ? 'Disable User' : 'Enable User'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {userToToggle?.is_active ? 'disable' : 'enable'} {userToToggle?.full_name}?
                {userToToggle?.is_active && ' They will no longer be able to access the system.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={userToToggle?.is_active ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                onClick={() => userToToggle && toggleActiveMutation.mutate({
                  id: userToToggle.id,
                  isActive: userToToggle.is_active
                })}
              >
                {userToToggle?.is_active ? 'Disable' : 'Enable'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </HRLayout>
  );
}
