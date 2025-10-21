import { MoveRight } from 'lucide-react';
import clsx from 'clsx';

const PortalCard = ({ title, description, icon: Icon, color = 'blue', onClick }) => {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      hoverBg: 'bg-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      hoverBg: 'bg-green-600',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      hoverBg: 'bg-purple-600',
    },
    sky: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      hoverBg: 'bg-sky-600',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      hoverBg: 'bg-indigo-600',
    },
  };

  const { bg, text, hoverBg } = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left border-2 border-transparent hover:border-gray-300 hover:-translate-y-1 cursor-pointer"
      role="button"
      aria-label={`Open ${title} portal`}
    >
      {/* Icon */}
      <div className={clsx('w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors', bg, `group-hover:${hoverBg}`)}>
        <Icon className={clsx('w-7 h-7 transition-colors', text, 'group-hover:text-white')} />
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>

      {/* Footer */}
      <div className={clsx('flex items-center font-medium', text)}>
        Role Available
        <MoveRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default PortalCard;