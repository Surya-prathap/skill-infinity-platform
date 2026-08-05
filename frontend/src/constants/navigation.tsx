import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
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
  {
    label: 'Community',
    path: ROUTES.COMMUNITY,
    icon: <ForumOutlinedIcon />,
    children: [
      { label: 'Feed', path: ROUTES.COMMUNITY, icon: <ForumOutlinedIcon />, end: true },
      {
        label: 'Communities',
        path: ROUTES.COMMUNITIES,
        icon: <GroupsOutlinedIcon />,
      },
      { label: 'Search', path: ROUTES.COMMUNITY_SEARCH, icon: <ExploreOutlinedIcon /> },
      {
        label: 'Leaderboard',
        path: ROUTES.COMMUNITY_LEADERBOARD,
        icon: <LeaderboardOutlinedIcon />,
      },
      { label: 'Activity', path: ROUTES.COMMUNITY_ACTIVITY, icon: <TimelineOutlinedIcon /> },
      {
        label: 'Achievements',
        path: ROUTES.COMMUNITY_ACHIEVEMENTS,
        icon: <WorkspacePremiumOutlinedIcon />,
      },
    ],
  },
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
    items: [
      { label: 'Community', path: ROUTES.ADMIN_COMMUNITY, icon: <ForumOutlinedIcon /> },
      { label: 'Reviews', path: ROUTES.ADMIN_REVIEWS, icon: <StarBorderOutlinedIcon /> },
      { label: 'Support', path: ROUTES.ADMIN_SUPPORT, icon: <SupportAgentOutlinedIcon /> },
      { label: 'Announcements', path: ROUTES.ADMIN_ANNOUNCEMENTS, icon: <CampaignOutlinedIcon /> },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Reports', path: ROUTES.ADMIN_REPORTS, icon: <SummarizeOutlinedIcon /> },
      { label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: <SettingsOutlinedIcon /> },
      { label: 'Feature Flags', path: ROUTES.ADMIN_FEATURE_FLAGS, icon: <FlagOutlinedIcon /> },
      { label: 'Audit Logs', path: ROUTES.ADMIN_AUDIT, icon: <HistoryOutlinedIcon /> },
      { label: 'Monitoring', path: ROUTES.ADMIN_MONITORING, icon: <MonitorHeartOutlinedIcon /> },
    ],
  },
];

/** Standard authenticated sidebar. */
export const DASHBOARD_NAV: NavItem[] = [...CORE_NAV, ...MENTOR_NAV, ...ACCOUNT_NAV];

/** Admin sidebar (flat, legacy export). */
export const ADMIN_SIDEBAR_NAV: NavItem[] = [...ADMIN_NAV, ...CORE_NAV, ...ACCOUNT_NAV];
