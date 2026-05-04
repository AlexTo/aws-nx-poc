import { Building2, Home, Users } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from ':aws-nx-poc/common-shadcn/components/ui/sidebar';
import { Link } from '@tanstack/react-router';

import Config from '../config';

export function AppSidebar() {
  // Menu items.
  const navItems = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Users', to: '/users', icon: Users },
    { label: 'Companies', to: '/companies', icon: Building2 },
  ];
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{Config.applicationName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} preload="intent">
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
