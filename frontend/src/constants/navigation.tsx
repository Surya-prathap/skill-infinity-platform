import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import type { NavItem } from '@/types';
import { ROLES, ROUTES } from '@/constants';

/** Core navigation — visible to every authenticated user. */
export const CORE_NAV: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardOutlinedIcon />, end: true },
  { label: 'Sessions', path: ROUTES.SESSIONS, icon: <EventAvailableOutlinedIcon /> },
  { label: 'Calendar', path: ROUTES.CALENDAR, icon: <CalendarTodayOutlinedIcon /> },
  { label: 'Meetings', path: ROUTES.MEETINGS, icon: <VideocamOutlinedIcon /> },
  { label: 'Messages', path: ROUTES.MESSAGES, icon: <ChatBubbleOutlineOutlinedIcon /> },
  { label: 'Wallet', path: ROUTES.WALLET, icon: <AccountBalanceWalletOutlinedIcon /> },
  { label: 'Community', path: ROUTES.COMMUNITY, icon: <ForumOutlinedIcon /> },
];

/** Account section navigation. */
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: <NotificationsNoneIcon /> },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: <SettingsOutlinedIcon /> },
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
      { label: 'Settings', path: ROUTES.MENTOR_SETTINGS, icon: <SettingsOutlinedIcon /> },
      { label: 'My Profile', path: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon /> },
    ],
  },
];

/** Admin-only navigation. */
export const ADMIN_NAV: NavItem[] = [
  {
    label: 'Admin Dashboard',
    path: ROUTES.ADMIN,
    icon: <AdminPanelSettingsOutlinedIcon />,
    end: true,
    roles: [ROLES.ADMIN],
  },
];

/** Standard authenticated sidebar. */
export const DASHBOARD_NAV: NavItem[] = [...CORE_NAV, ...MENTOR_NAV, ...ACCOUNT_NAV];

/** Admin sidebar. */
export const ADMIN_SIDEBAR_NAV: NavItem[] = [...ADMIN_NAV, ...CORE_NAV, ...ACCOUNT_NAV];
