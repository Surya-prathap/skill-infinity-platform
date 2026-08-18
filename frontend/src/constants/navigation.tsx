import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import type { NavItem, Role } from '@/types';
import { ROLES, ROUTES } from '@/constants';

/** Core navigation — visible to every authenticated learner. */
export const CORE_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Sessions', path: ROUTES.SESSIONS, icon: <EventAvailableOutlinedIcon /> },
  { label: 'Wallet', path: ROUTES.WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
];

/** Account section navigation. */
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
  { label: 'Subscription', path: ROUTES.SUBSCRIPTION, icon: <WorkspacePremiumOutlinedIcon /> },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsOutlinedIcon /> },
];

/**
 * Mentor-only navigation — the mentor studio is the ONLY dashboard a mentor
 * sees. Learners keep the standard core navigation.
 */
export const MENTOR_NAV: NavItem[] = [
  {
    label: 'Mentor Studio',
    path: ROUTES.MENTOR_DASHBOARD,
    icon: <WorkspacePremiumOutlinedIcon />,
    roles: [ROLES.MENTOR],
    children: [
      {
        label: 'Dashboard',
        path: ROUTES.MENTOR_DASHBOARD,
        icon: <DashboardOutlinedIcon />,
        end: true,
      },
      {
        label: 'Availability',
        path: ROUTES.MENTOR_AVAILABILITY,
        icon: <CalendarMonthOutlinedIcon />,
      },
      { label: 'Pricing', path: ROUTES.MENTOR_PRICING, icon: <PriceChangeOutlinedIcon /> },
      { label: 'Subscription', path: ROUTES.MENTOR_SUBSCRIPTION, icon: <WorkspacePremiumOutlinedIcon /> },
      { label: 'Settings', path: ROUTES.MENTOR_SETTINGS, icon: <SettingsOutlinedIcon /> },
    ],
  },
];

/** Admin-only navigation (flat list — kept for backward compatibility). */
export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.ADMIN, icon: <DashboardOutlinedIcon />, end: true, roles: [ROLES.ADMIN] },
];

/**
 * Grouped admin sidebar — the enterprise console navigation.
 */
export interface AdminNavGroup {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: ROUTES.ADMIN, icon: <DashboardOutlinedIcon />, end: true }],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', path: ROUTES.ADMIN_USERS, icon: <PeopleAltOutlinedIcon /> },
      { label: 'Mentors', path: ROUTES.ADMIN_MENTORS, icon: <WorkspacePremiumOutlinedIcon /> },
    ],
  },
  {
    label: 'Platform',
    items: [
      {
        label: 'Withdrawals',
        path: ROUTES.ADMIN_WITHDRAWALS,
        icon: <PaymentsOutlinedIcon />,
      },
      { label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: <SettingsOutlinedIcon /> },
    ],
  },
];

/**
 * Role-aware dashboard navigation.
 *
 * A mentor is ALSO a learner (can book other mentors, buy/use credits, attend
 * sessions), so mentors get the learner tools (Find mentors, Sessions, Wallet)
 * alongside their studio. Learners keep the standard core navigation.
 */
export const MENTOR_LEARNER_NAV: NavItem[] = [
  {
    label: 'Find Mentors',
    path: ROUTES.MENTORS,
    icon: <SearchOutlinedIcon />,
  },
  { label: 'Sessions', path: ROUTES.SESSIONS, icon: <EventAvailableOutlinedIcon /> },
  { label: 'Wallet', path: ROUTES.WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
];

export const getDashboardNav = (roles: readonly Role[] | undefined): NavItem[] => {
  if (roles?.includes(ROLES.MENTOR)) {
    return [...MENTOR_NAV, ...MENTOR_LEARNER_NAV, ...ACCOUNT_NAV];
  }
  return [...CORE_NAV, ...ACCOUNT_NAV];
};

/** Standard authenticated sidebar (kept for backward compatibility). */
export const DASHBOARD_NAV: NavItem[] = [...CORE_NAV, ...MENTOR_NAV, ...ACCOUNT_NAV];

/** Admin sidebar (flat, legacy export). */
export const ADMIN_SIDEBAR_NAV: NavItem[] = [...ADMIN_NAV, ...CORE_NAV, ...ACCOUNT_NAV];
