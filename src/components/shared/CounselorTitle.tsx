
'use client';

interface CounselorTitleProps {
  title: string;
}

export function CounselorTitle({ title }: CounselorTitleProps) {
  const [line1, line2] = title.split('\n');

  return (
    <div>
      <p className="text-sm font-medium text-primary">{line1}</p>
      {line2 && <p className="text-xs text-muted-foreground">{line2}</p>}
    </div>
  );
}
