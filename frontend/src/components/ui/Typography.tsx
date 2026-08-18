import MuiTypography from '@mui/material/Typography';
import type { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';

/**
 * Typography wrapper that restores the shorthand style props removed in MUI v9
 * and forwards them to `sx`.
 */
export interface TypographyProps extends MuiTypographyProps {
  fontWeight?: number | string;
  fontSize?: number | string;
  textAlign?: string;
  lineHeight?: number | string;
  whiteSpace?: string;
  letterSpacing?: number | string;
  textTransform?: string;
  verticalAlign?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  fontWeight,
  fontSize,
  textAlign,
  lineHeight,
  whiteSpace,
  letterSpacing,
  textTransform,
  verticalAlign,
  sx,
  ...rest
}) => {
  return (
    <MuiTypography
      sx={[
        fontWeight !== undefined && { fontWeight },
        fontSize !== undefined && { fontSize },
        textAlign !== undefined && { textAlign },
        lineHeight !== undefined && { lineHeight },
        whiteSpace !== undefined && { whiteSpace },
        letterSpacing !== undefined && { letterSpacing },
        textTransform !== undefined && { textTransform },
        verticalAlign !== undefined && { verticalAlign },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export default Typography;
