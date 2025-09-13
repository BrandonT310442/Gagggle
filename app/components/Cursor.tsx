interface CursorProps {
  x: number;
  y: number;
  color: string;
  userId: string;
  isOwn?: boolean;
}

export default function Cursor({ x, y, color, userId, isOwn = false }: CursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-20 transform -translate-x-1 -translate-y-1"
      style={{
        left: x,
        top: y,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
        <path
          d="M3 3 L17 10 L10 12 L7 17 Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="absolute left-5 top-0 text-xs bg-black text-white px-1 rounded whitespace-nowrap"
        style={{ color: 'white', backgroundColor: color }}
      >
        {isOwn ? `You (${userId})` : userId}
      </div>
    </div>
  );
}