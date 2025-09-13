import GaggleLogo from './GaggleLogo';

interface ConnectedUser {
  userId: string;
  color: string;
}

interface ShareBarProps {
  connectedUsers: ConnectedUser[];
  currentUser: ConnectedUser;
  onExport: () => void;
}

function Avatar({ color }: { color: string }) {
  return (
    <div className='relative size-8'>
      <div
        className='absolute inset-0 rounded-full'
        style={{ backgroundColor: color }}
      />
      <div className='absolute inset-[21.88%_21.19%_12.5%_21.88%]'>
        <GaggleLogo />
      </div>
    </div>
  );
}

export default function ShareBar({
  connectedUsers,
  currentUser,
  onExport,
}: ShareBarProps) {
  const allUsers = [currentUser, ...connectedUsers];
  const displayUsers = allUsers.slice(0, 3);
  const overflowCount = allUsers.length - 3;

  return (
    <div className='bg-white flex gap-6 items-center justify-start p-2'>
      <div className='flex items-start'>
        <div className='flex items-center pr-3'>
          {displayUsers.map((user, index) => (
            <div key={user.userId} className='-mr-3 relative'>
              <Avatar color={user.color} />
            </div>
          ))}
        </div>
        {overflowCount > 0 && (
          <div className='bg-white border border-gray-200 px-1 py-1 min-w-6 flex items-center justify-center'>
            <span className='text-gray-400 text-sm font-normal'>
              +{overflowCount}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        className='bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors'
      >
        Export
      </button>
    </div>
  );
}
