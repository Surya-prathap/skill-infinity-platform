import { Box, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckIcon from '@mui/icons-material/Check';
import type { WizardStepId } from '@/features/mentor/constants';

export interface WizardStepConfig {
  id: WizardStepId;
  label: string;
  icon: string;
}

const ICONS: Record<string, React.ReactNode> = {
  person: <PersonOutlineOutlinedIcon fontSize="small" />,
  work: <WorkOutlineOutlinedIcon fontSize="small" />,
  bolt: <BoltOutlinedIcon fontSize="small" />,
  lightbulb: <LightbulbOutlinedIcon fontSize="small" />,
  category: <CategoryOutlinedIcon fontSize="small" />,
  price: <PriceChangeOutlinedIcon fontSize="small" />,
  calendar: <CalendarMonthOutlinedIcon fontSize="small" />,
  award: <WorkspacePremiumOutlinedIcon fontSize="small" />,
  shield: <VerifiedUserOutlinedIcon fontSize="small" />,
  preview: <VisibilityOutlinedIcon fontSize="small" />,
};

interface WizardStepperProps {
  steps: readonly WizardStepConfig[];
  activeStep: number;
  /** Zero-based indexes the user can jump back to. */
  completedThrough?: number;
  onStepClick?: (index: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  activeStep,
  completedThrough = -1,
  onStepClick,
}) => {
  const progress = steps.length > 0 ? (activeStep / (steps.length - 1)) * 100 : 0;

  return (
    <Box
      role="tablist"
      aria-label="Registration progress"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
        px: { xs: 1, md: 2 },
        py: 2,
        overflowX: 'auto',
      }}
    >
      {/* Progress track */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 30,
          left: { xs: 28, md: 48 },
          right: { xs: 28, md: 48 },
          height: 3,
          borderRadius: 999,
          bgcolor: 'action.selected',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #6D5DF6, #43C6C0)',
            boxShadow: '0 0 12px rgba(109,93,246,0.5)',
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </Box>

      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isDone = index < activeStep;
        const clickable = onStepClick && index <= completedThrough;
        const showLabel = isActive || index === steps.length - 1;

        const node = (
          <Box
            role="tab"
            aria-selected={isActive}
            aria-label={step.label}
            tabIndex={clickable ? 0 : -1}
            onClick={clickable ? () => onStepClick(index) : undefined}
            onKeyDown={
              clickable
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onStepClick(index);
                    }
                  }
                : undefined
            }
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.75,
              minWidth: 64,
              cursor: clickable ? 'pointer' : isActive ? 'default' : 'not-allowed',
              outline: 'none',
              '&:focus-visible .stepper-node': { boxShadow: '0 0 0 4px rgba(109,93,246,0.25)' },
            }}
          >
            <Box
              component={motion.div}
              className="stepper-node"
              animate={
                isActive
                  ? { scale: [1, 1.12, 1], boxShadow: '0 0 0 6px rgba(109,93,246,0.16)' }
                  : { scale: 1 }
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                color: isActive || isDone ? '#fff' : 'text.secondary',
                background: isActive
                  ? 'linear-gradient(135deg, #6D5DF6, #43C6C0)'
                  : isDone
                    ? 'linear-gradient(135deg, #10B981, #34D399)'
                    : (theme) => theme.palette.background.paper,
                border: isActive || isDone ? 'none' : '2px solid',
                borderColor: 'divider',
                transition: 'background 0.25s ease, border-color 0.25s ease',
              }}
            >
              {isDone ? <CheckIcon sx={{ fontSize: 20 }} /> : ICONS[step.icon]}
            </Box>
            {showLabel && (
              <motion.span
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.6 }}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </motion.span>
            )}
          </Box>
        );

        return (
          <Tooltip key={step.id} title={step.label} arrow placement="top">
            {node}
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default WizardStepper;
