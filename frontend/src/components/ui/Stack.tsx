import MuiStack from '@mui/material/Stack';
import type { StackProps as MuiStackProps } from '@mui/material/Stack';

/**
 * Stack wrapper that restores the layout convenience props removed in MUI v9
 * (alignItems / justifyContent / flexWrap / gap) and forwards them to `sx`.
 */
export interface StackProps extends MuiStackProps {
  alignItems?: string;
  justifyContent?: string;
  flexWrap?: string;
  gap?: number | string;
  textAlign?: string;
}

export const Stack: React.FC<StackProps> = ({
  alignItems,
  justifyContent,
  flexWrap,
  gap,
  textAlign,
  sx,
  ...rest
}) => {
  return (
    <MuiStack
      sx={[
        alignItems !== undefined && { alignItems },
        justifyContent !== undefined && { justifyContent },
        flexWrap !== undefined && { flexWrap },
        gap !== undefined && { gap },
        textAlign !== undefined && { textAlign },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export default Stack;
