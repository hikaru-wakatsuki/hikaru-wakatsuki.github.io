import { forwardRef } from 'react';

const PROMPT = 'visitor@wakatsuki-portfolio:~$ ';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isDark: boolean;
}

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ value, onChange, onSubmit, isDark }, ref) => {
    const textColor = isDark ? '#00FF66' : '#1A1A1A';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSubmit(value);
      }
    };

    return (
      <div
        className="flex items-center px-4 py-2 shrink-0"
        style={{
          borderTop: `1px solid ${isDark ? 'rgba(0,255,102,0.2)' : 'rgba(26,26,26,0.2)'}`,
        }}
      >
        <span
          className="shrink-0 text-sm font-mono select-none"
          style={{ color: textColor, fontFamily: "'Courier New', Courier, monospace" }}
        >
          {PROMPT}
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none border-none text-sm font-mono"
          style={{
            color: textColor,
            caretColor: textColor,
            fontFamily: "'Courier New', Courier, monospace",
          }}
        />
        <span
          className="terminal-cursor text-sm font-mono"
          style={{ color: textColor }}
        >
          █
        </span>
      </div>
    );
  }
);

CommandInput.displayName = 'CommandInput';

export { PROMPT };
export default CommandInput;
