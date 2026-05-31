import { useContext } from "react";
import { SidebarContext } from "@/app/sidebar-context";

export function useSidebar() {
  return useContext(SidebarContext);
}
