import { MoveRight } from 'lucide-react';

const PortalCard = ({ title, description, icon: Icon, color = 'blue', onClick }) => {
  const colorSchemes = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-600',
    green: 'bg-green-100 text-green-600 hover:bg-green-600',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-600',
    sky: 'bg-sky-100 text-sky-600 hover:bg-sky-600',
    indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-600',
  };

  const [bg, text, hoverBg] = colorSchemes[color]?.split(' ') || [];

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left border-2 border-transparent hover:border-gray-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className={`w-14 h-14 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:${hoverBg} transition-colors`}>
        <Icon className={`w-7 h-7 ${text} group-hover:text-white transition-colors`} />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{description}</p>
      <div className={`flex items-center ${text} font-medium`}>
        Role Available
        <MoveRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default PortalCard;