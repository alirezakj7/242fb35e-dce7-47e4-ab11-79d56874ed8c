import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'خروج موفق',
        description: 'با موفقیت از حساب کاربری خارج شدید',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در خروج از حساب پیش آمد',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'کاربر';

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User size={18} className="text-primary" />
          پروفایل کاربری
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>تاریخ عضویت: {new Date(user.created_at).toLocaleDateString('fa-IR')}</p>
            <p>آخرین ورود: {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
          onClick={handleSignOut}
        >
          <LogOut size={16} className="ml-1" />
          خروج از حساب
        </Button>
      </CardContent>
    </Card>
  );
}