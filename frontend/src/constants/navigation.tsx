import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import type { NavItem, Role } from '@/types';
import { ROLES, ROUTES } from '@/constants';

/** Core navigation — visible to every authenticated user. */
export const CORE_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Sessions', path: ROUTES.SESSIONS, icon: <EventAvailableOutlinedIcon /> },
  { label: 'Calendar', path: ROUTES.CALENDAR, icon: <CalendarTodayOutlinedIcon /> },
  { label: 'Meetings', path: ROUTES.MEETINGS, icon: <VideocamOutlinedIcon /> },
  { label: 'Wallet', path: ROUTES.WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
];

/** Account section navigation. */
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
  { label: 'Subscription', path: ROUTES.SUBSCRIPTION, icon: <WorkspacePremiumOutlinedIcon /> },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsOutlinedIcon /> },
];

/** Learner tools a mentor can still use — kept in its own section so the
 *  mentor studio is the clear primary dashboard. */
export const MENTOR_LEARNER_NAV: NavItem[] = [
  {
    label: 'Learner Space',
    path: ROUTES.SESSIONS,
    icon: <EventAvailableOutlinedIcon />,
    roles: [ROLES.MENTOR],
    children: [
      { label: 'Sessions', path: ROUTES.SESSIONS, icon: <EventAvailableOutlinedIcon /> },
      { label: 'Calendar', path: ROUTES.CALENDAR, icon: <CalendarTodayOutlinedIcon /> },
      { label: 'Meetings', path: ROUTES.MEETINGS, icon: <VideocamOutlinedIcon /> },
      { label: 'Wallet', path: ROUTES.WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
      { label: 'Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
      { label: 'Subscription', path: ROUTES.SUBSCRIPTION, icon: <WorkspacePremiumOutlinedIcon /> },
      { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsOutlinedIcon /> },
    ],
  },
];

/** Mentor-only navigation with a nested section (demonstrates nested nav). */
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
      { label: 'Analytics', path: ROUTES.MENTOR_ANALYTICS, icon: <InsightsOutlinedIcon /> },
      { label: 'Certificates', path: ROUTES.MENTOR_CERTIFICATES, icon: <BadgeOutlinedIcon /> },
      {
        label: 'Achievements',
        path: ROUTES.MENTOR_ACHIEVEMENTS,
        icon: <EmojiEventsOutlinedIcon />,
      },
      {
        label: 'Availability',
        path: ROUTES.MENTOR_AVAILABILITY,
        icon: <CalendarMonthOutlinedIcon />,
      },
      { label: 'Pricing', path: ROUTES.MENTOR_PRICING, icon: <PriceChangeOutlinedIcon /> },
      { label: 'Subscription', path: ROUTES.MENTOR_SUBSCRIPTION, icon: <WorkspacePremiumOutlinedIcon /> },
      { label: 'Settings', path: ROUTES.MENTOR_SETTINGS, icon: <SettingsOutlinedIcon /> },
      { label: 'My Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
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
    items: [
      { label: 'Dashboard', path: ROUTES.ADMIN, icon: <DashboardOutlinedIcon />, end: true },
      { label: 'Analytics', path: ROUTES.ADMIN_ANALYTICS, icon: <InsightsOutlinedIcon /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', path: ROUTES.ADMIN_USERS, icon: <PeopleAltOutlinedIcon /> },
      { label: 'Mentors', path: ROUTES.ADMIN_MENTORS, icon: <WorkspacePremiumOutlinedIcon /> },
      { label: 'Sessions', path: ROUTES.ADMIN_SESSIONS, icon: <EventAvailableOutlinedIcon /> },
      { label: 'Payments', path: ROUTES.ADMIN_PAYMENTS, icon: <PaymentsOutlinedIcon /> },
      { label: 'Wallet', path: ROUTES.ADMIN_WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
    ],
  },
  {
    label: 'Engagement',
    items: [{ label: 'Reviews', path: ROUTES.ADMIN_REVIEWS, icon: <StarBorderOutlinedIcon /> }],
  },
  {
    label: 'Platform',
    items: [{ label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: <SettingsOutlinedIcon /> }],
  },
];

/**
 * Role-aware dashboard navigation.
 *
 * Mentors get a COMPLETELY separate dashboard: the mentor studio is the
 * primary section and all learner tools are grouped under a secondary
 * "Learner Space" section. Learners keep the standard core navigation.
 */
export const getDashboardNav = (roles: readonly Role[] | undefined): NavItem[] => {
  if (roles?.includes(ROLES.MENTOR)) {
    return [...MENTOR_NAV, ...MENTOR_LEARNER_NAV];
  }
  return [...CORE_NAV, ...ACCOUNT_NAV];
};

/** Standard authenticated sidebar (kept for backward compatibility). */
export const DASHBOARD_NAV: NavItem[] = [...CORE_NAV, ...MENTOR_NAV, ...ACCOUNT_NAV];

/** Admin sidebar (flat, legacy export). */
export const ADMIN_SIDEBAR_NAV: NavItem[] = [...ADMIN_NAV, ...CORE_NAV, ...ACCOUNT_NAV];
