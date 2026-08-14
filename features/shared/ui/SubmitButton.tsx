'use client';
import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/features/shared/ui/Button';

export function SubmitButton({ children, className, variant, size, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      isLoading={pending} 
      disabled={pending || props.disabled}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}
