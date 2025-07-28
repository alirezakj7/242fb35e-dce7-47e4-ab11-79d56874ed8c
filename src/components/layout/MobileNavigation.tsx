import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Wallet,
  Home,
  Menu,
  X,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    name: 'خانه',
    href: '/',
    icon: Home,
    description: 'صفحه اصلی'
  },
  {
    name: 'برنامه‌ریزی',
    href: '/planner',
    icon: Calendar,
    description: 'برنامه‌ریز روزانه، هفتگی و ماهانه'
  },
  {
    name: 'اهداف',
    href: '/goals',
    icon: Target,
    description: 'تعیین و پیگیری اهداف'
  },
  {
    name: 'عادت‌ها',
    href: '/habits',
    icon: CheckSquare,
    description: 'ردیابی عادت‌های روزانه'
  },
  {
    name: 'مالی',
    href: '/finance',
    icon: Wallet,
    description: 'مدیریت امور مالی'
  },
  {
    name: 'تحلیل',
    href: '/analytics',
    icon: BarChart3,
    description: 'گزارش‌ها و تحلیل‌ها'
  },
];

export function MobileNavigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'خروج موفق',
        description: 'با موفقیت از حساب کاربری خارج شدید',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در خروج از حساب کاربری',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-smooth",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex flex-col p-2">
                <Menu size={20} />
                <span className="text-xs mt-1 font-medium">بیشتر</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">منوی برنامه</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {navItems.slice(4).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-lg border transition-smooth",
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card hover:bg-muted border-border"
                      )}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {item.description}
                      </span>
                    </Link>
                  );
                })}
                
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto border-destructive/20 hover:bg-destructive/10 hover:border-destructive text-destructive"
                >
                  <LogOut size={24} className="mb-2" />
                  <span className="font-medium text-sm">خروج</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    خروج از حساب کاربری
                  </span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:right-0 md:w-64 md:bg-card md:border-l md:border-border">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              برنامه‌ریز زندگی
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-smooth",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-elegant" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={20} className="ml-3" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          {/* Desktop Logout Button */}
          <div className="p-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start border-destructive/20 hover:bg-destructive/10 hover:border-destructive text-destructive"
            >
              <LogOut size={20} className="ml-3" />
              خروج از حساب کاربری
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}