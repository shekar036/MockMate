import React from 'react';
import { ChevronDown, Code, Database, BarChart3, Settings } from 'lucide-react';

const ROLES = [
  { 
    value: 'Frontend Developer', 
    label: 'Frontend Developer', 
    icon: Code,
    description: 'React, Vue, Angular, JavaScript'
  },
  { 
    value: 'Backend Developer', 
    label: 'Backend Developer', 
    icon: Database,
    description: 'Node.js, Python, Java, APIs'
  },
  { 
    value: 'Data Scientist', 
    label: 'Data Scientist', 
    icon: BarChart3,
    description: 'Python, ML, Analytics, Statistics'
  },
  { 
    value: 'DevOps Engineer', 
    label: 'DevOps Engineer', 
    icon: Settings,
    description: 'AWS, Docker, Kubernetes, CI/CD'
  }
];

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ROLES.map((role) => {
        const IconComponent = role.icon;
        const isSelected = selectedRole === role.value;
        
        return (
          <button
            key={role.value}
            onClick={() => onRoleChange(role.value)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
              isSelected
                ? 'border-blue-500 bg-blue-600/20 shadow-lg'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                isSelected ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {role.label}
                </h3>
                <p className="text-gray-400 text-sm">
                  {role.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;