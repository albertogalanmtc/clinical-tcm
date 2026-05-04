import { User, CreditCard, BarChart3, Settings, Scale, LifeBuoy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function AccountHub() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const accountCards = [
    {
      id: 'profile',
      title: isSpanish ? 'Perfil' : 'Profile',
      description: isSpanish
        ? 'Gestiona tu información personal y preferencias'
        : 'Manage your personal information and preferences',
      icon: User,
      href: '/profile',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'membership',
      title: isSpanish ? 'Membresía y facturación' : 'Membership & Billing',
      description: isSpanish
        ? 'Consulta tu plan de suscripción y la información de facturación'
        : 'View your subscription plan and billing information',
      icon: CreditCard,
      href: '/membership',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'usage',
      title: isSpanish ? 'Uso y analíticas' : 'Usage & Analytics',
      description: isSpanish
        ? 'Revisa el uso de hierbas y fórmulas a lo largo del tiempo'
        : 'Track your herb and formula usage over time',
      icon: BarChart3,
      href: '/usage',
      color: 'bg-teal-50 text-teal-600'
    },
    {
      id: 'settings',
      title: isSpanish ? 'Ajustes' : 'Settings',
      description: isSpanish
        ? 'Gestiona seguridad, preferencias y ajustes de la cuenta'
        : 'Manage security, preferences, and account settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-50 text-gray-600'
    },
    {
      id: 'legal',
      title: isSpanish ? 'Legal y privacidad' : 'Legal & Privacy',
      description: isSpanish
        ? 'Información legal y políticas importantes'
        : 'Important legal information and policies',
      icon: Scale,
      href: '/legal',
      color: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'help',
      title: isSpanish ? 'Ayuda y soporte' : 'Help & Support',
      description: isSpanish
        ? 'Obtén ayuda y soporte para usar la plataforma'
        : 'Get help and support for using the platform',
      icon: LifeBuoy,
      href: '/help',
      color: 'bg-green-50 text-green-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Cuenta' : 'Account'}</h1>
        <p className="text-gray-600">
          {isSpanish
            ? 'Gestiona tu cuenta, preferencias y ajustes'
            : 'Manage your account, preferences, and settings'}
        </p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountCards.map((card) => (
          <Link
            key={card.id}
            to={card.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
